import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, RefreshCcw, Eye, FileImage } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface MedicalImageViewerProps {
  imageUrl: string | null;
  filename?: string;
  filesize?: number;
  width?: number;
  height?: number;
  title?: string;
  sourceLabel?: string;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  imageUrl,
  filename = 'image_capture.jpg',
  filesize,
  width,
  height,
  title = 'RGB Skin Lesion Capture',
  sourceLabel = 'ORIGINAL CAPTURE',
  onClear,
  showClearButton = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotationDeg(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotationDeg(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!imageUrl) {
    return (
      <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileImage className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No Image Loaded</p>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Capture from RGB inspection camera or select a local image file to view.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`border border-slate-200 rounded-xl bg-slate-900 overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="bg-slate-800/90 backdrop-blur-xs px-4 py-2.5 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300 select-none">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white truncate max-w-[200px]" title={filename}>
            {filename}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
            {sourceLabel}
          </span>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1 min-w-[42px] text-center text-slate-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3.5}
            title="Zoom In"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-slate-700 mx-1" />
          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {showClearButton && onClear && (
            <button
              onClick={onClear}
              className="ml-2 px-2 py-0.5 rounded text-[11px] bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Interactive Canvas / Image Display */}
      <div className="relative flex-1 min-h-[300px] max-h-[460px] overflow-hidden flex items-center justify-center p-4 bg-radial from-slate-800 to-slate-950">
        <div
          className="transition-transform duration-150 ease-out origin-center flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotationDeg}deg)`,
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[380px] max-w-full object-contain shadow-2xl rounded"
            draggable={false}
          />
        </div>
      </div>

      {/* Viewer Metadata Footer */}
      <div className="bg-slate-850 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-3">
          {width && height && (
            <span>
              Resolution: <strong className="text-slate-200">{width} × {height}</strong> px
            </span>
          )}
          {filesize && (
            <span>
              Size: <strong className="text-slate-200">{formatBytes(filesize)}</strong>
            </span>
          )}
        </div>
        <div className="text-slate-400">
          Modality: <span className="text-slate-300 font-sans font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};
