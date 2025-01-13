// src/components/spaces/CreateSpaceDialog.tsx
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface Map {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnail: string;
  mapElements: {
    id: {
      id: string;
      mapId: string;
      elementId: string;
      x: number;
      y: number;
    }[];
  };
}

interface MapResponse {
  maps: Map[];
}

export const CreateSpaceDialog = ({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void;
}) => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'select-map' | 'configure-space'>('select-map');
  const [spaceName, setSpaceName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useState(() => {
    const fetchMaps = async () => {
      try {
        const response = await api.get<MapResponse>('/maps');
        setMaps(response.data.maps);
      } catch (error) {
        console.error('Error fetching maps:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchMaps();
    }
  }, [open]);

  const handleMapSelect = (map: Map) => {
    setSelectedMap(map);
    setStep('configure-space');
  };

  const handleCreateSpace = async () => {
    try {
      const response = await api.post('/space', {
        name: spaceName,
        mapId: selectedMap?.id,
        dimensions: `${selectedMap?.width}x${selectedMap?.height}`,
      });
      
      if (response.data.spaceId) {
        navigate(`/play`);
      }
    } catch (error) {
      console.error('Error creating space:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {step === 'select-map' ? 'Select a Template' : 'Configure Space'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === 'select-map' ? (
            <div>
              <div className="flex gap-4 mb-6 overflow-x-auto py-2">
                <button className="px-4 py-2 rounded-full bg-purple-600 text-white">
                  All
                </button>
                <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                  Education
                </button>
                <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                  Quiz
                </button>
                <button className="px-4 py-2 rounded-full border hover:bg-gray-50">
                  Event
                </button>
              </div>

              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  Loading maps...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                  {maps.map((map) => (
                    <div
                      key={map.id}
                      onClick={() => handleMapSelect(map)}
                      className="cursor-pointer group relative rounded-lg overflow-hidden"
                    >
                      <img
                        src={map.thumbnail}
                        alt={map.name}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-medium">{map.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Space Name</label>
                <input
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter space name"
                />
                <p className="text-sm text-gray-500 mt-1">{spaceName.length}/30</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Public Option</label>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-900">Public</span>
                </div>
              </div>

              {!isPublic && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Set password"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setStep('select-map')}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateSpace}
                  disabled={!spaceName}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};