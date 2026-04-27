import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function ProgressFeed({ items }) {
    return (
        <div className="card-glass p-6 max-h-[400px] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Experiment Progress
            </h3>
            <div className="space-y-2">
                <AnimatePresence>
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-carbon-bg/50"
                        >
                            {item.status === 'done' ? (
                                <CheckCircle2 size={16} className="text-teal flex-shrink-0" />
                            ) : item.status === 'warning' ? (
                                <AlertTriangle size={16} className="text-accent-amber flex-shrink-0" />
                            ) : (
                                <Loader2 size={16} className="text-accent-blue animate-spin flex-shrink-0" />
                            )}
                            <span
                                className={`text-sm font-mono ${item.status === 'warning'
                                        ? 'text-accent-amber'
                                        : item.status === 'done'
                                            ? 'text-gray-300'
                                            : 'text-white'
                                    }`}
                            >
                                {item.message}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
