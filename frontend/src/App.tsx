import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './pages/Dashboard';
import { LiveScan } from './pages/LiveScan';
import { History } from './pages/History';
import { CaseDetail } from './pages/CaseDetail';
import { Settings } from './pages/Settings';
import { DeviceStatusPanel } from './components/device-status/DeviceStatusPanel';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useDeviceStatus } from './hooks/useDeviceStatus';
import { Examination } from './types/case';
import { historyService } from './services/historyService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCase, setSelectedCase] = useState<Examination | null>(null);

  const {
    backendStatus,
    modelsStatus,
    checkHealth,
    isChecking,
  } = useBackendHealth();

  const { deviceInfo } = useDeviceStatus();

  const handleSelectCase = (exam: Examination) => {
    setSelectedCase(exam);
    setCurrentTab('cases');
  };

  const handleCaseCreatedFromLiveScan = (exam: Examination) => {
    setSelectedCase(exam);
  };

  const totalCases = historyService.getLocalExaminations().length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* 1. Medical Top Navbar */}
      <Navbar
        backendStatus={backendStatus}
        modelsStatus={modelsStatus}
        cameraStatus={deviceInfo?.cameraStatus || 'waiting'}
        onRefreshHealth={checkHealth}
        isCheckingHealth={isChecking}
      />

      {/* 2. Main Dashboard Layout (Sidebar + Page Content) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            caseCount={totalCases}
          />
        </div>

        {/* Right Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Mobile Tab Navigation */}
          <div className="md:hidden flex items-center space-x-1 overflow-x-auto pb-3 mb-4 border-b border-slate-200 text-xs">
            {(['dashboard', 'live-scan', 'history', 'cases', 'device', 'settings'] as NavTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize ${
                  currentTab === tab
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Active View */}
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateToCase={handleSelectCase}
              onNavigateToTab={(tab) => setCurrentTab(tab as NavTab)}
            />
          )}

          {currentTab === 'live-scan' && (
            <LiveScan onCaseCompleted={handleCaseCreatedFromLiveScan} />
          )}

          {currentTab === 'history' && (
            <History onSelectCase={handleSelectCase} />
          )}

          {currentTab === 'cases' && (
            <CaseDetail
              examination={selectedCase}
              onBack={() => setCurrentTab('dashboard')}
              onSelectCase={setSelectedCase}
            />
          )}

          {currentTab === 'device' && (
            <DeviceStatusPanel />
          )}

          {currentTab === 'settings' && (
            <Settings />
          )}
        </main>
      </div>

      {/* 3. Medical Disclaimer Footer */}
      <Footer />
    </div>
  );
};

export default App;
