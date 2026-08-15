export function NavigationCard({ speedKmh = 0, speedUnit = 'km/h', isCameraActive }) {
  const displaySpeed = speedUnit === 'mph' ? Math.round(speedKmh * 0.621371) : speedKmh;

  return (
    <div className="navigation-banner-wrapper">
      <div className="glass-panel navigation-card">
        <div className="nav-icon-container">
          {isCameraActive ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          )}
        </div>

        <div className="nav-text-container">
          <div className="nav-instruction">
            {isCameraActive ? 'System Active — Monitoring Road Ahead' : 'Align Device Forward'}
          </div>
          <div className="nav-subtext">
            {isCameraActive ? 'AR HUD Overlay Active' : 'Start camera to enable computer vision scanning'}
          </div>
        </div>

        <div className="nav-telemetry-badge">
          <span className="speed-val">{displaySpeed}</span>
          <span className="speed-unit">{speedUnit}</span>
        </div>
      </div>
    </div>
  );
}
