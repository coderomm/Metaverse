import { useState } from 'react';
import { CreateElementData, UpdateElementData } from '../../utils/types';

interface ElementFormProps {
  initialData?: CreateElementData;
  onSubmit: (data: CreateElementData | UpdateElementData) => Promise<void>;
  isEdit?: boolean;
  isLoading?: boolean;
}
export function ElementForm({
  initialData,
  onSubmit,
  isEdit = false,
  isLoading = false
}: ElementFormProps) {
  const [formData, setFormData] = useState<CreateElementData>({
    width: initialData?.width || 0,
    height: initialData?.height || 0,
    static: initialData?.static || false,
    imageUrl: initialData?.imageUrl || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // await onSubmit(formData);
      if (isEdit) {
        const updateData: UpdateElementData = {
          imageUrl: formData.imageUrl
        };
        await onSubmit(updateData);
      } else {
        // If creating, send all CreateElementData fields
        await onSubmit(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
          className="mt-1 p-1 block w-full rounded-md border active:border-purple-500 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-md"
        />
      </div>

      {!isEdit && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
              Width
            </label>
            <input
              type="number"
              id="width"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
              required
              min="1"
              className="mt-1 p-1 block w-full rounded-md border shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-md"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 select-none cursor-pointer">
              Height
            </label>
            <input
              type="number"
              id="height"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              required
              min="1"
              className="mt-1 p-1 block w-full rounded-md border shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-md"
            />
          </div>
        </div>
      )}

      {!isEdit && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="static"
            checked={formData.static}
            onChange={(e) => setFormData({ ...formData, static: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <label htmlFor="static" className="ml-2 block text-md text-gray-700 select-none cursor-pointer">
            Static Element
          </label>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isEdit ? 'Update Element' : 'Create Element'
          )}
        </button>
      </div>
    </form>
  );
}