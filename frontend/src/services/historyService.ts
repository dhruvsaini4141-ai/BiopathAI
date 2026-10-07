import { Examination } from '../types/case';

const LOCAL_STORAGE_KEY = 'biopatch_ai_examinations';

class HistoryService {
  /**
   * Indicates whether a real backend database API is connected.
   * As specified in requirements, the backend does not yet have a persistent DB endpoint.
   */
  public hasBackendDatabase(): boolean {
    return false;
  }

  public getBackendDatabaseStatusMessage(): string {
    return 'Historical case database connection coming soon';
  }

  public getSimilaritySearchStatusMessage(): string {
    return 'Similarity search not yet connected';
  }

  /**
   * Retrieves examinations recorded in the current session/client storage.
   */
  public getLocalExaminations(): Examination[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Persists an examination to client storage.
   */
  public saveExamination(examination: Examination): void {
    try {
      const list = this.getLocalExaminations();
      // Prepend so latest appears first
      const updated = [examination, ...list.filter(e => e.id !== examination.id)];
      // Keep up to 20 local sessions in memory to prevent browser storage bloat
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 20)));
    } catch (e) {
      console.warn('Unable to persist examination to localStorage', e);
    }
  }

  public getExaminationById(id: string): Examination | null {
    const list = this.getLocalExaminations();
    return list.find(e => e.id === id) || null;
  }

  public clearLocalHistory(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export const historyService = new HistoryService();
