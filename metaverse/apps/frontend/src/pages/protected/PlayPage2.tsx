import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, MessageCircle, Settings, X } from 'lucide-react';
import { toast } from 'sonner';

const TILE_SIZE = 64; // Increased tile size for better visibility
const MAP_WIDTH = 50 * TILE_SIZE; // Example map dimensions
const MAP_HEIGHT = 50 * TILE_SIZE;

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const PlayPage2 = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState<string>('');
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [ws, setWs] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [users, setUsers] = useState(new Map());
    const [showUsers, setShowUsers] = useState(false);
    const mapRef = useRef();

    // Calculate viewport center
    const getViewportCenter = useCallback(() => {
        if (!mapRef.current) return { x: 0, y: 0 };
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
    }, []);

    // Calculate map offset based on player position
    const getMapOffset = useCallback(() => {
        const center = getViewportCenter();
        return {
            x: center.x - position.x * TILE_SIZE,
            y: center.y - position.y * TILE_SIZE
        };
    }, [position]);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const spaceId = searchParams.get('spaceId');
        if (!spaceId) {
            navigate('/spaces');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('User token not found')
            return
        }
        setToken(token);

        const socket = new WebSocket('ws://localhost:3001');

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'join',
                payload: { spaceId, token }
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'space-joined':
                    { setPosition(data.payload.spawn);
                    const userMap = new Map();
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    data.payload.users.forEach(user => {
                        userMap.set(user.id, {
                            ...user,
                            color: COLORS[Math.floor(Math.random() * COLORS.length)]
                        });
                    });
                    setUsers(userMap);
                    break; }

                case 'user-joined':
                case 'movement':
                case 'user-left':
                    handleUserUpdate(data);
                    break;

                case 'movement-rejected':
                    setPosition({
                        x: data.payload.x,
                        y: data.payload.y
                    });
                    break;
            }
        };

        setWs(socket);
        return () => socket.close();
    }, [isAuthenticated, navigate, searchParams, token]);

    const handleUserUpdate = (data) => {
        setUsers(prev => {
            const newUsers = new Map(prev);
            switch (data.type) {
                case 'user-joined':
                    newUsers.set(data.payload.userId, {
                        id: data.payload.userId,
                        x: data.payload.x,
                        y: data.payload.y,
                        color: COLORS[Math.floor(Math.random() * COLORS.length)]
                    });
                    break;
                case 'movement':
                    { const user = newUsers.get(data.payload.userId);
                    if (user) {
                        user.x = data.payload.x;
                        user.y = data.payload.y;
                    }
                    break; }
                case 'user-left':
                    newUsers.delete(data.payload.userId);
                    break;
            }
            return newUsers;
        });
    };

    // Handle keyboard movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!ws) return;

            let newX = position.x;
            let newY = position.y;

            switch (e.key) {
                case 'ArrowUp': newY--; break;
                case 'ArrowDown': newY++; break;
                case 'ArrowLeft': newX--; break;
                case 'ArrowRight': newX++; break;
                default: return;
            }

            ws.send(JSON.stringify({
                type: 'move',
                payload: { x: newX, y: newY }
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ws, position]);

    const mapOffset = getMapOffset();

    return (
        <div className="fixed inset-0 overflow-hidden bg-green-100">
            {/* Game Viewport */}
            <div className="relative w-full h-full">
                {/* Map Container */}
                <div
                    ref={mapRef}
                    className="absolute w-full h-full"
                    style={{
                        backgroundImage: 'url(/grid-pattern.png)',
                        backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
                        transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                        width: MAP_WIDTH,
                        height: MAP_HEIGHT
                    }}
                >
                    {/* Map Elements (trees, water, etc) */}
                    <div className="absolute inset-0">
                        {/* Add your map elements here */}
                    </div>

                    {/* Other Users */}
                    {Array.from(users.values()).map((user) => (
                        <div
                            key={user.id}
                            className="absolute transition-transform duration-200"
                            style={{
                                transform: `translate(${user.x * TILE_SIZE}px, ${user.y * TILE_SIZE}px)`,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: user.color }}
                            />
                        </div>
                    ))}
                </div>

                {/* Centered Player */}
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Player"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-purple-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* UI Overlay */}
            <div className="fixed top-4 right-4 flex gap-2">
                <button
                    onClick={() => setShowUsers(!showUsers)}
                    className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50"
                >
                    <Users className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50">
                    <MessageCircle className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Users Sidebar */}
            {showUsers && (
                <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Users in Space</h2>
                        <button
                            onClick={() => setShowUsers(false)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 overflow-hidden rounded-full border-2 border-purple-200">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="You"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-purple-600" />
                                )}
                            </div>
                            <span className="font-medium">You</span>
                        </div>
                        {Array.from(users.values()).map((user) => (
                            <div key={user.id} className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                                    style={{ backgroundColor: user.color }}
                                />
                                <span>User {user.id.slice(0, 6)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayPage2;