import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Download, ChevronDown, ChevronUp, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { getHistory, deleteExperiment, deleteAllExperiments, exportCSV } from '../api/client';

const ALG_NAMES = { insertion_sort: 'Insertion Sort', merge_sort: 'Merge Sort', radix_sort: 'Radix Sort' };

export default function History() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState('timestamp');
    const [sortDir, setSortDir] = useState('desc');
    const [expandedId, setExpandedId] = useState(null);
    const [showDeleteAll, setShowDeleteAll] = useState(false);

    const loadData = async () => {
        try {
            const res = await getHistory({ sort_by: sortCol, sort_order: sortDir });
            setExperiments(res.data.experiments || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => { loadData(); }, [sortCol, sortDir]);

    const filtered = useMemo(() => {
        if (!search) return experiments;
        const q = search.toLowerCase();
        return experiments.filter(e =>
            (ALG_NAMES[e.algorithm] || e.algorithm).toLowerCase().includes(q) ||
            e.input_size.toString().includes(q) || e.measurement_method.toLowerCase().includes(q)
        );
    }, [experiments, search]);

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('desc'); }
    };
    const handleDelete = async (id) => { await deleteExperiment(id); setExperiments(p => p.filter(e => e.id !== id)); };
    const handleDeleteAll = async () => { await deleteAllExperiments(); setExperiments([]); setShowDeleteAll(false); };
    const handleExportCSV = async () => {
        const res = await exportCSV();
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'carbonlens_history.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const SortHeader = ({ col, children }) => (
        <th className="cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort(col)}>
            <div className="flex items-center gap-1">{children}<ArrowUpDown size={12} className={sortCol === col ? 'text-teal' : ''} /></div>
        </th>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Experiment History</h1>
                <p className="text-gray-400">View, search, and manage all saved experiment records.</p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search algorithms, sizes..."
                        className="w-full pl-10 pr-4 py-2.5 bg-carbon-card border border-carbon-border rounded-lg text-sm text-white focus:border-teal focus:outline-none placeholder:text-gray-600" />
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-accent-blue/20 text-accent-blue rounded-lg text-sm font-medium hover:bg-accent-blue/30 transition-all">
                    <Download size={16} /> Export CSV
                </button>
                <button onClick={() => setShowDeleteAll(true)} disabled={experiments.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-red/10 text-accent-red rounded-lg text-sm font-medium hover:bg-accent-red/20 transition-all">
                    <Trash2 size={16} /> Delete All
                </button>
            </div>

            <AnimatePresence>
                {showDeleteAll && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                        <div className="card-glass p-4 border border-accent-red/30 bg-accent-red/5 flex items-center gap-4">
                            <AlertTriangle size={20} className="text-accent-red flex-shrink-0" />
                            <p className="text-sm text-gray-300 flex-1">Delete all {experiments.length} records permanently?</p>
                            <button onClick={handleDeleteAll} className="px-4 py-2 bg-accent-red text-white rounded-lg text-sm font-medium">Confirm</button>
                            <button onClick={() => setShowDeleteAll(false)} className="px-4 py-2 bg-carbon-card text-gray-400 rounded-lg text-sm">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-glass overflow-hidden">
                {loading ? <div className="p-12 text-center text-gray-500">Loading...</div>
                    : filtered.length === 0 ? <div className="p-12 text-center text-gray-500">{search ? 'No matching records.' : 'No experiments saved yet.'}</div>
                        : (
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead><tr>
                                        <SortHeader col="id">ID</SortHeader>
                                        <SortHeader col="timestamp">Timestamp</SortHeader>
                                        <th>Algorithm</th>
                                        <SortHeader col="input_size">Size</SortHeader>
                                        <th>Trials</th>
                                        <SortHeader col="avg_time">Time</SortHeader>
                                        <SortHeader col="avg_co2">CO₂</SortHeader>
                                        <SortHeader col="cei_score">CEI</SortHeader>
                                        <th>Actions</th>
                                    </tr></thead>
                                    <tbody>
                                        {filtered.map(exp => (
                                            <React.Fragment key={exp.id}>
                                                <tr className="cursor-pointer" onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}>
                                                    <td className="font-mono text-gray-500">{exp.id}</td>
                                                    <td className="text-gray-400 text-xs">{exp.timestamp ? new Date(exp.timestamp).toLocaleString() : '—'}</td>
                                                    <td className="font-medium text-white">{ALG_NAMES[exp.algorithm] || exp.algorithm}</td>
                                                    <td className="font-mono text-gray-300">{exp.input_size.toLocaleString()}</td>
                                                    <td className="font-mono text-gray-400">{exp.trial_count}</td>
                                                    <td className="font-mono text-gray-300">{exp.avg_time.toFixed(4)}s</td>
                                                    <td className="font-mono text-accent-amber">{exp.avg_co2.toFixed(4)}µg</td>
                                                    <td className="font-mono text-teal">{exp.cei_score.toFixed(2)}</td>
                                                    <td><div className="flex items-center gap-2">
                                                        {expandedId === exp.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                                        <button onClick={e => { e.stopPropagation(); handleDelete(exp.id); }} className="p-1 text-gray-600 hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                                                    </div></td>
                                                </tr>
                                                <AnimatePresence>
                                                    {expandedId === exp.id && exp.trial_details && (
                                                        <tr><td colSpan={9} className="!p-0">
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-carbon-bg/50 px-6 py-4">
                                                                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Individual Trial Values</p>
                                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                                                    {exp.trial_details.map((t, i) => (
                                                                        <div key={i} className="bg-carbon-card rounded-lg p-3 border border-carbon-border">
                                                                            <p className="text-xs text-gray-500 mb-1">Trial {t.trial}</p>
                                                                            <p className="font-mono text-xs text-gray-300">{t.time.toFixed(4)}s</p>
                                                                            <p className="font-mono text-xs text-accent-amber">{t.energy_mj.toFixed(4)}mJ</p>
                                                                            <p className="font-mono text-xs text-accent-red">{t.co2_ug.toFixed(4)}µg</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </td></tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
            </motion.div>
            <div className="mt-4 text-sm text-gray-600">{filtered.length} of {experiments.length} records</div>
        </div>
    );
}
