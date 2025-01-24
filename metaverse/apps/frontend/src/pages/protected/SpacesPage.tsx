// src/pages/home/SpacesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ExternalLink, Loader2, Plus } from 'lucide-react';
import Section from '../../components/ui/Section';
import { CreateSpaceDialog } from '../../components/spaces/CreateSpaceDialog';
import { api } from '../../services/api';
import { toast } from 'sonner';
import StandingChar from './../../assets/images/map-templates/banner/full_char.png'
import { JoinSpaceDialog } from '../../components/spaces/JoinSpaceDialog';

interface Space {
  id: number;
  name: string;
  dimensions: string;
  thumbnail: string;
}

interface SpacesResponse {
  spaces: Space[];
}

export const SpacesPage = () => {
  const { isAuthenticated } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await api.get<SpacesResponse>('/space/all');
        setSpaces(response.data.spaces);
      } catch (error) {
        console.error('Error fetching spaces:', error);
        toast.error('Error fetching spaces: ' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  const handleSpaceClick = (spaceId: number) => {
    navigate(`/play?spaceId=${spaceId}`);
  };

  return (
    <div className="min-h-dvh pb-10 pt-[70px]">
      <Section>
        <h1 className="text-4xl font-bold tracking-tight text-purple-600 sm:text-5xl lg:text-6xl">
          Welcome to Your Meety Space
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Explore and create in your personal metaverse space.
        </p>
      </Section>
      <Section>
        <div className="flex justify-between flex-col lg:flex-row items-start lg:items-center bg-white/80 backdrop-blur-md">
          <span className='text-[#27262e] font-bold cursor-pointer text-base'>My Spaces</span>
          <div className="sticky right-0 bottom-0 left-0 flex gap-2 justify-between items-center py-3 w-full lg:w-1/3">
            <button className='bg-[#f3f2ff] hover:bg-[#e9e8ff] text-[#6758ff] px-2 lg:px-6 py-2 w-full h-[48px] rounded-lg flex items-center justify-center' 
            onClick={()=>setJoinDialogOpen(true)}>Enter with Code</button>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 w-full h-[48px]"
            >
              <Plus className="w-5 h-5" />
              Create Space
            </button>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className='bg-[#6758ff] hover:bg-[#5246cc] text-[#ffffff] px-2 lg:px-6 py-2 w-full h-[48px] rounded-lg items-center justify-center gap-2 hidden'><Plus className='w-6 h-6' />Create Space</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center mt-8">
            <div className="bg-purple-100 rounded-full p-4 mb-4 hidden">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <img src={StandingChar} className='max-w-full w-40 h-auto' />
            <h3 className="text-lg xl:text-xl font-semibold mb-1 mt-3">You haven’t visited any Spaces.</h3>
            <p className="text-gray-800 mb-4 font-medium">Create or enter a Space.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() => handleSpaceClick(space.id)}
                className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="aspect-video relative">
                  <img
                    src={space.thumbnail}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Enter Space</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {space.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dimensions: {space.dimensions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
      <CreateSpaceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
      <JoinSpaceDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
      />
    </div>
  );
};