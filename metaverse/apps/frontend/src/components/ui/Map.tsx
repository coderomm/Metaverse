// interface MapProps {
//     size: number;
// }

// const spaceObjects = ['🪐', '🌟', '☄️', '🌠', '🌑'];

// export default function Map({ size }: MapProps) {
//     const grid = Array(size).fill(null).map(() => Array(size).fill(null));

//     // Randomly place space objects
//     for (let i = 0; i < size * 2; i++) {
//         const x = Math.floor(Math.random() * size);
//         const y = Math.floor(Math.random() * size);
//         grid[y][x] = spaceObjects[Math.floor(Math.random() * spaceObjects.length)];
//     }

//     return (
//         <div
//             className="grid gap-1 p-1 bg-gray-900 rounded-lg"
//             style={{
//                 gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
//                 width: `${size * 40}px`,
//                 height: `${size * 40}px`
//             }}
//         >
//             {grid.flat().map((cell, index) => (
//                 <div key={index} className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded">
//                     {cell}
//                 </div>
//             ))}
//         </div>
//     );
// }


interface MapProps {
  size: { width: number; height: number };
}

const spaceObjects = ['🪐', '🌟', '☄️', '🌠', '🌑'];

export default function PlayMap({ size }: MapProps) {
  const grid = Array(size.height).fill(null).map(() => Array(size.width).fill(null));

  // Randomly place space objects
  for (let i = 0; i < size.width * size.height / 50; i++) {
    const x = Math.floor(Math.random() * size.width);
    const y = Math.floor(Math.random() * size.height);
    grid[y][x] = spaceObjects[Math.floor(Math.random() * spaceObjects.length)];
  }

  return (
    <div 
      className="absolute inset-0 grid gap-1 p-1"
      style={{ 
        gridTemplateColumns: `repeat(${size.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${size.height}, minmax(0, 1fr))`,
      }}
    >
      {grid.flat().map((cell, index) => (
        <div key={index} className="flex items-center justify-center">
          {cell}
        </div>
      ))}
    </div>
  );
}