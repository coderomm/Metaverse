import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Loader2, LogIn, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Section from '../../components/ui/Section';
import { CreateSpaceDialog } from '../../components/spaces/CreateSpaceDialog';
import { JoinSpaceDialog } from '../../components/spaces/JoinSpaceDialog';
import StandingChar from './../../assets/images/map-templates/banner/full_char.png'
import dividerGray from './../../assets/images/light/spaceMe/divider_gray.png'
import searchGray from './../../assets/images/light/spaceMe/search_gray.png'
import { AxiosError } from 'axios';
import PageWrapper from '../../components/ui/PageWrapper';

interface Space {
  id: number;
  name: string;
  dimensions: string;
  thumbnail: string;
}

interface RecentSpace {
  id: number;
  name: string;
  dimensions: string;
  thumbnail: string;
  visitedAt: string;
}

interface SpacesResponse {
  spaces: Space[];
}

interface RecentSpacesResponse {
  recentSpaces: RecentSpace[]
}

export const SpacesPage = () => {
  const { isAuthenticated } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [showSearchSpaceBar, setShowSearchSpaceBar] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isShowingRecent, setIsShowingRecent] = useState(false);
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
        setFilteredSpaces(response.data.spaces);
        setIsShowingRecent(false);
      } catch (error) {
        const message = error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
        console.error('Error fetching spaces:', message);
        toast.error('Error fetching spaces: ' + message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  useEffect(() => {
    console.log('>> filteredSpaces updated:', filteredSpaces);
  }, [filteredSpaces]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300);
    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  useEffect(() => {
    const filtered = spaces.filter((space) =>
      space.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
    setFilteredSpaces(filtered);
  }, [debouncedQuery, spaces]);

  const handleSpaceClick = (spaceId: number) => {
    navigate(`/play?spaceId=${spaceId}`);
  };

  const fetchRecentSpaces = async () => {
    try {
      setLoading(true);
      const response = await api.get<RecentSpacesResponse>('/space/recent');
      console.log('>> API response:', response.data.recentSpaces);
      if (response.data.recentSpaces.length === 0) {
        setFilteredSpaces([]);
        toast.info('No recent spaces found.');
        setIsShowingRecent(true);
      } else {
        const normalizedSpaces = response.data.recentSpaces.map((space) => ({
          id: space.id,
          name: space.name,
          thumbnail: space.thumbnail,
          dimensions: space.dimensions,
        }));
        setFilteredSpaces(normalizedSpaces);
        setIsShowingRecent(true);
      }
    } catch (error) {
      const message = error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred';
      console.error('Error fetching recent spaces:', message);
      toast.error('Error fetching recent spaces: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Section className='pt-0'>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Welcome to Your Towny Space
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Explore and create in your personal metaverse space.
        </p>
      </Section>
      <Section>
        <div className="topBar flex flex-col">
          <div className="topBar_Inner flex justify-between items-center">
            <div className="topBar_left flex items-center justify-center">
              <span
                className={`text-[#27262e] font-bold text-base cursor-pointer ${isShowingRecent ? 'opacity-100' : 'opacity-70'
                  }`}
                onClick={fetchRecentSpaces}
              >
                Recent
              </span>
              <img src={dividerGray} alt="divider" width="1" height="14" className="m-[10px]"></img>
              <span
                className={`text-[#27262e] font-bold text-base cursor-pointer ${!isShowingRecent ? 'opacity-100' : 'opacity-70'
                  }`}
                onClick={() => {
                  setFilteredSpaces(spaces);
                  setIsShowingRecent(false);
                }}
              >
                My Spaces
              </span>
            </div>
            <div className="topBar_right flex items-center justify-center gap-[10px]">
              <button onClick={() => setShowSearchSpaceBar(!showSearchSpaceBar)} className='inline-flex lg:hidden items-center justify-center text-[#6758ff] bg-transparent shadow-none px-3 font-bold text-base h-10 rounded-lg hover:bg-[#f8f9fc] transition-colors duration-150 ease-in'>
                <span>
                  <img src={searchGray} alt="search" width="24" height="24" />
                </span>
              </button>
              <div className="desktop_ButtonsWrapper hidden sm:flex gap-2 justify-between items-center w-full">
                <span className='hidden lg:inline-flex items-center bg-white text-[#27262e] rounded-lg border border-[#d5d9e0] focus-within:border-[#6758ff] transition-all ease-in-out duration-200 text-base font-medium'>
                  <span className='flex flex-nowrap items-center ps-3'>
                    <img src={searchGray} alt="search" loading='lazy' className='w-5 h-5' />
                    <input placeholder="Search My Spaces" type="text" className="Input_control__dXIKY w-full p-0 text[#27262e] bg-transparent ms-2 h-[38px] pr-3 outline-none border-none" maxLength={30}
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></input>
                  </span>
                </span>

                <button onClick={() => setJoinDialogOpen(true)}
                  className='bg-[#f3f2ff] hover:bg-[#e9e8ff] text-[#6758ff] hidden sm:inline-flex justify-center items-center overflow-hidden whitespace-nowrap align-middle text-[14px] font-semibold h-[40px] w-max gap-1 rounded-lg px-3'
                ><LogIn className="w-5 h-5" />Enter with Code</button>
                <button onClick={() => setCreateDialogOpen(true)}
                  className="bg-primary hover:bg-primary text-white hidden sm:inline-flex justify-center items-center overflow-hidden whitespace-nowrap align-middle text-[14px] font-semibold h-[40px] w-max gap-1 rounded-lg px-3"
                ><Plus className="w-5 h-5" />Create Space</button>
              </div>
            </div>
          </div>

          {showSearchSpaceBar && (
            <div className="mobileSearchSpace_bar sticky top-[108px] sm:top-[129px] z-1 pb-[10px] bg-white lg:hidden">
              <span className='rounded-md border border-[#d5d9e0] focus-within:border-[#6758ff] transition-all ease-in-out duration-200 text-[#27262e] flex items-center bg-[#f3f5f9] w-full font-medium text-base'>
                <input placeholder="Search Spaces" type="text" maxLength={30} className='w-full p-0 text-[#27262e] border-0 outline-0 bg-transparent overflow-ellipsis h-[36px] sm:h-[38px] px-3'
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></input>
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">
            {filteredSpaces.length === 0 ? (
              <div className="col-span-2 lg:col-span-3 flex flex-col items-center justify-center h-64 text-center mt-8">
                <div className="bg-primary rounded-full p-4 mb-4 hidden">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <img src={StandingChar} className="max-w-full w-40 h-auto" />
                <h3 className="text-lg xl:text-xl font-semibold mb-1 mt-3">
                  {isShowingRecent ? `You haven’t visited any Spaces.` : 'You haven’t created any Spaces.'}
                </h3>
                <p className="text-gray-800 mb-4 font-medium">Create or enter a Space.</p>
              </div>
            ) : (
              filteredSpaces.map((space) => (
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
              ))
            )}
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
      <section className="sticky right-0 bottom-0 left-0 flex sm:hidden gap-2 justify-between items-center pt-2 px-6 pb-3 w-full">
        <button onClick={() => setJoinDialogOpen(true)}
          className='bg-[#f3f2ff] hover:bg-[#e9e8ff] text-[#6758ff] inline-flex justify-center items-center overflow-hidden whitespace-nowrap align-middle text-base font-semibold h-[48px] w-full gap-1 rounded-lg'
        ><LogIn className="w-5 h-5" />Enter with Code</button>
        <button onClick={() => setCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary text-white inline-flex justify-center items-center overflow-hidden whitespace-nowrap align-middle text-base font-semibold h-[48px] w-full gap-1 rounded-lg"
        ><Plus className="w-5 h-5" />Create Space</button>
      </section>
    </PageWrapper>
  );
};