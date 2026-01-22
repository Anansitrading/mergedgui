export type WorkspaceMode = 'hyperglyph' | 'panopticon' | 'agents';

export interface LogEntry {
  ts: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  agent: string;
  msg: string;
}

export interface AgentStatus {
    name: string;
    state: 'Idle' | 'Thinking' | 'Working' | 'Error';
    load: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  attachments?: File[];
}

export interface ContextItem {
    id: string;
    name: string;
    type: 'file' | 'repo';
    size: string;
    status: 'cached' | 'pending' | 'expired';
}

export interface IngestionConfig {
    fileId: string;
    fileName: string;
    displayName: string;
    processingMode: 'compress' | 'compress_enrich';
    codebase: {
        type: 'existing' | 'new';
        id?: string;
        name: string;
    };
    tags?: string[];
    description?: string;
}