/**
 * Step 5: Review & Confirmation
 * Final step before starting project ingestion
 * Displays summary of all settings and handles submission
 */

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Pencil,
  Rocket,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  FolderGit2,
  FileText,
  Users,
  Settings2,
  Calculator,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type {
  ProjectCreationForm,
  ProjectCreationStep,
  ReviewWarning,
  CostEstimate,
  ChunkingStrategy,
  ProjectType,
  GitProvider,
} from '../../../types/project';
import {
  CHUNKING_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  METADATA_OPTION_LABELS,
  ROLE_DEFINITIONS,
} from '../../../types/project';
import {
  calculateCostEstimate,
  formatCostFromCents,
  formatCompactNumber,
  formatTokens,
  formatCompression,
  getChunkingDescription,
} from '../../../utils/costEstimation';

// =============================================================================
// Types
// =============================================================================

interface Step5ReviewConfirmationProps {
  formData: ProjectCreationForm;
  onEditStep: (step: ProjectCreationStep) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

// =============================================================================
// Sub-Components
// =============================================================================

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  stepId: ProjectCreationStep;
  onEdit: (step: ProjectCreationStep) => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

function ReviewSection({
  title,
  icon,
  stepId,
  onEdit,
  children,
  defaultExpanded = true,
  badge,
}: ReviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/30">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left flex-1"
        >
          <div className="text-muted-foreground">{icon}</div>
          <span className="font-medium text-foreground">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {badge}
            </span>
          )}
          <span className="text-muted-foreground ml-auto mr-2">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors"
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-border">{children}</div>
      )}
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  muted?: boolean;
}

function ReviewItem({ label, value, icon, muted = false }: ReviewItemProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          'text-sm text-right',
          muted ? 'text-muted-foreground' : 'text-foreground font-medium'
        )}
      >
        {value}
      </div>
    </div>
  );
}

interface EstimateBadgeProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'success' | 'warning';
}

function EstimateBadge({
  label,
  value,
  subtext,
  variant = 'default',
}: EstimateBadgeProps) {
  const variantClasses = {
    default: 'bg-muted/50 text-foreground',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className={cn('px-4 py-3 rounded-lg', variantClasses[variant])}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}

interface CostEstimateSectionProps {
  estimate: CostEstimate;
}

function CostEstimateSection({ estimate }: CostEstimateSectionProps) {
  const reductionPercent = Math.round((1 - estimate.compressionRatio) * 100);

  return (
    <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-4">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        <Calculator size={16} />
        Estimated costs
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <EstimateBadge
          label="Processing"
          value={estimate.isPlanEligible ? 'Included' : formatCostFromCents(estimate.processingCost)}
          variant={estimate.isPlanEligible ? 'success' : 'default'}
        />
        <EstimateBadge
          label="Storage/month"
          value={estimate.storageCostMonthly === 0 ? 'Free' : formatCostFromCents(estimate.storageCostMonthly)}
          variant={estimate.storageCostMonthly === 0 ? 'success' : 'default'}
        />
        <EstimateBadge
          label="Savings"
          value={`${Math.round(estimate.savingsVsRaw)}%`}
          subtext="vs raw context"
          variant="success"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles size={12} className="text-primary" />
        <span>
          {formatCompactNumber(estimate.totalTokens)} tokens compressed to{' '}
          {formatCompactNumber(estimate.optimizedTokens)} ({reductionPercent}% smaller)
        </span>
      </div>
    </div>
  );
}

interface ValidationWarningsProps {
  warnings: ReviewWarning[];
  onEditStep: (step: ProjectCreationStep) => void;
}

function ValidationWarnings({ warnings, onEditStep }: ValidationWarningsProps) {
  if (warnings.length === 0) return null;

  const errors = warnings.filter((w) => w.severity === 'error');
  const warns = warnings.filter((w) => w.severity === 'warning');
  const infos = warnings.filter((w) => w.severity === 'info');

  return (
    <div className="space-y-2">
      {errors.map((warning, index) => (
        <div
          key={`error-${index}`}
          className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-destructive font-medium">{warning.message}</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(warning.step)}
            className="text-xs text-destructive hover:underline shrink-0"
          >
            Fix
          </button>
        </div>
      ))}
      {warns.map((warning, index) => (
        <div
          key={`warn-${index}`}
          className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
        >
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-amber-700 dark:text-amber-400">
            {warning.message}
          </div>
        </div>
      ))}
      {infos.map((warning, index) => (
        <div
          key={`info-${index}`}
          className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-blue-700 dark:text-blue-400">
            {warning.message}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getProjectTypeLabel(type: ProjectType | null): string {
  const labels: Record<ProjectType, string> = {
    repository: 'Repository',
    files: 'Files',
    manual: 'Manual',
  };
  return type ? labels[type] : 'Not selected';
}

function getProviderIcon(provider: GitProvider): string {
  const icons: Record<GitProvider, string> = {
    github: 'GitHub',
    gitlab: 'GitLab',
    bitbucket: 'Bitbucket',
    azure: 'Azure DevOps',
  };
  return icons[provider] || provider;
}

function getEnabledMetadataOptions(options: ProjectCreationForm['metadataOptions']): string[] {
  const enabled: string[] = [];
  const labels = METADATA_OPTION_LABELS;

  if (options.functionSignatures) enabled.push('Function signatures');
  if (options.importDependencies) enabled.push('Import dependencies');
  if (options.gitHistory) enabled.push('Git history');
  if (options.fileStructure) enabled.push('File structure');
  if (options.customAnnotations) enabled.push('Custom annotations');

  return enabled;
}

function getRoleSummary(members: ProjectCreationForm['members']): string {
  if (members.length === 0) return 'No team members';

  const roleCounts = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const parts = Object.entries(roleCounts).map(([role, count]) => {
    const roleLabel = ROLE_DEFINITIONS.find((r) => r.role === role)?.label || role;
    return `${count} ${roleLabel}`;
  });

  return parts.join(', ');
}

function validateFormData(formData: ProjectCreationForm): ReviewWarning[] {
  const warnings: ReviewWarning[] = [];

  // Check project type
  if (!formData.projectType) {
    warnings.push({
      step: 'type_selection',
      field: 'projectType',
      message: 'Select a project type to continue',
      severity: 'error',
    });
  }

  // Check project name
  if (!formData.name.trim()) {
    warnings.push({
      step: 'basic_info',
      field: 'name',
      message: 'Enter a project name',
      severity: 'error',
    });
  }

  // Check source configuration
  if (formData.projectType === 'repository' && formData.repositories.length === 0) {
    warnings.push({
      step: 'source_config',
      field: 'repositories',
      message: 'Add at least one repository',
      severity: 'error',
    });
  }

  if (formData.projectType === 'files' && (!formData.files || formData.files.length === 0)) {
    warnings.push({
      step: 'source_config',
      field: 'files',
      message: 'Upload at least one file',
      severity: 'error',
    });
  }

  if (formData.projectType === 'manual' && !formData.manualContent?.trim()) {
    warnings.push({
      step: 'source_config',
      field: 'manualContent',
      message: 'Enter manual content',
      severity: 'error',
    });
  }

  // Info: No team members
  if (formData.members.length === 0) {
    warnings.push({
      step: 'team_setup',
      field: 'members',
      message: 'This project has no team members. You can add team members later.',
      severity: 'info',
    });
  }

  return warnings;
}

// =============================================================================
// Main Component
// =============================================================================

export function Step5ReviewConfirmation({
  formData,
  onEditStep,
  onSubmit,
  isSubmitting,
  submitError,
}: Step5ReviewConfirmationProps) {
  // Calculate cost estimate
  const costEstimate = useMemo(
    () => calculateCostEstimate(formData),
    [formData]
  );

  // Validate form data
  const warnings = useMemo(() => validateFormData(formData), [formData]);

  const hasErrors = warnings.some((w) => w.severity === 'error');
  const canSubmit = !hasErrors && !isSubmitting;

  // Get enabled metadata options summary
  const enabledMetadata = useMemo(
    () => getEnabledMetadataOptions(formData.metadataOptions),
    [formData.metadataOptions]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardCheck size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Review project settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Review your settings before starting processing
          </p>
        </div>
      </div>

      {/* Validation Warnings */}
      <ValidationWarnings warnings={warnings} onEditStep={onEditStep} />

      {/* Submit Error */}
      {submitError && (
        <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-destructive">{submitError}</div>
        </div>
      )}

      {/* Project Details Section */}
      <ReviewSection
        title="Project Details"
        icon={<FileText size={18} />}
        stepId="basic_info"
        onEdit={onEditStep}
      >
        <ReviewItem label="Name" value={formData.name || '—'} />
        <ReviewItem
          label="Type"
          value={getProjectTypeLabel(formData.projectType)}
        />
        <ReviewItem
          label="Description"
          value={formData.description || '—'}
          muted={!formData.description}
        />
        <ReviewItem
          label="Privacy"
          value={
            <span className="flex items-center gap-1.5">
              {formData.privacy === 'private' ? (
                <>
                  <Lock size={14} />
                  Private
                </>
              ) : (
                <>
                  <Globe size={14} />
                  Shared
                </>
              )}
            </span>
          }
        />
      </ReviewSection>

      {/* Source Configuration Section */}
      {formData.projectType === 'repository' && (
        <ReviewSection
          title="Repositories"
          icon={<FolderGit2 size={18} />}
          stepId="source_config"
          onEdit={onEditStep}
          badge={`${formData.repositories.length} selected`}
        >
          {formData.repositories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No repositories added
            </p>
          ) : (
            <div className="space-y-2">
              {formData.repositories.map((repo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <FolderGit2 size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {repo.url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getProviderIcon(repo.provider)} • Branch: {repo.branch}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ReviewSection>
      )}

      {formData.projectType === 'files' && (
        <ReviewSection
          title="Files"
          icon={<FileText size={18} />}
          stepId="source_config"
          onEdit={onEditStep}
          badge={`${formData.files?.length || 0} files`}
        >
          {!formData.files || formData.files.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No files uploaded
            </p>
          ) : (
            <div className="space-y-2">
              {formData.files.slice(0, 5).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                >
                  <FileText size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
              {formData.files.length > 5 && (
                <p className="text-xs text-muted-foreground pl-2">
                  +{formData.files.length - 5} more files
                </p>
              )}
            </div>
          )}
        </ReviewSection>
      )}

      {formData.projectType === 'manual' && (
        <ReviewSection
          title="Manual Content"
          icon={<FileText size={18} />}
          stepId="source_config"
          onEdit={onEditStep}
        >
          {!formData.manualContent ? (
            <p className="text-sm text-muted-foreground italic">
              No content entered
            </p>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">
                {formData.manualContent}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.manualContent.length} characters
              </p>
            </div>
          )}
        </ReviewSection>
      )}

      {/* Team Access Section */}
      <ReviewSection
        title="Team Access"
        icon={<Users size={18} />}
        stepId="team_setup"
        onEdit={onEditStep}
        badge={formData.members.length > 0 ? `${formData.members.length} members` : undefined}
      >
        <ReviewItem
          label="Team members"
          value={getRoleSummary(formData.members)}
          muted={formData.members.length === 0}
        />
        <ReviewItem
          label="Default notifications"
          value={
            formData.defaultNotificationLevel === 'real-time'
              ? 'Real-time'
              : formData.defaultNotificationLevel === 'daily'
              ? 'Daily'
              : formData.defaultNotificationLevel === 'weekly'
              ? 'Weekly'
              : 'Disabled'
          }
        />
      </ReviewSection>

      {/* Advanced Settings Section */}
      <ReviewSection
        title="Advanced Settings"
        icon={<Settings2 size={18} />}
        stepId="settings"
        onEdit={onEditStep}
        defaultExpanded={false}
      >
        <ReviewItem
          label="Chunking strategy"
          value={getChunkingDescription(formData.chunkingStrategy)}
        />
        <ReviewItem
          label="Output format"
          value={
            OUTPUT_FORMAT_OPTIONS.find((o) => o.value === formData.outputFormat)?.label ||
            formData.outputFormat
          }
        />
        <ReviewItem
          label="Metadata extraction"
          value={
            enabledMetadata.length > 0 ? (
              <span className="text-xs">{enabledMetadata.join(', ')}</span>
            ) : (
              'None'
            )
          }
          muted={enabledMetadata.length === 0}
        />
        <ReviewItem
          label="Anonymize secrets"
          value={
            formData.processingOptions.anonymizeSecrets ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={14} />
                Aan
              </span>
            ) : (
              'Uit'
            )
          }
        />
        <ReviewItem
          label="Parallel processing"
          value={formData.processingOptions.parallelProcessing ? 'On' : 'Off'}
        />
      </ReviewSection>

      {/* Cost Estimate Section */}
      <CostEstimateSection estimate={costEstimate} />

      {/* Footer with action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => onEditStep('settings')}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg shadow-lg transition-all',
            canSubmit
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
              : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating project...</span>
            </>
          ) : (
            <>
              <Rocket size={16} />
              <span>Create & start</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Step5ReviewConfirmation;
