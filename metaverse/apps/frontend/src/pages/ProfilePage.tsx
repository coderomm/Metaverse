// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Avatar {
    id: number;
    imageUrl: string;
    name: string;
}

export const ProfilePage = () => {
    const [nickname, setNickname] = useState('');
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        fetchAvatars();
    }, []);

    const fetchAvatars = async () => {
        try {
            const response = await api.get('/avatars');
            setAvatars(response.data.avatars);
        } catch (error) {
            console.error('Failed to fetch avatars:', error);
        }
    };

    const filteredAvatars = avatars.filter(avatar =>
        avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/user/metadata', {
                avatarId: selectedAvatarId,
            });
        } catch (error) {
            console.error('Failed to save changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nickname
                    </label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Avatar
                    </label>
                    <input
                        type="text"
                        placeholder="Search avatars..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                    />

                    <div className="grid grid-cols-4 gap-4">
                        {filteredAvatars.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatarId(avatar.id)}
                                className={`cursor-pointer rounded-lg p-2 border-2 ${selectedAvatarId === avatar.id
                                    ? 'border-purple-500'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={avatar.imageUrl}
                                    alt={avatar.name}
                                    className="w-full h-auto rounded-lg"
                                />
                                <p className="text-sm text-center mt-1">{avatar.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};