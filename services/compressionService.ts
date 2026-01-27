/**
 * Compression Service
 * Handles API calls for compression metrics and actions
 */

import type {
  CompressionMetrics,
  IngestionEntry,
  IngestionSourceType,
  CompressionAlgorithmInfo,
  CompressedFileItem,
  PendingCompressionFileItem,
  NeverCompressFileItem,
} from '../types/contextInspector';

// Mock data for development
const MOCK_COMPRESSED_FILES: CompressedFileItem[] = [
  { id: 'cf-1', name: 'App.tsx', path: 'src/App.tsx', originalTokens: 12400, compressedTokens: 640 },
  { id: 'cf-2', name: 'index.ts', path: 'src/index.ts', originalTokens: 2100, compressedTokens: 180 },
  { id: 'cf-3', name: 'types.ts', path: 'src/types.ts', originalTokens: 8300, compressedTokens: 420 },
  { id: 'cf-4', name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', originalTokens: 5500, compressedTokens: 310 },
  { id: 'cf-5', name: 'HypervisaView.tsx', path: 'src/components/HypervisaView.tsx', originalTokens: 14800, compressedTokens: 780 },
  { id: 'cf-6', name: 'SettingsContext.tsx', path: 'src/contexts/SettingsContext.tsx', originalTokens: 7600, compressedTokens: 390 },
  { id: 'cf-7', name: 'useTheme.ts', path: 'src/hooks/useTheme.ts', originalTokens: 1200, compressedTokens: 95 },
  { id: 'cf-8', name: 'ProjectsDashboard.tsx', path: 'src/components/ProjectsDashboard.tsx', originalTokens: 10900, compressedTokens: 560 },
  { id: 'cf-9', name: 'NotificationContext.tsx', path: 'src/contexts/NotificationContext.tsx', originalTokens: 5300, compressedTokens: 270 },
  { id: 'cf-10', name: 'main.py', path: 'src/main.py', originalTokens: 3500, compressedTokens: 200 },
  { id: 'cf-11', name: 'ContextDetailInspector.tsx', path: 'src/components/ContextDetailInspector.tsx', originalTokens: 18500, compressedTokens: 950 },
  { id: 'cf-12', name: 'ChatHistoryPanel.tsx', path: 'src/components/ChatHistoryPanel.tsx', originalTokens: 9100, compressedTokens: 470 },
];

const MOCK_PENDING_FILES: PendingCompressionFileItem[] = [
  { id: 'pf-1', name: 'IngestionWizard.tsx', path: 'src/components/Hypervisa/IngestionWizard.tsx', currentTokens: 14800, estimatedTokens: 760 },
  { id: 'pf-2', name: 'ProjectCard.tsx', path: 'src/components/ProjectOverview/ProjectCard.tsx', currentTokens: 4200, estimatedTokens: 220 },
  { id: 'pf-3', name: 'ChatInput.tsx', path: 'src/components/ContextDetailInspector/ChatInput.tsx', currentTokens: 3100, estimatedTokens: 160 },
  { id: 'pf-4', name: 'EmptyState.tsx', path: 'src/components/EmptyState.tsx', currentTokens: 2100, estimatedTokens: 110 },
  { id: 'pf-5', name: 'StatusBadge.tsx', path: 'src/components/StatusBadge.tsx', currentTokens: 1800, estimatedTokens: 95 },
];

const MOCK_NEVER_COMPRESS_FILES: NeverCompressFileItem[] = [
  { id: 'nf-1', name: 'api-spec.json', path: 'src/api-spec.json', tokens: 44500, reason: 'API specification — must remain exact' },
  { id: 'nf-2', name: 'package.json', path: 'package.json', tokens: 3100, reason: 'Package manifest' },
  { id: 'nf-3', name: 'tsconfig.json', path: 'tsconfig.json', tokens: 800, reason: 'TypeScript configuration' },
];

const MOCK_COMPRESSION_DATA: Record<string, {
  metrics: CompressionMetrics;
  history: IngestionEntry[];
  algorithmInfo: CompressionAlgorithmInfo;
  compressedFiles: CompressedFileItem[];
  pendingFiles: PendingCompressionFileItem[];
  neverCompressFiles: NeverCompressFileItem[];
}> = {
  default: {
    metrics: {
      originalTokens: 2458624,
      compressedTokens: 126847,
      ratio: 19.4,
      savingsPercent: 94.8,
      costSavings: 23.32,
      totalIngestions: 12,
      lastIngestion: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avgInterval: 3.2,
    },
    history: [
      { number: 12, timestamp: new Date('2026-01-22T15:23:00'), filesAdded: 127, filesRemoved: 3, tokens: 389200, compressedTokens: 20200, displayName: 'Full project sync', tags: ['sync', 'release'], compressed: true, sourceType: 'repo' },
      { number: 11, timestamp: new Date('2026-01-19T09:45:00'), filesAdded: 45, filesRemoved: 1, tokens: 134500, compressedTokens: 6980, displayName: 'Auth module update', tags: ['auth'], compressed: true, sourceType: 'file' },
      { number: 10, timestamp: new Date('2026-01-15T14:12:00'), filesAdded: 89, filesRemoved: 12, tokens: 267800, compressedTokens: 13900, displayName: 'API refactor', tags: ['refactor', 'api'], compressed: true, sourceType: 'repo' },
      { number: 9, timestamp: new Date('2026-01-12T11:30:00'), filesAdded: 23, filesRemoved: 0, tokens: 48200, displayName: 'Config files', tags: ['config'], compressed: false, neverCompress: true, sourceType: 'file' },
      { number: 8, timestamp: new Date('2026-01-09T16:45:00'), filesAdded: 156, filesRemoved: 8, tokens: 485600, compressedTokens: 25200, displayName: 'Dashboard components', tags: ['ui'], compressed: true, sourceType: 'repo' },
      { number: 7, timestamp: new Date('2026-01-05T10:20:00'), filesAdded: 67, filesRemoved: 4, tokens: 178400, displayName: 'Utility functions', tags: ['utils'], compressed: false, sourceType: 'file' },
      { number: 6, timestamp: new Date('2026-01-02T13:15:00'), filesAdded: 34, filesRemoved: 2, tokens: 92100, compressedTokens: 4780, displayName: 'Test suite', tags: ['tests'], compressed: true, sourceType: 'file' },
      { number: 5, timestamp: new Date('2025-12-28T09:00:00'), filesAdded: 201, filesRemoved: 15, tokens: 612400, compressedTokens: 31800, displayName: 'Initial codebase import', tags: ['initial', 'sync'], compressed: true, sourceType: 'repo' },
      { number: 4, timestamp: new Date('2025-12-24T14:30:00'), filesAdded: 78, filesRemoved: 5, tokens: 156800, displayName: 'Shared types', tags: ['types'], compressed: false, neverCompress: true, sourceType: 'text' },
      { number: 3, timestamp: new Date('2025-12-20T11:45:00'), filesAdded: 112, filesRemoved: 7, tokens: 289600, compressedTokens: 15040, displayName: 'Core services', tags: ['core'], compressed: true, sourceType: 'file' },
    ],
    algorithmInfo: {
      method: 'Hypervisa Contextual Compression v2.1',
      preserves: ['Structure', 'Types', 'Exports', 'Documentation'],
      optimizationLevel: 'High (favor accuracy over compression)',
    },
    compressedFiles: MOCK_COMPRESSED_FILES,
    pendingFiles: MOCK_PENDING_FILES,
    neverCompressFiles: MOCK_NEVER_COMPRESS_FILES,
  },
};

export interface CompressionDataResponse {
  metrics: CompressionMetrics;
  history: IngestionEntry[];
  algorithmInfo: CompressionAlgorithmInfo;
  compressedFiles: CompressedFileItem[];
  pendingFiles: PendingCompressionFileItem[];
  neverCompressFiles: NeverCompressFileItem[];
}

export async function getCompressionData(contextId: string): Promise<CompressionDataResponse> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  return data;
}

export async function addIngestionEntry(
  contextId: string,
  filesAdded: number,
  filesRemoved: number = 0,
  displayName?: string,
  tokens: number = 0,
  sourceType?: IngestionSourceType,
  compressed?: boolean,
  neverCompress?: boolean
): Promise<IngestionEntry> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  const maxNumber = data.history.reduce((max, e) => Math.max(max, e.number), 0);
  const newEntry: IngestionEntry = {
    number: maxNumber + 1,
    timestamp: new Date(),
    filesAdded,
    filesRemoved,
    tokens,
    displayName,
    sourceType,
    compressed,
    neverCompress,
  };
  // Create new array reference so React detects the change
  data.history = [newEntry, ...data.history];
  data.metrics = {
    ...data.metrics,
    totalIngestions: data.metrics.totalIngestions + 1,
    lastIngestion: new Date(),
  };

  // Notify listeners with the new entry + updated metrics
  window.dispatchEvent(new CustomEvent('kijko-ingestion-added', {
    detail: { entry: newEntry, metrics: data.metrics },
  }));

  return newEntry;
}

export async function renameIngestion(
  contextId: string,
  ingestionNumber: number,
  newName: string
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  const entry = data.history.find(e => e.number === ingestionNumber);
  if (entry) {
    entry.displayName = newName;
  }
  window.dispatchEvent(new CustomEvent('kijko-ingestion-updated', {
    detail: { ingestionNumber, field: 'displayName', value: newName },
  }));
}

export async function deleteIngestion(
  contextId: string,
  ingestionNumber: number
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  data.history = data.history.filter(e => e.number !== ingestionNumber);
  data.metrics = {
    ...data.metrics,
    totalIngestions: Math.max(0, data.metrics.totalIngestions - 1),
  };
  window.dispatchEvent(new CustomEvent('kijko-ingestion-deleted', {
    detail: { ingestionNumber, metrics: data.metrics },
  }));
}

export async function updateIngestionTags(
  contextId: string,
  ingestionNumber: number,
  tags: string[]
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  const entry = data.history.find(e => e.number === ingestionNumber);
  if (entry) {
    entry.tags = tags;
  }
  window.dispatchEvent(new CustomEvent('kijko-ingestion-updated', {
    detail: { ingestionNumber, field: 'tags', value: tags },
  }));
}

export async function compressIngestion(
  contextId: string,
  ingestionNumber: number
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const data = MOCK_COMPRESSION_DATA[contextId] || MOCK_COMPRESSION_DATA.default;
  const entry = data.history.find(e => e.number === ingestionNumber);
  if (entry) {
    entry.compressed = true;
  }
  window.dispatchEvent(new CustomEvent('kijko-ingestion-updated', {
    detail: { ingestionNumber, field: 'compressed', value: true },
  }));
}

export async function triggerRecompression(contextId: string): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 2500));
  return {
    success: true,
    message: 'Re-compression completed successfully',
  };
}

export async function downloadOriginal(contextId: string): Promise<Blob> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return new Blob(['Mock original content'], { type: 'application/octet-stream' });
}

export interface IngestionPreviewData {
  fileName: string;
  language: string;
  content: string;
  fileCount: number;
  summary: string;
}

const MOCK_PREVIEW_CONTENT: Record<number, IngestionPreviewData> = {
  12: {
    fileName: 'src/App.tsx',
    language: 'tsx',
    content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}`,
    fileCount: 127,
    summary: 'Full project sync including all source files, components, and configuration.',
  },
  11: {
    fileName: 'src/auth/AuthService.ts',
    language: 'typescript',
    content: `import { createClient } from '@supabase/supabase-js';
import type { User, Session } from './types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class AuthService {
  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password,
    });
    if (error) throw new AuthError(error.message);
    return data.session;
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
}`,
    fileCount: 45,
    summary: 'Authentication module update with Supabase integration.',
  },
  10: {
    fileName: 'src/api/endpoints.ts',
    language: 'typescript',
    content: `import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ProjectController } from '../controllers/ProjectController';
import { ContextController } from '../controllers/ContextController';

const router = Router();
const projectCtrl = new ProjectController();
const contextCtrl = new ContextController();

router.get('/projects', authenticate, projectCtrl.list);
router.post('/projects', authenticate, projectCtrl.create);
router.get('/projects/:id', authenticate, projectCtrl.getById);
router.delete('/projects/:id', authenticate, projectCtrl.delete);

router.get('/contexts', authenticate, contextCtrl.list);
router.post('/contexts/:id/ingest', authenticate, contextCtrl.ingest);
router.post('/contexts/:id/compress', authenticate, contextCtrl.compress);

export default router;`,
    fileCount: 89,
    summary: 'API refactor with new routing structure and controller pattern.',
  },
  9: {
    fileName: 'config/app.config.json',
    language: 'json',
    content: `{
  "app": {
    "name": "Kijko Platform",
    "version": "2.1.0",
    "environment": "production"
  },
  "compression": {
    "algorithm": "hypervisa-v2",
    "preserveStructure": true,
    "preserveTypes": true,
    "optimizationLevel": "high"
  },
  "ingestion": {
    "maxFileSize": "50MB",
    "supportedFormats": [".ts", ".tsx", ".js", ".py", ".json", ".md"],
    "excludePatterns": ["node_modules", ".git", "dist"]
  }
}`,
    fileCount: 23,
    summary: 'Configuration files including app settings and compression parameters.',
  },
  8: {
    fileName: 'src/components/Dashboard/DashboardView.tsx',
    language: 'tsx',
    content: `import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { StatsOverview } from './StatsOverview';
import { ActivityFeed } from './ActivityFeed';
import { useProjects } from '../../hooks/useProjects';

export function DashboardView() {
  const { projects, isLoading } = useProjects();
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  const filtered = projects.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <div className="col-span-8">
        <StatsOverview />
        <div className="grid grid-cols-2 gap-4 mt-6">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      <div className="col-span-4">
        <ActivityFeed />
      </div>
    </div>
  );
}`,
    fileCount: 156,
    summary: 'Dashboard components including project cards, stats, and activity feed.',
  },
  7: {
    fileName: 'src/utils/helpers.ts',
    language: 'typescript',
    content: `export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      ) as T[typeof key];
    } else {
      output[key] = source[key] as T[typeof key];
    }
  }
  return output;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T, delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
    fileCount: 67,
    summary: 'Utility functions including deep merge, debounce, and UUID generation.',
  },
  6: {
    fileName: 'src/__tests__/compression.test.ts',
    language: 'typescript',
    content: `import { describe, it, expect } from 'vitest';
import { compress, decompress } from '../services/compressionService';
import { mockIngestionData } from './__fixtures__/mockData';

describe('CompressionService', () => {
  it('should compress tokens with correct ratio', async () => {
    const result = await compress(mockIngestionData);
    expect(result.ratio).toBeGreaterThan(10);
    expect(result.compressedTokens).toBeLessThan(result.originalTokens);
  });

  it('should preserve structure during compression', async () => {
    const result = await compress(mockIngestionData);
    expect(result.preservedElements).toContain('types');
    expect(result.preservedElements).toContain('exports');
  });

  it('should handle empty input gracefully', async () => {
    const result = await compress({ tokens: 0, content: '' });
    expect(result.compressedTokens).toBe(0);
  });
});`,
    fileCount: 34,
    summary: 'Test suite for compression service with mock fixtures.',
  },
  5: {
    fileName: 'src/index.ts',
    language: 'typescript',
    content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { setupRoutes } from './routes';
import { connectDatabase } from './database';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '50mb' }));

  setupRoutes(app);
  await connectDatabase();

  const port = config.port || 3000;
  app.listen(port, () => {
    logger.info(\`Server running on port \${port}\`);
  });
}

bootstrap().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});`,
    fileCount: 201,
    summary: 'Initial codebase import with full server setup and configuration.',
  },
  4: {
    fileName: 'types/shared.d.ts',
    language: 'typescript',
    content: `export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface UserProfile extends BaseEntity {
  email: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
}`,
    fileCount: 78,
    summary: 'Shared type definitions including base entities, API types, and user profiles.',
  },
  3: {
    fileName: 'src/services/ContextService.ts',
    language: 'typescript',
    content: `import { prisma } from '../database';
import { CompressionEngine } from '../compression/engine';
import { EventEmitter } from '../events';
import type { Context, IngestionResult } from '../types';

export class ContextService {
  private compressionEngine: CompressionEngine;
  private events: EventEmitter;

  constructor() {
    this.compressionEngine = new CompressionEngine();
    this.events = new EventEmitter();
  }

  async ingest(contextId: string, files: File[]): Promise<IngestionResult> {
    const context = await prisma.context.findUnique({
      where: { id: contextId },
    });
    if (!context) throw new Error('Context not found');

    const processed = await this.compressionEngine.process(files);

    await prisma.ingestion.create({
      data: {
        contextId,
        filesAdded: files.length,
        tokens: processed.totalTokens,
        compressedTokens: processed.compressedTokens,
      },
    });

    this.events.emit('ingestion:complete', { contextId });
    return processed;
  }
}`,
    fileCount: 112,
    summary: 'Core services including context management and ingestion pipeline.',
  },
};

export function getIngestionPreview(entry: IngestionEntry): IngestionPreviewData {
  if (MOCK_PREVIEW_CONTENT[entry.number]) {
    return MOCK_PREVIEW_CONTENT[entry.number];
  }
  return {
    fileName: 'document.ts',
    language: 'typescript',
    content: `// ${entry.displayName || 'Ingestion'}\n\nexport interface Document {\n  id: string;\n  content: string;\n  metadata: Record<string, unknown>;\n}\n\nexport function processDocument(doc: Document): void {\n  // Processing logic\n}`,
    fileCount: entry.filesAdded,
    summary: entry.displayName || `Ingestion with ${entry.filesAdded} files.`,
  };
}
