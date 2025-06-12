import { useState, useEffect, useCallback } from 'react';
import type { Element, CreateElementData, UpdateElementData, GetElementsResponse } from '../../utils/types';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import Section from '../../components/ui/Section';
import { Edit, Plus, X } from 'lucide-react';
import PageWrapper from '../../components/ui/PageWrapper';
import { TextInput } from '../../components/ui/TextInput';
import { ImageUploader } from "../../components/common/ImageUploader";
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary';

export const CreateElement = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateElementData>({
    width: 0,
    height: 0,
    static: false,
    imageUrl: '',
  });

  const handleUpload = async (file: File): Promise<string> => {
    const url = await uploadImageToCloudinary({
      file,
      validate: () => {
        if (!formData.width || !formData.height) {
          toast.error("Please enter valid width and height before uploading.");
          throw new Error("Width and height must be greater than 0.");
        }
      }
    });

    setFormData(prev => ({ ...prev, imageUrl: url }));
    return url;
  };

  const elementsApi = {
    getElements: () => api.get<GetElementsResponse>('/elements'),
    createElement: (data: CreateElementData) => api.post<Element>('/admin/element', data),
    updateElement: (id: string, data: UpdateElementData) => api.put<Element>(`/element/${id}`, data),
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
    <PageWrapper>
      <Section>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Element Management</h1>
          <Button
            onClick={() => {
              setSelectedElement(null);
              setShowFormPopup(true);
            }}
            label='Create New Element'
            className="hidden sm:flex w-max shadow-lg drop-shadow-lg"
            icon={<Plus className='w-5' />} />
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
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {elements.map((element) => (
              <div
                key={element.id}
                className="flex flex-col items-center justify-center p-4 gap-4 drop-shadow-md bg-white rounded-lg cursor-pointer w-full transition-all duration-200 ease-in-out hover:drop-shadow-2xl"
              >
                <img
                  src={element.imageUrl}
                  alt="Element"
                  className="w-16 h-auto min-h-16 object-cover shadow-md rounded"
                />
                <ul>
                  <li className='text-sm md:text-base'>Width: {element.width}</li>
                  <li className='text-sm md:text-base'>Height: {element.height}</li>
                  <li className='text-sm md:text-base'>Type: {element.static ? 'Static' : 'Dynamic'}</li>
                </ul>
                <button
                  onClick={() => {
                    setSelectedElement(element);
                    setShowFormPopup(true);
                  }}
                  className="text-[#ffffff] bg-primary hover:bg-primary-hover w-full py-1 text-base rounded-md inline-flex items-center justify-center gap-1 outline-none"><Edit className='w-4 h-4' /> Edit</button>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && elements.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">No elements found. Create one to get started.</p>
          </div>
        )}

        {showFormPopup && (
          <div onClick={() => setShowFormPopup(false)} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg w-full max-w-[96%] sm:max-w-md mx-auto overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedElement ? 'Edit Element' : 'Create New Element'}
                  </h2>
                  <button
                    onClick={() => setShowFormPopup(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  {!selectedElement && (
                    <>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <TextInput
                          type="number"
                          id="width"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                          required
                          min="1"
                          label='Width'
                        />

                        <TextInput
                          type="number"
                          id="height"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                          required
                          min="1"
                          label='Height'
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="static"
                          checked={formData.static}
                          onChange={(e) => setFormData({ ...formData, static: e.target.checked })}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="static" className="ml-2 block text-md text-gray-700 select-none cursor-pointer">
                          Static Element
                        </label>
                      </div>
                    </>
                  )}
                  <ImageUploader
                    onUpload={handleUpload}
                    onUploadComplete={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                    acceptTypes={["image/png", "image/jpeg"]}
                    maxSize={5}
                    label="Upload Image"
                    preview
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!showFormPopup && (
          <div className="sticky bottom-0 p-2 flex items-center justify-center sm:hidden">
            <Button
              onClick={() => {
                setSelectedElement(null);
                setShowFormPopup(true);
              }}
              label='Create New Element'
              className="w-full shadow-lg drop-shadow-lg mt-10"
              icon={<Plus className='w-5' />}
            />
          </div>
        )}
      </Section>
    </PageWrapper >
  );
}