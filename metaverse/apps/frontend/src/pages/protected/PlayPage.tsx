import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Users, MessageCircle, Settings, X } from 'lucide-react';
import { toast } from 'sonner';

const TILE_SIZE = 32; // Size of each movement tile
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C'
];

const PlayPage = () => {
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [token, setToken] = useState<string>('');
    const [ws, setWs] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [users, setUsers] = useState(new Map());
    const [showUsers, setShowUsers] = useState(false);

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
                payload: {
                    spaceId,
                    token
                }
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'space-joined':
                    {
                        setPosition(data.payload.spawn);
                        const userMap = new Map();
                        data.payload.users.forEach(user => {
                            userMap.set(user.id, {
                                ...user,
                                color: COLORS[Math.floor(Math.random() * COLORS.length)]
                            });
                        });
                        setUsers(userMap);
                        break;
                    }

                case 'user-joined':
                    setUsers(prev => {
                        const newUsers = new Map(prev);
                        newUsers.set(data.payload.userId, {
                            id: data.payload.userId,
                            x: data.payload.x,
                            y: data.payload.y,
                            color: COLORS[Math.floor(Math.random() * COLORS.length)]
                        });
                        return newUsers;
                    });
                    break;

                case 'user-left':
                    setUsers(prev => {
                        const newUsers = new Map(prev);
                        newUsers.delete(data.payload.userId);
                        return newUsers;
                    });
                    break;

                case 'movement':
                    setUsers(prev => {
                        const newUsers = new Map(prev);
                        const user = newUsers.get(data.payload.userId);
                        if (user) {
                            user.x = data.payload.x;
                            user.y = data.payload.y;
                        }
                        return newUsers;
                    });
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

        return () => {
            socket.close();
        };
    }, [isAuthenticated, navigate, searchParams, token]);

    // Handle keyboard movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!ws) return;

            let newX = position.x;
            let newY = position.y;

            switch (e.key) {
                case 'ArrowUp':
                    newY--;
                    break;
                case 'ArrowDown':
                    newY++;
                    break;
                case 'ArrowLeft':
                    newX--;
                    break;
                case 'ArrowRight':
                    newX++;
                    break;
                default:
                    return;
            }

            ws.send(JSON.stringify({
                type: 'move',
                payload: { x: newX, y: newY }
            }));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ws, position]);

    const handleBack = () => {
        navigate('/spaces');
    };

    return (
        <div className="min-h-dvh bg-gray-50">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b z-10">
                <div className="flex items-center justify-between px-4 h-16">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Spaces
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowUsers(!showUsers)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="pt-16 px-4">
                <div
                    className="relative w-full h-[calc(100vh-4rem)] bg-white rounded-lg border"
                    style={{ cursor: 'move' }}
                >
                    {/* Current User */}
                    <div
                        className="absolute w-8 h-8 bg-purple-600 rounded-full transition-all duration-200 ease-in-out"
                        style={{
                            transform: `translate(${position.x * TILE_SIZE}px, ${position.y * TILE_SIZE}px)`
                        }}
                    />

                    {/* Other Users */}
                    {Array.from(users.values()).map((user) => (
                        <div
                            key={user.id}
                            className="absolute w-8 h-8 rounded-full transition-all duration-200 ease-in-out"
                            style={{
                                transform: `translate(${user.x * TILE_SIZE}px, ${user.y * TILE_SIZE}px)`,
                                backgroundColor: user.color
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Users Sidebar */}
            {showUsers && (
                <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-white border-l shadow-lg">
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
                            <div className="w-8 h-8 bg-purple-600 rounded-full" />
                            <span className="font-medium">You</span>
                        </div>
                        {Array.from(users.values()).map((user) => (
                            <div key={user.id} className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-8 h-8 rounded-full"
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

export default PlayPage;