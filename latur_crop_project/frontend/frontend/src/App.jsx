import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FarmProvider } from './context/FarmContext';

import Home from './pages/Home';
import FindCropForm from './pages/FindCropForm';
import Recommendations from './pages/Recommendations';
import CropDetails from './pages/CropDetails';
import CheckCrop from './pages/CheckCrop';
import Compare from './pages/Compare';
import CropFacts from './pages/CropFacts';
import Profile from './pages/Profile';
import History from './pages/History';

import BottomNav from './components/BottomNav';
import LocationModal from './components/LocationModal';

import './App.css';

function App() {
  return (
    <FarmProvider>
      <BrowserRouter>
        <div className="app-viewport-wrapper">
          <div className="app-mobile-frame">
            {/* Scrollable screen content area */}
            <div className="screen-scroll-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/find-crop" element={<FindCropForm />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/crop/:name" element={<CropDetails />} />
                <Route path="/check-crop" element={<CheckCrop />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/crop-facts" element={<CropFacts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Permanent Bottom Navigation Bar across ALL screens */}
            <BottomNav />

            {/* Global Location Selector Modal */}
            <LocationModal />
          </div>
        </div>
      </BrowserRouter>
    </FarmProvider>
  );
}

export default App;