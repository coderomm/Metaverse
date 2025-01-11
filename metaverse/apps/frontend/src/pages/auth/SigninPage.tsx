// src/pages/auth/SigninPage.tsx
import { useState } from 'react';
import { SigninSchema, SigninInput } from '../../types';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Sign in to Meety</h2>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center text-center">Do not have an account ?
          <Link to="/signup" className="text-gray-700 hover:text-gray-900 ms-1">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};
