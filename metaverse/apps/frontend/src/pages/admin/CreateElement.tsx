import { useState, useEffect, useCallback } from 'react';
import { Element, CreateElementData, UpdateElementData, GetElementsResponse } from '../../utils/types';
import { api } from '../../services/api';
import { ElementForm } from '../../components/admin/ElementForm';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

export function CreateElement() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const elementsApi = {
    getElements: () => api.get<GetElementsResponse>('/elements'),
    createElement: (data: CreateElementData) => api.post<Element>('/admin/element', data),
    updateElement: (id: string, data: UpdateElementData) =>
      api.put<Element>(`/element/${id}`, data),
    deleteElement: (id: string) => api.delete(`/admin/element/${id}`),
  };

  const handleError = (error: unknown) => {
    const message = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred';
    setError(message);
    toast.error(message)
  };

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

  useEffect(() => {
    fetchElements();
  }, [fetchElements]);

  const handleCreate = async (data: CreateElementData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await elementsApi.createElement(data);
      await fetchElements();
      setShowFormPopup(false);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdateElementData) => {
    if (!selectedElement) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await elementsApi.updateElement(selectedElement.id, data);
      await fetchElements();
      setSelectedElement(null);
      setShowFormPopup(false);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    if (showFormPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFormPopup]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Element Management</h1>
          <button
            onClick={() => {
              setSelectedElement(null);
              setShowFormPopup(true);
            }}
            className="hidden md:inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create New Element
          </button>
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

        {!isLoading && elements.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {elements.map((element) => (
              <div
                key={element.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-4 flex flex-col space-y-2">
                  <img
                    src={element.imageUrl}
                    alt="Element"
                    className="w-16 h-auto object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {element.width}x{element.height}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {element.static ? 'Static' : 'Dynamic'}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setSelectedElement(element);
                        setShowFormPopup(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 bg-white rounded-xl drop-shadow-lg px-5 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(element.id)}
                      className="text-red-600 hover:text-red-900 bg-white rounded-xl drop-shadow-lg px-5 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && !isSubmitting && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {!isLoading && elements.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">No elements found. Create one to get started.</p>
          </div>
        )}

        {showFormPopup && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-[96%] sm:max-w-md mx-auto overflow-hidden"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedElement ? 'Edit Element' : 'Create New Element'}
                  </h2>
                  <button
                    onClick={() => setShowFormPopup(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

        <div className="sticky bottom-0 p-2 flex items-center justify-center md:justify-end w-full lg:hidden">
          <Button
            onClick={() => {
              setSelectedElement(null);
              setShowFormPopup(true);
            }}
            label='Create New Element'
          />
        </div>
      </div>
    </div>
  );
}