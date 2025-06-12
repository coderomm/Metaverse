import React from 'react';
import type { Position, UserRes } from '../../utils/types';
import { useViewport } from '../../hooks/useViewport';
import { TILE_SIZE } from '../../utils/constants';
import { ArenaAvatar } from './ArenaAvatar';

interface MapProps {
    width: number;
    height: number;
    playerPosition: Position;
    users: Map<string, UserRes>;
}

const createGridCells = (width: number, height: number) => 
    Array.from({ length: width * height }, (_, index) => ({
        id: `cell-${index}`,
        index
    }));

export function ArenaMap({ width, height, playerPosition, users }: MapProps) {
    const viewport = useViewport();
    const [mapOffset, setMapOffset] = React.useState({ x: 0, y: 0 });

    const calculateOffset = React.useCallback(() => {
        const mapWidth = width * TILE_SIZE;
        const mapHeight = height * TILE_SIZE;

        let offsetX = viewport.width / 2 - playerPosition.x * TILE_SIZE;
        let offsetY = viewport.height / 2 - playerPosition.y * TILE_SIZE;

        offsetX = Math.min(0, Math.max(viewport.width - mapWidth, offsetX));
        offsetY = Math.min(0, Math.max(viewport.height - mapHeight, offsetY));

        if (mapWidth < viewport.width) {
            offsetX = (viewport.width - mapWidth) / 2;
        }
        if (mapHeight < viewport.height) {
            offsetY = (viewport.height - mapHeight) / 2;
        }

        return { x: offsetX, y: offsetY };
    }, [width, height, playerPosition.x, playerPosition.y, viewport.width, viewport.height]);

    React.useEffect(() => {
        setMapOffset(calculateOffset());
    }, [calculateOffset]);

    const gridCells = React.useMemo(() => createGridCells(width, height), [width, height]);

    const MemoizedArenaAvatar = React.memo(ArenaAvatar);

    return (
        <div className="fixed inset-0 overflow-hidden bg-gray-900">
            <div
                className="absolute will-change-transform transition-transform duration-200 ease-in-out"
                style={{
                    transform: `translate3d(${mapOffset.x}px, ${mapOffset.y}px, 0)`,
                    width: `${width * TILE_SIZE}px`,
                    height: `${height * TILE_SIZE}px`,
                }}
            >
                {/* Grid */}
                <div
                    className="grid gap-px absolute inset-0"
                    style={{
                        gridTemplateColumns: `repeat(${width}, ${TILE_SIZE}px)`,
                    }}
                >
                    {gridCells.map(({ id, index }) => (
                        <div
                            key={id}
                            className="bg-gray-800/50 border border-gray-700/30 text-white/50"
                        >
                            {index}
                        </div>
                    ))}
                </div>

                {/* Player */}
                <div
                    className="absolute will-change-transform transition-transform duration-200 ease-in-out"
                    style={{
                        transform: `translate3d(${playerPosition.x * TILE_SIZE}px, ${playerPosition.y * TILE_SIZE}px, 0)`,
                    }}
                >
                    <MemoizedArenaAvatar emoji="💀" color="#ffffff" />
                </div>

                {/* Other Users */}
                {Array.from(users.entries()).map(([id, user]) => (
                    <div
                        key={`user-${id}`}
                        className="absolute will-change-transform transition-transform duration-200 ease-in-out"
                        style={{
                            transform: `translate3d(${user.x * TILE_SIZE}px, ${user.y * TILE_SIZE}px, 0)`,
                        }}
                    >
                        <MemoizedArenaAvatar emoji="🐵" color={user.color || '#FF6B6B'} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const MemoizedArenaMap = React.memo(ArenaMap);