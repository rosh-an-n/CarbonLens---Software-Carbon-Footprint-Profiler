import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Cloud, Gauge } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

function MetricItem({ icon: Icon, label, value, unit, color }) {
    const animatedVal = useCountUp(value, 1200, value < 1 ? 4 : 2, true);
    return (
        <div className="flex items-center gap-2">
            <Icon size={14} className={color} />
            <span className="text-xs text-gray-500">{label}</span>
            <span className="font-mono text-sm text-white ml-auto">
                {animatedVal}
                <span className="text-gray-500 text-xs ml-1">{unit}</span>
            </span>
        </div>
    );
}

export default function ResultCard({ result, rank, total }) {
    const rankColors = {
        0: { border: 'border-teal/40', bg: 'bg-teal/5', badge: 'bg-teal/20 text-teal', label: 'Best' },
        1: { border: 'border-accent-amber/30', bg: 'bg-accent-amber/5', badge: 'bg-accent-amber/20 text-accent-amber', label: 'Middle' },
        2: { border: 'border-accent-red/30', bg: 'bg-accent-red/5', badge: 'bg-accent-red/20 text-accent-red', label: 'Worst' },
    };

    // With only 2 algorithms, rank 1 = worst
    const effectiveRank = total <= 2 && rank === 1 ? 2 : rank;
    const rc = rankColors[Math.min(effectiveRank, 2)];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: rank * 0.1 }}
            className={`card-glass p-5 border ${rc.border} ${rc.bg}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-white text-lg">
                        {result.algorithm_name}
                    </h3>
                    <span className="font-mono text-xs text-gray-500">
                        {result.complexity}
                    </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${rc.badge}`}>
                    {rc.label}
                </span>
            </div>

            <div className="space-y-3">
                <MetricItem
                    icon={Clock}
                    label="Time"
                    value={result.avg_time}
                    unit="s"
                    color="text-accent-blue"
                />
                <MetricItem
                    icon={Zap}
                    label="Energy"
                    value={result.avg_energy_mj}
                    unit="mJ"
                    color="text-accent-amber"
                />
                <MetricItem
                    icon={Cloud}
                    label="CO₂"
                    value={result.avg_co2}
                    unit="µg"
                    color="text-accent-red"
                />
                <MetricItem
                    icon={Gauge}
                    label="CEI"
                    value={result.cei_score}
                    unit="ops/gCO₂"
                    color="text-teal"
                />
            </div>

            {result.input_size && (
                <div className="mt-3 pt-3 border-t border-carbon-border">
                    <span className="font-mono text-xs text-gray-500">
                        n = {result.input_size.toLocaleString()} • {result.trial_count} trials
                    </span>
                </div>
            )}
        </motion.div>
    );
}
