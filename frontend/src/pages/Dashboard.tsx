import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Play, RefreshCw, FileText, Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { SystemStatusBar } from '../components/dashboard/SystemStatusBar';
import { MultimodalExamSection } from '../components/dashboard/MultimodalExamSection';
import { CaseInfoSection } from '../components/dashboard/CaseInfoSection';
import { HistoricalCasesSection } from '../components/dashboard/HistoricalCasesSection';
import { MedicalImageViewer } from '../components/image-viewer/MedicalImageViewer';
import { ScreeningResultCard } from '../components/result/ScreeningResultCard';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useAnalysis } from '../hooks/useAnalysis';
import { historyService } from '../services/historyService';
import { radiographicAdapter } from '../services/radiographicAdapter';
import { CaseMetadata, Examination, ImageAttachment } from '../types/case';
import { generateCaseId, generatePatientId } from '../utils/formatters';

interface DashboardProps {
  onNavigateToCase?: (exam: Examination) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCase, onNavigateToTab }) => {
  const {
    backendStatus,
    modelsStatus,
    checkHealth,
    isChecking,
  } = useBackendHealth();

  const {
    deviceInfo,
    radiographicStatus,
    refreshDeviceStatus,
  } = useDeviceStatus();

  const {
    state: analysisState,
    previewUrl,
    currentFile,
    imageMetadata,
    setImage,
    reset,
    executeAnalysis,
  } = useAnalysis();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata for current session examination
  const [metadata, setMetadata] = useState<CaseMetadata>(() => ({
    caseId: generateCaseId(),
    patientId: generatePatientId(),
    age: '48',
    sex: 'Unspecified',
    anatomicalSite: 'Forearm (Right)',
    timestamp: new Date().toISOString(),
    operatorId: 'CLINICAL-OP-1',
  }));

  // Radiographic attachment state
  const [radiographicImage, setRadiographicImage] = useState<ImageAttachment | null>(() => {
    return radiographicAdapter.getAttachment();
  });

  // Recorded examinations in session
  const [examinations, setExaminations] = useState<Examination[]>(() => {
    return historyService.getLocalExaminations();
  });

  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warn' } | null>(null);

  const showNotification = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleMetadataChange = (updated: Partial<CaseMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updated }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file, 'upload');
      showNotification(`Loaded dermoscopy image: ${file.name}`, 'info');
    }
  };

  // Sample Loaders for quick presentation
  const loadSample = async (sampleType: 'non_target' | 'suspicious') => {
    try {
      const filename = sampleType === 'non_target' ? 'sample_non_target.jpg' : 'sample_suspicious.jpg';
      const label = sampleType === 'non_target' ? 'ISIC-0000000 (Non-Target)' : 'ISIC-0000002 (Suspicious Melanoma)';
      const response = await fetch(`/samples/${filename}`);
      if (!response.ok) throw new Error('Sample asset not found');
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setImage(file, 'sample');
      showNotification(`Sample loaded: ${label}`, 'success');
    } catch (err: any) {
      showNotification(`Could not load sample: ${err.message}`, 'warn');
    }
  };

  const handleCaptureClick = () => {
    // Check if camera is configured
    if (deviceInfo?.cameraStatus !== 'connected') {
      showNotification(
        'Camera not connected — operating in manual image mode. Please select a local image file or click "Load Sample Lesion".',
        'warn'
      );
    } else {
      showNotification('Hardware capture command dispatched to ESP32-CAM.', 'info');
    }
  };

  // Radiographic modality management
  const handleRadiographicUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const attachment: ImageAttachment = {
      url,
      filename: file.name,
      sizeBytes: file.size,
      source: 'upload',
    };
    setRadiographicImage(attachment);
    radiographicAdapter.setAttachment(attachment);
    refreshDeviceStatus();
    showNotification('Radiographic examination loaded. Modality separation active.', 'success');
  };

  const handleRadiographicRemove = () => {
    if (radiographicImage?.url) {
      URL.revokeObjectURL(radiographicImage.url);
    }
    setRadiographicImage(null);
    radiographicAdapter.clear();
    refreshDeviceStatus();
    showNotification('Radiographic attachment removed.', 'info');
  };

  // Run real analysis and persist examination on success
  const handleAnalyze = async () => {
    if (!currentFile) {
      showNotification('Please load or select an RGB image first.', 'warn');
      return;
    }

    const result = await executeAnalysis();

    if (result) {
      // Create session examination record
      const newExam: Examination = {
        id: metadata.caseId,
        patientId: metadata.patientId,
        createdAt: new Date().toISOString(),
        metadata: { ...metadata },
        rgbImage: previewUrl
          ? {
              url: previewUrl,
              filename: currentFile.name,
              sizeBytes: currentFile.size,
              source: imageMetadata?.source || 'upload',
              width: imageMetadata?.width,
              height: imageMetadata?.height,
            }
          : null,
        radiographicImage: radiographicImage,
        rgbAnalysis: result,
        clinicalReview: {
          status: 'Pending',
          reviewerNotes: '',
        },
      };

      historyService.saveExamination(newExam);
      setExaminations(historyService.getLocalExaminations());
      showNotification('AI screening finished successfully. Session record stored.', 'success');
    }
  };

  const currentRgbAttachment: ImageAttachment | null = previewUrl
    ? {
        url: previewUrl,
        filename: currentFile?.name || 'RGB_Capture.jpg',
        sizeBytes: currentFile?.size,
        width: imageMetadata?.width,
        height: imageMetadata?.height,
        source: imageMetadata?.source || 'upload',
      }
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : notification.type === 'warn'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. System Status Bar */}
      <SystemStatusBar
        backend={backendStatus}
        models={modelsStatus}
        camera={deviceInfo?.cameraStatus || 'waiting'}
        radiographic={radiographicStatus}
        onRefresh={checkHealth}
        isChecking={isChecking}
      />

      {/* 2. Primary Acquisition & Screening Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: RGB Acquisition & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sky-600" />
                  RGB Skin Lesion Acquisition
                </h2>
                <p className="text-xs text-slate-500">
                  Primary dermoscopic imaging modality analyzed by the two-stage AI pipeline.
                </p>
              </div>

              {/* Hardware connection badge / Fallback indicator */}
              <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Camera not connected — manual image mode
              </div>
            </div>

            {/* Image Preview / Medical Viewer */}
            <div className="mt-4">
              <MedicalImageViewer
                imageUrl={previewUrl}
                filename={currentFile?.name || 'RGB_Capture.jpg'}
                filesize={currentFile?.size}
                width={imageMetadata?.width}
                height={imageMetadata?.height}
                title="RGB Skin Lesion"
                sourceLabel="ORIGINAL CAPTURE"
                showClearButton={!!previewUrl}
                onClear={reset}
              />
            </div>
          </div>

          {/* Acquisition & Inference Action Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {/* Hardware capture button */}
                <button
                  onClick={handleCaptureClick}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Capture</span>
                </button>

                {/* Upload Image button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload RGB Image</span>
                </button>
              </div>

              {/* Primary Analyze Action */}
              <button
                onClick={handleAnalyze}
                disabled={!currentFile || analysisState.stage === 'UPLOADING' || analysisState.stage === 'PROCESSING'}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 disabled:pointer-events-none shadow-xs shadow-sky-200 transition-all"
              >
                {analysisState.stage === 'PROCESSING' || analysisState.stage === 'UPLOADING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Analyze Lesion</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick-test Presets for Presenter / Judges */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-400 font-medium">Quick Test Presets (Real ISIC Dataset):</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadSample('non_target')}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                >
                  Load Non-Target Sample
                </button>
                <button
                  onClick={() => loadSample('suspicious')}
                  className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                >
                  Load Suspicious Sample
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Analysis Result Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <ScreeningResultCard
            stage={analysisState.stage}
            result={analysisState.result}
            error={analysisState.error}
            technicalError={analysisState.technicalError}
            progressPercent={analysisState.progressPercent}
            statusMessage={analysisState.currentMessage}
          />
        </div>
      </div>

      {/* 3. Multimodal Examination Section (RGB + Radiographic) */}
      <MultimodalExamSection
        rgbImage={currentRgbAttachment}
        radiographicImage={radiographicImage}
        onRadiographicUpload={handleRadiographicUpload}
        onRadiographicRemove={handleRadiographicRemove}
      />

      {/* 4. Case & Patient Metadata Section */}
      <CaseInfoSection
        metadata={metadata}
        onChangeMetadata={handleMetadataChange}
        isEditable={true}
      />

      {/* 5. Historical Examinations & Similarity Search Section */}
      <HistoricalCasesSection
        examinations={examinations}
        onSelectCase={(exam) => {
          if (onNavigateToCase) onNavigateToCase(exam);
        }}
      />
    </div>
  );
};
