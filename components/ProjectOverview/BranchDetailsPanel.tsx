import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Package,
  FileText,
  FolderOpen,
  Database,
  Folder,
  ChevronRight,
  FileCode,
  FileJson,
  File,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Types for ingestion items
interface IngestionItem {
  id: string;
  name: string;
  type: 'repo' | 'file' | 'folder';
  size: string;
  status: 'cached' | 'expired' | 'pending';
}

// Types for explorer files
interface ExplorerFile {
  id: string;
  name: string;
  type: 'typescript' | 'javascript' | 'json' | 'markdown' | 'css' | 'html' | 'python' | 'folder' | 'other';
  size: number;
  isFolder?: boolean;
  parentId?: string;
  children?: ExplorerFile[];
}

// Mock data for demonstration
const MOCK_INGESTIONS: IngestionItem[] = [
  { id: '1', name: '343345', type: 'file', size: '1.2 MB', status: 'cached' },
  { id: '2', name: 'settingsplan.md', type: 'file', size: '45 KB', status: 'cached' },
  { id: '3', name: 'Full project sync', type: 'repo', size: '5.1 MB', status: 'cached' },
  { id: '4', name: 'Auth module update', type: 'file', size: '890 KB', status: 'cached' },
  { id: '5', name: 'API refactor', type: 'file', size: '2.3 MB', status: 'pending' },
  { id: '6', name: 'Config files', type: 'folder', size: '120 KB', status: 'cached' },
  { id: '7', name: 'Dashboard components', type: 'file', size: '1.8 MB', status: 'expired' },
  { id: '8', name: 'Utility functions', type: 'file', size: '450 KB', status: 'cached' },
  { id: '9', name: 'Test suite', type: 'repo', size: '3.2 MB', status: 'pending' },
  { id: '10', name: 'Initial codebase import', type: 'repo', size: '12 MB', status: 'cached' },
  { id: '11', name: 'Shared types', type: 'file', size: '230 KB', status: 'cached' },
  { id: '12', name: 'Core services', type: 'file', size: '4.5 MB', status: 'cached' },
];

const MOCK_EXPLORER_FILES: ExplorerFile[] = [
  { id: '1', name: 'Product User and Market In...', type: 'folder', size: 0, isFolder: true },
  { id: '2', name: 'App.tsx', type: 'typescript', size: 12148, parentId: '1' },
  { id: '3', name: 'index.ts', type: 'typescript', size: 3148, parentId: '1' },
  { id: '4', name: 'types.ts', type: 'typescript', size: 5420, parentId: '1' },
  { id: '5', name: 'Sidebar.tsx', type: 'typescript', size: 8920, parentId: '1' },
  { id: '6', name: 'HypervisaView.tsx', type: 'typescript', size: 14100, parentId: '1' },
  { id: '7', name: 'package.json', type: 'json', size: 2740 },
  { id: '8', name: 'README.md', type: 'markdown', size: 4520 },
  { id: '9', name: 'index.css', type: 'css', size: 3210 },
  { id: '10', name: 'vite.config.ts', type: 'typescript', size: 1890 },
  { id: '11', name: 'tailwind.config.js', type: 'javascript', size: 2340 },
  { id: '12', name: 'ContentInspector.tsx', type: 'typescript', size: 18450 },
  { id: '13', name: 'ChatHistoryPanel.tsx', type: 'typescript', size: 9780 },
  { id: '14', name: 'SettingsContext.tsx', type: 'typescript', size: 6230 },
  { id: '15', name: 'useTheme.ts', type: 'typescript', size: 1240 },
  { id: '16', name: 'cn.ts', type: 'typescript', size: 450 },
  { id: '17', name: 'ProjectsContext.tsx', type: 'typescript', size: 12300 },
  { id: '18', name: 'NotificationContex...', type: 'typescript', size: 5340 },
  { id: '19', name: 'main.py', type: 'python', size: 8920 },
  { id: '20', name: 'index.html', type: 'html', size: 1240 },
  { id: '21', name: 'api-spec.json', type: 'json', size: 44700 },
  { id: '22', name: 'EmptyState.tsx', type: 'typescript', size: 2340 },
  { id: '23', name: 'StatusBadge.tsx', type: 'typescript', size: 1840 },
  { id: '24', name: 'ProgressBar.tsx', type: 'typescript', size: 1440 },
  { id: '25', name: 'tsconfig.json', type: 'json', size: 800 },
];

type ViewMode = 'hypervisa' | 'explorer';

interface BranchDetailsPanelProps {
  branchName: string;
  worktreeId: string;
  onClose: () => void;
}

// Item type icon component
function ItemIcon({ type }: { type: IngestionItem['type'] }) {
  switch (type) {
    case 'repo':
      return <Package size={14} className="text-blue-400" />;
    case 'file':
      return <FileText size={14} className="text-slate-400" />;
    default:
      return <FolderOpen size={14} className="text-amber-400" />;
  }
}

// File type icon mapping for explorer
function getFileIcon(type: ExplorerFile['type']) {
  switch (type) {
    case 'typescript':
    case 'javascript':
      return FileCode;
    case 'json':
      return FileJson;
    case 'markdown':
      return FileText;
    case 'folder':
      return Folder;
    default:
      return File;
  }
}

// File type color mapping
function getFileTypeColor(type: ExplorerFile['type']) {
  switch (type) {
    case 'typescript':
      return 'text-blue-400';
    case 'javascript':
      return 'text-yellow-400';
    case 'json':
      return 'text-amber-400';
    case 'markdown':
      return 'text-slate-400';
    case 'css':
      return 'text-pink-400';
    case 'html':
      return 'text-orange-400';
    case 'python':
      return 'text-green-400';
    case 'folder':
      return 'text-blue-300';
    default:
      return 'text-slate-500';
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Hypervisa ingestion list view
function HypervisaListView({ items }: { items: IngestionItem[] }) {
  return (
    <div className="space-y-px">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
        >
          <ItemIcon type={item.type} />
          <span className="flex-1 text-[13px] text-slate-300 truncate">
            {item.name}
          </span>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                item.status === 'cached' && 'bg-emerald-500',
                item.status === 'expired' && 'bg-amber-500',
                item.status === 'pending' && 'bg-blue-500 animate-pulse'
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Explorer file list view
function ExplorerListView({
  files,
  expandedFolders,
  onFolderToggle,
}: {
  files: ExplorerFile[];
  expandedFolders: Set<string>;
  onFolderToggle: (id: string) => void;
}) {
  const rootFiles = files.filter((f) => !f.parentId);

  const renderFile = (file: ExplorerFile, depth = 0) => {
    const Icon = getFileIcon(file.type);
    const colorClass = getFileTypeColor(file.type);
    const isExpanded = expandedFolders.has(file.id);
    const children = files.filter((f) => f.parentId === file.id);

    return (
      <div key={file.id}>
        <div
          onClick={() => file.isFolder && onFolderToggle(file.id)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {file.isFolder && (
            <ChevronRight
              size={12}
              className={cn(
                'flex-shrink-0 text-slate-500 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          )}
          <Icon size={14} className={cn('flex-shrink-0', colorClass)} />
          <span className="flex-1 text-[13px] text-slate-300 truncate">
            {file.name}
          </span>
          {!file.isFolder && (
            <span className="text-[11px] text-slate-500 tabular-nums">
              {formatFileSize(file.size)}
            </span>
          )}
        </div>
        {file.isFolder && isExpanded && children.length > 0 && (
          <div>
            {children.map((child) => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="space-y-px">{rootFiles.map((f) => renderFile(f))}</div>;
}

export function BranchDetailsPanel({
  branchName,
  worktreeId,
  onClose,
}: BranchDetailsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('hypervisa');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['1'])
  );

  // Filter ingestion items based on search
  const filteredIngestions = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_INGESTIONS;
    const query = searchQuery.toLowerCase();
    return MOCK_INGESTIONS.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Filter explorer files based on search
  const filteredExplorerFiles = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_EXPLORER_FILES;
    const query = searchQuery.toLowerCase();
    return MOCK_EXPLORER_FILES.filter((file) =>
      file.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Calculate totals for hypervisa
  const totalTokens = useMemo(() => {
    return 2456834;
  }, []);

  const handleFolderToggle = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="w-[260px] h-full bg-[#0a0e17] rounded-xl border border-[#1e293b]/60 flex flex-col overflow-hidden ml-4 shadow-xl">
      {/* Header with toggle */}
      <div className="shrink-0 p-3 space-y-3">
        {/* View Toggle */}
        <div className="flex bg-[#0d1220] rounded-lg p-1 border border-[#1e293b]/40">
          <button
            onClick={() => setViewMode('hypervisa')}
            className={cn(
              'flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all',
              viewMode === 'hypervisa'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Hypervisa
          </button>
          <button
            onClick={() => setViewMode('explorer')}
            className={cn(
              'flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all',
              viewMode === 'explorer'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Explorer
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              viewMode === 'hypervisa'
                ? 'Filter ingestions...'
                : 'Filter files...'
            }
            className="w-full pl-9 pr-8 py-2 bg-[#0d1220] border border-[#1e293b]/40 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-1.5">
        {viewMode === 'hypervisa' ? (
          filteredIngestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Database size={24} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">No ingestions found</p>
            </div>
          ) : (
            <HypervisaListView items={filteredIngestions} />
          )
        ) : filteredExplorerFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <FolderOpen size={24} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">No files found</p>
          </div>
        ) : (
          <ExplorerListView
            files={filteredExplorerFiles}
            expandedFolders={expandedFolders}
            onFolderToggle={handleFolderToggle}
          />
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-[#1e293b]/40 bg-[#0d1220]/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Total context</span>
          <span className="text-sm font-medium text-emerald-400">
            {totalTokens.toLocaleString()} tokens
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{MOCK_INGESTIONS.length} ingestions</span>
          <span>106,847 compressed</span>
        </div>
      </div>
    </div>
  );
}

export default BranchDetailsPanel;
