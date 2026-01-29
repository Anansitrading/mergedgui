import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Search,
  GitBranch,
  Lock,
  Globe,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// GitHub icon component (lucide-react deprecated theirs)
function GitHubIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

/** Source type for project creation */
export type ProjectSourceType = 'github' | 'empty';

/** GitHub repository data */
export interface GitHubRepo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  defaultBranch: string;
  isPrivate: boolean;
  url: string;
  updatedAt: Date;
}

/** Form data for the simplified project creation */
export interface SimpleProjectCreationForm {
  name: string;
  sourceType: ProjectSourceType | null;
  githubRepo?: GitHubRepo;
}

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: SimpleProjectCreationForm) => void;
  existingProjectNames?: string[];
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'error';
type Step = 'name' | 'source' | 'github-select';

// =============================================================================
// Constants
// =============================================================================

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const DEBOUNCE_DELAY = 300;

// Mock GitHub repos for demo (in production, these come from OAuth callback)
const MOCK_GITHUB_REPOS: GitHubRepo[] = [
  {
    id: '1',
    owner: 'acme-corp',
    name: 'frontend-app',
    fullName: 'acme-corp/frontend-app',
    description: 'Main frontend application built with React',
    defaultBranch: 'main',
    isPrivate: false,
    url: 'https://github.com/acme-corp/frontend-app',
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    owner: 'acme-corp',
    name: 'backend-api',
    fullName: 'acme-corp/backend-api',
    description: 'REST API backend service',
    defaultBranch: 'main',
    isPrivate: true,
    url: 'https://github.com/acme-corp/backend-api',
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    owner: 'acme-corp',
    name: 'shared-utils',
    fullName: 'acme-corp/shared-utils',
    description: 'Shared utility functions and components',
    defaultBranch: 'develop',
    isPrivate: true,
    url: 'https://github.com/acme-corp/shared-utils',
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    owner: 'personal',
    name: 'side-project',
    fullName: 'personal/side-project',
    description: 'Personal side project',
    defaultBranch: 'main',
    isPrivate: false,
    url: 'https://github.com/personal/side-project',
    updatedAt: new Date('2024-01-05'),
  },
];

// =============================================================================
// Validation Functions
// =============================================================================

function validateProjectName(
  name: string
): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Project name is required' };
  }

  if (trimmed.length < NAME_MIN_LENGTH) {
    return { valid: false, error: `Minimum ${NAME_MIN_LENGTH} characters required` };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `Maximum ${NAME_MAX_LENGTH} characters allowed` };
  }

  return { valid: true };
}

function generateVariant(name: string): string {
  const match = name.match(/^(.+?)\s*(\d+)$/);
  if (match) {
    const base = match[1];
    const num = parseInt(match[2], 10);
    return `${base} ${num + 1}`;
  }
  return `${name} 2`;
}

async function checkDuplicateName(
  name: string,
  existingNames: string[]
): Promise<{ exists: boolean; suggestion?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const normalizedName = name.toLowerCase().trim();
  const exists = existingNames.some(
    existing => existing.toLowerCase().trim() === normalizedName
  );

  if (exists) {
    return {
      exists: true,
      suggestion: generateVariant(name),
    };
  }

  return { exists: false };
}

// =============================================================================
// Custom Hooks
// =============================================================================

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

// =============================================================================
// Sub-Components
// =============================================================================

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i === currentStep - 1
              ? 'w-6 bg-primary'
              : i < currentStep - 1
                ? 'w-1.5 bg-primary/60'
                : 'w-1.5 bg-muted'
          )}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

// =============================================================================
// Step 1: Project Name
// =============================================================================

interface Step1NameProps {
  value: string;
  onChange: (value: string) => void;
  validationState: ValidationState;
  error?: string;
  suggestion?: string;
  onUseSuggestion: (suggestion: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  canSubmit: boolean;
}

function Step1Name({
  value,
  onChange,
  validationState,
  error,
  suggestion,
  onUseSuggestion,
  inputRef,
  onSubmit,
  canSubmit,
}: Step1NameProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Name your project
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose a name that describes what this project is about
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-foreground"
        >
          Project name <span className="text-destructive">*</span>
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            id="project-name"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="E.g. Marketing site refactor"
            maxLength={NAME_MAX_LENGTH}
            className={cn(
              'w-full px-4 py-3 bg-muted/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-all pr-10',
              validationState === 'error'
                ? 'border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/20'
                : validationState === 'valid'
                  ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20'
                  : 'border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20'
            )}
            aria-describedby="name-helper name-error"
            aria-invalid={validationState === 'error'}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationState === 'validating' && (
              <Loader2 size={18} className="text-muted-foreground animate-spin" />
            )}
            {validationState === 'valid' && (
              <Check size={18} className="text-green-500" />
            )}
            {validationState === 'error' && (
              <AlertCircle size={18} className="text-destructive" />
            )}
          </div>
        </div>

        {validationState === 'error' && error ? (
          <div id="name-error" className="flex items-start gap-2">
            <p className="text-sm text-destructive">{error}</p>
            {suggestion && (
              <button
                type="button"
                onClick={() => onUseSuggestion(suggestion)}
                className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 whitespace-nowrap"
              >
                Use "{suggestion}"
              </button>
            )}
          </div>
        ) : (
          <p id="name-helper" className="text-xs text-muted-foreground">
            Min {NAME_MIN_LENGTH} characters, max {NAME_MAX_LENGTH} characters
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Step 2: Source Selection
// =============================================================================

interface Step2SourceProps {
  selectedSource: ProjectSourceType | null;
  onSelectSource: (source: ProjectSourceType) => void;
}

function Step2Source({ selectedSource, onSelectSource }: Step2SourceProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Choose your project source
        </h3>
        <p className="text-sm text-muted-foreground">
          Start from an existing codebase or create a blank workspace
        </p>
      </div>

      <div className="space-y-4">
        {/* GitHub Option */}
        <button
          type="button"
          onClick={() => onSelectSource('github')}
          className={cn(
            'w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left group',
            selectedSource === 'github'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
          )}
        >
          <div
            className={cn(
              'p-3 rounded-xl transition-colors shrink-0',
              selectedSource === 'github'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
            )}
          >
            <GitHubIcon size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground">Load GitHub repo</p>
              {selectedSource === 'github' && (
                <Check size={18} className="text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Connect an existing GitHub repository as the basis for this project.
              Your code will be indexed and ready to query.
            </p>
          </div>
        </button>

        {/* Empty Project Option */}
        <button
          type="button"
          onClick={() => onSelectSource('empty')}
          className={cn(
            'w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left group',
            selectedSource === 'empty'
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
          )}
        >
          <div
            className={cn(
              'p-3 rounded-xl transition-colors shrink-0',
              selectedSource === 'empty'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
            )}
          >
            <FileText size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-foreground">Start with empty project</p>
              {selectedSource === 'empty' && (
                <Check size={18} className="text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Begin with a blank workspace and build your project from scratch.
              You can connect a repository later from project settings.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// GitHub Repository Selection
// =============================================================================

interface GitHubRepoSelectProps {
  repos: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  onSelectRepo: (repo: GitHubRepo) => void;
  isLoading: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  onConnect: () => void;
}

function GitHubRepoSelect({
  repos,
  selectedRepo,
  onSelectRepo,
  isLoading,
  isConnecting,
  isConnected,
  onConnect,
}: GitHubRepoSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter(
      repo =>
        repo.name.toLowerCase().includes(query) ||
        repo.fullName.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query)
    );
  }, [repos, searchQuery]);

  // Show connect button if not connected
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Connect to GitHub
          </h3>
          <p className="text-sm text-muted-foreground">
            Authorize Kijko to access your GitHub repositories
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-8">
          <div className="p-4 bg-muted/50 rounded-full">
            <GitHubIcon size={48} className="text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className={cn(
              'flex items-center gap-3 px-6 py-3 bg-[#24292e] text-white rounded-lg font-medium transition-all',
              isConnecting
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-[#1b1f23] shadow-lg hover:shadow-xl'
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GitHubIcon size={20} />
                Connect GitHub Account
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            We'll open a popup to authorize access. You can revoke access anytime from your GitHub settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Select a repository
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose which repository you want to import
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search repositories..."
          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Repository List */}
      <div className="max-h-80 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No repositories found</p>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <button
              key={repo.id}
              type="button"
              onClick={() => onSelectRepo(repo)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left',
                selectedRepo?.id === repo.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted/50 border border-transparent'
              )}
            >
              <GitBranch
                size={18}
                className={cn(
                  'mt-0.5 shrink-0',
                  selectedRepo?.id === repo.id ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{repo.fullName}</p>
                  {repo.isPrivate ? (
                    <Lock size={14} className="text-muted-foreground shrink-0" />
                  ) : (
                    <Globe size={14} className="text-muted-foreground shrink-0" />
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {repo.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Default branch: {repo.defaultBranch}
                </p>
              </div>
              {selectedRepo?.id === repo.id && (
                <Check size={18} className="text-primary shrink-0 mt-0.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProjectCreationModal({
  isOpen,
  onClose,
  onCreate,
  existingProjectNames = [],
}: ProjectCreationModalProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('name');

  // Form state
  const [projectName, setProjectName] = useState('');
  const [sourceType, setSourceType] = useState<ProjectSourceType | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  // Validation state
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [suggestion, setSuggestion] = useState<string | undefined>();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // GitHub OAuth state
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Debounced name
  const debouncedName = useDebounce(projectName, DEBOUNCE_DELAY);

  // Compute current step number for indicator
  const stepNumber = currentStep === 'name' ? 1 : 2;
  const totalSteps = 2;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('name');
      setProjectName('');
      setSourceType(null);
      setSelectedRepo(null);
      setValidationState('idle');
      setValidationError(undefined);
      setSuggestion(undefined);
      setHasInteracted(false);
      setIsDirty(false);
      setIsSubmitting(false);
      setIsGitHubConnected(false);
      setIsConnecting(false);
      setIsLoadingRepos(false);
      setGithubRepos([]);

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Validate name when debounced value changes
  useEffect(() => {
    async function validate() {
      if (!debouncedName.trim() || !hasInteracted) {
        setValidationState('idle');
        setValidationError(undefined);
        setSuggestion(undefined);
        return;
      }

      const basicResult = validateProjectName(debouncedName);
      if (!basicResult.valid) {
        setValidationState('error');
        setValidationError(basicResult.error);
        setSuggestion(undefined);
        return;
      }

      setValidationState('validating');
      try {
        const duplicateResult = await checkDuplicateName(debouncedName, existingProjectNames);
        if (duplicateResult.exists) {
          setValidationState('error');
          setValidationError(`"${debouncedName}" already exists`);
          setSuggestion(duplicateResult.suggestion);
        } else {
          setValidationState('valid');
          setValidationError(undefined);
          setSuggestion(undefined);
        }
      } catch {
        setValidationState('valid');
        setValidationError(undefined);
        setSuggestion(undefined);
      }
    }

    validate();
  }, [debouncedName, existingProjectNames, hasInteracted]);

  // Handle keyboard events
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

  // Form handlers
  const handleNameChange = useCallback((name: string) => {
    setProjectName(name);
    setHasInteracted(true);
    setIsDirty(true);
  }, []);

  const handleUseSuggestion = useCallback((suggestedName: string) => {
    setProjectName(suggestedName);
    setHasInteracted(true);
    setIsDirty(true);
  }, []);

  const handleSourceSelect = useCallback((source: ProjectSourceType) => {
    setSourceType(source);
    setIsDirty(true);
  }, []);

  const handleRepoSelect = useCallback((repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsDirty(true);
  }, []);

  // Navigation
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  const handleBack = useCallback(() => {
    if (currentStep === 'source') {
      setCurrentStep('name');
    } else if (currentStep === 'github-select') {
      setCurrentStep('source');
      setSelectedRepo(null);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep === 'name') {
      setCurrentStep('source');
    } else if (currentStep === 'source' && sourceType === 'github') {
      setCurrentStep('github-select');
    }
  }, [currentStep, sourceType]);

  // GitHub OAuth connection (simulated)
  const handleGitHubConnect = useCallback(async () => {
    setIsConnecting(true);

    // Simulate OAuth popup and connection
    // In production, this would open a popup window for OAuth flow
    // and use postMessage to communicate the result back
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsGitHubConnected(true);
    setIsConnecting(false);
    setIsLoadingRepos(true);

    // Simulate fetching repos
    await new Promise(resolve => setTimeout(resolve, 800));
    setGithubRepos(MOCK_GITHUB_REPOS);
    setIsLoadingRepos(false);
  }, []);

  // Create project
  const handleCreateProject = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const formData: SimpleProjectCreationForm = {
        name: projectName.trim(),
        sourceType,
        githubRepo: selectedRepo || undefined,
      };

      // Call parent onCreate handler
      onCreate(formData);

      // Modal will be closed by parent after navigation
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsSubmitting(false);
    }
  }, [projectName, sourceType, selectedRepo, onCreate]);

  // Validation for buttons
  const isNameValid = useMemo(() => {
    return (
      projectName.trim().length >= NAME_MIN_LENGTH &&
      projectName.trim().length <= NAME_MAX_LENGTH &&
      validationState !== 'validating' &&
      validationState !== 'error'
    );
  }, [projectName, validationState]);

  const canProceedFromSource = sourceType !== null;

  const canCreateProject = useMemo(() => {
    if (sourceType === 'empty') return true;
    if (sourceType === 'github') return selectedRepo !== null;
    return false;
  }, [sourceType, selectedRepo]);

  // Get modal title
  const getModalTitle = () => {
    switch (currentStep) {
      case 'name':
        return 'Create new project';
      case 'source':
        return 'Create new project';
      case 'github-select':
        return 'Select repository';
      default:
        return 'Create new project';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-card border border-border rounded-xl shadow-2xl mx-4 overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderPlus size={20} className="text-primary" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                {getModalTitle()}
              </h2>
              <StepIndicator currentStep={stepNumber} totalSteps={totalSteps} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'name' && (
            <Step1Name
              value={projectName}
              onChange={handleNameChange}
              validationState={validationState}
              error={validationError}
              suggestion={suggestion}
              onUseSuggestion={handleUseSuggestion}
              inputRef={inputRef}
              onSubmit={handleNext}
              canSubmit={isNameValid}
            />
          )}

          {currentStep === 'source' && (
            <Step2Source
              selectedSource={sourceType}
              onSelectSource={handleSourceSelect}
            />
          )}

          {currentStep === 'github-select' && (
            <GitHubRepoSelect
              repos={githubRepos}
              selectedRepo={selectedRepo}
              onSelectRepo={handleRepoSelect}
              isLoading={isLoadingRepos}
              isConnecting={isConnecting}
              isConnected={isGitHubConnected}
              onConnect={handleGitHubConnect}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
          {currentStep === 'name' ? (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          {/* Primary action button */}
          {currentStep === 'name' && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isNameValid}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-lg transition-all',
                isNameValid
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
              )}
            >
              {validationState === 'validating' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )}

          {currentStep === 'source' && sourceType === 'github' && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedFromSource}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-lg transition-all',
                canProceedFromSource
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
              )}
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          )}

          {currentStep === 'source' && sourceType === 'empty' && (
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={isSubmitting}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-lg transition-all',
                'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30',
                isSubmitting && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Project</span>
                  <Check size={16} />
                </>
              )}
            </button>
          )}

          {currentStep === 'github-select' && isGitHubConnected && (
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={!canCreateProject || isSubmitting}
              className={cn(
                'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-lg transition-all',
                canCreateProject && !isSubmitting
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Use this repo</span>
                  <Check size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-export the old ProjectCreationForm type for backward compatibility
export type { SimpleProjectCreationForm as ProjectCreationForm };
