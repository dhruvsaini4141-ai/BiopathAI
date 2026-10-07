import { HealthResponse, RootResponse, AnalyzeResponse } from '../types/api';

/**
 * Base URL configured via Vite environment variable VITE_API_BASE_URL.
 * Defaults to http://127.0.0.1:8000 if not specified.
 */
export const API_BASE_URL: string = 
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000';

export class ApiServiceError extends Error {
  statusCode?: number;
  technicalDetails?: string;

  constructor(message: string, statusCode?: number, technicalDetails?: string) {
    super(message);
    this.name = 'ApiServiceError';
    this.statusCode = statusCode;
    this.technicalDetails = technicalDetails;
  }
}

/**
 * Checks backend connectivity and model load status.
 * Target: GET /health
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new ApiServiceError(
        `Backend health check failed with HTTP ${response.status}`,
        response.status,
        errorText
      );
    }

    const data: HealthResponse = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiServiceError(
        'Backend connection timed out. Please verify that the FastAPI server is running.',
        408,
        'Request aborted after 6000ms timeout'
      );
    }
    if (error instanceof ApiServiceError) {
      throw error;
    }
    // Network or CORS failure
    throw new ApiServiceError(
      `Unable to reach backend at ${API_BASE_URL}. Ensure uvicorn is running and CORS is configured.`,
      0,
      error?.message || 'Network error'
    );
  }
}

/**
 * Retrieves root project metadata.
 * Target: GET /
 */
export async function getRootInfo(): Promise<RootResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new ApiServiceError(`Root check failed with status ${response.status}`, response.status);
    }
    return await response.json();
  } catch (error: any) {
    throw new ApiServiceError(
      `Failed to query root endpoint: ${error.message}`,
      error.statusCode || 0,
      error.stack
    );
  }
}

/**
 * Uploads an RGB skin-lesion image for dual-stage CNN analysis.
 * Target: POST /analyze
 * Payload: multipart/form-data with field name "file"
 */
export async function analyzeImage(
  file: File | Blob,
  filename: string = 'capture.jpg'
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  // Ensure the field name is strictly "file" as expected by backend/main.py:
  // file: UploadFile = File(...)
  formData.append('file', file, filename);

  try {
    const controller = new AbortController();
    // Allow up to 30s for PyTorch inference on CPU
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let detail = `Server responded with HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.detail) {
          detail = errorJson.detail;
        }
      } catch {
        const rawText = await response.text().catch(() => '');
        if (rawText) detail = rawText;
      }

      if (response.status === 400) {
        throw new ApiServiceError(
          `Invalid image upload: ${detail}`,
          400,
          detail
        );
      } else if (response.status === 500) {
        throw new ApiServiceError(
          `AI Inference server error: ${detail}`,
          500,
          detail
        );
      } else {
        throw new ApiServiceError(
          `Analysis request failed (${response.status}): ${detail}`,
          response.status,
          detail
        );
      }
    }

    const data: AnalyzeResponse = await response.json();

    // Verify response structure
    if (!data || !data.result) {
      throw new ApiServiceError(
        'Malformed analysis response received from backend.',
        502,
        JSON.stringify(data)
      );
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiServiceError(
        'Inference timed out after 30 seconds. The server may be overloaded.',
        408,
        'PyTorch execution timeout'
      );
    }
    if (error instanceof ApiServiceError) {
      throw error;
    }
    throw new ApiServiceError(
      `Network error during analysis: ${error.message || 'Connection failed'}. Ensure backend at ${API_BASE_URL} is reachable.`,
      0,
      error?.stack
    );
  }
}
