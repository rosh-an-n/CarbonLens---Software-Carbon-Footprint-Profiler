import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Save,
    Download,
    FileText,
    AlertTriangle,
    RotateCcw,
    Loader2,
} from 'lucide-react';
import ProgressFeed from '../components/ProgressFeed';
import ResultCard from '../components/ResultCard';
import useExperiment from '../hooks/useExperiment';
import { exportPDF } from '../api/client';

const ALGORITHMS = [
    { id: 'insertion_sort', name: 'Insertion Sort', complexity: 'O(n²)', maxN: 100000 },
    { id: 'merge_sort', name: 'Merge Sort', complexity: 'O(n log n)', maxN: 1000000 },
    { id: 'radix_sort', name: 'Radix Sort', complexity: 'O(n)', maxN: 1000000 },
];

const PRESETS = [
    { label: '1K', value: 1000 },
    { label: '10K', value: 10000 },
    { label: '100K', value: 100000 },
    { label: '500K', value: 500000 },
    { label: '1M', value: 1000000 },
];

export default function RunExperiment() {
    const [selectedAlgs, setSelectedAlgs] = useState(['insertion_sort', 'merge_sort', 'radix_sort']);
    const [inputSize, setInputSize] = useState(10000);
    const [trialCount, setTrialCount] = useState(5);
    const [toast, setToast] = useState(null);

    const {
        isRunning,
        progress,
        results,
        error,
        isSaved,
        runExperiment,
        saveResults,
        reset,
    } = useExperiment();

    const hasInsertionSort = selectedAlgs.includes('insertion_sort');
    const isOversized = hasInsertionSort && inputSize > 100000;

    const effectiveInputSize = useMemo(() => {
        return inputSize;
    }, [inputSize]);

    const toggleAlg = (algId) => {
        setSelectedAlgs((prev) =>
            prev.includes(algId)
                ? prev.filter((a) => a !== algId)
                : [...prev, algId]
        );
    };

    const handleRun = () => {
        if (selectedAlgs.length === 0) {
            showToast('Please select at least one algorithm', 'warning');
            return;
        }

        let finalSize = inputSize;
        if (isOversized) {
            showToast(
                '⚠️ Insertion Sort capped at 100K — O(n²) runtime would be impractical beyond this.',
                'warning'
            );
        }

        runExperiment({
            algorithms: selectedAlgs,
            input_size: finalSize,
            trial_count: trialCount,
        });
    };

    const handleSave = () => {
        saveResults();
        showToast('Results saved to history!', 'success');
    };

    const handleExportCSV = () => {
        if (!results) return;

        const header = 'Algorithm,Input Size,Trials,Avg Time (s),Avg Energy (mJ),Avg CO₂ (µg),CEI Score\n';
        const rows = results.map(
            (r) =>
                `${r.algorithm_name},${r.input_size},${r.trial_count},${r.avg_time},${r.avg_energy_mj},${r.avg_co2},${r.cei_score}`
        );
        const csv = header + rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbonlens_experiment_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported!', 'success');
    };

    const handleExportPDF = async () => {
        if (!results) return;

        try {
            const data = {
                config: {
                    algorithms: selectedAlgs,
                    input_size: inputSize,
                    trial_count: trialCount,
                    measurement_method: results[0]?.measurement_method || 'Unknown',
                },
                results: results.map((r) => ({
                    algorithm: r.algorithm,
                    avg_time: r.avg_time,
                    avg_energy: r.avg_energy,
                    avg_co2: r.avg_co2,
                    cei_score: r.cei_score,
                })),
            };

            const res = await exportPDF(data);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carbonlens_report_${Date.now()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('PDF report generated!', 'success');
        } catch (err) {
            showToast('PDF generation failed', 'error');
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Sort results by CO₂ for ranking
    const rankedResults = useMemo(() => {
        if (!results) return [];
        return [...results].sort((a, b) => a.avg_co2 - b.avg_co2);
    }, [results]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Run Experiment</h1>
                <p className="text-gray-400">
                    Configure and execute a carbon footprint measurement experiment.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Step 1: Algorithm Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-glass p-6"
                    >
                        <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-4">
                            Step 1 — Select Algorithms
                        </h3>
                        <div className="space-y-3">
                            {ALGORITHMS.map((alg) => (
                                <label
                                    key={alg.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAlgs.includes(alg.id)
                                            ? 'bg-teal/10 border border-teal/30'
                                            : 'bg-carbon-bg/50 border border-carbon-border hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAlgs.includes(alg.id)}
                                        onChange={() => toggleAlg(alg.id)}
                                        className="w-4 h-4 rounded accent-teal"
                                        disabled={isRunning}
                                    />
                                    <div className="flex-1">
                                        <span className="text-white font-medium">{alg.name}</span>
                                        <span className="font-mono text-xs text-gray-500 ml-2">
                                            {alg.complexity}
                                        </span>
                                    </div>
                                    {alg.id === 'insertion_sort' && (
                                        <span className="text-xs bg-accent-amber/20 text-accent-amber px-2 py-0.5 rounded-full">
                                            ⚠️ Max 100K
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </motion.div>

                    {/* Step 2: Input Size */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-glass p-6"
                    >
                        <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-4">
                            Step 2 — Input Size
                        </h3>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PRESETS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setInputSize(p.value)}
                                    disabled={isRunning}
                                    className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all ${inputSize === p.value
                                            ? 'bg-teal text-carbon-bg'
                                            : 'bg-carbon-bg border border-carbon-border text-gray-300 hover:border-teal/50'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <input
                            type="range"
                            min={100}
                            max={1000000}
                            step={100}
                            value={inputSize}
                            onChange={(e) => setInputSize(Number(e.target.value))}
                            disabled={isRunning}
                            className="w-full mb-2"
                        />

                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                min={100}
                                max={1000000}
                                value={inputSize}
                                onChange={(e) =>
                                    setInputSize(Math.min(1000000, Math.max(100, Number(e.target.value))))
                                }
                                disabled={isRunning}
                                className="w-32 bg-carbon-bg border border-carbon-border rounded-lg px-3 py-2 font-mono text-sm text-white focus:border-teal focus:outline-none"
                            />
                            <span className="font-mono text-sm text-gray-500">
                                {inputSize.toLocaleString()} elements
                            </span>
                        </div>

                        {isOversized && (
                            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-accent-amber/10 border border-accent-amber/20">
                                <AlertTriangle size={14} className="text-accent-amber flex-shrink-0" />
                                <span className="text-xs text-accent-amber">
                                    Insertion Sort will be capped at 100K — O(n²) runtime would be impractical beyond this.
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Step 3: Trials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-glass p-6"
                    >
                        <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-4">
                            Step 3 — Trial Count
                        </h3>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={trialCount}
                            onChange={(e) => setTrialCount(Number(e.target.value))}
                            disabled={isRunning}
                            className="w-full mb-2"
                        />
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">1 trial</span>
                            <span className="font-mono text-lg text-white font-bold">{trialCount}</span>
                            <span className="text-xs text-gray-500">10 trials</span>
                        </div>
                    </motion.div>

                    {/* Run Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {!isRunning && !results && (
                            <button
                                onClick={handleRun}
                                className="w-full py-4 bg-teal hover:bg-teal-light text-carbon-bg font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,170,0.3)] flex items-center justify-center gap-3"
                            >
                                <Play size={20} />
                                Run Experiment
                            </button>
                        )}

                        {isRunning && (
                            <button
                                disabled
                                className="w-full py-4 bg-teal/50 text-carbon-bg font-bold text-lg rounded-xl flex items-center justify-center gap-3 cursor-not-allowed"
                            >
                                <Loader2 size={20} className="animate-spin" />
                                Running...
                            </button>
                        )}

                        {results && (
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaved}
                                    className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isSaved
                                            ? 'bg-teal/20 text-teal cursor-not-allowed'
                                            : 'bg-teal hover:bg-teal-light text-carbon-bg'
                                        }`}
                                >
                                    <Save size={16} />
                                    {isSaved ? 'Saved ✓' : 'Save to History'}
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-4 py-3 rounded-xl font-semibold bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-all flex items-center gap-2"
                                >
                                    <Download size={16} />
                                    CSV
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="px-4 py-3 rounded-xl font-semibold bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-all flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    PDF
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-4 py-3 rounded-xl font-semibold bg-carbon-card text-gray-400 hover:text-white hover:bg-carbon-hover transition-all flex items-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    New
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Progress + Results Panel */}
                <div className="space-y-6">
                    {(isRunning || progress.length > 0) && (
                        <ProgressFeed items={progress} />
                    )}

                    {error && (
                        <div className="card-glass p-6 border border-accent-red/30 bg-accent-red/5">
                            <p className="text-accent-red font-medium">{error}</p>
                        </div>
                    )}

                    {rankedResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                Results
                            </h3>
                            <div className="grid gap-4">
                                {rankedResults.map((r, i) => (
                                    <ResultCard
                                        key={r.algorithm}
                                        result={r}
                                        rank={i}
                                        total={rankedResults.length}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`toast ${toast.type === 'success'
                            ? 'bg-teal/20 border border-teal/30 text-teal'
                            : toast.type === 'warning'
                                ? 'bg-accent-amber/20 border border-accent-amber/30 text-accent-amber'
                                : toast.type === 'error'
                                    ? 'bg-accent-red/20 border border-accent-red/30 text-accent-red'
                                    : 'bg-carbon-card border border-carbon-border text-white'
                        }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
