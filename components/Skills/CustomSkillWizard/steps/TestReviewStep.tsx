import { useState, useEffect, useCallback } from 'react';
import { Info, Play, CheckCircle2, XCircle, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CATEGORY_COLORS } from '../../../../hooks/useSkills';
import type { WizardFormData } from '../../../../hooks/useSkillWizard';
import type { ExecuteSkillResponse } from '../../../../types/skills';

interface TestReviewStepProps {
  formData: WizardFormData;
  isTesting: boolean;
  testResult: ExecuteSkillResponse | null;
  onTest: (testInputs: Record<string, unknown>) => Promise<void>;
  onValidate: (valid: boolean) => void;
}

export function TestReviewStep({
  formData,
  isTesting,
  testResult,
  onTest,
  onValidate,
}: TestReviewStepProps) {
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Initialize test inputs from schema
  useEffect(() => {
    const initialInputs: Record<string, string> = {};
    formData.inputSchema.forEach((field) => {
      initialInputs[field.name] = '';
    });
    setTestInputs(initialInputs);
  }, [formData.inputSchema]);

  // Validate step - valid when all required test inputs are filled
  const validateStep = useCallback(() => {
    const requiredFieldsFilled = formData.inputSchema
      .filter(f => f.required)
      .every(f => testInputs[f.name]?.trim().length > 0);
    onValidate(requiredFieldsFilled || formData.inputSchema.length === 0);
  }, [formData.inputSchema, testInputs, onValidate]);

  useEffect(() => {
    validateStep();
  }, [validateStep]);

  const handleTest = async () => {
    const inputs: Record<string, unknown> = {};
    formData.inputSchema.forEach((field) => {
      const value = testInputs[field.name];
      switch (field.type) {
        case 'number':
          inputs[field.name] = parseFloat(value) || 0;
          break;
        case 'boolean':
          inputs[field.name] = value === 'true';
          break;
        case 'array':
          inputs[field.name] = value.split(',').map(v => v.trim()).filter(Boolean);
          break;
        case 'object':
          try {
            inputs[field.name] = JSON.parse(value);
          } catch {
            inputs[field.name] = {};
          }
          break;
        default:
          inputs[field.name] = value;
      }
    });
    await onTest(inputs);
  };

  const handleCopy = async () => {
    if (testResult?.output) {
      await navigator.clipboard.writeText(testResult.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categoryColors = CATEGORY_COLORS[formData.category];

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Info size={20} className="text-primary mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">Test & Review</h3>
          <p className="text-sm text-muted-foreground">
            Review your skill configuration and test it before saving. Make sure everything works as expected.
          </p>
        </div>
      </div>

      {/* Skill Summary Card */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl text-2xl">
            {formData.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{formData.name || 'Untitled Skill'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formData.description || 'No description provided'}
            </p>
          </div>
          <span
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-full capitalize',
              categoryColors.bg,
              categoryColors.text
            )}
          >
            {formData.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <span className="text-xs text-muted-foreground">Model</span>
            <p className="text-sm font-medium text-foreground">{formData.model}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Temperature</span>
            <p className="text-sm font-medium text-foreground">{formData.temperature}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Max Tokens</span>
            <p className="text-sm font-medium text-foreground">{formData.maxTokens}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Output Format</span>
            <p className="text-sm font-medium text-foreground capitalize">{formData.outputFormat}</p>
          </div>
        </div>
      </div>

      {/* Prompts Preview */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Prompts</h4>

        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">System Prompt</span>
          <p className="text-sm text-foreground mt-1 font-mono whitespace-pre-wrap">
            {formData.systemPrompt || 'No system prompt'}
          </p>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">User Prompt Template</span>
          <p className="text-sm text-foreground mt-1 font-mono whitespace-pre-wrap">
            {formData.userPromptTemplate || 'No user prompt'}
          </p>
        </div>
      </div>

      {/* Test Section */}
      {formData.inputSchema.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            Test Your Skill
          </h4>

          {/* Test Inputs */}
          <div className="p-4 bg-card border border-border rounded-lg space-y-4">
            {formData.inputSchema.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {field.name}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
                )}
                {field.type === 'boolean' ? (
                  <select
                    value={testInputs[field.name] || 'false'}
                    onChange={(e) => setTestInputs({ ...testInputs, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <textarea
                    value={testInputs[field.name] || ''}
                    onChange={(e) => setTestInputs({ ...testInputs, [field.name]: e.target.value })}
                    placeholder={`Enter ${field.name}...`}
                    rows={field.type === 'object' ? 4 : 2}
                    className={cn(
                      'w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm resize-y',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                      field.type === 'object' && 'font-mono'
                    )}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleTest}
              disabled={isTesting}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
                'bg-primary hover:bg-primary/90 text-primary-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isTesting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Run Test
                </>
              )}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={cn(
                'p-4 border rounded-lg',
                testResult.status === 'completed'
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-destructive/5 border-destructive/20'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {testResult.status === 'completed' ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <XCircle size={18} className="text-destructive" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      testResult.status === 'completed' ? 'text-green-500' : 'text-destructive'
                    )}
                  >
                    {testResult.status === 'completed' ? 'Test Successful' : 'Test Failed'}
                  </span>
                </div>
                {testResult.output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>

              {testResult.output && (
                <div className="p-3 bg-card rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                    {testResult.output}
                  </pre>
                </div>
              )}

              {testResult.error && (
                <p className="text-sm text-destructive mt-2">{testResult.error}</p>
              )}

              {testResult.tokensUsed && (
                <p className="text-xs text-muted-foreground mt-2">
                  Tokens used: {testResult.tokensUsed} | Duration: {testResult.durationMs}ms
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* No inputs message */}
      {formData.inputSchema.length === 0 && (
        <div className="p-4 bg-muted/30 border border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            This skill has no input fields. You can test it after creation.
          </p>
        </div>
      )}

      {/* Ready to Save */}
      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
        <CheckCircle2 size={20} className="text-green-500" />
        <div>
          <p className="text-sm font-medium text-foreground">Ready to save</p>
          <p className="text-xs text-muted-foreground">
            Click &quot;Create Skill&quot; below to save your skill to your library.
          </p>
        </div>
      </div>
    </div>
  );
}
