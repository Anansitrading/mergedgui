// Skill Configuration & Approval Component
// Shows proposed config with tags, trigger, scope options and approve/reject buttons

import { useState, useCallback } from 'react';
import { Check, X, Tag, Zap, Globe } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ProposedSkillConfig, SkillTrigger, SkillScope } from '../../../types/skillDraft';

interface SkillConfigApprovalProps {
  config: ProposedSkillConfig;
  status: 'pending' | 'approved' | 'rejected';
  onApprove: (modifications?: Partial<ProposedSkillConfig>) => void;
  onReject: () => void;
}

export function SkillConfigApproval({
  config,
  status,
  onApprove,
  onReject,
}: SkillConfigApprovalProps) {
  const [trigger, setTrigger] = useState<SkillTrigger>(config.suggestedTrigger);
  const [scope, setScope] = useState<SkillScope>(config.suggestedScope);

  const isDisabled = status !== 'pending';

  const handleApprove = useCallback(() => {
    // Pass modifications if user changed trigger or scope
    const modifications: Partial<ProposedSkillConfig> = {};

    if (trigger !== config.suggestedTrigger) {
      modifications.suggestedTrigger = trigger;
    }
    if (scope !== config.suggestedScope) {
      modifications.suggestedScope = scope;
    }

    onApprove(Object.keys(modifications).length > 0 ? modifications : undefined);
  }, [trigger, scope, config, onApprove]);

  return (
    <div
      className={cn(
        'mt-3 p-4 rounded-lg border',
        status === 'approved' && 'border-green-500/50 bg-green-500/10',
        status === 'rejected' && 'border-destructive/50 bg-destructive/10',
        status === 'pending' && 'border-border bg-secondary/50'
      )}
    >
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Skill Configuration & Approval
      </h4>

      {/* Automatic Detection Tags */}
      {config.detectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Tag size={12} />
            <span>Automatic Detection:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.detectedTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-muted text-foreground border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trigger Selection */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Zap size={12} />
          <span>Trigger:</span>
        </div>
        <div className="flex gap-2">
          <RadioOption
            label="Pre-tool use"
            value="pre-tool"
            checked={trigger === 'pre-tool'}
            onChange={() => setTrigger('pre-tool')}
            disabled={isDisabled}
          />
          <RadioOption
            label="Post-tool use"
            value="post-tool"
            checked={trigger === 'post-tool'}
            onChange={() => setTrigger('post-tool')}
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Scope Selection */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Globe size={12} />
          <span>Scope:</span>
        </div>
        <div className="flex gap-2">
          <RadioOption
            label="Global"
            value="global"
            checked={scope === 'global'}
            onChange={() => setScope('global')}
            disabled={isDisabled}
          />
          <RadioOption
            label="Local"
            value="local"
            checked={scope === 'local'}
            onChange={() => setScope('local')}
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Approve/Reject Buttons */}
      <div className="flex gap-2">
        {status === 'pending' ? (
          <>
            <button
              onClick={handleApprove}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
              )}
            >
              <Check size={14} />
              Approve
            </button>
            <button
              onClick={onReject}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                'bg-muted text-foreground border border-border',
                'hover:bg-muted/80 transition-colors'
              )}
            >
              <X size={14} />
              Reject
            </button>
          </>
        ) : (
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
              status === 'approved' && 'text-green-500',
              status === 'rejected' && 'text-destructive'
            )}
          >
            {status === 'approved' ? (
              <>
                <Check size={14} />
                Approved
              </>
            ) : (
              <>
                <X size={14} />
                Rejected
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Radio button option component
interface RadioOptionProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function RadioOption({ label, value, checked, onChange, disabled }: RadioOptionProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors',
        'border',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={cn(
          'w-3.5 h-3.5 rounded-full border-2',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
      >
        {checked && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
          </div>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </label>
  );
}
