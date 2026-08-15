export function StatusPanel({ coords, gpsStatus, isCameraActive, facingMode }) {
  const formatCoord = (val) => (val !== undefined && val !== null ? val.toFixed(4) : '--.----');

  return (
    <div className="glass-panel telemetry-strip">
      <div className="telemetry-item">
        <span className="telemetry-label">GPS COORDS</span>
        <span className="telemetry-value">
          {coords 
            ? `${formatCoord(coords.latitude)}, ${formatCoord(coords.longitude)}` 
            : gpsStatus === 'acquiring' ? 'SEARCHING...' : 'OFFLINE'}
        </span>
      </div>

      <div className="telemetry-item" style={{ alignItems: 'center' }}>
        <span className="telemetry-label">ACCURACY</span>
        <span className="telemetry-value">
          {coords ? `±${coords.accuracy}m` : '--'}
        </span>
      </div>

      <div className="telemetry-item" style={{ alignItems: 'flex-end' }}>
        <span className="telemetry-label">SENSOR FEED</span>
        <span className="telemetry-value">
          {isCameraActive ? `CAM (${facingMode === 'environment' ? 'REAR' : 'FRONT'})` : 'STANDBY'}
        </span>
      </div>
    </div>
  );
}
