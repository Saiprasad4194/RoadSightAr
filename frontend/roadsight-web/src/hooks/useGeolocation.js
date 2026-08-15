import { useState, useRef, useCallback, useEffect } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('off'); // 'off' | 'acquiring' | 'active' | 'error'
  const [gpsError, setGpsError] = useState(null);
  const watchIdRef = useRef(null);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus('off');
    setCoords(null);
    setGpsError(null);
  }, []);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsStatus('error');
      return;
    }

    setGpsStatus('acquiring');
    setGpsError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        
        // speed from geolocation API is in meters/sec, convert to km/h (m/s * 3.6)
        const speedKmh = speed !== null && speed >= 0 ? Math.round(speed * 3.6) : 0;

        setCoords({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          speedKmh,
          heading: heading !== null ? Math.round(heading) : 0,
        });
        setGpsStatus('active');
      },
      (err) => {
        console.warn('Geolocation position error:', err);
        let errorMsg = 'GPS acquisition error.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'GPS permission denied.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS signal unavailable.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'GPS request timed out.';
        }
        setGpsError(errorMsg);
        setGpsStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;
  }, []);

  const toggleGps = useCallback(() => {
    if (gpsStatus === 'off' || gpsStatus === 'error') {
      startGps();
    } else {
      stopGps();
    }
  }, [gpsStatus, startGps, stopGps]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    coords,
    gpsStatus,
    gpsError,
    startGps,
    stopGps,
    toggleGps,
  };
}
