export enum AIModel {
  NEMOTRON_FREE = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
}

export type AIAgent = 'Architect' | 'Developer' | 'QA' | 'Reviewer' | 'Security';

export interface ModelMetadata {
  id: AIModel;
  name: string;
  status: 'optimal' | 'stable' | 'preview';
  capability: 'Speed' | 'Reasoning' | 'Advanced' | 'Project Wide';
  color: string;
}

export const MODEL_LIST: ModelMetadata[] = [
  { id: AIModel.NEMOTRON_FREE, name: 'Nemotron Nano (Free)', status: 'optimal', capability: 'Speed', color: '#10b981' },
  { id: AIModel.GPT_4O, name: 'GPT-4o', status: 'stable', capability: 'Advanced', color: '#3b82f6' },
  { id: AIModel.GPT_4O_MINI, name: 'GPT-4o Mini', status: 'stable', capability: 'Speed', color: '#6366f1' },
  { id: AIModel.CLAUDE_3_5_SONNET, name: 'Claude 3.5 Sonnet', status: 'stable', capability: 'Reasoning', color: '#f97316' },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: AIAgent;
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
  isDeleted?: boolean;
}

export interface IDEState {
  activeAgent: AIAgent;
  isExplorerOpen: boolean;
  isTerminalOpen: boolean;
  commandPaletteOpen: boolean;
}

declare global {
  interface Window {
    puter: any;
    JSZip: any;
  }
}
