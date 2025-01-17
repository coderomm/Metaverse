import { FormEvent, useEffect, useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { MapCreateFormData, MapElement } from '../../utils/types';

type ElementData = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
};

const MapCreator = () => {
  const [formData, setFormData] = useState<MapCreateFormData>({
    name: '',
    dimensions: '',
    thumbnail: '',
    defaultElements: []
  });

  const [elementInput, setElementInput] = useState<MapElement>({
    elementId: '',
    x: 0,
    y: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableElements, setAvailableElements] = useState<ElementData[]>([]);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await api.get('/elements');
        setAvailableElements(response.data.elements);
      } catch (error) {
        const errorMessage = error instanceof AxiosError
          ? error.response?.data.message
          : error instanceof Error
            ? error.message
            : 'Creating map failed';
        toast.error('Failed to fetch elements: ' + errorMessage);
      }
    };

    fetchElements();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/admin/map', formData);

      if (response.status === 200) {
        const data = await response.data;
        toast.success(`Map created successfully with ID: ${data.id}`);
        setFormData({
          name: '',
          dimensions: '',
          thumbnail: '',
          defaultElements: []
        });
      } else {
        toast.error('Failed to create map');
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data.message
        : err instanceof Error
          ? err.message
          : 'Creating map failed';
      toast.error('Creating map failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addElement = () => {
    if (elementInput.elementId && elementInput.x && elementInput.y) {
      setFormData(prev => ({
        ...prev,
        defaultElements: [...prev.defaultElements, elementInput]
      }));
      setElementInput({ elementId: '', x: 0, y: 0 });
    }
  };

  const removeElement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defaultElements: prev.defaultElements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-[70px] md:p-8 md:pt-[80px]">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-purple-600">Create New Map</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Map Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter map name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (width x height)</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g. 800x600"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="Enter thumbnail URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-700">Default Elements</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={elementInput.elementId}
                    onChange={(e) =>
                      setElementInput(prev => ({
                        ...prev,
                        elementId: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">Select Element</option>
                    {availableElements.map(element => (
                      <option key={element.id} value={element.id}>
                        {element.id} ({element.width}x{element.height})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    onChange={(e) => setElementInput(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    placeholder="X Position"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  <input
                    type="number"
                    value={elementInput.y}
                    onChange={(e) => setElementInput(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    placeholder="Y Position"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={addElement}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Element
                </button>

                <div className="space-y-2">
                  {formData.defaultElements.map((element, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">
                        ID: {element.elementId} (X: {element.x}, Y: {element.y})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeElement(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md transition duration-200 flex items-center justify-center ${isLoading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
            >
              {isLoading ? (
                'Creating Map...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Map
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MapCreator;