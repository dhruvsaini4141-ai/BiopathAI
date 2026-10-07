import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../services/api';
import { BackendStatus, ModelStatus } from '../types/device';

export interface BackendHealthState {
  backendStatus: BackendStatus;
  modelsStatus: ModelStatus;
  model1Loaded: boolean;
  model2Loaded: boolean;
  apiBaseUrl: string;
  errorMessage: string | null;
  lastChecked: Date | null;
  isChecking: boolean;
  checkHealth: () => Promise<void>;
}

export function useBackendHealth(pollIntervalMs: number = 10000): BackendHealthState {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [modelsStatus, setModelsStatus] = useState<ModelStatus>('unverified');
  const [model1Loaded, setModel1Loaded] = useState<boolean>(false);
  const [model2Loaded, setModel2Loaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const data = await checkBackendHealth();
      const isHealthy = data.status === 'healthy';
      const m1 = data.model1 === 'loaded';
      const m2 = data.model2 === 'loaded';

      setBackendStatus(isHealthy ? 'online' : 'offline');
      setModel1Loaded(m1);
      setModel2Loaded(m2);
      setModelsStatus(m1 && m2 ? 'loaded' : 'error');
      setErrorMessage(null);
    } catch (err: any) {
      setBackendStatus('offline');
      setModelsStatus('error');
      setModel1Loaded(false);
      setModel2Loaded(false);
      setErrorMessage(err.message || 'Unable to contact backend');
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, pollIntervalMs]);

  return {
    backendStatus,
    modelsStatus,
    model1Loaded,
    model2Loaded,
    apiBaseUrl: API_BASE_URL,
    errorMessage,
    lastChecked,
    isChecking,
    checkHealth,
  };
}
