/**
 * ParametersPanel Component
 * Collapsible panel for advanced AI model parameters
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2, Info } from 'lucide-react';
import { outputFormats } from '../../lib/skillValidation';
import type { SkillOutputFormat } from '../../types/skills';

interface ParametersPanelProps {
  temperature: number;
  maxTokens: number;
  outputFormat: SkillOutputFormat;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onOutputFormatChange: (value: SkillOutputFormat) => void;
  errors?: {
    temperature?: string;
    maxTokens?: string;
    outputFormat?: string;
  };
  disabled?: boolean;
  defaultExpanded?: boolean;
}

export function ParametersPanel({
  temperature,
  maxTokens,
  outputFormat,
  onTemperatureChange,
  onMaxTokensChange,
  onOutputFormatChange,
  errors = {},
  disabled,
  defaultExpanded = false,
}: ParametersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.3) return 'More focused and deterministic';
    if (temp <= 0.7) return 'Balanced creativity and consistency';
    return 'More creative and varied';
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings2 size={16} className="text-muted-foreground" />
          Advanced Parameters
        </span>
        {isExpanded ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-5 bg-background">
          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                Temperature
                <span className="group relative">
                  <Info size={12} className="text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Controls randomness in the output
                  </span>
                </span>
              </label>
              <span className="text-sm font-mono text-primary">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0 (Precise)</span>
              <span className="text-center">{getTemperatureDescription(temperature)}</span>
              <span>1 (Creative)</span>
            </div>
            {errors.temperature && <p className="text-xs text-destructive">{errors.temperature}</p>}
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                Max Tokens
                <span className="group relative">
                  <Info size={12} className="text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Maximum length of the response
                  </span>
                </span>
              </label>
              <span className="text-sm font-mono text-primary">{maxTokens.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>256 (Short)</span>
              <span>8,192 (Long)</span>
            </div>
            {errors.maxTokens && <p className="text-xs text-destructive">{errors.maxTokens}</p>}
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Output Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {outputFormats.map((format) => (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => onOutputFormatChange(format.value)}
                  disabled={disabled}
                  className={`
                    px-3 py-2 text-sm rounded-lg border transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      outputFormat === format.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-foreground hover:border-border/80'
                    }
                  `}
                >
                  {format.label}
                </button>
              ))}
            </div>
            {errors.outputFormat && <p className="text-xs text-destructive">{errors.outputFormat}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
