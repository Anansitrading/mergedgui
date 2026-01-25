import { useEffect, useCallback, useMemo } from 'react';
import { Info, Code, Lightbulb } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { WizardFormData } from '../../../../hooks/useSkillWizard';

interface PromptConfigStepProps {
  formData: WizardFormData;
  errors: Record<string, string>;
  onUpdateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  onValidate: (valid: boolean) => void;
}

const EXAMPLE_SYSTEM_PROMPTS = [
  'You are a helpful assistant that summarizes text concisely.',
  'You are an expert code reviewer who provides constructive feedback.',
  'You are a professional writer who creates engaging content.',
];

const EXAMPLE_USER_PROMPTS = [
  'Please summarize the following document:\n\n{{document}}',
  'Review this code and provide feedback:\n\n```{{language}}\n{{code}}\n```',
  'Write a blog post about: {{topic}}',
];

export function PromptConfigStep({
  formData,
  errors,
  onUpdateField,
  onValidate,
}: PromptConfigStepProps) {
  // Extract variables from prompt templates
  const extractedVariables = useMemo(() => {
    const template = formData.userPromptTemplate || '';
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
  }, [formData.userPromptTemplate]);

  // Validate step
  const validateStep = useCallback(() => {
    const isValid =
      formData.systemPrompt.trim().length >= 10 &&
      formData.userPromptTemplate.trim().length >= 10;
    onValidate(isValid);
  }, [formData.systemPrompt, formData.userPromptTemplate, onValidate]);

  useEffect(() => {
    validateStep();
  }, [validateStep]);

  const insertVariable = (variable: string) => {
    const currentPrompt = formData.userPromptTemplate;
    const newPrompt = currentPrompt + `{{${variable}}}`;
    onUpdateField('userPromptTemplate', newPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Info size={20} className="text-primary mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">Prompt Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Define how the AI should behave and what instructions to follow.
            Use <code className="px-1 py-0.5 bg-muted rounded text-xs">{'{{variable}}'}</code> syntax for dynamic inputs.
          </p>
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <label htmlFor="system-prompt" className="block text-sm font-medium text-foreground mb-2">
          System Prompt <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Sets the AI&apos;s role and behavior. This is not visible to users.
        </p>
        <textarea
          id="system-prompt"
          value={formData.systemPrompt}
          onChange={(e) => onUpdateField('systemPrompt', e.target.value)}
          placeholder="You are a helpful assistant that..."
          rows={4}
          className={cn(
            'w-full px-4 py-2.5 bg-muted/50 border rounded-lg text-foreground resize-y font-mono text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
            'transition-colors',
            errors.systemPrompt ? 'border-destructive' : 'border-border'
          )}
        />
        {errors.systemPrompt && (
          <span className="text-xs text-destructive mt-1 block">{errors.systemPrompt}</span>
        )}

        {/* Example System Prompts */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb size={12} />
            Quick examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SYSTEM_PROMPTS.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onUpdateField('systemPrompt', example)}
                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded border border-border transition-colors"
              >
                {example.substring(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Prompt Template */}
      <div>
        <label htmlFor="user-prompt" className="block text-sm font-medium text-foreground mb-2">
          User Prompt Template <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          The template for user messages. Use <code className="px-1 py-0.5 bg-muted rounded">{'{{variable_name}}'}</code> for inputs.
        </p>
        <textarea
          id="user-prompt"
          value={formData.userPromptTemplate}
          onChange={(e) => onUpdateField('userPromptTemplate', e.target.value)}
          placeholder="Please help me with {{topic}}..."
          rows={6}
          className={cn(
            'w-full px-4 py-2.5 bg-muted/50 border rounded-lg text-foreground resize-y font-mono text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
            'transition-colors',
            errors.userPromptTemplate ? 'border-destructive' : 'border-border'
          )}
        />
        {errors.userPromptTemplate && (
          <span className="text-xs text-destructive mt-1 block">{errors.userPromptTemplate}</span>
        )}

        {/* Variable Helper */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Insert variable:</span>
          <div className="flex flex-wrap gap-1">
            {['input', 'content', 'text', 'topic', 'code'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="text-xs px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>

        {/* Example User Prompts */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb size={12} />
            Quick examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_USER_PROMPTS.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onUpdateField('userPromptTemplate', example)}
                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded border border-border transition-colors"
              >
                {example.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Variables Preview */}
      {extractedVariables.length > 0 && (
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Code size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Detected Variables ({extractedVariables.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedVariables.map((variable) => (
              <span
                key={variable}
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded"
              >
                {variable}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These will become input fields in the next step.
          </p>
        </div>
      )}
    </div>
  );
}
