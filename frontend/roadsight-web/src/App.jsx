import { useState } from 'react';
import { useCamera } from './hooks/useCamera';
import { useGeolocation } from './hooks/useGeolocation';
import { Header } from './components/Header';
import { NavigationCard } from './components/NavigationCard';
import { CameraView } from './components/CameraView';
import { StatusPanel } from './components/StatusPanel';
import { Controls } from './components/Controls';
import { SettingsModal } from './components/SettingsModal';
import './App.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [speedUnit, setSpeedUnit] = useState('km/h');

  const {
    videoRef,
    isCameraActive,
    cameraError,
    facingMode,
    isLoading,
    startCamera,
    stopCamera,
    toggleFacingMode,
  } = useCamera();

  const {
    coords,
    gpsStatus,
    toggleGps,
  } = useGeolocation();

  return (
    <div className="app-container">
      {/* Top Bar Header */}
      <Header 
        gpsStatus={gpsStatus}
        aiStatus="Standby"
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="main-view">
        {/* Navigation Instruction Overlay */}
        <NavigationCard 
          speedKmh={coords?.speedKmh || 0}
          speedUnit={speedUnit}
          isCameraActive={isCameraActive}
        />

        {/* Camera Feed & AR Overlay */}
        <CameraView 
          videoRef={videoRef}
          isCameraActive={isCameraActive}
          cameraError={cameraError}
          isLoading={isLoading}
          onStartCamera={startCamera}
        />

        {/* Bottom Telemetry Strip */}
        <StatusPanel 
          coords={coords}
          gpsStatus={gpsStatus}
          isCameraActive={isCameraActive}
          facingMode={facingMode}
        />
      </main>

      {/* Bottom Action Controls Bar */}
      <Controls 
        isCameraActive={isCameraActive}
        isLoading={isLoading}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        gpsStatus={gpsStatus}
        onToggleGps={toggleGps}
        onToggleFacingMode={toggleFacingMode}
      />

      {/* Settings Modal Sheet */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        speedUnit={speedUnit}
        onSpeedUnitChange={setSpeedUnit}
        facingMode={facingMode}
        onToggleFacingMode={toggleFacingMode}
      />
    </div>
  );
}

export default App;
