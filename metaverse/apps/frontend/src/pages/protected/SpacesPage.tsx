// src/pages/home/SpacesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import Section from '../../components/ui/Section';
import { CreateSpaceDialog } from '../../components/admin/CreateSpaceDialog';

export const SpacesPage = () => {
  const { isAuthenticated } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[90vh] pb-10 pt-[70px]">
      <Section>
        <h1 className="text-4xl font-bold tracking-tight text-purple-600 sm:text-5xl lg:text-6xl">
          Welcome to Your ZEP Space
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Explore and create in your personal metaverse space.
        </p>
      </Section>
      <Section>
        <div className="flex justify-between flex-col lg:flex-row items-start lg:items-center">
          <span className='text-[#27262e] font-bold cursor-pointer text-base'>My Spaces</span>
          <div className="sticky right-0 bottom-0 left-0 flex gap-2 justify-between items-center py-3 w-full lg:w-1/3">
            <button className='bg-[#f3f2ff] hover:bg-[#e9e8ff] text-[#6758ff] px-2 lg:px-6 py-2 w-full h-[48px] rounded-lg flex items-center justify-center'>Enter with Code</button>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className='bg-[#6758ff] hover:bg-[#5246cc] text-[#ffffff] px-2 lg:px-6 py-2 w-full h-[48px] rounded-lg flex items-center justify-center gap-2'><Plus className='w-6 h-6' />Create Space</button>
          </div>
        </div>
      </Section>
      <CreateSpaceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
};