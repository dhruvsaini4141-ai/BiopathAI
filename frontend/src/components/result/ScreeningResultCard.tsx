import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Stethoscope, Clock, AlertCircle } from 'lucide-react';
import { InferenceResult } from '../../types/api';
import { AnalysisStage } from '../../types/analysis';
import { ProbabilityDistribution } from './ProbabilityDistribution';
import { formatPercentage, getFullCancerName } from '../../utils/formatters';

interface ScreeningResultCardProps {
  stage: AnalysisStage;
  result: InferenceResult | null;
  error: string | null;
  technicalError?: string | null;
  progressPercent: number;
  statusMessage: string;
}

export const ScreeningResultCard: React.FC<ScreeningResultCardProps> = ({
  stage,
  result,
  error,
  technicalError,
  progressPercent,
  statusMessage,
}) => {
  // If idle and no result yet
  if (stage === 'IDLE' && !result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-center items-center text-center min-h-[380px]">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
          <Stethoscope className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">AI Screening Pipeline Idle</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Acquire or upload an RGB dermoscopic image and click <strong className="text-slate-700">"Analyze Lesion"</strong> to execute dual-stage EfficientNet-B0 screening.
        </p>
        <div className="mt-4 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-mono">
          Stage 1: Non-Target vs Suspicious • Stage 2: Subtype Classification
        </div>
      </div>
    );
  }

  // During upload or processing
  if (stage === 'UPLOADING' || stage === 'PROCESSING') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs min-h-[380px] flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 relative">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          {stage === 'UPLOADING' ? 'Uploading Skin Lesion Capture...' : 'Running PyTorch AI Inference...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {statusMessage}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1.5">
            <span>Inference Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Applying 224×224 ImageNet normalization & CNN feature extraction
        </p>
      </div>
    );
  }

  // If Error occurred
  if (stage === 'ERROR' || error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs min-h-[380px] flex flex-col justify-center">
        <div className="flex items-start space-x-3 text-rose-700 mb-3">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold">Analysis Failed</h3>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>

        {technicalError && (
          <div className="mt-3 p-3 bg-rose-50/70 rounded-lg border border-rose-100 text-[11px] font-mono text-rose-800 break-all">
            <span className="font-semibold block mb-0.5">Diagnostics:</span>
            {technicalError}
          </div>
        )}

        <p className="text-[11px] text-slate-500 mt-4">
          Please check backend connectivity and retry with a standard dermoscopic or skin lesion image.
        </p>
      </div>
    );
  }

  // Success state with real inference result
  if (result) {
    const isSuspicious = result.screening_result === 'suspicious';
    const confidencePct = formatPercentage(
      isSuspicious ? result.screening_probability : (1 - result.screening_probability)
    );

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Result Header Badge */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isSuspicious
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {isSuspicious ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Stage 1 Screening Result
              </span>
              <h3 className="text-base font-bold">
                {isSuspicious ? 'Suspicious' : 'Non-target lesion'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Screening Confidence
            </span>
            <span className="text-base font-mono font-bold">
              {confidencePct}
            </span>
          </div>
        </div>

        {/* Result Body */}
        <div className="p-6 space-y-5">
          {/* Summary / Message */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            <p className="font-medium text-slate-800 mb-0.5">AI Inference Summary:</p>
            <p>{result.message}</p>
          </div>

          {/* Conditional Stage 2 Details */}
          {isSuspicious ? (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                    Stage 2 Predicted Classification
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {getFullCancerName(result.cancer_type)}
                  </span>
                </div>
                {result.cancer_type && (
                  <span className="px-2.5 py-1 rounded text-xs font-bold tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    {result.cancer_type}
                  </span>
                )}
              </div>

              {/* Subtype Probability Distribution Bars */}
              {result.cancer_probabilities && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                    Cancer Classification Distribution
                  </h4>
                  <ProbabilityDistribution
                    probabilities={result.cancer_probabilities}
                    predictedClass={result.cancer_type}
                  />
                </div>
              )}

              {/* Clinical Recommendation Badge */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Clinical Evaluation Recommended:</span>
                  <span className="ml-1 text-amber-800">
                    This lesion was flagged as suspicious by Stage 1 screening. A comprehensive dermatological examination and biopsy are advised for definitive diagnostic confirmation.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Non-Target Pathway: Stage 2 explicitly NOT performed */
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">
                  Stage 2 Classification: <span className="text-slate-500 font-normal">Not performed</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  As the image was classified as a non-target lesion by Stage 1 screening, secondary malignant subtype classification (BCC / SCC / Melanoma) was automatically bypassed in accordance with the two-stage screening protocol.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
