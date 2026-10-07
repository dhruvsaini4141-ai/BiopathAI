import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, ExternalLink, Database, AlertCircle, Trash2, ArrowUpDown } from 'lucide-react';
import { Examination } from '../types/case';
import { historyService } from '../services/historyService';
import { formatDateTime, formatPercentage, getFullCancerName } from '../utils/formatters';

interface HistoryProps {
  onSelectCase: (exam: Examination) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const [examinations, setExaminations] = useState<Examination[]>(() => {
    return historyService.getLocalExaminations();
  });

  const filteredExams = useMemo(() => {
    return examinations
      .filter((exam) => {
        const matchesSearch =
          exam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exam.metadata.anatomicalSite || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterResult === 'suspicious') {
          return exam.rgbAnalysis?.screening_result === 'suspicious';
        }
        if (filterResult === 'non_target') {
          return exam.rgbAnalysis?.screening_result === 'non_target';
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [examinations, searchTerm, filterResult, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const paginatedExams = filteredExams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearHistory = () => {
    if (window.confirm('Clear all local session records?')) {
      historyService.clearLocalHistory();
      setExaminations([]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Historical Cases & Examination Archive
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse and review previously conducted dermoscopic screenings and attached modalities.
          </p>
        </div>

        {examinations.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 self-start sm:self-auto transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        )}
      </div>

      {/* Backend Archival Status Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-sky-900">
        <Database className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Historical case database connection coming soon
          </p>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            The system currently displays examinations performed within this session. Integration with the persistent SQLite / PostgreSQL 10GB ISIC archival database is architected and pending backend endpoint deployment.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Case ID, Patient ID, site..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterResult}
              onChange={(e) => {
                setFilterResult(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
            >
              <option value="all">All Results</option>
              <option value="suspicious">Suspicious</option>
              <option value="non_target">Non-target lesion</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Examinations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {paginatedExams.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No examinations found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || filterResult !== 'all'
                ? 'No cases match your active filters.'
                : 'Conduct an analysis on the Dashboard or Live Scan page to record an examination.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Screening Result</th>
                  <th className="py-3 px-4">Predicted Class</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExams.map((exam) => {
                  const isSuspicious = exam.rgbAnalysis?.screening_result === 'suspicious';
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {exam.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {exam.patientId}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {exam.metadata.anatomicalSite || 'Unrecorded'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(exam.createdAt)}
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {exam.rgbAnalysis?.cancer_type || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {exam.rgbAnalysis
                          ? formatPercentage(
                              isSuspicious
                                ? exam.rgbAnalysis.screening_probability
                                : 1 - exam.rgbAnalysis.screening_probability
                            )
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {exam.clinicalReview.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectCase(exam)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium transition-colors"
                        >
                          <span>Open Case</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredExams.length} records)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
