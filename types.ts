
export type ExtractionMode = 'transcript' | 'bant' | 'followup' | 'chat';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

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
