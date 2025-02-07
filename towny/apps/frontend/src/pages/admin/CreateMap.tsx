import { FormEvent, useEffect, useState } from 'react';
import { Upload, Plus, X, } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { MapCreateFormData, MapElement } from '../../utils/types';
import Section from '../../components/ui/Section';
import PageWrapper from '../../components/ui/PageWrapper';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/common/ImageUploader';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload as S3Upload } from "@aws-sdk/lib-storage";

type ElementData = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
};

export const CreateMap = () => {
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

  const s3Client = new S3Client({
    region: import.meta.env.VITE_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_PUBLIC_AWS_ACCESS_KEY_ID!,
      secretAccessKey: import.meta.env.VITE_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const uploadToS3 = async (file: File): Promise<string> => {
    if (!formData.name.trim() || !formData.dimensions.trim()) {
      toast.error("Please enter a map name and valid dimensions before uploading.");
      throw new Error("Name and dimensions must be provided.");
    }

    const sanitizedFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
    const upload = new S3Upload({
      client: s3Client,
      params: {
        Bucket: import.meta.env.VITE_PUBLIC_AWS_BUCKET_NAME,
        Key: `maps/${sanitizedFileName}`,
        Body: file,
        ContentType: file.type,
      },
    });

    try {
      const result = await upload.done();
      if (!result.Location) throw new Error("Upload failed: No URL returned.");
      setFormData((prev) => ({ ...prev, thumbnail: result.Location! }));
      return result.Location!;
    } catch (error) {
      toast.error("Upload failed. Try again.");
      throw error;
    } finally {
      setFormData((prev) => ({ ...prev, thumbnail: '' }));
    }
  };

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
    if (!formData.name.trim() || !formData.dimensions.trim()) {
      toast.error("Please fill in all required fields before creating the map.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/admin/map', formData);
      if (response.status === 200) {
        toast.success(`Map created successfully!`);
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
    if (!elementInput.elementId || elementInput.x < 0 || elementInput.y < 0) {
      toast.error("Select a valid element and set X/Y positions.");
      return;
    }
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
    <PageWrapper>
      <Section className='pt-0'>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-primary">Create New Map</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">

                <TextInput
                  type="text"
                  label="Map Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter map name"
                  required
                />
                <TextInput
                  type="text"
                  label="Dimensions (width x height)"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g. 800x600"
                  required
                />
                <ImageUploader
                  onUpload={uploadToS3}
                  onUploadComplete={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  acceptTypes={["image/png", "image/jpeg"]}
                  maxSize={5}
                  label="Upload Image"
                  preview
                />
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
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">Select Element</option>
                      {availableElements.map(element => (
                        <option key={element.id} value={element.id}>
                          {element.id} ({element.width}x{element.height})
                        </option>
                      ))}
                    </select>
                    <TextInput
                      type="number"
                      label="X Position"
                      value={elementInput.x}
                      onChange={(e) => setElementInput(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                      placeholder="X Position"
                    />
                    <TextInput
                      type="number"
                      label="Y Position"
                      value={elementInput.y}
                      onChange={(e) => setElementInput(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                      placeholder="Y Position"
                    />
                  </div>

                  <Button
                    type='button'
                    onClick={addElement}
                    label='Add Element'
                    icon={<Plus className="w-4 h-4" />}
                  />

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
              <Button
                type='submit'
                loading={isLoading}
                loadingLabel='Creating Map...'
                label='Create Map'
                icon={<Upload className="w-4 h-4 mr-2" />}
              />
            </form>
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
};