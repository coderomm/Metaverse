import React, { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, CreateAvatarData, GetAvatarsResponse } from '../../utils/types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import Section from '../../components/ui/Section';
import PageWrapper from '../../components/ui/PageWrapper';
import { ImageUploader } from '../../components/common/ImageUploader';
import { TextInput } from '../../components/ui/TextInput';
import SpinLoader from '../../components/ui/SpinLoader';

export const CreateAvatar = () => {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateAvatarData>({ name: '', imageUrl: '', });

    const s3Client = new S3Client({
        region: import.meta.env.VITE_PUBLIC_AWS_REGION,
        credentials: {
            accessKeyId: import.meta.env.VITE_PUBLIC_AWS_ACCESS_KEY_ID!,
            secretAccessKey: import.meta.env.VITE_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
    });

    const uploadToS3 = async (file: File): Promise<string> => {
        if (!formData.name.trim()) {
            toast.error("Please enter an image name before uploading.");
            throw new Error("Image name is required")
        }

        const sanitizedFileName = formData.name.replace(/\s+/g, "-").toLowerCase();
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: import.meta.env.VITE_PUBLIC_AWS_BUCKET_NAME,
                Key: `avatars/${sanitizedFileName}.jpg`,
                Body: file,
                ContentType: file.type,
                ACL: "public-read",
            },
        });

        const result = await upload.done();
        if (!result.Location) {
            throw new Error("Upload failed: No URL returned");
        }
        return result.Location!;
    };

    const fetchElements = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await api.get<GetAvatarsResponse>('/avatars');
            setAvatars(response.data.avatars);
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                        ? err.message
                        : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchElements();
    }, [fetchElements]);

    useEffect(() => {
        document.body.style.overflow = showCreateForm ? "hidden" : "";
        return () => {
            document.body.style.overflow = ""
        }
    }, [showCreateForm])

    const handleUploadComplete = async (url: string) => {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        try {
            setIsSubmitting(true);
            await api.post<Avatar>("/admin/avatar", {
                name: formData.name,
                imageUrl: url,
            });

            toast.success("Avatar created successfully!");
            await fetchElements();
            setShowCreateForm(false);
            setFormData({ name: "", imageUrl: "" });
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                        ? err.message
                        : "An unexpected error occurred";
            toast.error("Error while creating avatar: " + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper>
            <Section className='py-0'>
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-bold">Avatar Management</h1>
                    {!showCreateForm && (
                        <Button onClick={() => setShowCreateForm(true)}
                            label='Create New Avatar'
                            className="hidden sm:flex w-max shadow-lg drop-shadow-lg"
                            icon={<Plus className='w-5' />} />
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
                                <div className="space-y-6">
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
                                        onUpload={uploadToS3}
                                        onUploadComplete={handleUploadComplete}
                                        acceptTypes={["image/png", "image/jpeg"]}
                                        maxSize={5}
                                        label="Upload Profile Picture"
                                        preview
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && !isSubmitting && (
                    <div className="flex justify-center items-center h-dvh my-8">
                        <SpinLoader />
                    </div>
                )}

                {!isLoading && avatars.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        <AnimatePresence mode="wait">
                            {avatars.map((avatar, index) => (
                                <motion.div
                                    key={avatar.id}
                                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 0.2, delay: index * 0.1 }}
                                    className="flex flex-col items-center justify-center p-4 gap-4 shadow-md bg-white rounded-lg cursor-pointer w-full transition-all duration-200 ease-in-out hover:shadow-2xl">
                                    <img
                                        src={avatar.imageUrl}
                                        alt={avatar.name}
                                        className="w-16 h-auto min-h-16 object-cover shadow-md rounded"
                                        loading='lazy'
                                    />
                                    <ul>
                                        <li className='text-sm md:text-base'>Width: {avatar.name}</li>
                                    </ul>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!isLoading && avatars.length === 0 && (
                    <div className="text-center mt-8">
                        <p className="text-gray-500">No avatars found. Create one to get started.</p>
                    </div>
                )}

                {!showCreateForm && !isLoading && (
                    <div className="sticky bottom-0 p-2 flex items-center justify-center sm:hidden">
                        <Button onClick={() => setShowCreateForm(true)}
                            label='Create New Avatar'
                            className="w-full shadow-lg drop-shadow-lg mt-10"
                            icon={<Plus className='w-5' />} />
                    </div>
                )}
            </Section>
        </PageWrapper>
    );
}