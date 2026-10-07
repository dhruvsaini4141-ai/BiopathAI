import React from 'react';
import { User, Calendar, Tag, MapPin, Shield, Edit3 } from 'lucide-react';
import { CaseMetadata } from '../../types/case';
import { formatDateTime } from '../../utils/formatters';

interface CaseInfoSectionProps {
  metadata: CaseMetadata;
  onChangeMetadata?: (updated: Partial<CaseMetadata>) => void;
  isEditable?: boolean;
}

export const CaseInfoSection: React.FC<CaseInfoSectionProps> = ({
  metadata,
  onChangeMetadata,
  isEditable = true,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            Case & Patient Metadata
          </h2>
          <p className="text-xs text-slate-500">
            De-identified clinical case parameters associated with this examination session.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
          {metadata.caseId}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Case ID */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Case ID
          </label>
          <div className="text-xs font-mono font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 truncate">
            {metadata.caseId}
          </div>
        </div>

        {/* Patient ID */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Patient ID (De-identified)
          </label>
          {isEditable && onChangeMetadata ? (
            <input
              type="text"
              value={metadata.patientId}
              onChange={(e) => onChangeMetadata({ patientId: e.target.value })}
              className="text-xs font-mono text-slate-800 bg-white p-1.5 rounded border border-slate-300 w-full focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          ) : (
            <div className="text-xs font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
              {metadata.patientId}
            </div>
          )}
        </div>

        {/* Age */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Patient Age
          </label>
          {isEditable && onChangeMetadata ? (
            <input
              type="text"
              placeholder="e.g. 54"
              value={metadata.age || ''}
              onChange={(e) => onChangeMetadata({ age: e.target.value })}
              className="text-xs text-slate-800 bg-white p-1.5 rounded border border-slate-300 w-full focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          ) : (
            <div className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
              {metadata.age ? `${metadata.age} yrs` : 'Unspecified'}
            </div>
          )}
        </div>

        {/* Biological Sex */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Biological Sex
          </label>
          {isEditable && onChangeMetadata ? (
            <select
              value={metadata.sex || 'Unspecified'}
              onChange={(e) => onChangeMetadata({ sex: e.target.value as any })}
              className="text-xs text-slate-800 bg-white p-1.5 rounded border border-slate-300 w-full focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="Unspecified">Unspecified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <div className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
              {metadata.sex || 'Unspecified'}
            </div>
          )}
        </div>

        {/* Anatomical Site */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Anatomical Site
          </label>
          {isEditable && onChangeMetadata ? (
            <input
              type="text"
              placeholder="e.g. Upper Back, Forearm"
              value={metadata.anatomicalSite || ''}
              onChange={(e) => onChangeMetadata({ anatomicalSite: e.target.value })}
              className="text-xs text-slate-800 bg-white p-1.5 rounded border border-slate-300 w-full focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
            />
          ) : (
            <div className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 truncate">
              {metadata.anatomicalSite || 'Not recorded'}
            </div>
          )}
        </div>

        {/* Operator ID */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operator ID
          </label>
          <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 truncate">
            {metadata.operatorId || 'OP-DEFAULT'}
          </div>
        </div>
      </div>
    </div>
  );
};
