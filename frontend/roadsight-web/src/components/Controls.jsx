export function Controls({
  isCameraActive,
  isLoading,
  onStartCamera,
  onStopCamera,
  gpsStatus,
  onToggleGps,
  onToggleFacingMode,
}) {
  return (
    <div className="bottom-controls-bar">
      {/* GPS Toggle Button */}
      <button 
        className={`control-btn ${gpsStatus === 'active' || gpsStatus === 'acquiring' ? 'active' : ''}`}
        onClick={onToggleGps}
        aria-label="Toggle GPS"
      >
        <div className="control-btn-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
        <span>GPS {gpsStatus === 'active' ? 'ON' : gpsStatus === 'acquiring' ? 'SEARCH' : 'OFF'}</span>
      </button>

      {/* Main Start/Stop Camera Action Button */}
      <button 
        className={`main-action-btn ${isCameraActive ? 'active' : ''}`}
        onClick={isCameraActive ? onStopCamera : onStartCamera}
        disabled={isLoading}
      >
        {isCameraActive ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2"></rect>
            </svg>
            Stop Camera
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Start Camera
          </>
        )}
      </button>

      {/* Switch Camera Lens Button */}
      <button 
        className="control-btn"
        onClick={onToggleFacingMode}
        aria-label="Switch Camera"
        title="Switch Camera (Front/Rear)"
      >
        <div className="control-btn-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </div>
        <span>FLIP CAM</span>
      </button>
    </div>
  );
}
