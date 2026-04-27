import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ZAxis,
} from 'recharts';

const COLORS = {
    insertion_sort: '#ef4444',
    merge_sort: '#3b82f6',
    radix_sort: '#00d4aa',
};

const NAMES = {
    insertion_sort: 'Insertion Sort',
    merge_sort: 'Merge Sort',
    radix_sort: 'Radix Sort',
};

function CustomTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-carbon-card border border-carbon-border rounded-lg p-3 shadow-xl">
            <p className="text-sm text-white mb-1">{NAMES[d.algorithm] || d.algorithm}</p>
            <p className="text-sm font-mono text-accent-blue">
                Time: {d.x.toFixed(4)}s
            </p>
            <p className="text-sm font-mono text-accent-amber">
                CO₂: {d.y.toFixed(4)} µg
            </p>
            <p className="text-xs text-gray-500">
                n = {d.input_size?.toLocaleString()}
            </p>
        </div>
    );
}

export default function ScatterPlot({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="card-glass p-6 flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No data available.</p>
            </div>
        );
    }

    // Group by algorithm
    const groups = {};
    data.forEach((d) => {
        if (!groups[d.algorithm]) groups[d.algorithm] = [];
        groups[d.algorithm].push({
            x: d.avg_time,
            y: d.avg_co2,
            algorithm: d.algorithm,
            input_size: d.input_size,
        });
    });

    return (
        <div className="card-glass p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Execution Time vs CO₂
            </h3>
            <p className="text-xs text-gray-600 mb-4">Correlation between time and emissions</p>
            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Time"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#1e293b' }}
                        label={{
                            value: 'Execution Time (s)',
                            position: 'insideBottom',
                            offset: -5,
                            fill: '#94a3b8',
                            fontSize: 12,
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="CO₂"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#1e293b' }}
                        label={{
                            value: 'CO₂ (µg)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#94a3b8',
                            fontSize: 12,
                        }}
                    />
                    <ZAxis range={[60, 120]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    {Object.entries(groups).map(([alg, points]) => (
                        <Scatter
                            key={alg}
                            name={NAMES[alg] || alg}
                            data={points}
                            fill={COLORS[alg] || '#888'}
                            animationDuration={1500}
                        />
                    ))}
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
