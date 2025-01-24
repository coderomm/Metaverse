// src/pages/admin/AdminElementManager.tsx
import { useState, useEffect, useCallback } from 'react';
import { Avatar, CreateAvatarData, GetAvatarsResponse } from '../../utils/types';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { AvatarForm } from '../../components/admin/AvatarForm';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

export function CreateAvatar() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const elementsApi = {
        getElements: () => api.get<GetAvatarsResponse>('/avatars'),
        createElement: (data: CreateAvatarData) => api.post<Avatar>('/admin/avatar', data),
    };

    const handleError = (error: unknown) => {
        const message = error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        setError(message);
        toast.info(message)
    };

    const fetchElements = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await elementsApi.getElements();
            setAvatars(response.data.avatars);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchElements();
    }, [fetchElements]);

    useEffect(() => {
        if (showCreateForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showCreateForm]);

    const handleCreate = async (data: CreateAvatarData) => {
        try {
            setIsSubmitting(true);
            setError(null);
            await elementsApi.createElement(data);
            await fetchElements();
            setShowCreateForm(false);
            toast.success('Avatar created successfully')
        } catch (err) {
            handleError(err);
            toast.error('Error: ' + err)
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-start lg:justify-between items-start lg:items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Avatar Management</h1>
                    {!showCreateForm && (
                        <div className="sticky bottom-0 p-2 items-center justify-center md:justify-end w-full hidden xl:flex">
                            <Button onClick={() => setShowCreateForm(true)} label='Create New Avatar' className='w-full md:w-max shadow-lg drop-shadow-lg' />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {showCreateForm && (
                    <div onClick={() => setShowCreateForm(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 h-full w-full backdrop-blur-sm">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg w-full max-w-md">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Create New Avatar</h2>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <AvatarForm
                                    onSubmit={handleCreate}
                                    isLoading={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && !isSubmitting && (
                    <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {!isLoading && avatars.length > 0 && (
                    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {avatars.map((avatar) => (
                                <li key={avatar.id} className="px-4 py-4 flex items-center justify-start gap-4 sm:px-6">
                                    <img
                                        src={avatar.imageUrl}
                                        alt="Avatar preview"
                                        className="h-10 w-10 rounded-md md:w-14 md:h-14"
                                    />
                                    <h4 className='text-base md:text-lg'>{avatar.name}</h4>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isLoading && avatars.length === 0 && (
                    <div className="text-center mt-8">
                        <p className="text-gray-500">No avatars found. Create one to get started.</p>
                    </div>
                )}

                {!showCreateForm && (
                    <div className="sticky bottom-0 p-2 flex items-center justify-center md:justify-end w-full lg:hidden">
                        <Button onClick={() => setShowCreateForm(true)} label='Create New Avatar' className='w-full md:w-max shadow-lg drop-shadow-lg' />
                    </div>
                )}
            </div>
        </div>
    );
}