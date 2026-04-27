import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Cpu, Leaf, FlaskConical, AlertTriangle } from 'lucide-react';

const Section = ({ title, icon: Icon, children, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="card-glass p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
            <Icon size={18} className="text-teal" />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {children}
    </motion.div>
);

export default function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">About & Methodology</h1>
                <p className="text-gray-400">How CarbonLens measures software carbon footprint.</p>
            </motion.div>

            <Section title="What CarbonLens Measures" icon={FlaskConical} delay={0.1}>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    CarbonLens experimentally measures the energy consumption and resulting carbon dioxide emissions
                    of sorting algorithms from different time complexity classes. By running actual computations and
                    measuring real energy usage (via Intel RAPL or psutil estimation), it provides empirical data on
                    how algorithmic efficiency translates to environmental impact.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                    This is a research tool for a B.Tech Computer Science PBL project at Sharda University,
                    designed to demonstrate the relationship between computational complexity and carbon emissions.
                </p>
            </Section>

            <Section title="Formulas" icon={BookOpen} delay={0.2}>
                <div className="space-y-4">
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-carbon-border">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Carbon Emission</p>
                        <p className="font-mono text-teal text-lg">CO₂ (g) = E(kWh) × CI (gCO₂/kWh)</p>
                        <p className="text-xs text-gray-500 mt-2">Where E = energy consumed, CI = carbon intensity of electricity grid</p>
                    </div>
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-carbon-border">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Carbon Efficiency Index</p>
                        <p className="font-mono text-teal text-lg">CEI(n) = W(n) / (E(n) × CI)</p>
                        <p className="text-xs text-gray-500 mt-2">Where W(n) = theoretical work (operations), higher CEI = more efficient</p>
                    </div>
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-carbon-border">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Power-Law Regression</p>
                        <p className="font-mono text-teal text-lg">CO₂ = a × n<sup>b</sup></p>
                        <p className="text-xs text-gray-500 mt-2">Exponent b should match theoretical complexity class</p>
                    </div>
                </div>
            </Section>

            <Section title="Algorithms" icon={Cpu} delay={0.3}>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead><tr>
                            <th>Algorithm</th><th>Complexity</th><th>Type</th><th>Max Input</th>
                        </tr></thead>
                        <tbody>
                            <tr>
                                <td className="font-medium text-white">Insertion Sort</td>
                                <td className="font-mono text-accent-red">O(n²)</td>
                                <td className="text-gray-400">Comparison, In-place</td>
                                <td className="font-mono text-gray-400">100,000</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-white">Merge Sort</td>
                                <td className="font-mono text-accent-blue">O(n log n)</td>
                                <td className="text-gray-400">Comparison, Divide & Conquer</td>
                                <td className="font-mono text-gray-400">1,000,000</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-white">Radix Sort</td>
                                <td className="font-mono text-teal">O(n)</td>
                                <td className="text-gray-400">Non-comparison, LSD</td>
                                <td className="font-mono text-gray-400">1,000,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title="Energy Measurement" icon={Leaf} delay={0.4}>
                <div className="space-y-3 text-sm text-gray-300">
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-teal/20">
                        <p className="font-semibold text-teal mb-1">Primary: Intel RAPL</p>
                        <p className="text-gray-400">Hardware-level energy counters via pyRAPL. Requires Linux + Intel CPU. Measures actual package-level energy in microjoules.</p>
                    </div>
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-accent-amber/20">
                        <p className="font-semibold text-accent-amber mb-1">Fallback: psutil TDP Estimation</p>
                        <p className="text-gray-400">CPU utilization × TDP (45W estimate) × elapsed time. Works on all platforms. Less accurate but provides consistent relative comparisons.</p>
                    </div>
                    <div className="bg-carbon-bg/50 rounded-lg p-4 border border-accent-blue/20">
                        <p className="font-semibold text-accent-blue mb-1">Carbon Intensity</p>
                        <p className="text-gray-400"><span className="font-mono text-white">708 gCO₂/kWh</span> — India Central Electricity Authority (CEA) Annual Report 2023</p>
                    </div>
                </div>
            </Section>

            <Section title="Limitations" icon={AlertTriangle} delay={0.5}>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>Pure Python implementations include interpreter overhead (GC, bytecode execution)</li>
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>psutil fallback estimates energy from CPU utilization, not direct measurement</li>
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>Carbon intensity varies by region and time of day; we use India's annual average</li>
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>Results are indicative for relative comparison, not absolute carbon values</li>
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>Other system processes may affect energy readings during experiments</li>
                    <li className="flex items-start gap-2"><span className="text-accent-amber mt-1">•</span>Insertion Sort capped at n=100,000 to prevent impractical runtimes</li>
                </ul>
            </Section>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-center mt-8 text-gray-600 text-sm">
                <p>Built by <span className="text-teal">Roshan Naik</span> • Sharda University • 2025</p>
                <p className="mt-1">B.Tech Computer Science — PBL Project</p>
            </motion.div>
        </div>
    );
}
