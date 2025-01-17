import { useEffect, useState, useCallback } from 'react';
import { Position, UserRes } from '../../utils/types';
import { useViewport } from '../../hooks/useViewport';
import { TILE_SIZE } from '../../utils/constants';
import { ArenaAvatar } from './ArenaAvatar';

interface MapProps {
  width: number;
  height: number;
  playerPosition: Position;
  users: Map<string, UserRes>;
}

export function ArenaMap({ width, height, playerPosition, users }: MapProps) {
  const viewport = useViewport();
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  
  const calculateOffset = useCallback(() => {
    const mapWidth = width * TILE_SIZE;
    const mapHeight = height * TILE_SIZE;
    
    let offsetX = viewport.width / 2 - playerPosition.x * TILE_SIZE;
    let offsetY = viewport.height / 2 - playerPosition.y * TILE_SIZE;
    
    // Left boundary
    if (offsetX > 0) {
      offsetX = 0;
    }
    // Right boundary
    else if (offsetX < viewport.width - mapWidth) {
      offsetX = viewport.width - mapWidth;
    }
    
    // Top boundary
    if (offsetY > 0) {
      offsetY = 0;
    }
    // Bottom boundary
    else if (offsetY < viewport.height - mapHeight) {
      offsetY = viewport.height - mapHeight;
    }
    
    // If map is smaller than viewport, center it
    if (mapWidth < viewport.width) {
      offsetX = (viewport.width - mapWidth) / 2;
    }
    if (mapHeight < viewport.height) {
      offsetY = (viewport.height - mapHeight) / 2;
    }
    
    return { x: offsetX, y: offsetY };
  }, [width, height, playerPosition, viewport]);
  
  useEffect(() => {
    setMapOffset(calculateOffset());
  }, [calculateOffset]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-900">
      {/* Map Container */}
      <div 
        className="absolute will-change-transform"
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
          {Array(width * height).fill(null).map((_, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 border border-gray-700/30 text-white/50">{index}</div>
          ))}
        </div>

        {/* Player */}
        <div 
          className="absolute will-change-transform"
          style={{
            transform: `translate3d(${playerPosition.x * TILE_SIZE}px, ${playerPosition.y * TILE_SIZE}px, 0)`,
          }}
        >
          <ArenaAvatar />
        </div>

        {/* Other Users */}
        {Array.from(users.values()).map((user) => (
          <div
            key={user.id}
            className="absolute will-change-transform"
            style={{
              transform: `translate3d(${user.x * TILE_SIZE}px, ${user.y * TILE_SIZE}px, 0)`,
            }}
          >
            <ArenaAvatar emoji="👾" color={user.color} />
          </div>
        ))}
      </div>
    </div>
  );
}