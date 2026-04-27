import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FlaskConical,
    Activity,
    Cloud,
    Award,
    Clock,
    Cpu,
    ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats, getHistory, getStatus } from '../api/client';

// ─── CO₂ Particle Background ─────────────────
function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 100;
                this.size = Math.random() * 3 + 1;
                this.speedY = -(Math.random() * 0.5 + 0.2);
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.05;
                this.life = 0;
                this.maxLife = Math.random() * 300 + 200;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.life++;
                if (this.life > this.maxLife || this.y < -10) this.reset();
            }
            draw() {
                const fade = 1 - this.life / this.maxLife;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 170, ${this.opacity * fade})`;
                ctx.fill();

                // CO₂ text on some particles
                if (this.size > 2.5) {
                    ctx.font = '6px Space Mono';
                    ctx.fillStyle = `rgba(0, 212, 170, ${this.opacity * fade * 0.5})`;
                    ctx.fillText('CO₂', this.x + 5, this.y - 3);
                }
            }
        }

        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="particle-canvas" />;
}

// ─── Algorithm Name Map ──────────────────────
const ALG_NAMES = {
    insertion_sort: 'Insertion Sort',
    merge_sort: 'Merge Sort',
    radix_sort: 'Radix Sort',
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [statsRes, histRes, statusRes] = await Promise.all([
                    getDashboardStats(),
                    getHistory({ limit: 5 }),
                    getStatus(),
                ]);
                setStats(statsRes.data);
                setRecent(histRes.data.experiments || []);
                setStatus(statusRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <>
            <ParticleBackground />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        <span className="text-gradient">CarbonLens</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        Experimentally measure and compare the carbon footprint of sorting
                        algorithms. A research tool for sustainable computing.
                    </p>
                    <Link
                        to="/experiment"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-teal hover:bg-teal-light text-carbon-bg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,170,0.3)]"
                    >
                        <FlaskConical size={20} />
                        Run New Experiment
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <StatCard
                        title="Total Experiments"
                        value={stats?.total_experiments || 0}
                        icon={Activity}
                        color="teal"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total CO₂ Estimated"
                        value={stats?.total_co2_ug || 0}
                        suffix="µg"
                        icon={Cloud}
                        color="blue"
                        decimals={2}
                        delay={0.2}
                    />
                    <StatCard
                        title="Most Efficient"
                        value={stats?.most_efficient ? ALG_NAMES[stats.most_efficient] || stats.most_efficient : '—'}
                        icon={Award}
                        color="amber"
                        delay={0.3}
                    />
                    <StatCard
                        title="Last Experiment"
                        value={
                            stats?.last_timestamp
                                ? new Date(stats.last_timestamp).toLocaleDateString()
                                : '—'
                        }
                        icon={Clock}
                        color="purple"
                        delay={0.4}
                    />
                </div>

                {/* Energy Source Indicator */}
                {status && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="card-glass p-4 mb-8 flex items-center gap-3"
                    >
                        <Cpu size={18} className="text-teal" />
                        <div>
                            <p className="text-sm font-medium text-white">
                                Energy Measurement: <span className="font-mono text-teal">{status.measurement_method}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {status.system.platform} • {status.system.processor || status.system.machine} • Python {status.system.python_version}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Recent Experiments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card-glass overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-carbon-border flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Experiments</h2>
                        <Link
                            to="/history"
                            className="text-sm text-teal hover:text-teal-light transition-colors"
                        >
                            View All →
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <div className="p-12 text-center">
                            <FlaskConical size={40} className="mx-auto text-gray-600 mb-3" />
                            <p className="text-gray-500">No experiments yet. Run your first one!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Algorithm</th>
                                        <th>Input Size</th>
                                        <th>CO₂ (µg)</th>
                                        <th>CEI Score</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((exp) => (
                                        <tr key={exp.id}>
                                            <td className="font-medium text-white">
                                                {ALG_NAMES[exp.algorithm] || exp.algorithm}
                                            </td>
                                            <td className="font-mono text-gray-300">
                                                {exp.input_size.toLocaleString()}
                                            </td>
                                            <td className="font-mono text-accent-amber">
                                                {exp.avg_co2.toFixed(4)}
                                            </td>
                                            <td className="font-mono text-teal">
                                                {exp.cei_score.toFixed(2)}
                                            </td>
                                            <td className="text-gray-500 text-sm">
                                                {exp.timestamp
                                                    ? new Date(exp.timestamp).toLocaleString()
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
}
