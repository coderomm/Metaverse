// hooks/useViewport.ts
import { useState, useEffect } from 'react';
import { SIDEBAR_WIDTH } from '../utils/constants';

export function useViewport() {
    const [viewport, setViewport] = useState({
        width: window.innerWidth - SIDEBAR_WIDTH,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setViewport({
                width: window.innerWidth - SIDEBAR_WIDTH,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return viewport;
}