"""
CarbonLens — Energy Measurement Module
Primary: Intel RAPL via pyRAPL (requires Linux + Intel CPU)
Fallback: CPU utilisation × TDP estimation via psutil (works everywhere)
Method auto-detected on import.
"""

import time
import psutil

MEASUREMENT_METHOD = ""

# Try pyRAPL first
try:
    import pyRAPL
    pyRAPL.setup()
    MEASUREMENT_METHOD = "Intel RAPL (hardware)"

    def measure_energy(func, arr):
        """Measure energy using Intel RAPL hardware counters."""
        meter = pyRAPL.Measurement('carbonlens_exp')
        meter.begin()
        t0 = time.perf_counter()
        result = func(arr)
        t1 = time.perf_counter()
        meter.end()
        energy_uj = meter.result.pkg[0]  # microjoules
        return t1 - t0, energy_uj / 1e6  # seconds, joules

except Exception:
    # Fallback: psutil CPU% × TDP estimation
    MEASUREMENT_METHOD = "psutil TDP estimation (fallback)"
    TDP_WATTS = 45  # conservative mid-range estimate

    def measure_energy(func, arr):
        """Estimate energy using CPU utilisation × TDP."""
        proc = psutil.Process()
        # Prime the cpu_percent measurement
        proc.cpu_percent()
        time.sleep(0.05)

        t0 = time.perf_counter()
        result = func(arr)
        t1 = time.perf_counter()

        cpu_after = proc.cpu_percent()
        elapsed = t1 - t0

        # Use the post-sort CPU% reading as approximation
        avg_cpu = cpu_after / 100.0
        if avg_cpu <= 0:
            avg_cpu = 0.5  # minimum floor to avoid zero energy

        energy_j = avg_cpu * TDP_WATTS * elapsed
        return elapsed, energy_j
