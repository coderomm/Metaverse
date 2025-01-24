// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/ui/Section';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import SpinLoader from '../../components/ui/SpinLoader';

interface Avatar {
    id: number;
    imageUrl: string;
    name: string;
}

export const ProfilePage = () => {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, fetchCurrentUser, isLoading } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/account/login');
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
            toast.success('Profile updated successfully!');
            await fetchCurrentUser();
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <>
            <div className="flex items-center justify-center h-[80vh]">
                <SpinLoader />
            </div>
        </>
    }

    return (
        <div className="min-h-screen pb-10 pt-16">
            <Section className='min-h-dvh pb-10 pt-16'>
                <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

                <div className="space-y-6">
                    <TextInput
                        type="text"
                        placeholder="Search avatars..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        label='Select Avatar'
                    />

                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
                        {filteredAvatars.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatarId(avatar.id)}
                                className={`cursor-pointer rounded-lg p-2 border-2 transition-all ease-in-out duration-100 ${selectedAvatarId === avatar.id
                                    ? 'border-purple-500'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={avatar.imageUrl}
                                    alt={avatar.name}
                                    className="w-full h-auto rounded-lg"
                                    loading='lazy'
                                />
                                <p className="text-sm text-center mt-1">{avatar.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-0 p-2 flex items-center justify-center md:justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                        loadingLabel='Saving...'
                        label='Save Changes'
                        className="w-full md:w-max shadow-lg drop-shadow-lg"
                        icon={<CircleCheck className='w-5' />}
                    />
                </div>
            </Section >
        </div >
    );
};