
export type ExtractionMode = 'transcript' | 'bant' | 'contact';

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
