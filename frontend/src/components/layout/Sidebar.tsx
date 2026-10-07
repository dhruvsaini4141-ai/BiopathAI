import React from 'react';
import { LayoutDashboard, Radio, History, FileText, Cpu, Settings, ShieldCheck } from 'lucide-react';

export type NavTab = 'dashboard' | 'live-scan' | 'history' | 'cases' | 'device' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  caseCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, caseCount = 0 }) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & quick analysis',
    },
    {
      id: 'live-scan' as NavTab,
      label: 'Live Scan',
      icon: Radio,
      description: 'Guided multimodal screening',
      badge: 'Judges Flow',
    },
    {
      id: 'history' as NavTab,
      label: 'History',
      icon: History,
      description: 'Examination database',
      count: caseCount,
    },
    {
      id: 'cases' as NavTab,
      label: 'Case Detail',
      icon: FileText,
      description: 'Patient case review',
    },
    {
      id: 'device' as NavTab,
      label: 'Device & Hardware',
      icon: Cpu,
      description: 'ESP32 & camera status',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      description: 'Endpoints & diagnostics',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Prototype Footer Section */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-2 text-slate-600 mb-1">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-slate-800">BioPatch AI System</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          AI-assisted screening • Prototype build for clinical evaluation demo.
        </p>
      </div>
    </aside>
  );
};
