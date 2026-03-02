export enum AIModel {
  GPT_4O = 'gpt-4o',
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
}

export interface ModelMetadata {
  id: AIModel;
  name: string;
  status: 'optimal' | 'stable' | 'preview';
  capability: 'Speed' | 'Reasoning' | 'Advanced';
  color: string;
}

export const MODEL_LIST: ModelMetadata[] = [
  { id: AIModel.GPT_4O, name: 'GPT-4o', status: 'optimal', capability: 'Advanced', color: '#10b981' },
  { id: AIModel.CLAUDE_3_5_SONNET, name: 'Claude 3.5 Sonnet', status: 'stable', capability: 'Reasoning', color: '#f97316' },
  { id: AIModel.GEMINI_1_5_PRO, name: 'Gemini 1.5 Pro', status: 'preview', capability: 'Speed', color: '#3b82f6' },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
  isStreaming?: boolean;
  isThinking?: boolean;
  thought?: string;
  error?: string;
}

export interface FileEntry {
  path: string;
  content: string;
  language: string;
}

export interface DiagnosticReport {
  timestamp: number;
  error?: string;
  logs: string[];
}

declare global {
  interface Window {
    puter: any;
    JSZip: any;
  }
}
