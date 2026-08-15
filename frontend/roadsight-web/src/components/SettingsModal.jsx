export function SettingsModal({
  isOpen,
  onClose,
  speedUnit,
  onSpeedUnitChange,
  facingMode,
  onToggleFacingMode
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">System Settings</div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Speedometer Units</div>
              <div className="setting-subtext">Choose display unit for speed telemetry</div>
            </div>
            <div className="setting-toggle">
              <button 
                className={`toggle-option ${speedUnit === 'km/h' ? 'selected' : ''}`}
                onClick={() => onSpeedUnitChange('km/h')}
              >
                KM/H
              </button>
              <button 
                className={`toggle-option ${speedUnit === 'mph' ? 'selected' : ''}`}
                onClick={() => onSpeedUnitChange('mph')}
              >
                MPH
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">Active Lens</div>
              <div className="setting-subtext">Rear camera recommended for dash mount</div>
            </div>
            <div className="setting-toggle">
              <button 
                className={`toggle-option ${facingMode === 'environment' ? 'selected' : ''}`}
                onClick={onToggleFacingMode}
              >
                {facingMode === 'environment' ? 'REAR' : 'FRONT'}
              </button>
            </div>
          </div>

          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <div className="setting-label">About RoadSight AR</div>
            <div className="setting-subtext" style={{ lineHeight: '1.5' }}>
              Version 0.1.0 Mobile Web Client. Built with React & Vite. Real-time camera feed & GPS telemetry API integrated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
