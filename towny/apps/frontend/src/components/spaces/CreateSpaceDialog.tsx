// src/components/spaces/CreateSpaceDialog.tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import SpinLoader from '../ui/SpinLoader';

interface Map {
    id: string;
    name: string;
    width: number;
    height: number;
    thumbnail: string;
    mapElements: {
        id: {
            id: string;
            mapId: string;
            elementId: string;
            x: number;
            y: number;
        }[];
    };
}

interface MapResponse {
    maps: Map[];
}

export const CreateSpaceDialog = ({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMap, setSelectedMap] = useState<Map | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'select-map' | 'configure-space'>('select-map');
    const [spaceName, setSpaceName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [password, setPassword] = useState('');
    const [dimensions, setDimensions] = useState({ width: '', height: '' });
    const navigate = useNavigate();

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setStep('select-map');
            setSpaceName('');
            setIsPublic(true);
            setPassword('');
            setSelectedMap(null);
            setDimensions({ width: '', height: '' });
            fetchMaps();
        }
    }, [open]);

    // Prevent background scrolling when dialog is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const fetchMaps = async () => {
        try {
            const response = await api.get<MapResponse>('/maps');
            setMaps(response.data.maps);
        } catch (error) {
            console.error('Error fetching maps:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMapSelect = (map: Map) => {
        setSelectedMap(map);
        setStep('configure-space');
    };

    const validateDimensions = () => {
        const width = parseInt(dimensions.width);
        const height = parseInt(dimensions.height);
        return width > 0 && height > 0 && width <= 9999 && height <= 9999;
    };

    const handleCreateSpace = async () => {
        try {
            const dimensionsString = selectedMap
                ? `${selectedMap.width}x${selectedMap.height}`
                : `${dimensions.width}x${dimensions.height}`;

            const response = await api.post('/space', {
                name: spaceName,
                mapId: selectedMap?.id,
                dimensions: dimensionsString,
            });

            if (response.data.spaceId) {
                onClose();
                navigate(`/play?spaceId=${response.data.spaceId}`);
            }
        } catch (error) {
            console.error('Error creating space:', error);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {step === 'select-map' ? 'Select a Template' : 'Configure Space'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {step === 'select-map' ? (
                    <div>
                        <div className="flex gap-4 mb-6 overflow-x-auto py-2">
                            <button className="px-4 py-2 rounded-full bg-primary text-white">
                                All
                            </button>
                            <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                                Education
                            </button>
                            <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                                Quiz
                            </button>
                            <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                                Event
                            </button>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center">
                                <SpinLoader />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                                <div
                                    onClick={() => setStep('configure-space')}
                                    className="cursor-pointer group relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center aspect-video"
                                >
                                    <div className="text-center p-4">
                                        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-primary" />
                                        <p className="text-gray-600 group-hover:text-primary">Create Empty Space</p>
                                    </div>
                                </div>
                                {maps.map((map) => (
                                    <div
                                        key={map.id}
                                        onClick={() => handleMapSelect(map)}
                                        className="cursor-pointer group relative rounded-lg overflow-hidden"
                                    >
                                        <img
                                            src={map.thumbnail}
                                            alt={map.name}
                                            className="w-full aspect-video object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <p className="text-white font-medium">{map.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Space Name
                            </label>
                            <input
                                type="text"
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                                maxLength={30}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter space name"
                            />
                            <p className="text-sm text-gray-500 mt-1">{spaceName.length}/30</p>
                        </div>

                        {!selectedMap && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Width (px)
                                    </label>
                                    <input
                                        type="number"
                                        value={dimensions.width}
                                        onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                                        min="1"
                                        max="9999"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter width"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Height (px)
                                    </label>
                                    <input
                                        type="number"
                                        value={dimensions.height}
                                        onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                                        min="1"
                                        max="9999"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter height"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Public Option
                            </label>
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className="ml-3 text-sm font-medium text-gray-900">Public</span>
                            </div>
                        </div>

                        {!isPublic && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Set password"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setStep('select-map')
                                    setSelectedMap(null);
                                }}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreateSpace}
                                disabled={!spaceName || (!selectedMap && !validateDimensions())}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};