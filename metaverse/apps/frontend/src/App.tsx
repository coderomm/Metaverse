import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { SigninPage } from './pages/auth/SigninPage';
import { SignupPage } from './pages/auth/SignupPage';
import { SpacesPage } from './pages/protected/SpacesPage';
import { PrivateRoute } from './routes/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/protected/ProfilePage';
import { CreateElement } from './pages/admin/CreateElement';
import { CreateAvatar } from './pages/admin/CreateAvatar';
import { Toaster } from 'sonner';
import MapCreator from './pages/admin/MapCreator';
import PlayPage from './pages/protected/PlayPage';
import './global.css'
import AuthCallback from './pages/auth/AuthCallback';

export const App = () => (
  <Router>
    <Toaster />
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/accounts/signin" element={<SigninPage />} />
          <Route path="/accounts/signup" element={<SignupPage />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/home/spaces" element={<PrivateRoute><SpacesPage /></PrivateRoute>} />
          <Route path="/accounts/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/admin/element" element={<PrivateRoute><CreateElement /></PrivateRoute>} />
          <Route path="/admin/avatar" element={<PrivateRoute><CreateAvatar /></PrivateRoute>} />
          <Route path="/admin/map" element={<PrivateRoute><MapCreator /></PrivateRoute>} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  </Router>
);