// import { useEffect, useState } from "react";

// interface AvatarProps {
//     position: { x: number; y: number };
// }

// export default function Avatar({ position }: AvatarProps) {
//     const [pos, setPos] = useState({ x: 0, y: 0 })
//     useEffect(() => {
//         const xx = position.x ;
//         const yy = position.y ;
//         setPos({ x: xx, y: yy })
//     }, [position])
//     return (
//         <div
//             className="absolute transition-all duration-200 text-2xl flex items-center justify-center"
//             style={{
//                 left: `${pos.x * 40 + 20}px`,
//                 top: `${pos.y * 40 + 20}px`,
//                 transform: 'translate(-50%, -50%)'
//             }}
//         >
//             👨‍🚀
//         </div>
//     );
// }

// ========================================================================================================================================================================================================================================

// Avatar.tsx
interface AvatarProps {
    emoji?: string;
}
export default function Avatar({ emoji = '👨‍🚀' }: AvatarProps) {
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="text-2xl">{emoji}</div>
        </div>
    );
}