import { useState } from 'react';
import { CreateAvatarData } from '../../utils/types';
import { ImageUploader } from '../common/ImageUploader';

interface ElementFormProps {
    onSubmit: (data: CreateAvatarData) => Promise<void>;
    isLoading?: boolean;
}
export function AvatarForm({ onSubmit, isLoading = false }: ElementFormProps) {
    const [formData, setFormData] = useState<CreateAvatarData>({ name: '', imageUrl: '', });
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
                <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Image Name
                </label>
                <input
                    type="text"
                    id="imageName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-2 py-1 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
            </div>

            <ImageUploader
                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Upload Avatar"
                folder="avatars"
            />

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-end">
                <button
                    disabled={isLoading}
                    className={`text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center h-[40px]
      ${isLoading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"}`}>
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