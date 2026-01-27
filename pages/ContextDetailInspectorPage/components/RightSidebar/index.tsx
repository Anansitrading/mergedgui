import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Search, X, Pencil, Trash2, Loader2, Plus, FileText, GitBranch, AlignLeft, Tag, Archive, Shield, Eye } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useIngestion, formatFileSizeFromBytes } from '../../../../contexts/IngestionContext';
import { useCompressionData } from '../../../../components/ContextDetailInspector/tabs/CompressionTab/hooks';
import { formatDateTime, formatFileChange } from '../../../../utils/formatting';
import type { IngestionEntry, IngestionSourceType } from '../../../../types/contextInspector';

function getSourceIcon(sourceType?: IngestionSourceType) {
  switch (sourceType) {
    case 'repo':
      return { Icon: GitBranch, color: 'text-purple-400' };
    case 'text':
      return { Icon: AlignLeft, color: 'text-emerald-400' };
    case 'file':
    default:
      return { Icon: FileText, color: 'text-blue-400' };
  }
}

// ==========================================
// Constants
// ==========================================

const STORAGE_KEY = 'kijko_right_sidebar_collapsed';
const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 48;
const TRANSITION_DURATION = 300;

// ==========================================
// Debounce Hook
// ==========================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ==========================================
// Delete Confirmation Dialog
// ==========================================

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  heading?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ isOpen, title, heading = 'Delete', onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-white/20 rounded-lg shadow-xl p-4 max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-semibold text-white mb-2">{heading}</h3>
        <p className="text-xs text-gray-400 mb-4">
          Are you sure you want to delete "{title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Inline Edit Input
// ==========================================

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

function InlineEdit({ value, onSave, onCancel }: InlineEditProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue.trim() || value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(editValue.trim() || value)}
      className="w-full bg-white/10 border border-blue-500/50 rounded px-2 py-0.5 text-xs font-medium text-white outline-none focus:border-blue-500"
    />
  );
}

// ==========================================
// Ingestion Context Menu
// ==========================================

type IngestionMenuAction = 'rename' | 'edit-tags' | 'compress' | 'delete';

interface IngestionContextMenuProps {
  x: number;
  y: number;
  showCompress?: boolean;
  onAction: (action: IngestionMenuAction) => void;
  onClose: () => void;
}

function IngestionContextMenu({ x, y, showCompress, onAction, onClose }: IngestionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const actions: Array<{ id: IngestionMenuAction; label: string; icon: typeof Pencil; danger?: boolean }> = [
    { id: 'rename', label: 'Rename', icon: Pencil },
    { id: 'edit-tags', label: 'Edit Tags', icon: Tag },
    ...(showCompress ? [{ id: 'compress' as const, label: 'Compress', icon: Archive }] : []),
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <div key={action.id}>
            {action.danger && index > 0 && (
              <div className="my-1 border-t border-slate-700" />
            )}
            <button
              onClick={() => { onAction(action.id); onClose(); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                action.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-slate-300 hover:bg-slate-700'
              )}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="flex-1 text-left">{action.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// Tag Editor Inline
// ==========================================

interface TagEditorProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
}

function TagEditor({ tags, onSave, onCancel }: TagEditorProps) {
  const [inputValue, setInputValue] = useState(tags.join(', '));
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parsed = inputValue.split(',').map(t => t.trim()).filter(Boolean);
      onSave(parsed);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="px-3 py-1.5 bg-slate-800/80">
      <div className="flex items-center gap-1.5 mb-1">
        <Tag size={10} className="text-slate-500" />
        <span className="text-[10px] text-slate-500">Tags (comma-separated)</span>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const parsed = inputValue.split(',').map(t => t.trim()).filter(Boolean);
          onSave(parsed);
        }}
        placeholder="e.g. sync, release, api"
        className="w-full bg-white/10 border border-blue-500/50 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
      />
    </div>
  );
}

// ==========================================
// Ingestion Entry Row Component (Compact)
// ==========================================

interface IngestionEntryRowProps {
  entry: IngestionEntry;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onUpdateTags?: (tags: string[]) => void;
  onCompress?: () => void;
}

function IngestionEntryRow({ entry, isSelected, onSelect, onRename, onDelete, onUpdateTags, onCompress }: IngestionEntryRowProps) {
  const { Icon: SourceIcon, color: sourceColor } = getSourceIcon(entry.sourceType);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';

    const payload = JSON.stringify({
      number: entry.number,
      timestamp: entry.timestamp,
    });
    e.dataTransfer.setData('application/x-kijko-ingestion', payload);
    e.dataTransfer.setData('text/plain', `@Ingestion #${entry.number}`);
  }, [entry.number, entry.timestamp]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!contextMenu && !isRenaming && !isEditingTags) {
      setIsHovered(true);
      if (rowRef.current) {
        const rect = rowRef.current.getBoundingClientRect();
        setTooltipPos({
          top: rect.top + rect.height / 2,
          left: rect.left - 8,
        });
      }
    }
  }, [contextMenu, isRenaming, isEditingTags]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTooltipPos(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    setTooltipPos(null);
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextMenuAction = useCallback((action: IngestionMenuAction) => {
    setContextMenu(null);
    switch (action) {
      case 'rename':
        setIsRenaming(true);
        break;
      case 'edit-tags':
        setIsEditingTags(true);
        break;
      case 'compress':
        onCompress?.();
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
    }
  }, [onCompress]);

  const handleRename = useCallback((newName: string) => {
    setIsRenaming(false);
    if (newName && newName !== entry.displayName) {
      onRename?.(newName);
    }
  }, [entry.displayName, onRename]);

  const handleSaveTags = useCallback((tags: string[]) => {
    setIsEditingTags(false);
    onUpdateTags?.(tags);
  }, [onUpdateTags]);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    onDelete?.();
  }, [onDelete]);

  return (
    <>
      {/* Main row */}
      <div
        ref={rowRef}
        draggable={!isRenaming && !isEditingTags}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={!isRenaming && !isEditingTags ? (e: React.MouseEvent) => onSelect?.(e) : undefined}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors group",
          isDragging && "opacity-40",
          isSelected
            ? "bg-blue-600/10 hover:bg-blue-600/20"
            : "hover:bg-slate-800/50"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(e);
          }
        }}
      >
        {/* Source type icon */}
        <SourceIcon size={14} className={cn(
          "flex-shrink-0",
          isSelected ? sourceColor : "text-slate-500"
        )} />

        {/* Name or inline rename */}
        {isRenaming ? (
          <InlineEdit
            value={entry.displayName || `Ingestion #${entry.number}`}
            onSave={handleRename}
            onCancel={() => setIsRenaming(false)}
          />
        ) : (
          <span className="flex-1 text-xs text-slate-300 truncate">
            {entry.displayName || `Ingestion #${entry.number}`}
          </span>
        )}

        {/* Never compress shield */}
        {!isRenaming && entry.neverCompress && (
          <Shield size={12} className="flex-shrink-0 text-amber-400" />
        )}

        {/* Compression status eye */}
        {!isRenaming && !entry.neverCompress && (
          <Eye size={12} className={cn(
            "flex-shrink-0",
            entry.compressed ? "text-blue-400" : "text-gray-600"
          )} />
        )}

      </div>

      {/* Inline tag editor (shown below the row) */}
      {isEditingTags && (
        <TagEditor
          tags={entry.tags || []}
          onSave={handleSaveTags}
          onCancel={() => setIsEditingTags(false)}
        />
      )}

      {/* Hover tooltip */}
      {isHovered && tooltipPos && !contextMenu && !isRenaming && !isEditingTags && (
        <div
          className="fixed z-50 pointer-events-none animate-in fade-in duration-150"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translate(-100%, -50%)',
          }}
        >
          <div className="bg-[#1a1f2e] border border-white/15 rounded-lg shadow-xl px-3 py-2.5 min-w-[180px] max-w-[240px]">
            {/* Ingestion number */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="font-mono text-xs font-semibold text-blue-400">
                #{entry.number}
              </span>
              <span className="text-[10px] text-slate-500">Ingestion</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={10} className="text-slate-500 flex-shrink-0" />
              <span className="text-[11px] text-slate-400">
                {formatDateTime(entry.timestamp)}
              </span>
            </div>

            {/* File name */}
            {entry.displayName && (
              <div className="text-[11px] text-slate-300 truncate mb-1">
                {entry.displayName}
              </div>
            )}

            {/* Changes */}
            <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-white/10">
              {entry.filesAdded > 0 && (
                <span className="text-emerald-400">
                  {formatFileChange(entry.filesAdded, true)}
                </span>
              )}
              {entry.filesRemoved > 0 && (
                <span className="text-red-400">
                  {formatFileChange(entry.filesRemoved, false)}
                </span>
              )}
              {entry.filesAdded === 0 && entry.filesRemoved === 0 && (
                <span className="text-slate-500">No changes</span>
              )}
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <IngestionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          showCompress={!entry.compressed && !entry.neverCompress}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        heading="Delete Ingestion"
        title={entry.displayName || `Ingestion #${entry.number}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

// ==========================================
// Empty State Component
// ==========================================

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
        {hasSearch ? (
          <Search size={24} className="text-gray-500" />
        ) : (
          <Clock size={24} className="text-gray-500" />
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-1">
        {hasSearch ? 'No results found' : 'No ingestion history'}
      </h3>
      <p className="text-xs text-gray-500 max-w-[180px]">
        {hasSearch
          ? 'Try a different search term'
          : 'Ingest files to see your history here.'
        }
      </p>
    </div>
  );
}

// ==========================================
// Props Interface
// ==========================================

interface RightSidebarProps {
  className?: string;
  style?: React.CSSProperties;
  onWidthChange?: (width: number) => void;
  projectId?: string;
  selectedIngestionNumbers?: number[];
  onSelectIngestion?: (ingestionNumbers: number[]) => void;
  onNavigateToIngestion?: (ingestionNumber: number) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  expandedWidth?: number;
}

// ==========================================
// Main Component
// ==========================================

export function RightSidebar({
  className,
  style,
  onWidthChange,
  projectId = 'default',
  selectedIngestionNumbers = [],
  onSelectIngestion,
  onNavigateToIngestion,
  collapsed: externalCollapsed,
  onToggleCollapse: externalToggleCollapse,
  expandedWidth,
}: RightSidebarProps) {
  const {
    history: ingestionHistory,
    metrics: compressionMetrics,
    isLoading: ingestionLoading,
    renameIngestion,
    deleteIngestion,
    updateIngestionTags,
    compressIngestion,
  } = useCompressionData(projectId);
  const { openIngestionModal, openIngestionModalEmpty } = useIngestion();

  const selectedIngestionSet = useMemo(
    () => new Set(selectedIngestionNumbers),
    [selectedIngestionNumbers]
  );

  const selectedIngestions = useMemo(
    () => ingestionHistory.filter(e => selectedIngestionSet.has(e.number)),
    [ingestionHistory, selectedIngestionSet]
  );

  const totalIngestionTokens = useMemo(
    () => ingestionHistory.reduce((sum, e) => sum + e.tokens, 0),
    [ingestionHistory]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });

  // Use external collapse state when provided, otherwise fall back to internal
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Collect all unique tags from ingestions for filter chips
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    ingestionHistory.forEach(entry => {
      entry.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [ingestionHistory]);

  const handleToggleTagFilter = useCallback((tag: string) => {
    setSelectedTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTagFilters = useCallback(() => {
    setSelectedTagFilters([]);
  }, []);

  // Persist collapse state (only when using internal state)
  useEffect(() => {
    if (externalCollapsed === undefined) {
      localStorage.setItem(STORAGE_KEY, String(internalCollapsed));
    }
    onWidthChange?.(isCollapsed ? COLLAPSED_WIDTH : (expandedWidth ?? EXPANDED_WIDTH));
  }, [isCollapsed, internalCollapsed, externalCollapsed, onWidthChange]);

  // Notify parent of initial width
  useEffect(() => {
    onWidthChange?.(isCollapsed ? COLLAPSED_WIDTH : (expandedWidth ?? EXPANDED_WIDTH));
  }, []);

  const handleToggleCollapse = useCallback(() => {
    if (externalToggleCollapse) {
      externalToggleCollapse();
    } else {
      setInternalCollapsed(prev => !prev);
    }
  }, [externalToggleCollapse]);

  // Filter ingestions
  const { filteredIngestions, hasIngestionsResults } = useMemo(() => {
    let filtered = ingestionHistory;
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(entry => {
        const numStr = `#${entry.number}`;
        const dateStr = formatDateTime(entry.timestamp).toLowerCase();
        const nameStr = entry.displayName?.toLowerCase() || '';
        return numStr.includes(searchLower) || dateStr.includes(searchLower) || nameStr.includes(searchLower);
      });
    }

    // Filter by selected tags
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags?.some(tag => selectedTagFilters.includes(tag))
      );
    }

    // Sort by number (newest first)
    const sorted = [...filtered].sort((a, b) => b.number - a.number);

    return { filteredIngestions: sorted, hasIngestionsResults: sorted.length > 0 };
  }, [ingestionHistory, debouncedSearch, selectedTagFilters]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Ingestion handlers
  const [isIngestionDragOver, setIsIngestionDragOver] = useState(false);

  const handleNewIngestion = useCallback(() => {
    openIngestionModalEmpty();
  }, [openIngestionModalEmpty]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const id = `file-${Date.now()}`;
      openIngestionModal({
        id,
        name: file.name,
        size: formatFileSizeFromBytes(file.size),
        sizeBytes: file.size,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [openIngestionModal]);

  const handleIngestionDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsIngestionDragOver(true);
    }
  }, []);

  const handleIngestionDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIngestionDragOver(false);
  }, []);

  const handleIngestionDrop = useCallback((e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    e.preventDefault();
    e.stopPropagation();
    setIsIngestionDragOver(false);

    const id = `file-${Date.now()}`;
    openIngestionModal({
      id,
      name: file.name,
      size: formatFileSizeFromBytes(file.size),
      sizeBytes: file.size,
    });
  }, [openIngestionModal]);

  const resolvedExpandedWidth = expandedWidth ?? EXPANDED_WIDTH;
  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : resolvedExpandedWidth;

  return (
    <aside
      className={cn(
        'h-full bg-[#0d1220] border-l border-[#1e293b] flex flex-col overflow-hidden',
        'transition-all ease-out',
        className
      )}
      style={{
        width: currentWidth,
        minWidth: currentWidth,
        transitionDuration: `${TRANSITION_DURATION}ms`,
        ...style,
      }}
    >
      {isCollapsed ? (
        // Collapsed state
        <div
          className="flex-1 flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={handleToggleCollapse}
          role="button"
          aria-label="Expand ingestions sidebar"
        >
          <ChevronLeft size={16} className="text-gray-400 mb-3" />
          <div
            className="text-[10px] font-bold uppercase tracking-wider text-gray-500"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Ingestions
          </div>
          <div className="mt-2 text-[10px] text-gray-600">
            {ingestionHistory.length}
          </div>
        </div>
      ) : (
        // Expanded state
        <>
          {/* Hidden file input for ingestion */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.json,.md,.css,.html,.py,.txt"
          />

          {/* Header */}
          <div className="shrink-0 px-3 h-10 flex items-center justify-between border-b border-[#1e293b]">
            <span className="text-xs text-slate-400 font-medium">
              Ingestions
            </span>
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
              title="Collapse panel"
              aria-label="Collapse panel"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Search Input */}
          <div className="shrink-0 px-3 py-2 border-b border-[#1e293b]">
            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <Search className="text-gray-500" size={14} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingestions..."
                aria-label="Search ingestions"
                className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-8 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-2 flex items-center"
                >
                  <span className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                    <X size={12} />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div
              className={cn(
                "h-full flex flex-col transition-colors",
                isIngestionDragOver && "bg-blue-500/10 ring-2 ring-inset ring-blue-500/40"
              )}
              onDragOver={handleIngestionDragOver}
              onDragLeave={handleIngestionDragLeave}
              onDrop={handleIngestionDrop}
            >
              {/* New Ingestion Button */}
              <div className="shrink-0 px-2 pt-2 pb-1">
                <button
                  onClick={handleNewIngestion}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 transition-colors"
                >
                  <Plus size={14} />
                  <span>New Ingestion</span>
                </button>
              </div>

              {/* Tag Filter Chips */}
              {allUniqueTags.length > 0 && (
                <div className="shrink-0 px-2 pb-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Tag size={10} className="text-slate-500 flex-shrink-0" />
                    <span className="text-[10px] text-slate-500 font-medium">Filter by tag</span>
                    {selectedTagFilters.length > 0 && (
                      <button
                        onClick={handleClearTagFilters}
                        className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {allUniqueTags.map(tag => {
                      const isActive = selectedTagFilters.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleTagFilter(tag)}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                            isActive
                              ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ingestion List */}
              {ingestionLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : !hasIngestionsResults ? (
                <EmptyState hasSearch={debouncedSearch.trim().length > 0 || selectedTagFilters.length > 0} />
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="py-1">
                    {filteredIngestions.map((entry) => (
                      <IngestionEntryRow
                        key={entry.number}
                        entry={entry}
                        isSelected={selectedIngestionSet.has(entry.number)}
                        onSelect={(e) => {
                          const isCtrl = 'ctrlKey' in e && (e.ctrlKey || e.metaKey);
                          if (isCtrl) {
                            const next = selectedIngestionSet.has(entry.number)
                              ? selectedIngestionNumbers.filter(n => n !== entry.number)
                              : [...selectedIngestionNumbers, entry.number];
                            onSelectIngestion?.(next);
                          } else {
                            onSelectIngestion?.([entry.number]);
                            onNavigateToIngestion?.(entry.number);
                          }
                        }}
                        onRename={(newName) => renameIngestion(entry.number, newName)}
                        onDelete={() => deleteIngestion(entry.number)}
                        onUpdateTags={(tags) => updateIngestionTags(entry.number, tags)}
                        onCompress={() => compressIngestion(entry.number)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Size Bar */}
          <div className="shrink-0 border-t border-[#1e293b] p-3 bg-slate-900/50">
            {selectedIngestions.length === 1 ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Ingestion #{selectedIngestions[0].number}:</span>
                  <span className="text-slate-300 font-medium">
                    {selectedIngestions[0].tokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${totalIngestionTokens > 0 ? (selectedIngestions[0].tokens / totalIngestionTokens) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{selectedIngestions[0].filesAdded} files added</span>
                  <span>{totalIngestionTokens > 0 ? ((selectedIngestions[0].tokens / totalIngestionTokens) * 100).toFixed(1) : 0}% of total</span>
                </div>
              </>
            ) : selectedIngestions.length > 1 ? (
              (() => {
                const totalSelectedTokens = selectedIngestions.reduce((sum, e) => sum + e.tokens, 0);
                const totalSelectedFiles = selectedIngestions.reduce((sum, e) => sum + e.filesAdded, 0);
                return (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{selectedIngestions.length} selected:</span>
                      <span className="text-slate-300 font-medium">
                        {totalSelectedTokens.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${totalIngestionTokens > 0 ? (totalSelectedTokens / totalIngestionTokens) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{totalSelectedFiles} files added</span>
                      <span>{totalIngestionTokens > 0 ? ((totalSelectedTokens / totalIngestionTokens) * 100).toFixed(1) : 0}% of total</span>
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total context:</span>
                  <span className="text-slate-300 font-medium">
                    {compressionMetrics ? compressionMetrics.originalTokens.toLocaleString() : '—'} tokens
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${compressionMetrics?.savingsPercent ?? 0}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{ingestionHistory.length} ingestions</span>
                  <span>
                    {compressionMetrics ? `${compressionMetrics.compressedTokens.toLocaleString()} compressed` : '—'}
                  </span>
                </div>
              </>
            )}
          </div>

        </>
      )}
    </aside>
  );
}

export default RightSidebar;
