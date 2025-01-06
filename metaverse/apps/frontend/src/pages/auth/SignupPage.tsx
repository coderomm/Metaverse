// src/pages/auth/SignupPage.tsx
import { useState } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SignupInput, SignupSchema } from '../../types/auth';

export const SignupPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupInput>({
    username: '',
    password: '',
    type: 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validData = SignupSchema.parse(formData);
      await authApi.signup(validData);
      
      // Auto signin after successful signup
      const signinResponse = await authApi.signin({
        username: validData.username,
        password: validData.password
      });
      login(signinResponse.data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Create your Meety account</h2>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "user" | "admin" })}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};