import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — Animates a number counting up from 0 to target.
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms (default 1500)
 * @param {number} decimals - Decimal places (default 0)
 * @param {boolean} start - Whether to start the animation
 */
export function useCountUp(target, duration = 1500, decimals = 0, start = true) {
    const [value, setValue] = useState(0);
    const frameRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (!start || target === 0 || target === null || target === undefined) {
            setValue(target || 0);
            return;
        }

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            setValue(Number(current.toFixed(decimals)));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        startTimeRef.current = null;
        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [target, duration, decimals, start]);

    return value;
}

export default useCountUp;
