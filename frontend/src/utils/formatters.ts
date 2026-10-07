/**
 * Utility formatters for clinical UI
 */

export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  // Model probabilities are in range 0.0 to 1.0
  const normalized = value > 1.0 ? value : value * 100;
  return `${normalized.toFixed(decimals)}%`;
}

export function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function getFullCancerName(code: string | null | undefined): string {
  if (!code) return 'Not Classified';
  switch (code.toUpperCase()) {
    case 'MEL':
      return 'Melanoma (MEL)';
    case 'BCC':
      return 'Basal Cell Carcinoma (BCC)';
    case 'SCC':
      return 'Squamous Cell Carcinoma (SCC)';
    default:
      return code;
  }
}

export function generateCaseId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BP-CASE-${timestamp}-${random}`;
}

export function generatePatientId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PT-${num}`;
}
