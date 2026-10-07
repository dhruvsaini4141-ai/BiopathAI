import { useState, useCallback } from 'react';
import { analyzeImage, ApiServiceError } from '../services/api';
import { AnalysisState, ImageMetadata } from '../types/analysis';
import { InferenceResult } from '../types/api';

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    stage: 'IDLE',
    progressPercent: 0,
    currentMessage: 'Ready for image acquisition',
    result: null,
    error: null,
    technicalError: null,
  });

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);

  const reset = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setCurrentFile(null);
    setPreviewUrl(null);
    setImageMetadata(null);
    setState({
      stage: 'IDLE',
      progressPercent: 0,
      currentMessage: 'Ready for image acquisition',
      result: null,
      error: null,
      technicalError: null,
    });
  }, [previewUrl]);

  const setImage = useCallback((file: File, source: 'camera' | 'upload' | 'sample' = 'upload') => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setCurrentFile(file);
    setPreviewUrl(objectUrl);

    // Read image dimensions
    const img = new Image();
    img.onload = () => {
      setImageMetadata({
        filename: file.name,
        sizeBytes: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type || 'image/jpeg',
        source,
        timestamp: new Date().toISOString(),
      });
    };
    img.src = objectUrl;

    setState({
      stage: 'IDLE',
      progressPercent: 0,
      currentMessage: `Image loaded: ${file.name}. Ready for screening analysis.`,
      result: null,
      error: null,
      technicalError: null,
    });
  }, [previewUrl]);

  const executeAnalysis = useCallback(async (fileOverride?: File) => {
    const fileToAnalyze = fileOverride || currentFile;
    if (!fileToAnalyze) {
      setState(prev => ({
        ...prev,
        stage: 'ERROR',
        error: 'No image selected for analysis. Please upload or capture an image first.',
      }));
      return;
    }

    try {
      // 1. Transition to UPLOADING
      setState(prev => ({
        ...prev,
        stage: 'UPLOADING',
        progressPercent: 25,
        currentMessage: 'Uploading image to BioPatch AI server...',
        error: null,
        technicalError: null,
      }));

      // Simulate a brief transition so user visually observes the state machine
      await new Promise(r => setTimeout(r, 250));

      // 2. Transition to PROCESSING
      setState(prev => ({
        ...prev,
        stage: 'PROCESSING',
        progressPercent: 65,
        currentMessage: 'Running dual-stage EfficientNet-B0 screening inference...',
      }));

      // 3. Call backend API
      const response = await analyzeImage(fileToAnalyze, fileToAnalyze.name);

      // 4. Success state with real inference result
      setState({
        stage: 'SUCCESS',
        progressPercent: 100,
        currentMessage: 'Analysis complete. Results ready for clinical review.',
        result: response.result,
        error: null,
        technicalError: null,
      });

      return response.result;
    } catch (err: any) {
      const isApiError = err instanceof ApiServiceError;
      const status = isApiError ? err.statusCode : undefined;
      const techDetails = isApiError ? err.technicalDetails : err.stack;

      let userMsg = err.message || 'An error occurred during image screening.';
      if (status === 0) {
        userMsg = 'Cannot connect to backend server. Verify that FastAPI is running on port 8000.';
      } else if (status === 400) {
        userMsg = `Invalid input: ${err.message}`;
      } else if (status === 500) {
        userMsg = 'AI inference server encountered an internal error processing the image.';
      }

      setState({
        stage: 'ERROR',
        progressPercent: 0,
        currentMessage: 'Analysis failed.',
        result: null,
        error: userMsg,
        technicalError: techDetails || (status ? `HTTP Status ${status}` : null),
      });

      return null;
    }
  }, [currentFile]);

  return {
    state,
    currentFile,
    previewUrl,
    imageMetadata,
    setImage,
    reset,
    executeAnalysis,
  };
}
