export function CameraView({
  videoRef,
  isCameraActive,
  cameraError,
  isLoading,
  onStartCamera
}) {
  return (
    <div className="camera-container">
      {/* Video stream feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="video-stream"
        style={{ display: isCameraActive ? 'block' : 'none' }}
      />

      {/* AR HUD Overlay layer */}
      {isCameraActive && (
        <div className="ar-overlay-layer">
          <div className="ar-corner top-left"></div>
          <div className="ar-corner top-right"></div>
          <div className="ar-corner bottom-left"></div>
          <div className="ar-corner bottom-right"></div>
          <div className="ar-center-crosshair"></div>
        </div>
      )}

      {/* Camera Inactive / Error Placeholder */}
      {!isCameraActive && (
        <div className="camera-placeholder">
          <div className="placeholder-icon-wrapper">
            {isLoading ? (
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            )}
          </div>

          <div className="placeholder-title">
            {isLoading ? 'Initializing Camera Feed...' : cameraError ? 'Camera Unavailable' : 'Camera Feed Inactive'}
          </div>

          <div className="placeholder-desc">
            {cameraError || 'Tap "Start Camera" below to activate real-time AR road vision and object detection stream.'}
          </div>

          {!isLoading && (
            <button 
              className="main-action-btn"
              onClick={onStartCamera}
              style={{ marginTop: '12px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start Camera
            </button>
          )}
        </div>
      )}
    </div>
  );
}
