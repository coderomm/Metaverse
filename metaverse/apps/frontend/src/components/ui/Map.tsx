// interface MapProps {
//   width: number;
//   height: number;
// }

// // const spaceObjects = ['🪐', '🌑'];

// export default function Map({ width, height }: MapProps) {
//   const grid = Array(height).fill(null).map(() => Array(width).fill(null));
//   // for (let i = 0; i < width * height * 2; i++) {
//   //   const x = Math.floor(Math.random() * width);
//   //   const y = Math.floor(Math.random() * height);
//   //   grid[y][x] = spaceObjects[Math.floor(Math.random() * spaceObjects.length)];
//   // }

//   return (
//     <div
//       className="grid gap-1 p-1 bg-gray-900 rounded-lg"
//       style={{
//         gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
//         width: `${width * 40}px`,
//         height: `${height * 40}px`
//       }}
//     >
//       {grid.flat().map((cell, index) => (
//         <div key={index} className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded">
//           {cell}{index + 1}
//         </div>
//       ))}
//     </div>
//   );
// }

// ========================================================================================================================================================================================================================================


// Map.tsx
import { useEffect, useState } from 'react';

interface MapProps {
  width: number;
  height: number;
  playerPosition: { x: number; y: number };
}

export default function PlayMap({ width, height, playerPosition }: MapProps) {
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const TILE_SIZE = 32;
  const VIEWPORT_WIDTH = window.innerWidth - 48; // Accounting for sidebar
  const VIEWPORT_HEIGHT = window.innerHeight;

  useEffect(() => {
    // Center the map on the player
    const centerX = (VIEWPORT_WIDTH / 2) - (playerPosition.x * TILE_SIZE);
    const centerY = (VIEWPORT_HEIGHT / 2) - (playerPosition.y * TILE_SIZE);

    setMapOffset({ x: centerX, y: centerY });
  }, [playerPosition]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute transition-transform duration-200"
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
          width: `${width * TILE_SIZE}px`,
          height: `${height * TILE_SIZE}px`,
        }}
      >
        <div className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(${width}, ${TILE_SIZE}px)`,
            width: '100%',
            height: '100%'
          }}
        >
          {Array(width * height).fill(null).map((_, index) => (
            <div
              key={index}
              className="bg-gray-800/50 border border-white text-white"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE
              }}
            >{index}</div>
          ))}
        </div>
      </div>
    </div>
  );
}