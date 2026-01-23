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

// Project Overview Types
export interface Project {
    id: string;
    name: string;
    icon: ProjectIcon;
    createdAt: Date;
    updatedAt: Date;
    sourceCount: number;
    isShared: boolean;
    sharedBy?: string;
    owner: string;
    description?: string;
}

export interface ProjectIcon {
    type: 'emoji' | 'initials' | 'image';
    value: string;
    backgroundColor?: string;
}

export type ProjectFilter = 'all' | 'mine' | 'shared';
export type ProjectSort = 'recent' | 'name' | 'sources';
export type ProjectViewMode = 'grid' | 'list';