
export enum AIModel {
  CLAUDE_3_5 = 'claude-3-5-sonnet',
  GPT_4O = 'gpt-4o',
  GEMINI_FLASH = 'gemini-2.0-flash',
}

export interface AIConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  config?: AIConfig;
  timestamp: number;
  isStreaming?: boolean;
  status?: 'analyzing' | 'coding' | 'idle';
  error?: string;
}

export interface FileEntry {
  path: string;
  content: string;
  language: string;
}

declare global {
  interface Window {
    puter: any;
    JSZip: any;
  }
}
