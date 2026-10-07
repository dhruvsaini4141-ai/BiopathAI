import React from 'react';
import { Server, Camera, Layers, Cpu, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { BackendStatus, ModelStatus, CameraStatus, RadiographicStatus } from '../../types/device';

interface SystemStatusBarProps {
  backend: BackendStatus;
  models: ModelStatus;
  camera: CameraStatus;
  radiographic: RadiographicStatus;
  onRefresh?: () => void;
  isChecking?: boolean;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  backend,
  models,
  camera,
  radiographic,
  onRefresh,
  isChecking,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            System & Hardware Architecture Status
          </h2>
          <p className="text-xs text-slate-500">
            Real-time pipeline verification across acquisition devices, backend API, and AI inference engines.
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isChecking}
            className="self-start sm:self-auto inline-flex items-center text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Backend Server */}
        <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              backend === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              FastAPI Backend
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backend === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-800 capitalize">
                {backend === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. RGB Acquisition Camera */}
        <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              camera === 'connected'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Camera className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              RGB Camera (ESP32)
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  camera === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-800 capitalize truncate">
                {camera === 'connected' ? 'Connected' : 'Manual / Waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Radiographic Input Modality */}
        <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              radiographic === 'loaded'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-sky-100 text-sky-700'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              Radiographic Modality
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  radiographic === 'loaded' ? 'bg-indigo-500' : 'bg-sky-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-800 capitalize truncate">
                {radiographic === 'loaded' ? 'Image Loaded' : 'Ready for Input'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. AI Models */}
        <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              models === 'loaded' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              EfficientNet-B0 Models
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  models === 'loaded' ? 'bg-sky-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-800 capitalize truncate">
                {models === 'loaded' ? 'Stage 1 & 2 Loaded' : 'Error Loading'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
