import { InferenceResult } from './api';

export type BiologicalSex = 'Male' | 'Female' | 'Other' | 'Unspecified';
export type ReviewStatus = 'Pending' | 'Reviewed' | 'Requires further evaluation';

export interface CaseMetadata {
  caseId: string;
  patientId: string;
  age?: number | string;
  sex?: BiologicalSex;
  anatomicalSite?: string;
  timestamp: string;
  operatorId?: string;
}

export interface ImageAttachment {
  url: string;
  filename: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  source: 'camera' | 'upload' | 'sample';
}

export interface ClinicalReview {
  status: ReviewStatus;
  reviewerNotes?: string;
  reviewedAt?: string;
  reviewerId?: string;
}

export interface Examination {
  id: string;
  patientId: string;
  createdAt: string;
  metadata: CaseMetadata;
  rgbImage: ImageAttachment | null;
  radiographicImage: ImageAttachment | null;
  rgbAnalysis: InferenceResult | null;
  radiographicAnalysis?: {
    status: 'Not analyzed — modality separation enforced';
    note: string;
  };
  clinicalReview: ClinicalReview;
}
