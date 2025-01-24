// src/pages/auth/SigninPage.tsx
import { useState } from 'react';
import { SigninSchema, SigninInput } from '../../utils/types';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { TextInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import googleSymbol from '../../assets/images/light/signin/google_symbol.png'

export const SigninPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SigninInput>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validData = SigninSchema.parse(formData);
      const response = await authApi.signin(validData);
      login(response.data.token, response.data.user);
    } catch (err) {
      setError(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-9 px-4">
      <div className="max-w-md w-full py-20 px-5 bg-white rounded-xl flex flex-col gap-[10px] items-center authcard">
        <h2 className="text-center text-2xl lg:text-4xl font-bold text-[#6758ff] mb-10">Meety</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button onClick={handleGoogleLogin} className='cursor-pointer rounded-[8px] py-[10px] px-[16px] select-none w-full h-[40px] md:h-[48px] border-2 border-solid !border-purple-500 hover:bg-gray-50 flex items-center justify-center'>
          <div className="flex items-center justify-center gap-[6px]">
            <img className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" src={googleSymbol} alt="google" />
            <span className="text-body-1 text-gray-700 text-center font-semibold leading-[140%] md:text-subtitle truncate">Sign in with Google</span>
          </div>
        </button>
        <span className="text-caption-1 font-semibold text-gray-500">or</span>
        <form className="flex flex-col gap-[10px] items-start w-full" onSubmit={handleSubmit}>
          <div className='w-full'>
            <TextInput
              type="email"
              required
              placeholder="Email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className='w-full'>
            <TextInput
              type="password"
              required
              placeholder="Password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className='w-full'>
            <Button
              type="submit"
              loading={loading}
              loadingLabel='Signing in...'
              label='Sign in'
            />
          </div>
        </form>
        <div className="flex items-center justify-center text-center text-gray-500">Do not have an account ?
          <Link to="/accounts/signup" className="text-gray-600 hover:text-gray-900 ms-1">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};
