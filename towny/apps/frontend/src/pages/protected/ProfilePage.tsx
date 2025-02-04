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
import PageWrapper from '../../components/ui/PageWrapper';

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
        <PageWrapper>
            <Section>
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                        loadingLabel='Saving...'
                        label='Save Changes'
                        className="hidden sm:flex w-max shadow-lg drop-shadow-lg"
                        icon={<CircleCheck className='w-5' />}
                    />
                </div>

                <div className="space-y-6">
                    <TextInput
                        type="text"
                        placeholder="Search avatars..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        label='Select Avatar'
                    />

                    <div className="grid justify-items-center grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                        {filteredAvatars.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatarId(avatar.id)}
                                className={`p-1 flex flex-col items-center justify-start gap-1 drop-shadow-md bg-white rounded-lg cursor-pointer w-max transition-all duration-200 ease-in-out hover:drop-shadow-2xl hover:scale-[1.1] border-[2px] ${selectedAvatarId === avatar.id
                                    ? 'border-purple-500'
                                    : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={avatar.imageUrl}
                                    alt={avatar.name}
                                    className='w-20 rounded-md md:w-20 lg:w-24 lg:h-auto'
                                    loading='lazy'
                                />
                                <h4 className='text-base md:text-lg'>{avatar.name}</h4>
                            </div>

                        ))}
                    </div>
                </div>

                <div className="sticky bottom-0 p-2 flex items-center justify-center sm:hidden">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                        loadingLabel='Saving...'
                        label='Save Changes'
                        className="w-full shadow-lg drop-shadow-lg mt-10"
                        icon={<CircleCheck className='w-5' />}
                    />
                </div>
            </Section >
        </PageWrapper >
    );
};