import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Clinical Disclaimer:</span> BioPatch AI is an AI-assisted research/demo screening prototype and is not a substitute for professional medical diagnosis. Suspicious findings require clinical evaluation.
          </p>
        </div>
        <div className="text-slate-400 text-right whitespace-nowrap">
          EfficientNet-B0 Dual-Stage Pipeline
        </div>
      </div>
    </footer>
  );
};
