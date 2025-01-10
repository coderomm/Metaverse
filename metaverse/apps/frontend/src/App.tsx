// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { SigninPage } from './pages/auth/SigninPage';
import { SignupPage } from './pages/auth/SignupPage';
import { SpacesPage } from './pages/protected/SpacesPage';
import { PrivateRoute } from './routes/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/protected/ProfilePage';
import { ElementsManager } from './pages/admin/ElementsManager';
import { AvatarsManager } from './pages/admin/AvatarsManager';

export const App = () => (
  <Router>
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home/spaces"
            element={
              <PrivateRoute>
                <SpacesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/element"
            element={
              <PrivateRoute>
                <ElementsManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/avatar"
            element={
              <PrivateRoute>
                <AvatarsManager />
              </PrivateRoute>
            }
          />
          {/* <Route path="/" element={<Navigate to="/home/spaces" />} /> */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  </Router>
);