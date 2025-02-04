import { useState } from 'react';
import { CreateAvatarData } from '../../utils/types';
import { ImageUploader } from '../common/ImageUploader';
import { TextInput } from '../ui/TextInput';
import { toast } from 'sonner';

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

        if (!formData.name.trim()) {
            toast.error("Image name is required.");
            return;
        }

        if (!formData.imageUrl.trim()) {
            toast.error("Image upload is required.");
            return;
        }

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Image Name
                </label>
                <TextInput
                    type="text"
                    id="imageName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full text-base px-2 py-[6px] mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
            </div>

            <ImageUploader
                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Upload Avatar"
                folder="avatars"
            />

            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className={`mt-2 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                disabled={isLoading}
            >
                {isLoading ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
}