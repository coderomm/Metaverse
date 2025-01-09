import { useState } from 'react';
import { CreateElementData, UpdateElementData } from '../../types';
import { api } from '../../services/api';
import { ElementForm } from '../../components/ElementForm';
import { AxiosError } from 'axios';
// import { ElementForm } from '../components/ElementForm';
// import { createElement, updateElement } from '../api/elements';
// import { Element, CreateElementData, UpdateElementData } from '../types/element';

export function AdminElements() {
    const [selectedElement, setSelectedElement] = useState<Element | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async (data: CreateElementData) => {
        try {
            const response = await api.post('/admin/element', data);
            console.log('> create element res = ', response.data)
            setShowCreateForm(false);
            // fetchElements();
        } catch (err) {
            setError(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Failed to create avatars');
            console.error(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Failed to create avatars');
        }
    };

    const handleUpdate = async (data: UpdateElementData) => {
        if (selectedElement) {
            try {
                const response = await api.put(`/admin/element/${selectedElement.id}`, data);
                console.log('> handle update res = ', response.data);
                setSelectedElement(null);
                // fetchElements();
            } catch (err) {
                setError(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Failed to update element');
                console.error(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Failed to update element');
            }
        }
    };

    const getElements = async () => {
        const response = await api.get('/admin/elements');
        return response.data;
      };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Element Management</h1>
                    {!showCreateForm && !selectedElement && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            Create New Element
                        </button>
                    )}
                </div>

                {(showCreateForm || selectedElement) && (
                    <div className="mt-8">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedElement ? 'Edit Element' : 'Create New Element'}
                                    </h2>
                                    <button
                                        onClick={() => selectedElement ? setSelectedElement(null) : setShowCreateForm(false)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <ElementForm
                                    initialData={selectedElement || undefined}
                                    onSubmit={selectedElement ? handleUpdate : handleCreate}
                                    isEdit={!!selectedElement}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}