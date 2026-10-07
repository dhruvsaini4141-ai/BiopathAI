import { DeviceInfo, CameraStatus, WifiStatus } from '../types/device';

/**
 * Device Service Layer
 * 
 * Hardware abstraction for ESP32 / ESP32-CAM / Wi-Fi Inspection Cameras.
 * 
 * NOTE: As per project architecture rules, this layer provides a clean,
 * modular interface for future ESP32 firmware endpoints without fabricating
 * imaginary backend endpoints. When no hardware device is bound, it returns
 * clear "not configured / waiting" states and guides the operator to manual image mode.
 */

export interface DeviceConfig {
  deviceIp: string;
  devicePort: number;
  ssid: string;
  mode: 'esp32' | 'itimo_udp' | 'manual';
}

const DEFAULT_CONFIG: DeviceConfig = {
  deviceIp: '192.168.10.123',
  devicePort: 80,
  ssid: 'iTiMO-725530',
  mode: 'manual',
};

class DeviceService {
  private config: DeviceConfig = { ...DEFAULT_CONFIG };

  public getConfig(): DeviceConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<DeviceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Checks the status of the RGB camera hardware.
   * In current prototype state, hardware firmware endpoint is pending integration.
   */
  public async getRGBDeviceStatus(): Promise<DeviceInfo> {
    // In this prototype, hardware is in waiting/manual acquisition mode
    // unless an active device bridge is deployed.
    const isManualMode = this.config.mode === 'manual';

    const cameraStatus: CameraStatus = isManualMode ? 'waiting' : 'not_configured';
    const wifiStatus: WifiStatus = 'unknown';

    return {
      deviceId: 'ESP32-CAM-MOD-01',
      deviceType: 'ESP32-CAM',
      ipAddress: this.config.deviceIp,
      ssid: this.config.ssid,
      cameraStatus,
      wifiStatus,
      firmwareVersion: 'v0.9.1-preview',
      lastPingTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Abstraction for capturing a frame directly from hardware.
   * Throws an informative error if hardware capture endpoint is not configured.
   */
  public async captureRGBImage(): Promise<Blob> {
    // Hardware capture requires active ESP32 firmware endpoint
    throw new Error(
      'Hardware capture endpoint not yet bound. Please use "Upload RGB Image" or "Load Sample Lesion" for prototype demonstration.'
    );
  }

  /**
   * Sends a capture trigger command to hardware.
   */
  public async sendCaptureCommand(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Hardware trigger not configured on current network segment. Operating in manual acquisition mode.',
    };
  }
}

export const deviceService = new DeviceService();
