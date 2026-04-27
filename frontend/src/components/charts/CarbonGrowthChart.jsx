import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
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
            <p className="text-sm text-gray-400 mb-1">n = {Number(label).toLocaleString()}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm font-mono" style={{ color: p.color }}>
                    {p.name}: {p.value.toFixed(4)} µg CO₂
                </p>
            ))}
        </div>
    );
}

export default function CarbonGrowthChart({ data }) {
    // data = array of { algorithm, input_size, avg_co2 }
    if (!data || data.length === 0) {
        return (
            <div className="card-glass p-6 flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No data available. Run experiments at multiple input sizes.</p>
            </div>
        );
    }

    // Build chart data: each point is { input_size, insertion_sort: co2, merge_sort: co2, ... }
    const sizeMap = {};
    data.forEach((d) => {
        const key = d.input_size;
        if (!sizeMap[key]) sizeMap[key] = { input_size: key };
        sizeMap[key][d.algorithm] = d.avg_co2;
    });

    const chartData = Object.values(sizeMap).sort((a, b) => a.input_size - b.input_size);
    const algorithms = [...new Set(data.map((d) => d.algorithm))];

    // Use log scale ticks
    const formatLogTick = (val) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
        return val;
    };

    return (
        <div className="card-glass p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Carbon Growth Curve
            </h3>
            <p className="text-xs text-gray-600 mb-4">
                How CO₂ scales with input size (log-log scale)
            </p>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="input_size"
                        scale="log"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatLogTick}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#1e293b' }}
                        label={{
                            value: 'Input Size (n)',
                            position: 'insideBottom',
                            offset: -5,
                            fill: '#94a3b8',
                            fontSize: 12,
                        }}
                    />
                    <YAxis
                        scale="log"
                        domain={['auto', 'auto']}
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
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    {algorithms.map((alg) => (
                        <Line
                            key={alg}
                            type="monotone"
                            dataKey={alg}
                            name={NAMES[alg] || alg}
                            stroke={COLORS[alg] || '#888'}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            animationDuration={1500}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
