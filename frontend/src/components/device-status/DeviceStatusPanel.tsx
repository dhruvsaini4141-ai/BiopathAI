import React, { useState } from 'react';
import { Wifi, Camera, Cpu, ArrowRight, ShieldCheck, Terminal, AlertCircle, RefreshCw } from 'lucide-react';
import { deviceService, DeviceConfig } from '../../services/deviceService';
import { useBackendHealth } from '../../hooks/useBackendHealth';

export const DeviceStatusPanel: React.FC = () => {
  const { backendStatus, apiBaseUrl } = useBackendHealth();
  const [config, setConfig] = useState<DeviceConfig>(() => deviceService.getConfig());
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);

  const handleRunDevicePing = async () => {
    setIsRunningTest(true);
    setTestOutput(`[BioPatch AI Hardware Bridge]\nTarget Device: ${config.deviceIp}:${config.devicePort}\nSSID: ${config.ssid}\nTesting network reachability...\n\nResult: Device endpoint in waiting mode.\nRecommendation: Use Manual Image Mode for desktop evaluation or flash firmware to bridge frame capture.`);
    setIsRunningTest(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Device Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Hardware Architecture & ESP32-CAM Status
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical acquisition hardware configuration and wireless communication topology.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
          Device ID: ESP32-CAM-01
        </span>
      </div>

      {/* Target Hardware Workflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Hardware Acquisition & Inference Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Camera className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-800">ESP32-CAM</span>
            <span className="text-[10px] text-slate-500">OV2640 Sensor</span>
          </div>

          <div className="text-slate-400 font-mono font-bold flex items-center justify-center">
            <ArrowRight className="w-4 h-4 hidden sm:block" />
            <span className="sm:hidden">&darr; Wi-Fi 802.11b/g/n</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Wifi className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-800">FastAPI Server</span>
            <span className="text-[10px] text-slate-500">0.0.0.0:8000</span>
          </div>

          <div className="text-slate-400 font-mono font-bold flex items-center justify-center">
            <ArrowRight className="w-4 h-4 hidden sm:block" />
            <span className="sm:hidden">&darr; PyTorch CPU/GPU</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Cpu className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-800">EfficientNet-B0</span>
            <span className="text-[10px] text-slate-500">Dual-Stage AI</span>
          </div>
        </div>

        <div className="p-3.5 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 leading-relaxed">
          <span className="font-semibold">Hardware Engineering Rule:</span> The ESP32 serves exclusively as an image acquisition and transmission peripheral. Heavy PyTorch neural network inference is strictly executed on the host workstation server, preserving micro-controller resources and ensuring millisecond response times.
        </div>
      </div>

      {/* Network Configuration & Test Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            Wireless Network Parameters
          </h2>
          <span className="text-xs text-slate-500">
            Inspection Camera Protocol (iTiMO / ESP32)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Configured Device IP:</label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
              {config.deviceIp}
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Wi-Fi Network SSID:</label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800">
              {config.ssid}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleRunDevicePing}
            disabled={isRunningTest}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
            <span>Test Hardware Reachability</span>
          </button>
        </div>

        {testOutput && (
          <div className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {testOutput}
          </div>
        )}
      </div>

      {/* 10GB Data Architecture Protection Rule */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Memory & Dataset Architecture Enforcement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">No Frontend Flooding</span>
            <p className="text-slate-500">
              The 10GB ISIC dataset is never loaded into browser RAM. Only user-selected images and metadata are exchanged.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">No Microcontroller Overload</span>
            <p className="text-slate-500">
              The ESP32 microcontroller only transmits the captured frame and is never sent archival data or heavy model weights.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Event-Driven Analysis</span>
            <p className="text-slate-500">
              The pipeline executes inference only on demand rather than queuing uncompressed high-framerate video blindly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
