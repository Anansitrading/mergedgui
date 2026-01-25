// ConditionsEditor Component - Visual builder for reflex conditions
// Task 3_2: Reflexes Implementation

import { useState } from 'react';
import { Plus, X, Code, List, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getAvailableOperators, validateConditions } from '../../lib/conditions';
import type { ReflexConditions } from '../../types/skills';

interface ConditionsEditorProps {
  value: ReflexConditions;
  onChange: (value: ReflexConditions) => void;
  disabled?: boolean;
}

type ViewMode = 'visual' | 'json';

// Filter type for the visual editor
interface FilterRow {
  field: string;
  operator: string;
  value: string;
}

const OPERATORS = getAvailableOperators();

export function ConditionsEditor({ value, onChange, disabled = false }: ConditionsEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Convert filters from ReflexConditions format to editor rows
  const filters: FilterRow[] = (value.filters || []).map(f => ({
    field: f.field,
    operator: f.operator,
    value: f.value,
  }));

  const handleAddFilter = () => {
    const newFilter = { field: '', operator: 'equals', value: '' };
    const newFilters = [
      ...(value.filters || []),
      { field: '', operator: 'equals' as const, value: '' },
    ];
    onChange({ ...value, filters: newFilters });
  };

  const handleUpdateFilter = (index: number, updates: Partial<FilterRow>) => {
    const newFilters = [...(value.filters || [])];
    newFilters[index] = {
      ...newFilters[index],
      ...updates,
      operator: (updates.operator || newFilters[index].operator) as 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex',
    };
    onChange({ ...value, filters: newFilters });
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = (value.filters || []).filter((_, i) => i !== index);
    onChange({ ...value, filters: newFilters });
  };

  const handleMatchAllChange = (matchAll: boolean) => {
    onChange({ ...value, matchAll });
  };

  const handleExpressionChange = (expression: string) => {
    onChange({ ...value, expression: expression || undefined });
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setJsonError(null);

    try {
      const parsed = JSON.parse(text);
      const validation = validateConditions(parsed);

      if (!validation.valid) {
        setJsonError(validation.errors.join(', '));
        return;
      }

      onChange(parsed);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'json') {
      // Sync JSON text with current value
      setJsonText(JSON.stringify(value, null, 2));
    }
    setViewMode(mode);
  };

  const validation = validateConditions(value);

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Conditions</label>
        <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
          <button
            onClick={() => handleViewModeChange('visual')}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              viewMode === 'visual'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List size={14} />
            Visual
          </button>
          <button
            onClick={() => handleViewModeChange('json')}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              viewMode === 'json'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Code size={14} />
            JSON
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="space-y-4">
          {/* Expression Input */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Expression (optional)
            </label>
            <input
              type="text"
              value={value.expression || ''}
              onChange={(e) => handleExpressionChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g., data.count > 10 or user.role == 'admin'"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Simple expression using field comparisons (==, !=, &gt;, &lt;, &gt;=, &lt;=)
            </p>
          </div>

          {/* Match All/Any Toggle */}
          {(value.filters?.length ?? 0) > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Match:</span>
              <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
                <button
                  onClick={() => handleMatchAllChange(true)}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    value.matchAll !== false
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All (AND)
                </button>
                <button
                  onClick={() => handleMatchAllChange(false)}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    value.matchAll === false
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Any (OR)
                </button>
              </div>
            </div>
          )}

          {/* Filters List */}
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <FilterRowEditor
                key={index}
                filter={filter}
                onChange={(updates) => handleUpdateFilter(index, updates)}
                onRemove={() => handleRemoveFilter(index)}
                disabled={disabled}
                showConnector={index > 0}
                matchAll={value.matchAll !== false}
              />
            ))}

            {/* Add Filter Button */}
            <button
              onClick={handleAddFilter}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm',
                'border border-dashed border-border rounded-lg',
                'text-muted-foreground hover:text-foreground hover:border-foreground/20',
                'transition-colors',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Plus size={16} />
              Add Filter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            disabled={disabled}
            rows={10}
            className={cn(
              'w-full px-3 py-2 bg-card border rounded-lg font-mono text-sm text-foreground',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50',
              'disabled:opacity-50',
              jsonError ? 'border-destructive' : 'border-border'
            )}
            placeholder={`{
  "matchAll": true,
  "filters": [
    { "field": "event.type", "operator": "equals", "value": "push" }
  ]
}`}
          />
          {jsonError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle size={14} />
              {jsonError}
            </div>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {!validation.valid && validation.errors.length > 0 && (
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              {validation.errors.map((error, i) => (
                <p key={i} className="text-xs text-destructive">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {filters.length === 0 && !value.expression && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No conditions set. The reflex will trigger for all events.
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Filter Row Component
// =============================================================================

interface FilterRowEditorProps {
  filter: FilterRow;
  onChange: (updates: Partial<FilterRow>) => void;
  onRemove: () => void;
  disabled?: boolean;
  showConnector?: boolean;
  matchAll?: boolean;
}

function FilterRowEditor({
  filter,
  onChange,
  onRemove,
  disabled = false,
  showConnector = false,
  matchAll = true,
}: FilterRowEditorProps) {
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);

  const selectedOperator = OPERATORS.find(op => op.value === filter.operator) || OPERATORS[0];

  return (
    <div className="relative">
      {/* Connector */}
      {showConnector && (
        <div className="flex items-center justify-center mb-2">
          <span className="px-2 py-0.5 bg-muted text-xs text-muted-foreground rounded">
            {matchAll ? 'AND' : 'OR'}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
        {/* Field Input */}
        <input
          type="text"
          value={filter.field}
          onChange={(e) => onChange({ field: e.target.value })}
          disabled={disabled}
          placeholder="field.path"
          className="flex-1 min-w-0 px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
        />

        {/* Operator Selector */}
        <div className="relative">
          <button
            onClick={() => !disabled && setShowOperatorDropdown(!showOperatorDropdown)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 bg-card border border-border rounded text-sm',
              'text-foreground hover:bg-muted transition-colors min-w-[100px] justify-between',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="truncate">{selectedOperator.label}</span>
            <ChevronDown size={14} className="shrink-0" />
          </button>

          {showOperatorDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowOperatorDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
                {OPERATORS.map((op) => (
                  <button
                    key={op.value}
                    onClick={() => {
                      onChange({ operator: op.value });
                      setShowOperatorDropdown(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                      filter.operator === op.value
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground'
                    )}
                  >
                    <div className="font-medium">{op.label}</div>
                    <div className="text-xs text-muted-foreground">{op.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Value Input */}
        <input
          type="text"
          value={filter.value}
          onChange={(e) => onChange({ value: e.target.value })}
          disabled={disabled}
          placeholder="value"
          className="flex-1 min-w-0 px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
        />

        {/* Remove Button */}
        <button
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            'p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title="Remove filter"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
