import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import BarComparison from '../components/charts/BarComparison';
import CarbonGrowthChart from '../components/charts/CarbonGrowthChart';
import CEIChart from '../components/charts/CEIChart';
import ScatterPlot from '../components/charts/ScatterPlot';
import { getHistory, getRegression, getAnova } from '../api/client';

const ALG_NAMES = {
    insertion_sort: 'Insertion Sort',
    merge_sort: 'Merge Sort',
    radix_sort: 'Radix Sort',
};

const THEORETICAL = {
    insertion_sort: '2.0 (O(n²))',
    merge_sort: '~1.0–1.3 (O(n log n))',
    radix_sort: '1.0 (O(n))',
};

export default function Compare() {
    const [data, setData] = useState([]);
    const [regression, setRegression] = useState(null);
    const [anova, setAnova] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [histRes, regRes] = await Promise.all([
                    getHistory(),
                    getRegression(),
                ]);
                const experiments = histRes.data.experiments || [];
                setData(experiments);
                setRegression(regRes.data.regression || {});

                // Get unique input sizes for ANOVA dropdown
                const sizes = [...new Set(experiments.map((e) => e.input_size))].sort((a, b) => a - b);
                if (sizes.length > 0) {
                    const size = sizes[sizes.length - 1];
                    setSelectedSize(size);
                    const anovaRes = await getAnova(size);
                    setAnova(anovaRes.data.anova);
                }
            } catch (err) {
                console.error('Compare load error:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleAnovaSize = async (size) => {
        setSelectedSize(size);
        try {
            const res = await getAnova(size);
            setAnova(res.data.anova);
        } catch (err) {
            console.error('ANOVA error:', err);
        }
    };

    const inputSizes = [...new Set(data.map((d) => d.input_size))].sort((a, b) => a - b);

    // Latest results per algorithm (for CEI chart)
    const latestPerAlg = {};
    data.forEach((d) => {
        if (!latestPerAlg[d.algorithm] || new Date(d.timestamp) > new Date(latestPerAlg[d.algorithm].timestamp)) {
            latestPerAlg[d.algorithm] = d;
        }
    });
    const ceiData = Object.values(latestPerAlg);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
                <div className="text-gray-500">Loading analysis data...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Compare & Analyse</h1>
                <p className="text-gray-400">
                    Full comparative visualisation of carbon emissions across algorithms.
                </p>
            </motion.div>

            {data.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-glass p-12 text-center"
                >
                    <BarChart3 size={48} className="mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl text-white mb-2">No Data Yet</h2>
                    <p className="text-gray-500">
                        Run some experiments and save them to history to see comparative analysis here.
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Chart 1 — Bar Comparison */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <BarComparison data={data} />
                    </motion.div>

                    {/* Chart 2 — Carbon Growth Curve */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <CarbonGrowthChart data={data} />
                    </motion.div>

                    {/* Chart 3 + 4 side by side */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CEIChart data={ceiData} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <ScatterPlot data={data} />
                        </motion.div>
                    </div>

                    {/* Regression Analysis Panel */}
                    {regression && Object.values(regression).some((r) => r !== null) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="card-glass p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-teal" />
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    Power-Law Regression Analysis
                                </h3>
                            </div>
                            <p className="text-xs text-gray-600 mb-4">
                                Fitting CO₂ = a × n<sup>b</sup> to find empirical growth exponents
                            </p>

                            <div className="grid md:grid-cols-3 gap-4">
                                {Object.entries(regression).map(([alg, reg]) => {
                                    if (!reg) return (
                                        <div key={alg} className="bg-carbon-bg/50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-400 mb-2">{ALG_NAMES[alg] || alg}</h4>
                                            <p className="text-xs text-gray-600">Need ≥3 data points at different input sizes</p>
                                        </div>
                                    );

                                    return (
                                        <div key={alg} className="bg-carbon-bg/50 rounded-lg p-4 border border-carbon-border">
                                            <h4 className="font-medium text-white mb-3">{ALG_NAMES[alg] || alg}</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">Exponent (b)</span>
                                                    <span className="font-mono text-sm text-teal font-bold">{reg.exponent}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">95% CI</span>
                                                    <span className="font-mono text-xs text-gray-400">
                                                        [{reg.ci_lower}, {reg.ci_upper}]
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">R²</span>
                                                    <span className="font-mono text-sm text-accent-blue">{reg.r_squared}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500">Theoretical</span>
                                                    <span className="font-mono text-xs text-gray-400">{THEORETICAL[alg]}</span>
                                                </div>
                                                {reg.interpretation && (
                                                    <div className="mt-2 pt-2 border-t border-carbon-border">
                                                        <p className="text-xs text-teal">{reg.interpretation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ANOVA Panel */}
                    {inputSizes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="card-glass p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle size={18} className="text-accent-blue" />
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    One-Way ANOVA
                                </h3>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs text-gray-500">Input Size:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {inputSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleAnovaSize(size)}
                                            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${selectedSize === size
                                                    ? 'bg-accent-blue text-white'
                                                    : 'bg-carbon-bg border border-carbon-border text-gray-400 hover:border-accent-blue/50'
                                                }`}
                                        >
                                            {size.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {anova ? (
                                <div className="bg-carbon-bg/50 rounded-lg p-4 border border-carbon-border">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-xs text-gray-500 block">F-statistic</span>
                                            <span className="font-mono text-lg text-white">{anova.f_statistic}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">p-value</span>
                                            <span className="font-mono text-lg text-white">{anova.p_value}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Significant?</span>
                                            <span className={`font-mono text-lg ${anova.significant ? 'text-teal' : 'text-accent-amber'}`}>
                                                {anova.significant ? 'Yes ✓' : 'No ✗'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-sm ${anova.significant ? 'text-teal' : 'text-accent-amber'}`}>
                                        {anova.interpretation}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600">
                                    Need data from at least 2 algorithms at the same input size to run ANOVA.
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
