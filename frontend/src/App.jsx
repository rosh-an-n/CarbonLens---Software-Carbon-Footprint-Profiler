import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RunExperiment from './pages/RunExperiment';
import Compare from './pages/Compare';
import History from './pages/History';
import About from './pages/About';

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
            >
                <Routes location={location}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/experiment" element={<RunExperiment />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <Router>
            <div className="min-h-screen bg-carbon-bg">
                <Navbar />
                <AnimatedRoutes />
            </div>
        </Router>
    );
}
