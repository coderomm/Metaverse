// src/pages/admin/AdminElementManager.tsx
import { useState, useEffect, useCallback } from 'react';
import { Element, CreateElementData, UpdateElementData, GetElementsResponse } from '../../types';
import { api } from '../../services/api';
import { ElementForm } from '../../components/admin/ElementForm';
import { AxiosError } from 'axios';

export function ElementsManager() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API calls defined within the component
  const elementsApi = {
    getElements: () => api.get<GetElementsResponse>('/elements'),
    createElement: (data: CreateElementData) => api.post<Element>('/admin/element', data),
    updateElement: (id: string, data: UpdateElementData) => 
      api.put<Element>(`/element/${id}`, data),
    deleteElement: (id: string) => api.delete(`/admin/element/${id}`),
  };

  // Error handling helper
  const handleError = (error: unknown) => {
    const message = error instanceof AxiosError 
      ? error.response?.data?.message || error.message
      : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
    setError(message);
  };

  // Fetch elements
  const fetchElements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await elementsApi.getElements();
      setElements(response.data.elements);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load elements on mount
  useEffect(() => {
    fetchElements();
  }, [fetchElements]);

  // Create element handler
  const handleCreate = async (data: CreateElementData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await elementsApi.createElement(data);
      await fetchElements();
      setShowCreateForm(false);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update element handler
  const handleUpdate = async (data: UpdateElementData) => {
    if (!selectedElement) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await elementsApi.updateElement(selectedElement.id, data);
      await fetchElements();
      setSelectedElement(null);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete element handler
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await elementsApi.deleteElement(id);
      await fetchElements();
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Element Management</h1>
          {!showCreateForm && !selectedElement && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Create New Element
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
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ElementForm
                  initialData={selectedElement || undefined}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  onSubmit={selectedElement ? handleUpdate : handleCreate}
                  isEdit={!!selectedElement}
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
        {!isLoading && elements.length > 0 && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {elements.map((element) => (
                <li key={element.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex items-center">
                    <img 
                      src={element.imageUrl} 
                      alt="Element preview" 
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {element.width}x{element.height}
                      </p>
                      <p className="text-sm text-gray-500">
                        {element.static ? 'Static' : 'Dynamic'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSelectedElement(element)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(element.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && elements.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">No elements found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}