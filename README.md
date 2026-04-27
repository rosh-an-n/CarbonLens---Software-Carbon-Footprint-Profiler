# 🌿 CarbonLens — Software Carbon Footprint Profiler

<div align="center">

**A full-stack experimental platform for measuring, comparing, and analysing carbon emissions produced by sorting algorithms across different time complexity classes.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Academic-green?style=flat-square)]()

*B.Tech Computer Science — PBL Project | Sharda University*

</div>

---

## 📄 Research Paper

This project is the implementation companion to the IEEE-format research paper:

> **"A Comparative Analysis of Carbon Footprints Across Algorithmic Complexity Classes Using CarbonLens"**
>
> *Roshan Naik — Department of Computer Science & Engineering, Sharda University, Greater Noida, India*

The paper presents a controlled experimental methodology to measure and compare CO₂ emissions of sorting algorithms spanning three complexity classes — **O(n)**, **O(n log n)**, and **O(n²)** — and introduces the **Carbon Efficiency Index (CEI)** as a developer-facing metric for algorithm-level sustainability analysis.

### Key Findings

| # | Finding |
|---|---------|
| 1 | **Complexity class predicts carbon emission growth rate** — regression exponents match theoretical complexity values with R² = 1.000 for all three algorithms |
| 2 | **Differences are large enough to matter** — at n = 10⁴, Insertion Sort emits **262× more CO₂** than Radix Sort for identical input |
| 3 | **Measured energy ratios depart from theoretical predictions** due to cache effects, branch prediction overhead, and measurement artefacts |
| 4 | **CEI is a reproducible comparative index** for algorithm-level sustainability analysis |

---

## 🧠 Research Methodology

### Carbon Emission Model

The paper uses a direct measurement approach to quantify software carbon emissions:

```
CO₂ (g) = E(kWh) × CI (gCO₂/kWh)
```

Where:
- **E** = Electrical energy consumed during algorithm execution
- **CI** = Carbon Intensity of the electrical grid (708 gCO₂/kWh — India CEA Annual Report 2023)

### Carbon Efficiency Index (CEI)

A novel metric introduced in this research:

```
CEI(n) = W(n) / CO₂(n)
```

Where **W(n)** is the theoretical work function of the algorithm:

| Algorithm | W(n) | Complexity |
|-----------|-------|-----------|
| Radix Sort | n | O(n) |
| Merge Sort | n log₂ n | O(n log n) |
| Insertion Sort | n² | O(n²) |

**Higher CEI = more computational operations per gram of CO₂ emitted = more carbon-efficient.**

CEI asks: *"Is the algorithm extracting carbon-efficient value from the work it performs?"* — making it suitable as a profiling metric alongside execution time and memory.

### Energy Measurement

| Method | Mechanism | Availability |
|--------|-----------|-------------|
| **Intel RAPL** | Hardware energy counters via `pyRAPL` | Linux + Intel CPU |
| **psutil TDP estimation** | CPU utilisation × TDP wattage | Any platform (fallback) |

The method is auto-detected at startup. The `psutil` fallback uses a conservative TDP estimate of 45W and CPU utilisation sampling.

### Statistical Validation

- **Power-law regression** (log-log): CO₂ = a × nᵇ — validates that measured exponents match theoretical complexity
- **One-way ANOVA**: Tests whether CO₂ differences across algorithms are statistically significant (p < 0.05)
- **95% Confidence Intervals** on regression exponents

---

## ⚙️ Architecture

```
carbonlens/
├── backend/                    # Python FastAPI server
│   ├── main.py                 # API routes (experiment, history, analysis, export)
│   ├── algorithms.py           # Pure Python sorting implementations
│   ├── measurement.py          # Energy measurement (RAPL / psutil fallback)
│   ├── carbon.py               # CO₂ conversion & CEI calculation
│   ├── analysis.py             # Power-law regression & ANOVA
│   ├── database.py             # SQLite + SQLAlchemy ORM
│   ├── report.py               # PDF report generation (matplotlib + fpdf2)
│   ├── partial_report.py       # Partial report utilities
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── App.jsx             # Router with animated page transitions
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Summary stats & recent experiments
│   │   │   ├── RunExperiment.jsx  # Live experiment execution with SSE streaming
│   │   │   ├── Compare.jsx     # Side-by-side algorithm comparison
│   │   │   ├── History.jsx     # Experiment history with CRUD
│   │   │   └── About.jsx      # Methodology & research context
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── ProgressFeed.jsx
│   │   │   └── charts/         # Recharts visualisations
│   │   │       ├── BarComparison.jsx
│   │   │       ├── CEIChart.jsx
│   │   │       ├── CarbonGrowthChart.jsx
│   │   │       └── ScatterPlot.jsx
│   │   ├── hooks/
│   │   │   ├── useExperiment.js
│   │   │   └── useCountUp.js
│   │   └── api/
│   │       └── client.js       # Axios HTTP client
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd carbonlens/backend
python -m venv venv
source venv/bin/activate        # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd carbonlens/frontend
npm install
npm run dev
```

### Open

```
Frontend:  http://localhost:5173
API Docs:  http://localhost:8000/docs (Swagger UI)
```

---

## 🔬 Algorithms Under Study

All algorithms are implemented in **pure Python** (no C extensions like `list.sort()`) to ensure energy measurements reflect the actual algorithmic work, not interpreter optimisations.

| Algorithm | Complexity Class | Implementation | Max Input Size |
|-----------|-----------------|----------------|---------------|
| **Insertion Sort** | O(n²) | In-place comparison sort | 100,000 |
| **Merge Sort** | O(n log n) | Recursive divide-and-conquer | 1,000,000 |
| **Radix Sort (LSD)** | O(n) | Counting sort on each digit | 1,000,000 |

### Why Pure Python?

From the paper: *"A NumPy-accelerated sort would show a different energy profile. The ordering relationship across complexity classes is expected to hold across implementations; the absolute values are not portable."*

---

## 📊 Experimental Results (from the Paper)

### CO₂ Emissions at n = 10,000

| Algorithm | Avg CO₂ (µg) | Relative to Radix Sort |
|-----------|-------------|----------------------|
| Radix Sort | 0.71 | 1× |
| Merge Sort | 3.86 | 5.4× |
| Insertion Sort | 186.14 | 262× |

### Power-Law Regression

| Algorithm | Measured Exponent (b) | Theoretical | R² |
|-----------|----------------------|-------------|-----|
| Radix Sort | ≈ 1.0 | 1.0 | 1.000 |
| Merge Sort | ≈ 1.0 | ~1.0 (n log n) | 1.000 |
| Insertion Sort | ≈ 2.0 | 2.0 | 1.000 |

### Notable Observations

- **Radix Sort at n = 10⁵**: Energy was only 2.06× lower than Merge Sort, despite a theoretical complexity ratio of log n ≈ 17. Comparison operations carry disproportionate energy cost due to branch misprediction.
- **Insertion Sort at n = 10⁴**: Energy was 134× greater than Merge Sort (theoretical: 752×). At this size, Insertion Sort still fits within L2 cache, partially compensating for its larger operation count.
- **At n = 10⁵**, once cache pressure builds, the ratio climbs to 2,343×.

> *"Asymptotic analysis alone cannot predict these transitions. That is precisely what makes experimental measurement worth doing."*

---

## 🌍 Carbon Intensity

| Parameter | Value | Source |
|-----------|-------|--------|
| Grid carbon intensity | **708 gCO₂/kWh** | India Central Electricity Authority, Annual Report 2023 |
| Conversion | CO₂(g) = Energy(kWh) × 708 | |

**Note**: On a predominantly renewable grid such as Norway's (~30 gCO₂/kWh), absolute emissions would be ~24× lower, though the ratios between algorithms remain unchanged.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Recharts, Framer Motion, Lucide Icons |
| **Backend** | Python FastAPI, pyRAPL, psutil, SQLAlchemy |
| **Database** | SQLite |
| **Analysis** | NumPy, SciPy (stats), Pandas, Matplotlib |
| **Reports** | fpdf2 (PDF generation) |
| **Streaming** | Server-Sent Events (SSE) for live experiment progress |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | System info, measurement method, available algorithms |
| `POST` | `/api/experiment/run` | Run experiment with SSE streaming progress |
| `GET` | `/api/history` | List saved experiments (filterable, sortable, paginated) |
| `POST` | `/api/history/save` | Save a single experiment result |
| `POST` | `/api/history/save-bulk` | Batch save multiple experiments |
| `DELETE` | `/api/history/{id}` | Delete one experiment |
| `DELETE` | `/api/history` | Delete all experiments |
| `GET` | `/api/export/csv` | Download experiment history as CSV |
| `POST` | `/api/export/pdf` | Generate and download PDF report |
| `GET` | `/api/analysis/regression` | Power-law regression on stored data |
| `GET` | `/api/analysis/anova` | One-way ANOVA across algorithms |
| `GET` | `/api/stats` | Dashboard summary statistics |

---

## ⚠️ Known Limitations

These are documented in the research paper (Section VI-E):

1. **Measurement method**: Energy is estimated via psutil TDP sampling on non-Linux/non-Intel systems. Relative algorithm ordering is reliable; absolute values may differ from hardware counters.
2. **Fixed carbon intensity**: Uses India's annual average. Real-time intensity varies by hour, season, and generation mix.
3. **Single hardware configuration**: Results from one machine may not transfer directly to others.
4. **Implementation specificity**: Pure Python only. NumPy-accelerated sorts would show different energy profiles.
5. **Input distribution**: Uniformly distributed random integers. Insertion Sort runs in O(n) on nearly-sorted data.

---

## 🔮 Future Work

As outlined in the paper:

- **Broader algorithm coverage** — graph algorithms, dynamic programming, ML training loops
- **Real-time carbon intensity** — integrate Electricity Maps or WattTime APIs for carbon-aware scheduling
- **Cross-architecture replication** — AMD, ARM, and GPU-accelerated hardware
- **Language-level integration** — combine with Pereira et al.'s language energy findings for a 2D carbon cost map
- **Developer tooling** — CEI as a Python decorator or profiler plugin (`pip install` ready)

---

## 📚 References

1. International Energy Agency, "Data Centres and Data Transmission Networks," IEA Technology Report, 2022.
2. R. Pereira et al., "Energy Efficiency Across Programming Languages," SLE 2017.
3. S. Georgiou et al., "Green AI: Do Deep Learning Frameworks Have Different Costs?" ICSE 2022.
4. Green Software Foundation, "Software Carbon Intensity (SCI) Specification v1.0," 2023.
5. Central Electricity Authority, Government of India, "CO₂ Baseline Database for the Indian Power Sector, v17.0," 2023.
6. C. Bunse et al., "Choosing Sorting Algorithms for Energy-Efficiency," SESENA 2009.
7. M. Hähnel et al., "Measuring Energy Consumption for Short Code Paths Using RAPL," ACM SIGMETRICS 2012.
8. T. H. Cormen et al., *Introduction to Algorithms*, 4th ed., MIT Press, 2022.

---

## 👤 Author

**Roshan Naik**
Department of Computer Science & Engineering, Sharda University, Greater Noida, India

---

<div align="center">

*"The Green Software Foundation and similar bodies are beginning to formalise what carbon-aware software development looks like in practice. This study shows that complexity analysis and energy profiling — tools developers already use — are sufficient to reason about algorithmic carbon cost."*

</div>
