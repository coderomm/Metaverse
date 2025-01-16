import { useState, useEffect } from 'react';
import Map from './components/ui/Map';
import Avatar from './components/ui/Avatar';

const GRID_SIZE = 10;
// const MOVE_DELAY = 200; // ms

export default function Arena() {
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const newPosition = { ...playerPosition };

            switch (key) {
                case 'arrowup':
                case 'w':
                    newPosition.y = Math.max(0, playerPosition.y - 1);
                    break;
                case 'arrowdown':
                case 's':
                    newPosition.y = Math.min(GRID_SIZE - 1, playerPosition.y + 1);
                    break;
                case 'arrowleft':
                case 'a':
                    newPosition.x = Math.max(0, playerPosition.x - 1);
                    break;
                case 'arrowright':
                case 'd':
                    newPosition.x = Math.min(GRID_SIZE - 1, playerPosition.x + 1);
                    break;
                default:
                    return;
            }

            setPlayerPosition(newPosition);
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [playerPosition]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-4xl font-bold mb-8">Space Arena</h1>
            <div className="relative">
                <Map size={{ width: 100, height: 100 }} />
                <Avatar position={playerPosition} />
            </div>
            <p className="mt-4">Use arrow keys or WASD to move</p>
        </div>
    );
}

