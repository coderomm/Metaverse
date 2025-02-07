// src/pages/auth/SignupPage.tsx
import { useState } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SignupInput, SignupSchema } from '../../utils/types';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { TextInput } from '../../components/ui/TextInput';
import { SelectInput } from '../../components/ui/SelectInput';
import { Button } from '../../components/ui/Button';
import googleSymbol from '../../assets/images/light/signin/google_symbol.png'

export const SignupPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: '',
    role: 'User',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validData = SignupSchema.parse(formData);
      await authApi.signup(validData);

      const signinResponse = await authApi.signin({
        email: validData.email,
        password: validData.password
      });
      login(signinResponse.data.token, signinResponse.data.user);
    } catch (err) {
      setError(err instanceof AxiosError ? err?.response?.data.message : err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full py-12 px-5 bg-white rounded-xl flex flex-col gap-[10px] items-center authcard">
        <h2 className="text-center text-2xl lg:text-4xl font-bold text-[#6758ff] mb-10">Towny</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button onClick={handleGoogleLogin} className='cursor-pointer rounded-[8px] py-[10px] px-[16px] select-none w-full h-[40px] md:h-[48px] border-2 border-solid !border-primary hover:bg-gray-50 flex items-center justify-center'>
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
          <div className='hidden'>
            <SelectInput
              label="User Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "User" | "Admin" })}
              options={[
                { value: "User", label: "Regular User" },
                { value: "Admin", label: "Administrator" },
              ]}
              required
            />
          </div>
          <div className='w-full'>
            <Button
              type="submit"
              label='Sign up'
              loadingLabel='Creating account...'
              loading={loading}
            />
          </div>
        </form>
        <div className="flex items-center justify-center text-center text-gray-500">Already have an account ?
          <Link to="/accounts/signin" className="text-gray-600 hover:text-gray-900 ms-1">Sign In</Link>
        </div>
      </div>
    </div>
  );
};