import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Database,
  Clock,
  ChevronRight,
  RefreshCw,
  FileText,
  GitBranch,
  AlignLeft,
  Shield,
  Eye,
  Trash2,
  X,
  Code,
  Hash,
  Tag,
  FileCode,
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { formatDateTime, formatNumber } from '../../../../utils/formatting';
import { useCompressionData } from '../CompressionTab/hooks';
import { CompressionProgress } from '../CompressionTab/CompressionProgress';
import { CompressionStats } from '../CompressionTab/CompressionStats';
import { getIngestionPreview } from '../../../../services/compressionService';
import type { IngestionEntry, IngestionSourceType } from '../../../../types/contextInspector';

function getSourceIcon(sourceType?: IngestionSourceType) {
  switch (sourceType) {
    case 'repo':
      return { Icon: GitBranch, color: 'text-purple-400', bg: 'bg-purple-500/15', bgSelected: 'bg-purple-500/25' };
    case 'text':
      return { Icon: AlignLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/15', bgSelected: 'bg-emerald-500/25' };
    case 'file':
    default:
      return { Icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/15', bgSelected: 'bg-blue-500/25' };
  }
}

interface KnowledgeBaseTabProps {
  contextId: string;
  selectedIngestionNumbers?: number[];
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-6">
      <div className="space-y-4">
        <div className="h-20 bg-slate-800/50 rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface IngestionCardProps {
  entry: IngestionEntry;
  isSelected?: boolean;
  isPreviewTarget?: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  onDelete?: (number: number) => void;
  onClick?: (entry: IngestionEntry) => void;
}

function TokenInfo({ entry }: { entry: IngestionEntry }) {
  const currentTokens = entry.compressed && entry.compressedTokens != null
    ? entry.compressedTokens
    : entry.tokens;
  return (
    <span className="text-[11px] text-gray-500 tabular-nums">
      {entry.compressed && entry.compressedTokens != null ? (
        <>
          <span className="text-gray-600 line-through">{formatNumber(entry.tokens)}</span>
          {' '}
          <span className="text-blue-400">{formatNumber(currentTokens)}</span>
          <span className="text-gray-600"> tokens</span>
        </>
      ) : (
        <>{formatNumber(entry.tokens)} tokens</>
      )}
    </span>
  );
}

function IngestionCard({ entry, isSelected, isPreviewTarget, cardRef, onDelete, onClick }: IngestionCardProps) {
  const { Icon, color, bg, bgSelected } = getSourceIcon(entry.sourceType);
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(entry)}
      className={cn(
        "group py-1.5 px-3 rounded-md transition-colors border cursor-pointer",
        isPreviewTarget
          ? "bg-blue-600/15 border-blue-500/40 ring-1 ring-blue-500/20"
          : isSelected
            ? "bg-blue-600/10 border-blue-500/30"
            : "bg-transparent hover:bg-white/[0.03] border-transparent hover:border-white/[0.06]"
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-5 h-5 rounded flex-shrink-0 flex items-center justify-center",
          isSelected ? bgSelected : bg
        )}>
          <Icon size={11} className={color} />
        </div>
        {entry.displayName && (
          <span className="text-xs font-medium text-gray-300 truncate min-w-0">{entry.displayName}</span>
        )}
        {entry.neverCompress && (
          <Shield size={10} className="text-amber-400 flex-shrink-0" />
        )}
        {entry.compressed && !entry.neverCompress && (
          <Eye size={10} className="text-blue-400 flex-shrink-0" />
        )}
        <TokenInfo entry={entry} />
        <span className="ml-auto text-[10px] text-gray-600 flex-shrink-0">{formatDateTime(entry.timestamp)}</span>
        {onDelete && !confirming && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
            title="Delete ingestion"
            aria-label="Delete ingestion"
          >
            <Trash2 size={11} />
          </button>
        )}
        {confirming && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(entry.number); setConfirming(false); }}
              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IngestionGridCard({ entry, isSelected, isPreviewTarget, cardRef, onDelete, onClick }: IngestionCardProps) {
  const { Icon, color, bg, bgSelected } = getSourceIcon(entry.sourceType);
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(entry)}
      className={cn(
        "group relative aspect-square p-2.5 rounded-md transition-colors border flex flex-col items-center justify-center text-center gap-1 cursor-pointer",
        isPreviewTarget
          ? "bg-blue-600/15 border-blue-500/40 ring-1 ring-blue-500/20"
          : isSelected
            ? "bg-blue-600/10 border-blue-500/30"
            : "bg-transparent hover:bg-white/[0.03] border-white/[0.04] hover:border-white/[0.08]"
      )}
    >
      {onDelete && !confirming && (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/15 text-gray-600 hover:text-red-400 transition-all"
          title="Delete ingestion"
          aria-label="Delete ingestion"
        >
          <Trash2 size={10} />
        </button>
      )}
      {confirming && (
        <div className="absolute inset-0 rounded-md bg-[#0d1220]/90 flex flex-col items-center justify-center gap-1.5 z-10">
          <span className="text-[10px] text-gray-400">Delete?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(entry.number); setConfirming(false); }}
              className="px-2 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
              className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}
      <div className={cn(
        "w-7 h-7 rounded flex items-center justify-center",
        isSelected ? bgSelected : bg
      )}>
        <Icon size={14} className={color} />
      </div>
      <div className="flex items-center gap-1">
        {entry.displayName && (
          <span className="text-[10px] font-medium text-gray-300 truncate">{entry.displayName}</span>
        )}
        {entry.neverCompress && (
          <Shield size={9} className="text-amber-400 flex-shrink-0" />
        )}
        {entry.compressed && !entry.neverCompress && (
          <Eye size={9} className="text-blue-400 flex-shrink-0" />
        )}
      </div>
      <span className="text-[8px] text-gray-600 leading-tight">{formatDateTime(entry.timestamp)}</span>
      <span className="text-[8px] text-gray-600 tabular-nums">
        {entry.compressed && entry.compressedTokens != null
          ? `${formatNumber(entry.compressedTokens)} tok`
          : `${formatNumber(entry.tokens)} tok`
        }
      </span>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  entries: IngestionEntry[];
  isOpen: boolean;
  onToggle: () => void;
  viewMode: 'list' | 'grid';
  selectedSet: Set<number>;
  selectedIngestionNumbers: number[];
  selectedCardRef: React.RefObject<HTMLDivElement>;
  accentColor: string;
  onDelete?: (number: number) => void;
  onCardClick?: (entry: IngestionEntry) => void;
  previewIngestionNumber?: number | null;
}

function IngestionSection({
  title,
  icon,
  count,
  entries,
  isOpen,
  onToggle,
  viewMode,
  selectedSet,
  selectedIngestionNumbers,
  selectedCardRef,
  accentColor,
  onDelete,
  onCardClick,
  previewIngestionNumber,
}: SectionProps) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/5 transition-colors group"
      >
        <ChevronRight
          size={14}
          className={cn(
            "text-gray-500 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {icon}
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</span>
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", accentColor)}>
          {count}
        </span>
      </button>
      {isOpen && entries.length > 0 && (
        <div className={cn(
          "mt-1 ml-1",
          viewMode === 'grid' ? 'grid grid-cols-3 gap-1.5' : 'space-y-0.5'
        )}>
          {entries.map((entry) => {
            const cardProps = {
              key: entry.number,
              entry,
              isSelected: selectedSet.has(entry.number),
              isPreviewTarget: previewIngestionNumber === entry.number,
              cardRef: selectedIngestionNumbers.length === 1 && selectedIngestionNumbers[0] === entry.number ? selectedCardRef : undefined,
              onDelete,
              onClick: onCardClick,
            };
            return viewMode === 'grid'
              ? <IngestionGridCard {...cardProps} />
              : <IngestionCard {...cardProps} />;
          })}
        </div>
      )}
      {isOpen && entries.length === 0 && (
        <p className="text-xs text-gray-600 ml-7 py-2">No ingestions in this category</p>
      )}
    </div>
  );
}

interface IngestionPreviewProps {
  entry: IngestionEntry;
  onClose: () => void;
}

function IngestionPreview({ entry, onClose }: IngestionPreviewProps) {
  const preview = useMemo(() => getIngestionPreview(entry), [entry]);
  const { Icon, color } = getSourceIcon(entry.sourceType);

  return (
    <div className="h-full flex flex-col bg-[#0c1220] border-l border-white/5">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Icon size={14} className={color} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white truncate">
            {entry.displayName || `Ingestion #${entry.number}`}
          </h3>
          <p className="text-[10px] text-gray-500 truncate">{preview.fileName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors flex-shrink-0"
          aria-label="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      {/* Metadata */}
      <div className="shrink-0 px-4 py-2 border-b border-white/[0.03] flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
          <Hash size={10} />
          {entry.filesAdded} {entry.filesAdded === 1 ? 'file' : 'files'}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
          <Code size={10} />
          {formatNumber(entry.tokens)} tokens
        </span>
        {entry.compressed && entry.compressedTokens != null && (
          <span className="text-[10px] text-blue-400">
            {formatNumber(entry.compressedTokens)} compressed
          </span>
        )}
        <span className="text-[10px] text-gray-600 ml-auto">
          {formatDateTime(entry.timestamp)}
        </span>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="shrink-0 px-4 py-1.5 border-b border-white/[0.03] flex items-center gap-1.5 flex-wrap">
          <Tag size={10} className="text-gray-600" />
          {entry.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/[0.06]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="shrink-0 px-4 py-2 border-b border-white/[0.03]">
        <p className="text-xs text-gray-400 leading-relaxed">{preview.summary}</p>
      </div>

      {/* Code Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="shrink-0 px-4 py-1.5 flex items-center gap-2 border-b border-white/[0.03]">
          <FileCode size={11} className="text-gray-600" />
          <span className="text-[10px] text-gray-500 font-mono">{preview.fileName}</span>
          <span className="text-[10px] text-gray-600 ml-auto">{preview.language}</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <pre className="px-4 py-3 text-[11px] leading-relaxed font-mono text-gray-300 whitespace-pre-wrap break-all">
            <code>{preview.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function KnowledgeBaseTab({ contextId, selectedIngestionNumbers = [] }: KnowledgeBaseTabProps) {
  const {
    metrics,
    history,
    isLoading,
    error,
    refresh,
    deleteIngestion,
  } = useCompressionData(contextId);

  const [openSections, setOpenSections] = useState({
    compressed: true,
    notCompressed: true,
    neverCompress: true,
  });

  const [previewEntry, setPreviewEntry] = useState<IngestionEntry | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIngestionNumbers), [selectedIngestionNumbers]);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Scroll to the selected ingestion card when selection changes
  useEffect(() => {
    if (selectedIngestionNumbers.length === 1 && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIngestionNumbers]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCardClick = useCallback((entry: IngestionEntry) => {
    setPreviewEntry(prev => prev?.number === entry.number ? null : entry);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewEntry(null);
  }, []);

  const handleDelete = useCallback((number: number) => {
    if (previewEntry?.number === number) {
      setPreviewEntry(null);
    }
    deleteIngestion(number);
  }, [deleteIngestion, previewEntry]);

  // Sort and split into sections
  const { compressed, notCompressed, neverCompress } = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.number - a.number);

    return {
      compressed: sorted.filter(e => e.compressed && !e.neverCompress),
      notCompressed: sorted.filter(e => !e.compressed && !e.neverCompress),
      neverCompress: sorted.filter(e => e.neverCompress),
    };
  }, [history]);

  const total = compressed.length + notCompressed.length + neverCompress.length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load knowledge base</h3>
        <p className="text-sm text-gray-400 mb-4 max-w-md">{error || 'Unable to load data'}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const sectionSharedProps = {
    viewMode: 'list' as const,
    selectedSet,
    selectedIngestionNumbers,
    selectedCardRef: selectedCardRef as React.RefObject<HTMLDivElement>,
    onDelete: handleDelete,
    onCardClick: handleCardClick,
    previewIngestionNumber: previewEntry?.number ?? null,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Knowledge Base</h2>
            <p className="text-[11px] text-gray-500">All ingestions and their file changes</p>
          </div>
          <button
            onClick={refresh}
            className={cn(
              'ml-auto flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium',
              'text-gray-400 hover:text-white',
              'bg-white/5 hover:bg-white/10',
              'border border-white/10 rounded-md',
              'transition-colors duration-150'
            )}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Content Area: split when preview is open */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ingestion List */}
        <div className={cn(
          "overflow-y-auto custom-scrollbar px-6 py-3",
          previewEntry ? "w-[45%] min-w-[280px]" : "flex-1"
        )}>
          {/* Compression Stats */}
          {metrics && (
            <div className="space-y-3 mb-5 pb-5 border-b border-white/5">
              <CompressionProgress
                savingsPercent={metrics.savingsPercent}
                ratio={metrics.ratio}
                costSavings={metrics.costSavings}
              />
              <CompressionStats metrics={metrics} tokensSaved={metrics.originalTokens - metrics.compressedTokens} />
            </div>
          )}

          {/* Ingestion Sections */}
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">No ingestions yet</p>
            </div>
          ) : (
            <>
              <IngestionSection
                title="Compressed"
                icon={<Eye size={13} className="text-blue-400" />}
                count={compressed.length}
                entries={compressed}
                isOpen={openSections.compressed}
                onToggle={() => toggleSection('compressed')}
                accentColor="bg-blue-500/15 text-blue-400"
                {...sectionSharedProps}
              />
              <IngestionSection
                title="Not Compressed"
                icon={<Eye size={13} className="text-gray-400" />}
                count={notCompressed.length}
                entries={notCompressed}
                isOpen={openSections.notCompressed}
                onToggle={() => toggleSection('notCompressed')}
                accentColor="bg-gray-500/15 text-gray-400"
                {...sectionSharedProps}
              />
              <IngestionSection
                title="Never Compress"
                icon={<Shield size={13} className="text-amber-400" />}
                count={neverCompress.length}
                entries={neverCompress}
                isOpen={openSections.neverCompress}
                onToggle={() => toggleSection('neverCompress')}
                accentColor="bg-amber-500/15 text-amber-400"
                {...sectionSharedProps}
              />
            </>
          )}
        </div>

        {/* Preview Panel */}
        {previewEntry && (
          <div className="flex-1 min-w-0">
            <IngestionPreview entry={previewEntry} onClose={handleClosePreview} />
          </div>
        )}
      </div>
    </div>
  );
}
