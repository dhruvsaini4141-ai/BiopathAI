import React from 'react';
import { Database, Search, Sparkles, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Examination } from '../../types/case';
import { formatDateTime, formatPercentage } from '../../utils/formatters';

interface HistoricalCasesSectionProps {
  examinations: Examination[];
  onSelectCase: (exam: Examination) => void;
}

export const HistoricalCasesSection: React.FC<HistoricalCasesSectionProps> = ({
  examinations,
  onSelectCase,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Historical Cases (2 columns on wide screens) */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              Historical Examinations & Archive
            </h2>
            <p className="text-xs text-slate-500">
              Session examination records and repository case archive.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {examinations.length} recorded in session
          </span>
        </div>

        {examinations.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50/50 space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              Historical case database connection coming soon
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Examinations conducted during this session will automatically appear in this table. Full connection to the persistent 10GB ISIC archival database is under development.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Case ID</th>
                  <th className="pb-2">Date / Time</th>
                  <th className="pb-2">Screening</th>
                  <th className="pb-2">Predicted Class</th>
                  <th className="pb-2">Confidence</th>
                  <th className="pb-2">Review Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examinations.map((exam) => {
                  const isSuspicious = exam.rgbAnalysis?.screening_result === 'suspicious';
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-mono font-medium text-slate-800">
                        {exam.id}
                      </td>
                      <td className="py-2.5 text-slate-500 whitespace-nowrap">
                        {formatDateTime(exam.createdAt)}
                      </td>
                      <td className="py-2.5">
                        {exam.rgbAnalysis ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isSuspicious
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isSuspicious ? 'Suspicious' : 'Non-target'}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 font-medium text-slate-700">
                        {exam.rgbAnalysis?.cancer_type || 'N/A'}
                      </td>
                      <td className="py-2.5 font-mono text-slate-600">
                        {exam.rgbAnalysis
                          ? formatPercentage(
                              isSuspicious
                                ? exam.rgbAnalysis.screening_probability
                                : 1 - exam.rgbAnalysis.screening_probability
                            )
                          : '—'}
                      </td>
                      <td className="py-2.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {exam.clinicalReview.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onSelectCase(exam)}
                          className="inline-flex items-center text-xs text-sky-600 hover:text-sky-800 font-medium"
                        >
                          <span>View Case</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Similarity Search Section (1 column) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            Similar Historical Cases
          </h2>
          <p className="text-xs text-slate-500">
            Vector embedding similarity comparison.
          </p>
        </div>

        <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-5 h-5 stroke-[1.7]" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Similarity search not yet connected
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            As mandated by system integrity rules, CNN classification output is not fabricated as vector similarity. A dedicated feature embedding model (e.g. FAISS / pgvector index across historical biopsy-confirmed records) is required for genuine similarity retrieval.
          </p>
        </div>

        <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100 text-[11px] text-sky-900 leading-normal">
          <span className="font-semibold block mb-0.5">Architectural Roadmap:</span>
          RGB Image &rarr; Dense Embedding Vector &rarr; Approximate Nearest Neighbor (ANN) &rarr; Top-5 Histopathologically Verified Matches.
        </div>
      </div>
    </div>
  );
};
