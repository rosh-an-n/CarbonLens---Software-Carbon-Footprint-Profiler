import { useState, useCallback, useRef } from 'react';
import { runExperimentSSE, saveExperimentsBulk } from '../api/client';

/**
 * useExperiment — Manages experiment execution state with SSE streaming.
 */
export function useExperiment() {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState([]);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const abortRef = useRef(null);

    const runExperiment = useCallback((config) => {
        setIsRunning(true);
        setProgress([]);
        setResults(null);
        setError(null);
        setIsSaved(false);

        const cancel = runExperimentSSE(
            config,
            (message) => {
                setProgress((prev) => [...prev, message]);
            },
            (finalResults) => {
                setResults(finalResults);
                setIsRunning(false);
            },
            (err) => {
                setError(err.message || 'Experiment failed');
                setIsRunning(false);
            }
        );

        abortRef.current = cancel;
    }, []);

    const cancelExperiment = useCallback(() => {
        if (abortRef.current) {
            abortRef.current();
            setIsRunning(false);
        }
    }, []);

    const saveResults = useCallback(async (config) => {
        if (!results) return;

        try {
            const experiments = results.map((r) => ({
                algorithm: r.algorithm,
                input_size: r.input_size,
                trial_count: r.trial_count,
                avg_time: r.avg_time,
                avg_energy: r.avg_energy,
                avg_co2: r.avg_co2,
                cei_score: r.cei_score,
                measurement_method: r.measurement_method,
                trial_details: JSON.stringify(r.trials),
            }));

            await saveExperimentsBulk(experiments);
            setIsSaved(true);
        } catch (err) {
            setError('Failed to save: ' + (err.message || 'Unknown error'));
        }
    }, [results]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setProgress([]);
        setResults(null);
        setError(null);
        setIsSaved(false);
    }, []);

    return {
        isRunning,
        progress,
        results,
        error,
        isSaved,
        runExperiment,
        cancelExperiment,
        saveResults,
        reset,
    };
}

export default useExperiment;
