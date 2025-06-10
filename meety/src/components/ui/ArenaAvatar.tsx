import { TILE_SIZE } from "../../utils/constants";

interface AvatarProps {
    emoji?: string;
    color?: string;
    className?: string;
  }
  
  export function ArenaAvatar({ emoji = '👨‍🚀', color, className = '' }: AvatarProps) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={color ? {
          backgroundColor: color,
          borderRadius: '50%',
          width: TILE_SIZE,
          height: TILE_SIZE
        } : undefined}
      >
        <span className="text-2xl select-none pointer-events-none">{emoji}</span>
      </div>
    );
  }
  