// ReflexConfigModal Component - Create/Edit reflex configuration
// Task 3_2: Reflexes Implementation

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, Webhook, Mail, FileCode, Globe, Bell, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { WebhookConfig } from './WebhookConfig';
import { EventConfig } from './EventConfig';
import { ConditionsEditor } from './ConditionsEditor';
import { TRIGGER_TYPE_CONFIG } from '../../hooks/useReflexes';
import type {
  Reflex,
  ReflexTriggerType,
  TriggerConfig,
  ReflexConditions,
  WebhookTriggerConfig,
  CreateReflexRequest,
  UpdateReflexRequest,
} from '../../types/skills';

// =============================================================================
// Types
// =============================================================================

interface ReflexConfigModalProps {
  skillId: string;
  reflex?: Reflex; // If provided, edit mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateReflexRequest | UpdateReflexRequest) => Promise<void>;
  onRegenerateSecret?: (reflexId: string) => Promise<void>;
}

interface FormState {
  triggerType: ReflexTriggerType;
  triggerConfig: TriggerConfig;
  conditions: ReflexConditions;
  isActive: boolean;
}

// =============================================================================
// Trigger Type Icons
// =============================================================================

const TRIGGER_ICONS: Record<ReflexTriggerType, typeof Webhook> = {
  webhook: Webhook,
  email: Mail,
  file_change: FileCode,
  api_call: Globe,
  schedule: Zap,
  event: Bell,
};

// Available trigger types (excluding schedule which uses Habits)
const AVAILABLE_TRIGGER_TYPES: ReflexTriggerType[] = [
  'webhook',
  'event',
  'file_change',
  'email',
  'api_call',
];

// =============================================================================
// Default Configs
// =============================================================================

const DEFAULT_CONFIGS: Record<ReflexTriggerType, TriggerConfig> = {
  webhook: { url: '', secret: '', method: 'POST' as const },
  email: { fromAddress: '', subjectPattern: '', bodyPattern: '' },
  file_change: { paths: [], events: ['create', 'modify'] },
  api_call: { endpoint: '', method: 'POST' },
  event: { eventName: '', source: '' },
  schedule: { eventName: 'schedule', source: 'cron' },
};

// =============================================================================
// Component
// =============================================================================

export function ReflexConfigModal({
  skillId,
  reflex,
  isOpen,
  onClose,
  onSave,
  onRegenerateSecret,
}: ReflexConfigModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<FormState>(() => ({
    triggerType: reflex?.triggerType || 'webhook',
    triggerConfig: reflex?.triggerConfig || DEFAULT_CONFIGS.webhook,
    conditions: reflex?.conditions || {},
    isActive: reflex?.isActive ?? true,
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(reflex);

  // Reset form when modal opens/closes or reflex changes
  useEffect(() => {
    if (isOpen) {
      setFormState({
        triggerType: reflex?.triggerType || 'webhook',
        triggerConfig: reflex?.triggerConfig || DEFAULT_CONFIGS.webhook,
        conditions: reflex?.conditions || {},
        isActive: reflex?.isActive ?? true,
      });
      setError(null);
    }
  }, [isOpen, reflex]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle trigger type change
  const handleTriggerTypeChange = (type: ReflexTriggerType) => {
    setFormState((prev) => ({
      ...prev,
      triggerType: type,
      triggerConfig: DEFAULT_CONFIGS[type],
    }));
  };

  // Handle trigger config change
  const handleTriggerConfigChange = (config: TriggerConfig) => {
    setFormState((prev) => ({
      ...prev,
      triggerConfig: config,
    }));
  };

  // Handle conditions change
  const handleConditionsChange = (conditions: ReflexConditions) => {
    setFormState((prev) => ({
      ...prev,
      conditions,
    }));
  };

  // Handle active toggle
  const handleActiveChange = (isActive: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isActive,
    }));
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (isEditMode) {
        // Update existing reflex
        const updateRequest: UpdateReflexRequest = {
          triggerConfig: formState.triggerConfig,
          conditions: Object.keys(formState.conditions).length > 0 ? formState.conditions : undefined,
          isActive: formState.isActive,
        };
        await onSave(updateRequest);
      } else {
        // Create new reflex
        const createRequest: CreateReflexRequest = {
          skillId,
          triggerType: formState.triggerType,
          triggerConfig: formState.triggerConfig,
          conditions: Object.keys(formState.conditions).length > 0 ? formState.conditions : undefined,
          isActive: formState.isActive,
        };
        await onSave(createRequest);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reflex');
    } finally {
      setIsSaving(false);
    }
  }, [formState, isEditMode, skillId, onSave, onClose]);

  // Handle secret regeneration
  const handleRegenerateSecret = async () => {
    if (!reflex || !onRegenerateSecret) return;
    try {
      await onRegenerateSecret(reflex.id);
    } catch {
      setError('Failed to regenerate secret');
    }
  };

  if (!isOpen) return null;

  const triggerConfig = TRIGGER_TYPE_CONFIG[formState.triggerType];
  const TriggerIcon = TRIGGER_ICONS[formState.triggerType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflex-config-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isSaving ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden',
          'bg-card border border-border rounded-xl shadow-2xl',
          'flex flex-col',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', triggerConfig.color.bg)}>
              <TriggerIcon size={20} className={triggerConfig.color.text} />
            </div>
            <h2 id="reflex-config-title" className="text-lg font-semibold text-foreground">
              {isEditMode ? 'Edit Reflex' : 'Create Reflex'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trigger Type Selection (only for new reflexes) */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Trigger Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_TRIGGER_TYPES.map((type) => {
                  const config = TRIGGER_TYPE_CONFIG[type];
                  const Icon = TRIGGER_ICONS[type];
                  const isSelected = formState.triggerType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => handleTriggerTypeChange(type)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-3 rounded-lg border transition-all text-left',
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-card border-border hover:border-foreground/20 hover:bg-muted/50'
                      )}
                    >
                      <Icon
                        size={18}
                        className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                      />
                      <div>
                        <div
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {config.label}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {config.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trigger Configuration */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              {triggerConfig.label} Configuration
            </h3>
            {formState.triggerType === 'webhook' ? (
              <WebhookConfig
                config={formState.triggerConfig as WebhookTriggerConfig}
                onChange={handleTriggerConfigChange}
                webhookUrl={
                  reflex?.triggerType === 'webhook'
                    ? (reflex.triggerConfig as WebhookTriggerConfig).url
                    : undefined
                }
                isNew={!isEditMode}
                onRegenerateSecret={isEditMode ? handleRegenerateSecret : undefined}
              />
            ) : (
              <EventConfig
                triggerType={formState.triggerType}
                config={formState.triggerConfig}
                onChange={handleTriggerConfigChange}
              />
            )}
          </div>

          {/* Conditions Editor */}
          <div className="pt-4 border-t border-border">
            <ConditionsEditor
              value={formState.conditions}
              onChange={handleConditionsChange}
              disabled={isSaving}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <h4 className="text-sm font-medium text-foreground">Active Status</h4>
              <p className="text-xs text-muted-foreground">
                {formState.isActive
                  ? 'Reflex is enabled and will trigger on matching events'
                  : 'Reflex is disabled and will not trigger'}
              </p>
            </div>
            <button
              onClick={() => handleActiveChange(!formState.isActive)}
              disabled={isSaving}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
                formState.isActive ? 'bg-primary' : 'bg-muted',
                isSaving && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={formState.isActive ? 'Deactivate reflex' : 'Activate reflex'}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
                  formState.isActive ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Reflex'}
          </button>
        </div>
      </div>
    </div>
  );
}
