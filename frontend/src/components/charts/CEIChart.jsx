import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
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
            <p className="text-sm font-mono text-teal">CEI: {d.cei_score.toFixed(2)}</p>
            <p className="text-xs text-gray-500">ops per gCO₂</p>
        </div>
    );
}

export default function CEIChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="card-glass p-6 flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No data available.</p>
            </div>
        );
    }

    const chartData = data
        .map((d) => ({
            name: NAMES[d.algorithm] || d.algorithm,
            algorithm: d.algorithm,
            cei_score: d.cei_score,
        }))
        .sort((a, b) => b.cei_score - a.cei_score);

    return (
        <div className="card-glass p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Carbon Efficiency Index
            </h3>
            <p className="text-xs text-gray-600 mb-4">Higher = more work per gram of CO₂</p>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical" barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: '#e2e8f0', fontSize: 13 }}
                        axisLine={{ stroke: '#1e293b' }}
                        width={130}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cei_score" radius={[0, 6, 6, 0]} animationDuration={1200}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={COLORS[entry.algorithm] || '#888'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
