"""
CarbonLens — Carbon Emission & CEI Calculation Module

Carbon Intensity: 708 gCO₂/kWh — India CEA Annual Report 2023
CEI(n) = W(n) / (E(n) × CI)
CO₂ (g) = E(kWh) × CI (gCO₂/kWh)
"""

import math

# India Central Electricity Authority, Annual Report 2023
CARBON_INTENSITY = 708  # gCO₂ per kWh


def joules_to_kwh(joules: float) -> float:
    """Convert joules to kilowatt-hours."""
    return joules / 3_600_000


def joules_to_co2_grams(joules: float) -> float:
    """Convert energy in joules to CO₂ emissions in grams."""
    kwh = joules_to_kwh(joules)
    return kwh * CARBON_INTENSITY


def joules_to_co2_micrograms(joules: float) -> float:
    """Convert energy in joules to CO₂ emissions in micrograms."""
    return joules_to_co2_grams(joules) * 1e6


# Theoretical work functions for each algorithm
WORK_FUNCTIONS = {
    "insertion_sort": lambda n: n ** 2,
    "merge_sort": lambda n: n * math.log2(n) if n > 0 else 0,
    "radix_sort": lambda n: n,
}


def calculate_cei(algorithm: str, n: int, energy_joules: float) -> float:
    """
    Calculate Carbon Efficiency Index.
    CEI = W(n) / CO₂(g)
    Higher CEI = more operations per gram of CO₂ = better.
    """
    co2 = joules_to_co2_grams(energy_joules)
    if co2 <= 0:
        return 0.0
    work = WORK_FUNCTIONS.get(algorithm, lambda n: n)(n)
    return work / co2  # operations per gram CO₂


def energy_millijoules(joules: float) -> float:
    """Convert joules to millijoules."""
    return joules * 1000
