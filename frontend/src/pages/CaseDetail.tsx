import React, { useState } from 'react';
import { FileText, ArrowLeft, Calendar, User, ShieldCheck, AlertTriangle, Layers, Edit3, CheckCircle2 } from 'lucide-react';
import { Examination, ReviewStatus } from '../types/case';
import { MedicalImageViewer } from '../components/image-viewer/MedicalImageViewer';
import { ScreeningResultCard } from '../components/result/ScreeningResultCard';
import { formatDateTime, formatPercentage, getFullCancerName } from '../utils/formatters';
import { historyService } from '../services/historyService';

interface CaseDetailProps {
  examination: Examination | null;
  onBack: () => void;
  onSelectCase?: (exam: Examination) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ examination, onBack, onSelectCase }) => {
  const [currentExam, setCurrentExam] = useState<Examination | null>(examination);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    examination?.clinicalReview.status || 'Pending'
  );
  const [reviewerNotes, setReviewNotes] = useState<string>(
    examination?.clinicalReview.reviewerNotes || ''
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // If no case is selected, pick the latest or show picker
  const allExaminations = historyService.getLocalExaminations();

  const activeCase = currentExam || allExaminations[0] || null;

  const handleSaveReview = () => {
    if (!activeCase) return;
    const updated: Examination = {
      ...activeCase,
      clinicalReview: {
        ...activeCase.clinicalReview,
        status: reviewStatus,
        reviewerNotes,
        reviewedAt: new Date().toISOString(),
      },
    };
    historyService.saveExamination(updated);
    setCurrentExam(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!activeCase) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-base font-semibold text-slate-800">No Case Selected</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select an examination from the History list or perform a scan from the Dashboard.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  const isSuspicious = activeCase.rgbAnalysis?.screening_result === 'suspicious';

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Detail Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {activeCase.id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                  isSuspicious
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isSuspicious ? 'Suspicious' : 'Non-target lesion'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Examination Timestamp: {formatDateTime(activeCase.createdAt)}
            </p>
          </div>
        </div>

        {/* Other Cases Quick Switcher */}
        {allExaminations.length > 1 && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Switch Case:</span>
            <select
              value={activeCase.id}
              onChange={(e) => {
                const found = allExaminations.find(ex => ex.id === e.target.value);
                if (found) {
                  setCurrentExam(found);
                  setReviewStatus(found.clinicalReview.status);
                  setReviewNotes(found.clinicalReview.reviewerNotes || '');
                }
              }}
              className="p-1.5 rounded border border-slate-300 bg-white text-xs font-mono"
            >
              {allExaminations.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.id} ({ex.rgbAnalysis?.screening_result || 'Pending'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Case Metadata Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Patient ID</span>
          <span className="font-mono font-medium text-slate-800">{activeCase.patientId}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Age / Sex</span>
          <span className="text-slate-800 font-medium">
            {activeCase.metadata.age ? `${activeCase.metadata.age} yrs` : 'Unrecorded'} • {activeCase.metadata.sex || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Anatomical Site</span>
          <span className="text-slate-800 font-medium">{activeCase.metadata.anatomicalSite || 'Not specified'}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Operator ID</span>
          <span className="font-mono text-slate-700">{activeCase.metadata.operatorId || 'OP-DEFAULT'}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Review Status</span>
          <span className="font-semibold text-sky-700">{activeCase.clinicalReview.status}</span>
        </div>
      </div>

      {/* Side-by-Side Multimodal Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modality 1: RGB Capture */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Modality 1: RGB Dermoscopy
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-mono">
              AI Evaluated
            </span>
          </div>
          <MedicalImageViewer
            imageUrl={activeCase.rgbImage?.url || null}
            filename={activeCase.rgbImage?.filename || 'RGB_Capture.jpg'}
            filesize={activeCase.rgbImage?.sizeBytes}
            width={activeCase.rgbImage?.width}
            height={activeCase.rgbImage?.height}
            title="Dermoscopic Lesion"
            sourceLabel="ORIGINAL CAPTURE"
          />
        </div>

        {/* Modality 2: Radiographic Imaging */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Modality 2: Radiographic Imaging
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              {activeCase.radiographicImage ? 'Attached' : 'Not Attached'}
            </span>
          </div>
          {activeCase.radiographicImage ? (
            <MedicalImageViewer
              imageUrl={activeCase.radiographicImage.url}
              filename={activeCase.radiographicImage.filename}
              filesize={activeCase.radiographicImage.sizeBytes}
              width={activeCase.radiographicImage.width}
              height={activeCase.radiographicImage.height}
              title="Radiographic Scan"
              sourceLabel="RADIOGRAPHIC"
            />
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center min-h-[300px]">
              <Layers className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Radiographic Image Associated</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                This case was evaluated solely with RGB dermoscopy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Screening Result Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ScreeningResultCard
            stage="SUCCESS"
            result={activeCase.rgbAnalysis}
            error={null}
            progressPercent={100}
            statusMessage="Historical analysis record"
          />
        </div>

        {/* Clinical Review Decision Section */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                Clinical Decision Support Review
              </h3>
              <p className="text-xs text-slate-500">
                Medical review status and physician consultation notes.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Evaluation Decision:
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Reviewed">Reviewed & Noted</option>
                  <option value="Requires further evaluation">Requires Biopsy / Further Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Physician / Reviewer Notes:
                </label>
                <textarea
                  rows={4}
                  value={reviewerNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Clinical notes, dermoscopic features observed, biopsy recommendation..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              {activeCase.clinicalReview.reviewedAt && (
                <div className="text-[11px] text-slate-400">
                  Last updated: {formatDateTime(activeCase.clinicalReview.reviewedAt)}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs text-emerald-600 flex items-center space-x-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Notes Saved</span>
              </span>
            ) : <span />}

            <button
              onClick={handleSaveReview}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
            >
              Update Clinical Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
