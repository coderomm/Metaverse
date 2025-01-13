// src/pages/admin/AdminElementManager.tsx
import { useState, useEffect, useCallback } from 'react';
import { Avatar, CreateAvatarData, GetAvatarsResponse } from '../../types';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { AvatarForm } from '../../components/admin/AvatarForm';
import { toast } from 'sonner';

export function AvatarsManager() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // API calls defined within the component
    const elementsApi = {
        getElements: () => api.get<GetAvatarsResponse>('/avatars'),
        createElement: (data: CreateAvatarData) => api.post<Avatar>('/admin/avatar', data),
    };

    // Error handling helper
    const handleError = (error: unknown) => {
        const message = error instanceof AxiosError
            ? error.response?.data?.message || error.message
            : error instanceof Error
                ? error.message
                : 'An unexpected error occurred';
        setError(message);
        toast.info(message)
    };

    // Fetch avatars
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

    // Load avatars on mount
    useEffect(() => {
        fetchElements();
    }, [fetchElements]);

    // Create avatar handler
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
        <div className="min-h-screen bg-gray-50 py-8 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Avatar Management</h1>
                    {!showCreateForm && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Create New Avatar
                        </button>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Section */}
                {(showCreateForm) && (
                    <div className="mt-8">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Create New Avatar</h2>
                                    <button
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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

                {/* Loading State */}
                {isLoading && !isSubmitting && (
                    <div className="flex justify-center my-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {/* Elements List */}
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

                {/* Empty State */}
                {!isLoading && avatars.length === 0 && (
                    <div className="text-center mt-8">
                        <p className="text-gray-500">No avatars found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}