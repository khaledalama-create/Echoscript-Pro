
export type ExtractionMode = 'transcript' | 'bant' | 'followup';

export interface TranscriptionResult {
  text: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}
