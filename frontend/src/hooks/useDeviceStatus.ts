import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '../services/deviceService';
import { radiographicAdapter } from '../services/radiographicAdapter';
import { DeviceInfo, RadiographicStatus } from '../types/device';

export interface DeviceStatusState {
  deviceInfo: DeviceInfo | null;
  radiographicStatus: RadiographicStatus;
  radiographicNotes: string;
  refreshDeviceStatus: () => Promise<void>;
}

export function useDeviceStatus(): DeviceStatusState {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [radiographicStatus, setRadiographicStatus] = useState<RadiographicStatus>('not_loaded');
  const [radiographicNotes, setRadiographicNotes] = useState<string>('');

  const refreshDeviceStatus = useCallback(async () => {
    try {
      const dev = await deviceService.getRGBDeviceStatus();
      setDeviceInfo(dev);

      const rad = radiographicAdapter.getStatus();
      setRadiographicStatus(rad.isLoaded ? 'loaded' : 'ready');
      setRadiographicNotes(rad.notes);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    refreshDeviceStatus();
    const interval = setInterval(refreshDeviceStatus, 15000);
    return () => clearInterval(interval);
  }, [refreshDeviceStatus]);

  return {
    deviceInfo,
    radiographicStatus,
    radiographicNotes,
    refreshDeviceStatus,
  };
}
