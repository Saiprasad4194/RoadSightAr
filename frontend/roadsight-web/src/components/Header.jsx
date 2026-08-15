export function Header({ gpsStatus, aiStatus = 'Standby', onOpenSettings }) {
  const getGpsDotClass = () => {
    switch (gpsStatus) {
      case 'active':
        return 'status-dot emerald';
      case 'acquiring':
        return 'status-dot amber';
      case 'error':
        return 'status-dot rose';
      default:
        return 'status-dot';
    }
  };

  const getGpsLabel = () => {
    switch (gpsStatus) {
      case 'active':
        return 'GPS ACTIVE';
      case 'acquiring':
        return 'SEARCHING GPS';
      case 'error':
        return 'GPS ERROR';
      default:
        return 'GPS OFF';
    }
  };

  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">RS</div>
        <div className="brand-name">RoadSight</div>
        <span className="brand-badge">AR</span>
      </div>

      <div className="header-status-group">
        <div className={`status-pill ${gpsStatus === 'active' ? 'active' : ''}`}>
          <span className={getGpsDotClass()}></span>
          <span>{getGpsLabel()}</span>
        </div>

        <div className="status-pill">
          <span className="status-dot amber"></span>
          <span>AI {aiStatus.toUpperCase()}</span>
        </div>

        <button 
          className="header-btn" 
          onClick={onOpenSettings} 
          aria-label="Settings"
          title="Open Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
