import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FlaskConical,
    BarChart3,
    History,
    Info,
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/experiment', label: 'Run Experiment', icon: FlaskConical },
    { path: '/compare', label: 'Compare', icon: BarChart3 },
    { path: '/history', label: 'History', icon: History },
    { path: '/about', label: 'About', icon: Info },
];

function CO2Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
                {/* CO₂ molecule - central C */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-teal border-2 border-teal-light shadow-[0_0_12px_rgba(0,212,170,0.5)]" />
                {/* O atoms */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-accent-blue/80 border border-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent-blue/80 border border-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                {/* Bonds */}
                <div className="absolute top-2 left-1.5 w-3 h-px bg-gradient-to-r from-accent-blue/60 to-teal/60 rotate-[-40deg]" />
                <div className="absolute bottom-2 right-1.5 w-3 h-px bg-gradient-to-r from-teal/60 to-accent-blue/60 rotate-[-40deg]" />
            </div>
            <span className="text-xl font-bold tracking-tight">
                <span className="text-teal">Carbon</span>
                <span className="text-white">Lens</span>
            </span>
        </div>
    );
}

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-carbon-border bg-carbon-bg/80 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <NavLink to="/">
                        <CO2Logo />
                    </NavLink>

                    <div className="flex items-center gap-1">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'text-teal bg-teal/10 shadow-[0_0_15px_rgba(0,212,170,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`
                                }
                            >
                                <Icon size={16} />
                                <span className="hidden md:inline">{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
