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