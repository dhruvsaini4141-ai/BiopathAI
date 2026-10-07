import React from 'react';
import { CancerProbabilities, CancerClassType } from '../../types/api';
import { formatPercentage, getFullCancerName } from '../../utils/formatters';

interface ProbabilityDistributionProps {
  probabilities: CancerProbabilities;
  predictedClass: CancerClassType | null;
}

export const ProbabilityDistribution: React.FC<ProbabilityDistributionProps> = ({
  probabilities,
  predictedClass,
}) => {
  const items = [
    {
      code: 'BCC' as CancerClassType,
      label: 'Basal Cell Carcinoma (BCC)',
      prob: probabilities.BCC,
    },
    {
      code: 'SCC' as CancerClassType,
      label: 'Squamous Cell Carcinoma (SCC)',
      prob: probabilities.SCC,
    },
    {
      code: 'MEL' as CancerClassType,
      label: 'Melanoma (MEL)',
      prob: probabilities.Melanoma,
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Histopathological Subtype</span>
        <span>Model Probability</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isTopPredicted =
            predictedClass === item.code ||
            (predictedClass === 'MEL' && item.code === 'MEL');
          const percent = item.prob > 1.0 ? item.prob : item.prob * 100;

          return (
            <div key={item.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isTopPredicted ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                  {item.label}
                  {isTopPredicted && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                      Top Prediction
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatPercentage(item.prob)}
                </span>
              </div>

              {/* Horizontal Probability Bar */}
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTopPredicted
                      ? 'bg-sky-600'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(percent, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed italic pt-1">
        Probabilities represent normalized softmax outputs from the Stage 2 EfficientNet-B0 classifier across the three target classes.
      </p>
    </div>
  );
};
