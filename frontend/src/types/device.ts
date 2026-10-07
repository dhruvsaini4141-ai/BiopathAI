export type CameraStatus = 'connected' | 'waiting' | 'disconnected' | 'not_configured';
export type WifiStatus = 'connected' | 'disconnected' | 'unknown';
export type BackendStatus = 'online' | 'offline' | 'checking';
export type ModelStatus = 'loaded' | 'error' | 'unverified';
export type RadiographicStatus = 'not_loaded' | 'loaded' | 'ready' | 'not_configured';

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'ESP32-CAM' | 'iTiMO-WiFi' | 'Simulated' | 'Manual';
  ipAddress?: string;
  ssid?: string;
  cameraStatus: CameraStatus;
  wifiStatus: WifiStatus;
  firmwareVersion?: string;
  lastPingTimestamp?: string;
}

export interface SystemStatus {
  backend: BackendStatus;
  models: ModelStatus;
  camera: CameraStatus;
  wifi: WifiStatus;
  radiographic: RadiographicStatus;
  details?: {
    model1?: string;
    model2?: string;
    apiBaseUrl: string;
  };
}
