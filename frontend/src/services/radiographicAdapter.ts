import { ImageAttachment } from '../types/case';

/**
 * RadiographicImageAdapter
 * 
 * Modular adapter for the second imaging modality (Radiographic imaging).
 * 
 * ARCHITECTURAL MANDATES:
 * 1. Modality separation: Under NO circumstances should the RGB EfficientNet-B0
 *    classifier be applied to radiographic images.
 * 2. Hardware abstraction: Encapsulates future DICOM / Flat-Panel Detector / USB
 *    radiographic inputs without fabricating imaginary low-level drivers.
 */

export interface RadiographicAdapterStatus {
  source: 'Local Upload' | 'Network Detector' | 'DICOM PACS Bridge';
  isLoaded: boolean;
  resolution?: string;
  notes: string;
}

class RadiographicAdapter {
  private currentAttachment: ImageAttachment | null = null;

  public getStatus(): RadiographicAdapterStatus {
    return {
      source: 'Local Upload',
      isLoaded: this.currentAttachment !== null,
      notes: this.currentAttachment 
        ? 'Radiographic modality loaded and associated with case. No CNN classifier is applied to this modality.'
        : 'Second imaging modality ready for patient case association.',
    };
  }

  public setAttachment(attachment: ImageAttachment | null): void {
    this.currentAttachment = attachment;
  }

  public getAttachment(): ImageAttachment | null {
    return this.currentAttachment;
  }

  public clear(): void {
    this.currentAttachment = null;
  }
}

export const radiographicAdapter = new RadiographicAdapter();
