import { useState } from 'react';
import { CreateAvatarData } from '../../utils/types';

interface ElementFormProps {
    onSubmit: (data: CreateAvatarData) => Promise<void>;
    isLoading?: boolean;
}
export function AvatarForm({
    onSubmit,
    isLoading = false
}: ElementFormProps) {
    const [formData, setFormData] = useState<CreateAvatarData>({
        name: 'Avatar 001',
        imageUrl: 'temp.png',
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Image URL
                </label>
                <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                    className="mt-1 p-1 block w-full rounded-md border active:border-purple-500 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-md"
                />
            </div>

            <div>
                <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Image Name
                </label>
                <input
                    type="text"
                    id="imageName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 p-1 block w-full rounded-md border active:border-purple-500 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-md"
                />
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : 'Create Avatar'}
                </button>
            </div>
        </form>
    );
}