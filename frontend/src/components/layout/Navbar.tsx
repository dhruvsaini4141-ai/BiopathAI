import React from 'react';
import { Activity, ShieldAlert, Cpu, Wifi, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BackendStatus, ModelStatus, CameraStatus } from '../../types/device';

interface NavbarProps {
  backendStatus: BackendStatus;
  modelsStatus: ModelStatus;
  cameraStatus: CameraStatus;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendStatus,
  modelsStatus,
  cameraStatus,
  onRefreshHealth,
  isCheckingHealth,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  BIOPATCH<span className="text-sky-600 ml-1">AI</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  v1.0 Demo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Monitor Early • Heal Better &nbsp;—&nbsp; <span className="text-slate-600">AI-assisted skin-lesion screening</span>
              </p>
            </div>
          </div>

          {/* Real-time Hardware & Model Badges */}
          <div className="flex items-center space-x-3">
            {/* Backend status badge */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>Backend: {backendStatus === 'online' ? 'Online' : 'Offline'}</span>
            </div>

            {/* Model status badge */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                modelsStatus === 'loaded'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Models: {modelsStatus === 'loaded' ? 'Loaded' : 'Error'}</span>
            </div>

            {/* Camera acquisition status badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              <Wifi className="w-3.5 h-3.5 text-slate-400" />
              <span>
                RGB Camera: {cameraStatus === 'connected' ? 'Connected' : 'Manual Mode'}
              </span>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefreshHealth}
              disabled={isCheckingHealth}
              title="Ping backend health"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
