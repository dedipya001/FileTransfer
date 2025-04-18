// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import  LocationStatsPage  from './pages/LocationStatsPage';
import  LocationPhotosPage  from './pages/LocationPhotosPage';

// Import pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Import styles
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/location/:locationId/stats" element={<LocationStatsPage />} />
<Route path="/location/:locationId/photos" element={<LocationPhotosPage />} />

            </Routes>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;