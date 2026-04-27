import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
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

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload) return null;
    return (
        <div className="bg-carbon-card border border-carbon-border rounded-lg p-3 shadow-xl">
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-mono" style={{ color: p.color }}>
                    {p.name}: {p.value.toFixed(2)} µg CO₂
                </p>
            ))}
        </div>
    );
}

export default function BarComparison({ data }) {
    // data = array of { algorithm, avg_co2, input_size, ... }
    if (!data || data.length === 0) {
        return (
            <div className="card-glass p-6 flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No data available. Run an experiment first.</p>
            </div>
        );
    }

    // Group by input_size for grouped bars
    const sizeMap = {};
    data.forEach((d) => {
        const key = d.input_size;
        if (!sizeMap[key]) sizeMap[key] = { input_size: `n=${key.toLocaleString()}` };
        sizeMap[key][d.algorithm] = d.avg_co2;
    });
    const chartData = Object.values(sizeMap);

    const algorithms = [...new Set(data.map((d) => d.algorithm))];

    return (
        <div className="card-glass p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Carbon Emission Comparison
            </h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="input_size"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                    />
                    {algorithms.map((alg) => (
                        <Bar
                            key={alg}
                            dataKey={alg}
                            name={NAMES[alg] || alg}
                            fill={COLORS[alg] || '#888'}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1200}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
