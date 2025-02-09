import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SpinLoader from '../../components/ui/SpinLoader';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';

const AuthCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading] = useState(true);

    const validateToken = async (token: string) => {
        try {
            const response = await api.post('/auth/validate-token', { token });
            login(token, response.data.user);
            toast.info('Google Authentication complete!')
            navigate('/home/spaces');
        } catch (err) {
            const errorMessage =
                err instanceof AxiosError
                    ? err?.response?.data?.message || 'Authentication failed'
                    : err instanceof Error
                        ? err.message
                        : 'Unknown error occurred';
            toast.error(errorMessage);
            console.error(errorMessage);
            navigate('/account/login?error=invalid-token');
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) {
            toast.error('Token after Google Auth is empty')
            console.error('Token after Google Auth is empty:', token)
            navigate('/account/login?error=missing-token');
            return;
        }

        localStorage.setItem('token', token);
        validateToken(token);
    }, [location.search, navigate]);

    return <div className="h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            {loading ? (
                <>
                    <SpinLoader />
                    Processing authentication...
                </>
            ) : (
                <span>Authentication complete!</span>
            )}
        </div>
    </div>;
};

export default AuthCallback;
