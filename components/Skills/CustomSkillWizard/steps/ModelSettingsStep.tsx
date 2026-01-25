import { useEffect, useCallback } from 'react';
import { Info, ChevronDown, Cpu, Thermometer, Hash, FileText } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { WizardFormData } from '../../../../hooks/useSkillWizard';
import type { SkillOutputFormat } from '../../../../types/skills';

interface ModelSettingsStepProps {
  formData: WizardFormData;
  errors: Record<string, string>;
  onUpdateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  onValidate: (valid: boolean) => void;
}

const AVAILABLE_MODELS = [
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best balance of speed and quality' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most powerful, for complex tasks' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fastest, for simple tasks' },
  { value: 'gpt-4', label: 'GPT-4', description: 'OpenAI flagship model' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Faster GPT-4 variant' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google AI model' },
];

const OUTPUT_FORMATS: { value: SkillOutputFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'markdown', label: 'Markdown', icon: <FileText size={14} /> },
  { value: 'text', label: 'Plain Text', icon: <FileText size={14} /> },
  { value: 'json', label: 'JSON', icon: <FileText size={14} /> },
  { value: 'html', label: 'HTML', icon: <FileText size={14} /> },
  { value: 'code', label: 'Code', icon: <FileText size={14} /> },
];

export function ModelSettingsStep({
  formData,
  errors,
  onUpdateField,
  onValidate,
}: ModelSettingsStepProps) {
  // Validate step - always valid with defaults
  const validateStep = useCallback(() => {
    const isValid =
      formData.model.length > 0 &&
      formData.temperature >= 0 &&
      formData.temperature <= 1 &&
      formData.maxTokens >= 1 &&
      formData.maxTokens <= 8192;
    onValidate(isValid);
  }, [formData.model, formData.temperature, formData.maxTokens, onValidate]);

  useEffect(() => {
    validateStep();
  }, [validateStep]);

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Info size={20} className="text-primary mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">Model Settings</h3>
          <p className="text-sm text-muted-foreground">
            Choose the AI model and configure its behavior. These settings affect response quality and style.
          </p>
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Cpu size={16} className="text-primary" />
          AI Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_MODELS.map((model) => (
            <button
              key={model.value}
              type="button"
              onClick={() => onUpdateField('model', model.value)}
              className={cn(
                'p-4 text-left border rounded-lg transition-all',
                formData.model === model.value
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                  : 'bg-card border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium text-foreground">{model.label}</span>
              <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Temperature Slider */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Thermometer size={16} className="text-primary" />
          Temperature: {formData.temperature.toFixed(2)}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={formData.temperature}
            onChange={(e) => onUpdateField('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex flex-col items-start">
              <span className="font-medium">0.0</span>
              <span>Deterministic</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="font-medium">0.5</span>
              <span>Balanced</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="font-medium">1.0</span>
              <span>Creative</span>
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Lower values = more focused and consistent. Higher values = more creative and varied.
        </p>
      </div>

      {/* Max Tokens */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Hash size={16} className="text-primary" />
          Max Tokens
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="8192"
            value={formData.maxTokens}
            onChange={(e) => onUpdateField('maxTokens', Math.min(8192, Math.max(1, parseInt(e.target.value) || 1)))}
            className={cn(
              'w-32 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50'
            )}
          />
          <div className="flex gap-2">
            {[1024, 2048, 4096, 8192].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdateField('maxTokens', value)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-lg transition-colors',
                  formData.maxTokens === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {value >= 1000 ? `${value / 1000}k` : value}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum length of the AI response. 1 token ≈ 4 characters.
        </p>
      </div>

      {/* Output Format */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <FileText size={16} className="text-primary" />
          Output Format
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onUpdateField('outputFormat', format.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                formData.outputFormat === format.value
                  ? 'bg-primary/10 border-primary text-foreground'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              )}
            >
              {format.icon}
              {format.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          How the output should be formatted and displayed.
        </p>
      </div>

      {/* Settings Summary */}
      <div className="p-4 bg-muted/30 border border-border rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-3">Current Settings</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="ml-2 text-foreground font-medium">
              {AVAILABLE_MODELS.find(m => m.value === formData.model)?.label}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Temperature:</span>
            <span className="ml-2 text-foreground font-medium">{formData.temperature}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Max Tokens:</span>
            <span className="ml-2 text-foreground font-medium">{formData.maxTokens}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Output:</span>
            <span className="ml-2 text-foreground font-medium capitalize">{formData.outputFormat}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
