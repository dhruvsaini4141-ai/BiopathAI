import React, { useRef } from 'react';
import { Layers, Upload, X, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MedicalImageViewer } from '../image-viewer/MedicalImageViewer';
import { ImageAttachment } from '../../types/case';
import { radiographicAdapter } from '../../services/radiographicAdapter';

interface MultimodalExamSectionProps {
  rgbImage: ImageAttachment | null;
  radiographicImage: ImageAttachment | null;
  onRadiographicUpload: (file: File) => void;
  onRadiographicRemove: () => void;
}

export const MultimodalExamSection: React.FC<MultimodalExamSectionProps> = ({
  rgbImage,
  radiographicImage,
  onRadiographicUpload,
  onRadiographicRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onRadiographicUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            Multimodal Examination Modalities
          </h2>
          <p className="text-xs text-slate-500">
            Simultaneous examination of RGB dermoscopy and radiographic imaging modality.
          </p>
        </div>

        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
          Modality separation strictly enforced: AI inference analyzes RGB only
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modality 1: RGB Skin Lesion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Modality 1: RGB Dermoscopy
            </span>
            <span className="text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono font-medium">
              Analyzed by EfficientNet-B0
            </span>
          </div>

          <MedicalImageViewer
            imageUrl={rgbImage?.url || null}
            filename={rgbImage?.filename || 'RGB_Acquisition.jpg'}
            filesize={rgbImage?.sizeBytes}
            width={rgbImage?.width}
            height={rgbImage?.height}
            title="RGB Dermoscopic Lesion"
            sourceLabel="ORIGINAL CAPTURE"
          />
        </div>

        {/* Modality 2: Radiographic Imaging */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Modality 2: Radiographic Imaging
            </span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
              Status: {radiographicImage ? 'Loaded' : 'Not loaded'}
            </span>
          </div>

          {radiographicImage ? (
            <MedicalImageViewer
              imageUrl={radiographicImage.url}
              filename={radiographicImage.filename}
              filesize={radiographicImage.sizeBytes}
              width={radiographicImage.width}
              height={radiographicImage.height}
              title="Radiographic Examination"
              sourceLabel="RADIOGRAPHIC"
              showClearButton={true}
              onClear={onRadiographicRemove}
            />
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/60 flex flex-col items-center justify-center text-center min-h-[340px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Layers className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Radiographic Modality Ready</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4 leading-relaxed">
                Associate a radiographic scan with this patient case. Modality remains isolated from the RGB neural network classifier.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Radiographic Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
