/**
 * BioPatch AI API Types
 * Represents the exact contracts exposed by the FastAPI backend.
 */

export interface RootResponse {
  project: string;
  status: string;
  description: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | string;
  model1: 'loaded' | string;
  model2: 'loaded' | string;
}

export type ScreeningResultType = 'non_target' | 'suspicious';
export type CancerClassType = 'BCC' | 'SCC' | 'MEL';

export interface CancerProbabilities {
  BCC: number;
  SCC: number;
  Melanoma: number;
}

export interface InferenceResult {
  screening_result: ScreeningResultType;
  screening_label: string;
  screening_probability: number;
  cancer_type: CancerClassType | null;
  cancer_probabilities: CancerProbabilities | null;
  message: string;
}

export interface AnalyzeResponse {
  filename: string;
  result: InferenceResult;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  technicalDetails?: string;
}
