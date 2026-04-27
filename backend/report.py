"""
CarbonLens — PDF Report Generation Module
Uses matplotlib for chart images and fpdf2 for PDF assembly.
"""

import io
import os
import tempfile
from datetime import datetime

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from fpdf import FPDF


class CarbonLensReport(FPDF):
    """Custom PDF report for CarbonLens experiments."""

    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(0, 212, 170)
        self.cell(0, 10, 'CarbonLens Experiment Report', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0, 180, 150)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6, text)
        self.ln(2)


def _generate_bar_chart(results):
    """Generate a CO₂ comparison bar chart and return the temp file path."""
    fig, ax = plt.subplots(figsize=(8, 4))
    fig.patch.set_facecolor('#0a0f1e')
    ax.set_facecolor('#0a0f1e')

    algorithms = [r['algorithm'] for r in results]
    co2_values = [r['avg_co2'] for r in results]
    colors = ['#00d4aa', '#3b82f6', '#f59e0b']

    bars = ax.bar(algorithms, co2_values, color=colors[:len(algorithms)], width=0.5)
    ax.set_ylabel('CO₂ (µg)', color='white', fontsize=12)
    ax.set_title('Carbon Emission Comparison', color='white', fontsize=14)
    ax.tick_params(colors='white')
    ax.spines['bottom'].set_color('#333')
    ax.spines['left'].set_color('#333')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    for bar, val in zip(bars, co2_values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(co2_values) * 0.02,
                f'{val:.2f}', ha='center', va='bottom', color='white', fontsize=10)

    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
    fig.savefig(tmp.name, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close(fig)
    return tmp.name


def generate_pdf_report(experiment_data):
    """
    Generate a complete PDF report.

    Args:
        experiment_data: dict with keys:
            - config: {algorithms, input_size, trial_count, measurement_method}
            - results: list of {algorithm, avg_time, avg_energy, avg_co2, cei_score}
            - regression (optional): dict of algorithm -> regression stats
            - anova (optional): ANOVA result dict

    Returns: bytes of the PDF file
    """
    pdf = CarbonLensReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Title
    pdf.set_font('Helvetica', 'B', 22)
    pdf.set_text_color(0, 212, 170)
    pdf.cell(0, 15, 'CarbonLens', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(180, 180, 180)
    pdf.cell(0, 8, 'Software Carbon Footprint Profiler', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Author & date
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 6, f'Author: Roshan Naik | Sharda University', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # Experiment Configuration
    config = experiment_data.get('config', {})
    pdf.section_title('1. Experiment Configuration')
    pdf.body_text(
        f"Algorithms: {', '.join(config.get('algorithms', []))}\n"
        f"Input Size: {config.get('input_size', 'N/A'):,}\n"
        f"Trial Count: {config.get('trial_count', 'N/A')}\n"
        f"Measurement Method: {config.get('measurement_method', 'N/A')}"
    )

    # Results Table
    results = experiment_data.get('results', [])
    pdf.section_title('2. Experiment Results')

    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_fill_color(20, 30, 50)
    pdf.set_text_color(0, 212, 170)
    col_widths = [40, 30, 35, 35, 40]
    headers = ['Algorithm', 'Time (s)', 'Energy (mJ)', 'CO2 (ug)', 'CEI Score']
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, h, border=1, fill=True, align='C')
    pdf.ln()

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(60, 60, 60)
    for r in results:
        row = [
            r.get('algorithm', ''),
            f"{r.get('avg_time', 0):.4f}",
            f"{r.get('avg_energy', 0) * 1000:.4f}",
            f"{r.get('avg_co2', 0):.2f}",
            f"{r.get('cei_score', 0):.2f}",
        ]
        for i, val in enumerate(row):
            pdf.cell(col_widths[i], 7, val, border=1, align='C')
        pdf.ln()
    pdf.ln(5)

    # Bar chart
    pdf.section_title('3. Carbon Emission Comparison')
    if results:
        chart_path = _generate_bar_chart(results)
        pdf.image(chart_path, x=20, w=170)
        os.unlink(chart_path)
        pdf.ln(5)

    # CEI Table
    pdf.section_title('4. Carbon Efficiency Index')
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_fill_color(20, 30, 50)
    pdf.set_text_color(0, 212, 170)
    pdf.cell(60, 8, 'Algorithm', border=1, fill=True, align='C')
    pdf.cell(60, 8, 'CEI (ops/gCO2)', border=1, fill=True, align='C')
    pdf.cell(60, 8, 'Complexity', border=1, fill=True, align='C')
    pdf.ln()

    complexity_map = {
        'insertion_sort': 'O(n^2)',
        'merge_sort': 'O(n log n)',
        'radix_sort': 'O(n)',
    }

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(60, 60, 60)
    for r in results:
        alg = r.get('algorithm', '')
        pdf.cell(60, 7, alg, border=1, align='C')
        pdf.cell(60, 7, f"{r.get('cei_score', 0):.2f}", border=1, align='C')
        pdf.cell(60, 7, complexity_map.get(alg, ''), border=1, align='C')
        pdf.ln()
    pdf.ln(5)

    # Statistical Analysis
    regression = experiment_data.get('regression')
    anova = experiment_data.get('anova')

    if regression or anova:
        pdf.section_title('5. Statistical Analysis')

        if regression:
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(60, 60, 60)
            pdf.cell(0, 7, 'Power-Law Regression (CO2 = a * n^b)', new_x="LMARGIN", new_y="NEXT")
            pdf.set_font('Helvetica', '', 9)
            for alg, reg in regression.items():
                if reg:
                    pdf.body_text(
                        f"{alg}: b = {reg['exponent']}, "
                        f"95% CI [{reg['ci_lower']}, {reg['ci_upper']}], "
                        f"R^2 = {reg['r_squared']}"
                    )
            pdf.ln(3)

        if anova:
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(60, 60, 60)
            pdf.cell(0, 7, 'One-Way ANOVA', new_x="LMARGIN", new_y="NEXT")
            pdf.set_font('Helvetica', '', 9)
            pdf.body_text(
                f"F-statistic: {anova['f_statistic']}\n"
                f"p-value: {anova['p_value']}\n"
                f"{anova['interpretation']}"
            )

    # Limitations
    pdf.section_title('6. Notes & Limitations')
    pdf.body_text(
        "- Carbon intensity assumes India CEA 2023 value: 708 gCO2/kWh\n"
        "- pyRAPL requires Linux + Intel CPU; psutil fallback uses TDP estimation\n"
        "- Pure Python implementations; compiled-language sorts would differ\n"
        "- Measurements include Python overhead (GC, interpreter)\n"
        "- Results are indicative for academic comparison, not absolute values"
    )

    # Return as bytes
    return pdf.output()
