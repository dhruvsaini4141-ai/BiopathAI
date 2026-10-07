import { InferenceResult } from './api';

export type AnalysisStage = 
  | 'IDLE'
  | 'CAPTURING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR';

export interface ImageMetadata {
  filename: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  format?: string;
  source: 'camera' | 'upload' | 'sample';
  timestamp: string;
}

export interface AnalysisState {
  stage: AnalysisStage;
  progressPercent: number;
  currentMessage: string;
  result: InferenceResult | null;
  error: string | null;
  technicalError?: string | null;
}
