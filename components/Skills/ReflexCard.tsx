// ReflexCard Component - Individual reflex card with controls
// Task 3_2: Reflexes Implementation

import { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Webhook,
  Mail,
  FileCode,
  Globe,
  Calendar,
  Bell,
  MoreVertical,
  Play,
  Pencil,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRIGGER_TYPE_CONFIG, getTriggerConfigSummary, getConditionsSummary } from '../../hooks/useReflexes';
import type { Reflex, ReflexTriggerType, WebhookTriggerConfig } from '../../types/skills';

interface ReflexCardProps {
  reflex: Reflex;
  onEdit: (reflex: Reflex) => void;
  onDelete: (reflex: Reflex) => void;
  onTest: (reflex: Reflex) => void;
  onToggle: (reflex: Reflex, isActive: boolean) => void;
  onResetErrors: (reflex: Reflex) => void;
  isToggling?: boolean;
}

// Icon mapping for trigger types
const TRIGGER_ICONS: Record<ReflexTriggerType, typeof Webhook> = {
  webhook: Webhook,
  email: Mail,
  file_change: FileCode,
  api_call: Globe,
  schedule: Calendar,
  event: Bell,
};

export function ReflexCard({
  reflex,
  onEdit,
  onDelete,
  onTest,
  onToggle,
  onResetErrors,
  isToggling = false,
}: ReflexCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const triggerConfig = TRIGGER_TYPE_CONFIG[reflex.triggerType];
  const TriggerIcon = TRIGGER_ICONS[reflex.triggerType] || Zap;
  const hasErrors = reflex.consecutiveFailures > 0;

  // Get webhook URL for copy functionality
  const webhookUrl = reflex.triggerType === 'webhook'
    ? (reflex.triggerConfig as WebhookTriggerConfig).url
    : null;

  const handleCopyUrl = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const formatTimestamp = (date?: Date): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'group relative bg-card border rounded-xl p-4',
        'hover:shadow-lg hover:shadow-black/5',
        'transition-all duration-200',
        hasErrors ? 'border-destructive/50' : 'border-border',
        !reflex.isActive && 'opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Trigger Type Icon */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              triggerConfig.color.bg
            )}
          >
            <TriggerIcon size={20} className={triggerConfig.color.text} />
          </div>

          {/* Trigger Type & Status */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-md',
                  triggerConfig.color.bg,
                  triggerConfig.color.text
                )}
              >
                {triggerConfig.label}
              </span>
              {hasErrors && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle size={12} />
                  {reflex.consecutiveFailures} failures
                </span>
              )}
            </div>
            {!reflex.isActive && (
              <span className="text-xs text-muted-foreground">Inactive</span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              'p-1.5 rounded-md text-muted-foreground',
              'hover:bg-muted hover:text-foreground',
              'opacity-0 group-hover:opacity-100 focus:opacity-100',
              'transition-all',
              isMenuOpen && 'opacity-100 bg-muted text-foreground'
            )}
            aria-label="Reflex actions"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-xl z-10 py-1">
              <button
                onClick={() => {
                  onTest(reflex);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Play size={14} />
                Test
              </button>
              <button
                onClick={() => {
                  onEdit(reflex);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              {hasErrors && (
                <button
                  onClick={() => {
                    onResetErrors(reflex);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10 transition-colors"
                >
                  <RefreshCw size={14} />
                  Reset Errors
                </button>
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  onDelete(reflex);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Config Summary */}
      <div className="mb-3">
        <p className="text-sm text-foreground line-clamp-1">
          {getTriggerConfigSummary(reflex.triggerType, reflex.triggerConfig)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {getConditionsSummary(reflex.conditions)}
        </p>
      </div>

      {/* Webhook URL (if applicable) */}
      {webhookUrl && (
        <div className="mb-3 p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs text-muted-foreground truncate flex-1">
              {webhookUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              className={cn(
                'p-1.5 rounded-md transition-colors shrink-0',
                copied
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={copied ? 'Copied!' : 'Copy URL'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {reflex.lastErrorMessage && (
        <div className="mb-3 p-2 bg-destructive/10 rounded-lg">
          <p className="text-xs text-destructive line-clamp-2">
            {reflex.lastErrorMessage}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap size={12} />
            {reflex.triggerCount} triggers
          </span>
          <span>Last: {formatTimestamp(reflex.lastTriggeredAt)}</span>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(reflex, !reflex.isActive)}
          disabled={isToggling}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
            reflex.isActive ? 'bg-primary' : 'bg-muted',
            isToggling && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={reflex.isActive ? 'Deactivate reflex' : 'Activate reflex'}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
              reflex.isActive ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
    </div>
  );
}
