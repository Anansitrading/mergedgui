/**
 * PromptEditor Component
 * Textarea for editing prompt templates with variable hints
 */

import React, { useState } from 'react';
import { Code2, Info, Copy, Check } from 'lucide-react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const variableExamples = [
  { variable: '{{input}}', description: 'Main input content' },
  { variable: '{{code}}', description: 'Code to analyze' },
  { variable: '{{context}}', description: 'Additional context' },
];

export function PromptEditor({ value, onChange, error, disabled }: PromptEditorProps) {
  const [showHints, setShowHints] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      setCopied(variable);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard API might not be available
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('prompt-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + variable + value.slice(end);
      onChange(newValue);
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const characterCount = value.length;
  const minChars = 20;
  const maxChars = 10000;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Code2 size={14} className="text-muted-foreground" />
            Prompt Template <span className="text-destructive">*</span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info size={12} />
          {showHints ? 'Hide hints' : 'Show hints'}
        </button>
      </div>

      {showHints && (
        <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Use variables in double curly braces. They will be replaced with input values when the skill runs.
          </p>
          <div className="flex flex-wrap gap-2">
            {variableExamples.map(({ variable, description }) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                onDoubleClick={() => handleCopyVariable(variable)}
                className="group flex items-center gap-1.5 px-2 py-1 bg-secondary border border-border rounded text-xs hover:border-primary/50 transition-colors"
                title={`Click to insert, double-click to copy. ${description}`}
              >
                <code className="text-primary font-mono">{variable}</code>
                {copied === variable ? (
                  <Check size={10} className="text-green-500" />
                ) : (
                  <Copy size={10} className="opacity-0 group-hover:opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        id="prompt-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your prompt template here. Use {{variables}} for dynamic inputs.

Example:
Analyze the following code and identify potential issues:

{{code}}

Focus on:
1. Code quality
2. Performance
3. Security"
        rows={8}
        className={`
          w-full bg-secondary border rounded-lg px-4 py-3 font-mono text-sm
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-colors resize-y min-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-destructive' : 'border-border'}
        `}
      />

      <div className="flex items-center justify-between text-xs">
        <div className={characterCount < minChars ? 'text-destructive' : 'text-muted-foreground'}>
          {characterCount} / {minChars} min characters
        </div>
        <div className={characterCount > maxChars ? 'text-destructive' : 'text-muted-foreground'}>
          {characterCount.toLocaleString()} / {maxChars.toLocaleString()} max
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
