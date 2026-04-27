import React from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';

export default function StatCard({
    title,
    value,
    suffix = '',
    icon: Icon,
    color = 'teal',
    decimals = 0,
    delay = 0,
}) {
    const animatedValue = useCountUp(
        typeof value === 'number' ? value : 0,
        1500,
        decimals,
        true
    );

    const colorMap = {
        teal: {
            bg: 'bg-teal/10',
            border: 'border-teal/20',
            icon: 'text-teal',
            glow: 'shadow-[0_0_30px_rgba(0,212,170,0.08)]',
        },
        blue: {
            bg: 'bg-accent-blue/10',
            border: 'border-accent-blue/20',
            icon: 'text-accent-blue',
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.08)]',
        },
        amber: {
            bg: 'bg-accent-amber/10',
            border: 'border-accent-amber/20',
            icon: 'text-accent-amber',
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.08)]',
        },
        purple: {
            bg: 'bg-accent-purple/10',
            border: 'border-accent-purple/20',
            icon: 'text-accent-purple',
            glow: 'shadow-[0_0_30px_rgba(139,92,246,0.08)]',
        },
    };

    const c = colorMap[color] || colorMap.teal;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`card-glass p-6 ${c.glow} hover:scale-[1.02] transition-transform duration-300`}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                    {title}
                </p>
                {Icon && (
                    <div className={`p-2 rounded-lg ${c.bg}`}>
                        <Icon size={20} className={c.icon} />
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-white">
                    {typeof value === 'number' ? animatedValue.toLocaleString() : value || '—'}
                </span>
                {suffix && (
                    <span className="text-sm text-gray-500 font-mono">{suffix}</span>
                )}
            </div>
        </motion.div>
    );
}
