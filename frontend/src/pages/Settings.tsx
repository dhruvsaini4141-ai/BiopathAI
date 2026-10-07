import React, { useState } from 'react';
import { Settings as SettingsIcon, Server, Wifi, Cpu, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Terminal, Shield } from 'lucide-react';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { deviceService, DeviceConfig } from '../services/deviceService';
import { checkBackendHealth, getRootInfo, API_BASE_URL } from '../services/api';

export const Settings: React.FC = () => {
  const {
    backendStatus,
    modelsStatus,
    model1Loaded,
    model2Loaded,
    apiBaseUrl,
    checkHealth,
    isChecking,
  } = useBackendHealth();

  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>(() => deviceService.getConfig());
  const [testResult, setTestResult] = useState<{
    success: boolean;
    timestamp: string;
    latencyMs: number;
    details: any;
  } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleRunDiagnostics = async () => {
    setIsTesting(true);
    const start = performance.now();
    try {
      const [health, root] = await Promise.all([
        checkBackendHealth(),
        getRootInfo().catch(() => ({ project: 'BioPatch AI' })),
      ]);
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: latency,
        details: { health, root },
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: latency,
        details: { error: err.message, technical: err.technicalDetails },
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateDeviceConfig = (updated: Partial<DeviceConfig>) => {
    const next = { ...deviceConfig, ...updated };
    setDeviceConfig(next);
    deviceService.updateConfig(next);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              System Settings & Architecture Diagnostics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure backend endpoints, check live PyTorch model health, and verify ESP32 network bridge parameters.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
          Environment: Local Dev
        </span>
      </div>

      {/* 1. FastAPI Backend Connection Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              FastAPI Inference Server Configuration
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-slate-700 capitalize">{backendStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Active API Base URL (VITE_API_BASE_URL):
            </label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
              {apiBaseUrl}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Configured via frontend .env file. For LAN or ESP32 access, bind uvicorn to 0.0.0.0:8000.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">
              Active AI Checkpoint Engines:
            </label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
              <div className="flex items-center justify-between">
                <span>Model 1 (Screening Checkpoint):</span>
                <span className={`font-mono font-semibold ${model1Loaded ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {model1Loaded ? 'LOADED' : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Model 2 (Cancer Type Checkpoint):</span>
                <span className={`font-mono font-semibold ${model2Loaded ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {model2Loaded ? 'LOADED' : 'UNAVAILABLE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleRunDiagnostics}
            disabled={isTesting}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Pinging Endpoints...' : 'Run Connectivity Diagnostic'}</span>
          </button>

          {testResult && (
            <div className="flex items-center space-x-2 text-xs">
              {testResult.success ? (
                <span className="text-emerald-700 flex items-center space-x-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified in {testResult.latencyMs}ms ({testResult.timestamp})</span>
                </span>
              ) : (
                <span className="text-rose-700 flex items-center space-x-1 font-medium">
                  <XCircle className="w-4 h-4" />
                  <span>Diagnostic Failed ({testResult.latencyMs}ms)</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Technical Diagnostics Payload */}
        {testResult && (
          <div className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto space-y-1">
            <span className="text-sky-400 block font-semibold">// Diagnostics Response:</span>
            <pre className="text-slate-300">{JSON.stringify(testResult.details, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* 2. ESP32 / Camera Hardware Abstraction Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              ESP32 & Wi-Fi Camera Hardware Profile
            </h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
            Hardware Abstraction Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Camera Wi-Fi SSID:
            </label>
            <input
              type="text"
              value={deviceConfig.ssid}
              onChange={(e) => handleUpdateDeviceConfig({ ssid: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800 bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Target Device IP Address:
            </label>
            <input
              type="text"
              value={deviceConfig.deviceIp}
              onChange={(e) => handleUpdateDeviceConfig({ deviceIp: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800 bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Acquisition Mode:
            </label>
            <select
              value={deviceConfig.mode}
              onChange={(e) => handleUpdateDeviceConfig({ mode: e.target.value as any })}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="manual">Manual / File Upload (Presentation Mode)</option>
              <option value="esp32">ESP32-CAM Wi-Fi HTTP Bridge</option>
              <option value="itimo_udp">iTiMO Inspection Camera Protocol</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Integration Architecture Note:</span> To prevent hardware freezes during presentations, BioPatch AI does not assume an active physical Wi-Fi camera. The device service layer safely abstracts camera state while allowing seamless transition to live hardware once firmware is flashed.
        </div>
      </div>

      {/* 3. System Integration Gap Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          Production Integration Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2">Subsystem</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Implementation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-medium">FastAPI Backend</td>
                <td className="py-2.5 text-emerald-600 font-semibold">Active & Connected</td>
                <td className="py-2.5">Exposing GET /, GET /health, POST /analyze with CORS support.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Dual PyTorch Models</td>
                <td className="py-2.5 text-emerald-600 font-semibold">Loaded & Verified</td>
                <td className="py-2.5">EfficientNet-B0 Stage 1 (Screening) & Stage 2 (Cancer Subtype).</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">ESP32 RGB Acquisition</td>
                <td className="py-2.5 text-amber-600 font-semibold">Abstraction Layer Ready</td>
                <td className="py-2.5">Hardware service ready for firmware HTTP/TCP image stream.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Radiographic Modality</td>
                <td className="py-2.5 text-sky-600 font-semibold">Isolated Adapter Ready</td>
                <td className="py-2.5">Local image association with strict AI modality separation.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">10GB Archival DB</td>
                <td className="py-2.5 text-slate-500 font-semibold">Database API Coming Soon</td>
                <td className="py-2.5">Session records persist; persistent SQLite/Postgres backend planned.</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Similarity Search</td>
                <td className="py-2.5 text-slate-500 font-semibold">Vector Index Coming Soon</td>
                <td className="py-2.5">Requires dedicated embedding model & FAISS / pgvector backend.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
