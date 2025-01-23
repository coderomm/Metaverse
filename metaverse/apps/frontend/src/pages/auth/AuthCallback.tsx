import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SpinLoader from '../../components/ui/SpinLoader';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        console.log('>>> token = ', token)
        if (!token) {
            toast.error('Token after Google Auth is empty')
            console.error('Token after Google Auth is empty:', token)
            navigate('/account/login?error=missing-token');
            return;
        }
        localStorage.setItem('token', token);
        navigate('/home/spaces');
    }, [location.search, navigate]);

    return <div className="h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            <SpinLoader />Processing authentication...
        </div>
    </div>;
};

export default AuthCallback;
