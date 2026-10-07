import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Camera, 
  Upload, 
  Layers, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  FileCheck, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { MedicalImageViewer } from '../components/image-viewer/MedicalImageViewer';
import { ScreeningResultCard } from '../components/result/ScreeningResultCard';
import { CaseMetadata, Examination, ImageAttachment, ReviewStatus } from '../types/case';
import { historyService } from '../services/historyService';
import { generateCaseId, generatePatientId } from '../utils/formatters';

interface LiveScanProps {
  onCaseCompleted?: (exam: Examination) => void;
}

export const LiveScan: React.FC<LiveScanProps> = ({ onCaseCompleted }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const rgbFileInputRef = useRef<HTMLInputElement>(null);
  const radFileInputRef = useRef<HTMLInputElement>(null);

  const { backendStatus, modelsStatus } = useBackendHealth();
  const { deviceInfo } = useDeviceStatus();

  const {
    state: analysisState,
    previewUrl,
    currentFile,
    imageMetadata,
    setImage,
    reset,
    executeAnalysis,
  } = useAnalysis();

  // Radiographic attachment
  const [radiographicImage, setRadiographicImage] = useState<ImageAttachment | null>(null);

  // Clinical Review state
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('Pending');
  const [reviewerNotes, setReviewNotes] = useState<string>('');

  // Metadata
  const [metadata, setMetadata] = useState<CaseMetadata>(() => ({
    caseId: generateCaseId(),
    patientId: generatePatientId(),
    age: '52',
    sex: 'Female',
    anatomicalSite: 'Left Upper Arm',
    timestamp: new Date().toISOString(),
    operatorId: 'EXAMINER-CHAIR-1',
  }));

  const steps = [
    { num: 1, title: 'Device Check', desc: 'Hardware & backend readiness' },
    { num: 2, title: 'RGB Capture', desc: 'Primary lesion image' },
    { num: 3, title: 'Radiographic', desc: 'Optional second modality' },
    { num: 4, title: 'AI Screening', desc: 'Dual-stage inference' },
    { num: 5, title: 'Results', desc: 'Probability analysis' },
    { num: 6, title: 'Clinical Review', desc: 'Physician sign-off' },
  ];

  const handleRgbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0], 'upload');
    }
  };

  const handleRadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setRadiographicImage({
        url,
        filename: file.name,
        sizeBytes: file.size,
        source: 'upload',
      });
    }
  };

  const loadSample = async (type: 'non_target' | 'suspicious') => {
    const filename = type === 'non_target' ? 'sample_non_target.jpg' : 'sample_suspicious.jpg';
    try {
      const res = await fetch(`/samples/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setImage(file, 'sample');
    } catch (e) {
      console.error('Failed to load sample', e);
    }
  };

  const loadSampleRadiograph = async () => {
    try {
      const res = await fetch('/samples/sample_radiographic.jpg');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setRadiographicImage({
        url,
        filename: 'sample_radiographic.jpg',
        sizeBytes: blob.size,
        source: 'sample',
      });
    } catch (e) {
      console.error('Failed to load sample radiograph', e);
    }
  };

  const handleRunInference = async () => {
    const res = await executeAnalysis();
    if (res) {
      setCurrentStep(5);
    }
  };

  const handleFinalizeCase = () => {
    const exam: Examination = {
      id: metadata.caseId,
      patientId: metadata.patientId,
      createdAt: new Date().toISOString(),
      metadata: { ...metadata },
      rgbImage: previewUrl && currentFile
        ? {
            url: previewUrl,
            filename: currentFile.name,
            sizeBytes: currentFile.size,
            source: imageMetadata?.source || 'upload',
            width: imageMetadata?.width,
            height: imageMetadata?.height,
          }
        : null,
      radiographicImage,
      rgbAnalysis: analysisState.result,
      clinicalReview: {
        status: reviewStatus,
        reviewerNotes,
        reviewedAt: new Date().toISOString(),
        reviewerId: 'DR-ONCOLOGY-DESK',
      },
    };

    historyService.saveExamination(exam);
    if (onCaseCompleted) onCaseCompleted(exam);
    setCurrentStep(6);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-sky-100 text-sky-800">
                Live Demonstration Workflow
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Live Examination & Screening Protocol
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step clinical acquisition and dual-stage AI classification workflow designed for committee evaluation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500">Case ID:</span>
            <span className="text-xs font-mono font-semibold bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-slate-800">
              {metadata.caseId}
            </span>
          </div>
        </div>

        {/* Horizontal Progress Indicator */}
        <div className="pt-5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px]">
            {steps.map((s, index) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setCurrentStep(s.num)}
                    className="flex flex-col items-center group focus:outline-hidden text-center"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPast
                          ? 'bg-sky-600 text-white shadow-xs shadow-sky-200'
                          : isCurrent
                          ? 'bg-sky-50 text-sky-700 border-2 border-sky-600 font-extrabold'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-5 h-5 stroke-[2.4]" /> : s.num}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                        isCurrent
                          ? 'text-sky-700 font-bold'
                          : isPast
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:block">
                      {s.desc}
                    </span>
                  </button>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 -mt-4 transition-all ${
                        currentStep > index + 1 ? 'bg-sky-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 1: PREPARE DEVICE */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Step 1: Prepare Device & Verify Infrastructure</h2>
            <p className="text-xs text-slate-500">
              Verify local network bridge, FastAPI AI inference service, and camera connectivity before patient acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>FastAPI Backend Service</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${backendStatus === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {backendStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Listening on host: 0.0.0.0:8000. Provides /health and /analyze endpoints.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>PyTorch EfficientNet-B0</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${modelsStatus === 'loaded' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}`}>
                  {modelsStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Stage 1 (Screening) & Stage 2 (Cancer Type) checkpoint weights loaded in memory.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>RGB Acquisition Camera</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">
                  MANUAL MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Camera not connected — manual image mode active. Ready for direct file upload or test samples.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
            >
              <span>Proceed to RGB Capture</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CAPTURE RGB IMAGE */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Step 2: RGB Skin Lesion Image Acquisition</h2>
              <p className="text-xs text-slate-500">
                Capture dermoscopic region of interest or upload a clinical photograph.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadSample('non_target')}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Sample: Non-Target
              </button>
              <button
                onClick={() => loadSample('suspicious')}
                className="text-[11px] px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800"
              >
                Sample: Suspicious
              </button>
            </div>
          </div>

          <div className="max-w-xl mx-auto">
            <MedicalImageViewer
              imageUrl={previewUrl}
              filename={currentFile?.name || 'No image loaded'}
              filesize={currentFile?.size}
              width={imageMetadata?.width}
              height={imageMetadata?.height}
              title="RGB Dermoscopy"
              sourceLabel="ORIGINAL CAPTURE"
              showClearButton={!!previewUrl}
              onClear={reset}
            />

            <input
              ref={rgbFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleRgbUpload}
              className="hidden"
            />

            <div className="mt-4 flex items-center justify-center space-x-3">
              <button
                onClick={() => rgbFileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Dermoscopic Image</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!previewUrl}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 transition-colors"
            >
              <span>Continue to Radiographic</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RADIOGRAPHIC IMAGE */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Step 3: Radiographic Image Association (Optional)</h2>
              <p className="text-xs text-slate-500">
                Attach anatomical radiographic imaging as a secondary modality. Modality separation is strictly enforced.
              </p>
            </div>
            <button
              onClick={loadSampleRadiograph}
              className="text-[11px] px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800"
            >
              Load Sample Radiograph
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Integrity Mandate:</strong> The current EfficientNet-B0 classifier operates strictly on RGB dermoscopic images. Radiographic images are stored as clinical documentation only and will not be classified by the skin lesion model.
            </span>
          </div>

          <div className="max-w-xl mx-auto">
            {radiographicImage ? (
              <MedicalImageViewer
                imageUrl={radiographicImage.url}
                filename={radiographicImage.filename}
                filesize={radiographicImage.sizeBytes}
                width={radiographicImage.width}
                height={radiographicImage.height}
                title="Radiographic Scan"
                sourceLabel="RADIOGRAPHIC"
                showClearButton={true}
                onClear={() => setRadiographicImage(null)}
              />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 text-center space-y-3">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">No Radiographic Image Attached (Optional)</p>
                <input
                  ref={radFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleRadUpload}
                  className="hidden"
                />
                <button
                  onClick={() => radFileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach Radiograph</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              <span>Proceed to AI Screening</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ANALYZE RGB IMAGE */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Step 4: Execute AI Screening Inference</h2>
            <p className="text-xs text-slate-500">
              Submit the RGB dermoscopic capture to the local FastAPI PyTorch service for two-stage EfficientNet-B0 evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <MedicalImageViewer
                imageUrl={previewUrl}
                filename={currentFile?.name || 'Selected lesion capture'}
                title="Lesion for Analysis"
                sourceLabel="RGB INPUT"
              />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-800 block">Inference Execution Plan:</span>
                <ul className="list-disc pl-4 text-slate-600 space-y-1">
                  <li>Resize to 224 × 224 pixels</li>
                  <li>ImageNet mean/std normalization</li>
                  <li>Stage 1: Binary screening (Non-target vs Suspicious)</li>
                  <li>Stage 2: Multiclass subtype analysis (BCC / SCC / Melanoma) if flagged suspicious</li>
                </ul>
              </div>

              <button
                onClick={handleRunInference}
                disabled={analysisState.stage === 'UPLOADING' || analysisState.stage === 'PROCESSING'}
                className="w-full py-3 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                {analysisState.stage === 'PROCESSING' || analysisState.stage === 'UPLOADING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing PyTorch Inference...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run Screening Inference Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-start pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DISPLAY RESULT */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Step 5: Screening Results & Probability Distribution</h2>
              <p className="text-xs text-slate-500">
                Review model classification and confidence metrics.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Inference Complete
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <MedicalImageViewer
                imageUrl={previewUrl}
                filename={currentFile?.name}
                title="Evaluated Lesion"
                sourceLabel="ORIGINAL CAPTURE"
              />
            </div>
            <div className="lg:col-span-6">
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

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              <span>Proceed to Clinical Review</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CLINICAL REVIEW */}
      {currentStep === 6 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Step 6: Clinical Review Placeholder</h2>
            <p className="text-xs text-slate-500">
              Record examining clinician notes and tentative sign-off recommendation.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Compliance & Regulatory Notice:</span> This clinical sign-off interface is an interactive decision-support placeholder. As this is a research/demonstration prototype, sign-off status represents prototype simulation and does not constitute a legal or clinical diagnostic record.
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Clinical Recommendation Status:
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              >
                <option value="Pending">Pending Review</option>
                <option value="Reviewed">Reviewed & Noted</option>
                <option value="Requires further evaluation">Requires Biopsy / Specialist Referral</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Clinician Notes & Observations (Optional):
              </label>
              <textarea
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter clinical observations, anatomical context, or follow-up recommendations..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleFinalizeCase}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save & Finalize Examination Record</span>
            </button>
          </div>

          <div className="flex justify-start pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Results</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
