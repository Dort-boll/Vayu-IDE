export enum AIModel {
  GPT_4O = 'gpt-4o',
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
  O1_MINI = 'o1-mini',
}

export interface ModelMetadata {
  id: AIModel;
  name: string;
  status: 'optimal' | 'stable';
  capability: 'Synthesis' | 'Logic' | 'Reasoning';
  color: string;
}

export const MODEL_LIST: ModelMetadata[] = [
  { id: AIModel.GPT_4O, name: 'GPT-4o', status: 'optimal', capability: 'Synthesis', color: '#10b981' },
  { id: AIModel.CLAUDE_3_5_SONNET, name: 'Claude 3.5 Sonnet', status: 'optimal', capability: 'Logic', color: '#8b5cf6' },
  { id: AIModel.O1_MINI, name: 'O1 Mini', status: 'stable', capability: 'Reasoning', color: '#3b82f6' },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
  isStreaming?: boolean;
  status?: 'analyzing' | 'coding' | 'diagnosing' | 'idle';
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