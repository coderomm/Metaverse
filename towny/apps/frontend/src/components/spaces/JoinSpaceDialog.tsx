// src/components/spaces/JoinSpaceDialog.tsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const JoinSpaceDialog = ({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [enable, setEnable] = useState<boolean>(false);
    const [spaceId, setSpaceId] = useState<string>('');
    const [spaceNotFound, setSpaceNotFound] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const handleSpaceId = (e: string) => {
        setSpaceId(e);
        setEnable(e.length >= 20);
    }

    const handleSpaceJoin = async () => {
        if (!enable) return;
        setLoading(true);
        try {
            const response = await api.get(`/space/${spaceId}`);
            if (response.status === 200) {
                onClose();
                toast.info(`spaceId = ${spaceId}`)
                navigate(`/play?spaceId=${spaceId}`);
            }
        } catch (error) {
            toast.error(error instanceof AxiosError ? error?.response?.data.message : error instanceof Error ? error.message : 'Space not found: ' + error);
            console.error(error instanceof AxiosError ? error?.response?.data.message : error instanceof Error ? error.message : 'Space not found: ', error);
            setSpaceNotFound(true);
        } finally {
            setLoading(false);
            setSpaceId('')
        }
    };

    const handleInvalidConfirm = () => {
        setSpaceNotFound(false)
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={!spaceNotFound ? onClose : undefined} />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Enter with Code</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Entry Code
                        </label>
                        <input
                            type="text"
                            value={spaceId}
                            onChange={(e) => handleSpaceId(e.target.value)}
                            maxLength={30}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter space name"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-1">
                        <button
                            onClick={handleSpaceJoin}
                            disabled={!spaceId || loading || !enable}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
                        >
                            {loading ? 'Checking...' : 'Join'}
                        </button>
                    </div>
                </div>
                {spaceNotFound && (
                    <>
                        <div className="fixed inset-0 z-60">
                            <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" />
                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-xs">
                                <div className="flex flex-col items-start mb-6">
                                    <h2 className="text-xl font-semibold mb-2">
                                        Invalid Code
                                    </h2>
                                    <p>Please try again with the correct code.</p>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={handleInvalidConfirm}
                                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors w-full"
                                    >Confirm</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};