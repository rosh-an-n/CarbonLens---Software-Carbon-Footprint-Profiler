"""
CarbonLens — Statistical Analysis Module
Power-law regression, confidence intervals, and ANOVA.
"""

import numpy as np
from scipy import stats


def power_law_regression(input_sizes, co2_values):
    """
    Fit a power-law model: CO₂ = a * n^b
    Using log-log linear regression: log(CO₂) = log(a) + b * log(n)

    Returns dict with:
        - exponent (b)
        - coefficient (a)
        - r_squared
        - ci_lower, ci_upper (95% CI on exponent)
    """
    if len(input_sizes) < 3:
        return None

    x = np.array(input_sizes, dtype=float)
    y = np.array(co2_values, dtype=float)

    # Filter out zeros/negatives
    mask = (x > 0) & (y > 0)
    x = x[mask]
    y = y[mask]

    if len(x) < 3:
        return None

    log_x = np.log(x)
    log_y = np.log(y)

    slope, intercept, r_value, p_value, std_err = stats.linregress(log_x, log_y)

    # 95% confidence interval for slope
    n = len(log_x)
    t_crit = stats.t.ppf(0.975, n - 2)
    ci_lower = slope - t_crit * std_err
    ci_upper = slope + t_crit * std_err

    return {
        "exponent": round(slope, 4),
        "coefficient": round(np.exp(intercept), 6),
        "r_squared": round(r_value ** 2, 4),
        "ci_lower": round(ci_lower, 4),
        "ci_upper": round(ci_upper, 4),
        "p_value": round(p_value, 6),
        "n_points": int(n),
    }


def run_anova(groups):
    """
    Run one-way ANOVA across algorithm groups at the same input size.

    Args:
        groups: dict mapping algorithm name -> list of CO₂ values

    Returns dict with:
        - f_statistic
        - p_value
        - significant (bool, p < 0.05)
        - interpretation text
    """
    group_values = [v for v in groups.values() if len(v) >= 2]

    if len(group_values) < 2:
        return None

    f_stat, p_val = stats.f_oneway(*group_values)

    return {
        "f_statistic": round(float(f_stat), 4),
        "p_value": round(float(p_val), 6),
        "significant": bool(p_val < 0.05),
        "interpretation": (
            f"Differences are statistically significant (p = {p_val:.4f})"
            if p_val < 0.05
            else f"Differences are NOT statistically significant (p = {p_val:.4f})"
        ),
    }
