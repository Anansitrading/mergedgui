/**
 * Step 2D: Manual Content Entry
 *
 * Allows users to manually add context or paste code snippets.
 * Used when project type is 'manual'.
 */

import React, { useState, useCallback } from 'react';
import {
  Code,
  Copy,
  Check,
  FileText,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// =============================================================================
// Types
// =============================================================================

interface Step2DProps {
  manualContent: string;
  onSetManualContent: (content: string) => void;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const PLACEHOLDER_TEXT = `// Paste your code here...
//
// You can paste:
// - Code snippets
// - Configuration files
// - Documentation
// - Any text content you want to analyze

function example() {
  console.log("Hello, World!");
}`;

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 500000; // 500KB of text

// =============================================================================
// Main Component
// =============================================================================

export function Step2D({ manualContent, onSetManualContent, className }: Step2DProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setError(null);

    if (value.length > MAX_CONTENT_LENGTH) {
      setError(`Content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
      return;
    }

    onSetManualContent(value);
  }, [onSetManualContent]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.length > MAX_CONTENT_LENGTH) {
        setError(`Pasted content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
        return;
      }
      onSetManualContent(manualContent + text);
      setError(null);
    } catch (err) {
      setError('Failed to paste from clipboard');
    }
  }, [manualContent, onSetManualContent]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(manualContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }, [manualContent]);

  const handleClear = useCallback(() => {
    onSetManualContent('');
    setError(null);
  }, [onSetManualContent]);

  // Calculate statistics
  const charCount = manualContent.length;
  const lineCount = manualContent.split('\n').length;
  const isValid = charCount >= MIN_CONTENT_LENGTH;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code className="w-4 h-4" />
          <span>Add your code or content below</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Paste
          </button>
          {manualContent && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={manualContent}
          onChange={handleContentChange}
          placeholder={PLACEHOLDER_TEXT}
          className={cn(
            'w-full h-80 p-4 font-mono text-sm bg-muted/30 border rounded-xl resize-none',
            'placeholder:text-muted-foreground/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'transition-all',
            error ? 'border-destructive' : 'border-border'
          )}
          spellCheck={false}
        />

        {/* Line numbers overlay hint */}
        {!manualContent && (
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="flex items-center gap-2 text-muted-foreground/50">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Stats Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{charCount.toLocaleString()} characters</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isValid ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-foreground">Content ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">
                Minimum {MIN_CONTENT_LENGTH} characters required
              </span>
            </>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-muted/20 border border-border rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Paste code snippets, configuration files, or documentation</li>
          <li>• Include relevant context to help with analysis</li>
          <li>• You can combine multiple files by adding separators</li>
        </ul>
      </div>
    </div>
  );
}
