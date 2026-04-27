"""
CarbonLens — FastAPI Backend Application
All API routes for experiment execution, history, analysis, and export.
"""

import json
import math
import time
import random
import platform
import io
import csv
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from algorithms import ALGORITHMS, ALGORITHM_INFO
from measurement import measure_energy, MEASUREMENT_METHOD
from carbon import (
    joules_to_co2_micrograms,
    joules_to_co2_grams,
    calculate_cei,
    energy_millijoules,
    CARBON_INTENSITY,
)
from database import init_db, get_db, Experiment
from analysis import power_law_regression, run_anova
from report import generate_pdf_report

# ─── App Setup ────────────────────────────────────────────────
app = FastAPI(title="CarbonLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
init_db()


# ─── Pydantic Models ─────────────────────────────────────────
class ExperimentRequest(BaseModel):
    algorithms: List[str] = ["insertion_sort", "merge_sort", "radix_sort"]
    input_size: int = 10000
    trial_count: int = 5


class SaveExperimentRequest(BaseModel):
    algorithm: str
    input_size: int
    trial_count: int
    avg_time: float
    avg_energy: float
    avg_co2: float
    cei_score: float
    measurement_method: str
    trial_details: Optional[str] = None


class BulkSaveRequest(BaseModel):
    experiments: List[SaveExperimentRequest]


class PDFReportRequest(BaseModel):
    config: dict
    results: list
    regression: Optional[dict] = None
    anova: Optional[dict] = None


# ─── Routes ───────────────────────────────────────────────────

@app.get("/api/status")
def get_status():
    """Return system info and measurement method."""
    return {
        "measurement_method": MEASUREMENT_METHOD,
        "system": {
            "platform": platform.system(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "machine": platform.machine(),
        },
        "carbon_intensity": CARBON_INTENSITY,
        "carbon_intensity_unit": "gCO₂/kWh",
        "carbon_intensity_source": "India CEA Annual Report 2023",
        "algorithms": ALGORITHM_INFO,
    }


@app.post("/api/experiment/run")
def run_experiment(req: ExperimentRequest):
    """
    Run sorting experiment with SSE streaming progress.
    Returns a text/event-stream with progress updates and final results.
    """
    # Validate algorithms
    valid_algos = []
    for alg in req.algorithms:
        if alg not in ALGORITHMS:
            continue
        valid_algos.append(alg)

    if not valid_algos:
        raise HTTPException(status_code=400, detail="No valid algorithms selected")

    input_size = max(1, req.input_size)
    trial_count = max(1, min(10, req.trial_count))

    def event_stream():
        # Generate random array with fixed seed for reproducibility
        msg = json.dumps({"type": "progress", "message": "Generating random array...", "status": "running"})
        yield "data: " + msg + "\n\n"
        random.seed(42)
        base_array = [random.randint(0, 999_999) for _ in range(input_size)]
        gen_msg = "Generated array of {:,} integers ✓".format(input_size)
        msg = json.dumps({"type": "progress", "message": gen_msg, "status": "done"})
        yield "data: " + msg + "\n\n"

        all_results = []

        for alg_name in valid_algos:
            alg_func = ALGORITHMS[alg_name]
            alg_info = ALGORITHM_INFO[alg_name]
            alg_display = alg_info["name"]

            # Cap insertion sort
            actual_size = min(input_size, alg_info["max_n"])
            arr = base_array[:actual_size]

            if actual_size < input_size:
                cap_msg = "⚠️ {} capped at {:,} (O(n²) runtime limit)".format(alg_display, actual_size)
                msg = json.dumps({"type": "progress", "message": cap_msg, "status": "warning"})
                yield "data: " + msg + "\n\n"

            trials = []
            for t in range(trial_count):
                run_msg = "Running {} — Trial {}/{}...".format(alg_display, t + 1, trial_count)
                msg = json.dumps({"type": "progress", "message": run_msg, "status": "running"})
                yield "data: " + msg + "\n\n"

                elapsed, energy_j = measure_energy(alg_func, arr)
                co2_ug = joules_to_co2_micrograms(energy_j)
                cei = calculate_cei(alg_name, actual_size, energy_j)

                trials.append({
                    "trial": t + 1,
                    "time": round(elapsed, 6),
                    "energy_joules": round(energy_j, 8),
                    "energy_mj": round(energy_millijoules(energy_j), 4),
                    "co2_ug": round(co2_ug, 4),
                    "cei": round(cei, 2),
                })

                done_msg = "{} — Trial {}/{} ✓ ({:.4f}s)".format(alg_display, t + 1, trial_count, elapsed)
                msg = json.dumps({"type": "progress", "message": done_msg, "status": "done"})
                yield "data: " + msg + "\n\n"

            # Compute averages
            avg_time = sum(tr["time"] for tr in trials) / len(trials)
            avg_energy = sum(tr["energy_joules"] for tr in trials) / len(trials)
            avg_co2 = sum(tr["co2_ug"] for tr in trials) / len(trials)
            avg_cei = sum(tr["cei"] for tr in trials) / len(trials)

            result = {
                "algorithm": alg_name,
                "algorithm_name": alg_info["name"],
                "complexity": alg_info["complexity"],
                "input_size": actual_size,
                "trial_count": trial_count,
                "avg_time": round(avg_time, 6),
                "avg_energy": round(avg_energy, 8),
                "avg_energy_mj": round(energy_millijoules(avg_energy), 4),
                "avg_co2": round(avg_co2, 4),
                "cei_score": round(avg_cei, 2),
                "trials": trials,
                "measurement_method": MEASUREMENT_METHOD,
            }
            all_results.append(result)

        # Send final results
        msg = json.dumps({"type": "complete", "results": all_results})
        yield "data: " + msg + "\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── History CRUD ─────────────────────────────────────────────

@app.get("/api/history")
def get_history(
    limit: Optional[int] = None,
    offset: int = 0,
    algorithm: Optional[str] = None,
    sort_by: Optional[str] = "timestamp",
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db),
):
    """Return all saved experiments from SQLite."""
    query = db.query(Experiment)

    if algorithm:
        query = query.filter(Experiment.algorithm == algorithm)

    # Sorting
    sort_column = getattr(Experiment, sort_by, Experiment.timestamp)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()

    if limit:
        query = query.offset(offset).limit(limit)

    experiments = query.all()
    return {
        "total": total,
        "experiments": [
            {
                "id": e.id,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                "algorithm": e.algorithm,
                "input_size": e.input_size,
                "trial_count": e.trial_count,
                "avg_time": e.avg_time,
                "avg_energy": e.avg_energy,
                "avg_co2": e.avg_co2,
                "cei_score": e.cei_score,
                "measurement_method": e.measurement_method,
                "trial_details": json.loads(e.trial_details) if e.trial_details else None,
            }
            for e in experiments
        ],
    }


@app.post("/api/history/save")
def save_experiment(req: SaveExperimentRequest, db: Session = Depends(get_db)):
    """Save a single experiment result."""
    exp = Experiment(
        algorithm=req.algorithm,
        input_size=req.input_size,
        trial_count=req.trial_count,
        avg_time=req.avg_time,
        avg_energy=req.avg_energy,
        avg_co2=req.avg_co2,
        cei_score=req.cei_score,
        measurement_method=req.measurement_method,
        trial_details=req.trial_details,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return {"id": exp.id, "message": "Experiment saved successfully"}


@app.post("/api/history/save-bulk")
def save_experiments_bulk(req: BulkSaveRequest, db: Session = Depends(get_db)):
    """Save multiple experiment results at once."""
    ids = []
    for item in req.experiments:
        exp = Experiment(
            algorithm=item.algorithm,
            input_size=item.input_size,
            trial_count=item.trial_count,
            avg_time=item.avg_time,
            avg_energy=item.avg_energy,
            avg_co2=item.avg_co2,
            cei_score=item.cei_score,
            measurement_method=item.measurement_method,
            trial_details=item.trial_details,
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)
        ids.append(exp.id)
    return {"ids": ids, "message": f"{len(ids)} experiments saved successfully"}


@app.delete("/api/history/{experiment_id}")
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """Delete one experiment record."""
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experiment deleted"}


@app.delete("/api/history")
def delete_all_experiments(db: Session = Depends(get_db)):
    """Delete all experiment records."""
    count = db.query(Experiment).delete()
    db.commit()
    return {"message": f"Deleted {count} experiments"}


# ─── Export ───────────────────────────────────────────────────

@app.get("/api/export/csv")
def export_csv(db: Session = Depends(get_db)):
    """Download all history as CSV file."""
    experiments = db.query(Experiment).order_by(Experiment.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Timestamp", "Algorithm", "Input Size", "Trials",
        "Avg Time (s)", "Avg Energy (J)", "Avg CO2 (µg)",
        "CEI Score", "Measurement Method"
    ])

    for e in experiments:
        writer.writerow([
            e.id,
            e.timestamp.isoformat() if e.timestamp else "",
            e.algorithm,
            e.input_size,
            e.trial_count,
            f"{e.avg_time:.6f}",
            f"{e.avg_energy:.8f}",
            f"{e.avg_co2:.4f}",
            f"{e.cei_score:.2f}",
            e.measurement_method,
        ])

    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=carbonlens_history.csv"},
    )


@app.post("/api/export/pdf")
def export_pdf(req: PDFReportRequest):
    """Generate and download a PDF report."""
    pdf_bytes = generate_pdf_report(req.dict())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=carbonlens_report.pdf"},
    )


# ─── Analysis ────────────────────────────────────────────────

@app.get("/api/analysis/regression")
def get_regression(db: Session = Depends(get_db)):
    """Run power-law regression on stored data for each algorithm."""
    results = {}
    for alg_name in ALGORITHMS.keys():
        experiments = (
            db.query(Experiment)
            .filter(Experiment.algorithm == alg_name)
            .order_by(Experiment.input_size)
            .all()
        )
        if len(experiments) >= 3:
            sizes = [e.input_size for e in experiments]
            co2_vals = [e.avg_co2 for e in experiments]
            reg = power_law_regression(sizes, co2_vals)
            results[alg_name] = reg
        else:
            results[alg_name] = None

    # Add interpretation
    theoretical = {
        "insertion_sort": 2.0,
        "merge_sort": 1.0,  # approximately, since n*log(n) ≈ n^1.x
        "radix_sort": 1.0,
    }

    for alg, reg in results.items():
        if reg:
            expected = theoretical.get(alg, 1.0)
            reg["theoretical_exponent"] = expected
            reg["interpretation"] = (
                f"{ALGORITHM_INFO[alg]['name']} exponent {reg['exponent']:.3f} "
                f"{'≈' if abs(reg['exponent'] - expected) < 0.3 else '≠'} "
                f"theoretical O(n{'²' if expected == 2 else ''}) "
                f"{'✓' if abs(reg['exponent'] - expected) < 0.3 else '✗'}"
            )

    return {"regression": results}


@app.get("/api/analysis/anova")
def get_anova(
    input_size: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Run one-way ANOVA on CO₂ values across algorithms at a given input size."""
    query = db.query(Experiment)
    if input_size:
        query = query.filter(Experiment.input_size == input_size)

    experiments = query.all()

    # Group by algorithm
    groups = {}
    for e in experiments:
        if e.algorithm not in groups:
            groups[e.algorithm] = []
        groups[e.algorithm].append(e.avg_co2)

    if len(groups) < 2:
        return {"anova": None, "message": "Need data from at least 2 algorithms"}

    result = run_anova(groups)
    return {"anova": result, "input_size": input_size}


# ─── Dashboard Stats ─────────────────────────────────────────

@app.get("/api/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return dashboard summary statistics."""
    from sqlalchemy import func

    total_experiments = db.query(func.count(Experiment.id)).scalar() or 0
    total_co2 = db.query(func.sum(Experiment.avg_co2)).scalar() or 0

    # Most efficient algorithm (highest CEI)
    best = db.query(Experiment).order_by(Experiment.cei_score.desc()).first()
    most_efficient = best.algorithm if best else None

    # Last experiment timestamp
    last = db.query(Experiment).order_by(Experiment.timestamp.desc()).first()
    last_timestamp = last.timestamp.isoformat() if last else None

    return {
        "total_experiments": total_experiments,
        "total_co2_ug": round(total_co2, 2),
        "most_efficient": most_efficient,
        "last_timestamp": last_timestamp,
        "measurement_method": MEASUREMENT_METHOD,
    }
