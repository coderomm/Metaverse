interface AvatarProps {
    position: { x: number; y: number };
}

export default function Avatar({ position }: AvatarProps) {
    return (
        <div
            className="absolute transition-all duration-200 text-2xl"
            style={{
                left: `${position.x * 40 + 20}px`,
                top: `${position.y * 40 + 20}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            👨‍🚀
        </div>
    );
}