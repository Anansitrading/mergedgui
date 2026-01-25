// EventConfig Component - Configure event-based trigger settings
// Task 3_2: Reflexes Implementation

import { useState } from 'react';
import { Bell, Plus, X, FileCode, Mail, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';
import type {
  ReflexTriggerType,
  TriggerConfig,
  EventTriggerConfig,
  FileChangeTriggerConfig,
  EmailTriggerConfig,
  ApiCallTriggerConfig,
} from '../../types/skills';

// =============================================================================
// Component Props
// =============================================================================

interface EventConfigProps {
  triggerType: ReflexTriggerType;
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
}

// =============================================================================
// Event Source Options
// =============================================================================

const EVENT_SOURCES = [
  { value: 'github', label: 'GitHub', events: ['push', 'pull_request', 'issue', 'release', 'deployment'] },
  { value: 'vercel', label: 'Vercel', events: ['deployment.created', 'deployment.completed', 'deployment.error'] },
  { value: 'stripe', label: 'Stripe', events: ['payment.succeeded', 'payment.failed', 'subscription.created', 'invoice.paid'] },
  { value: 'slack', label: 'Slack', events: ['message', 'reaction_added', 'channel_created', 'user_joined'] },
  { value: 'jira', label: 'Jira', events: ['issue_created', 'issue_updated', 'sprint_started', 'sprint_completed'] },
  { value: 'custom', label: 'Custom', events: [] },
];

const FILE_CHANGE_EVENTS = [
  { value: 'create', label: 'Created' },
  { value: 'modify', label: 'Modified' },
  { value: 'delete', label: 'Deleted' },
];

// =============================================================================
// Main Component
// =============================================================================

export function EventConfig({ triggerType, config, onChange }: EventConfigProps) {
  // Render appropriate config based on trigger type
  switch (triggerType) {
    case 'event':
      return <IntegrationEventConfig config={config as EventTriggerConfig} onChange={onChange} />;
    case 'file_change':
      return <FileChangeConfig config={config as FileChangeTriggerConfig} onChange={onChange} />;
    case 'email':
      return <EmailTriggerConfigComponent config={config as EmailTriggerConfig} onChange={onChange} />;
    case 'api_call':
      return <ApiCallConfig config={config as ApiCallTriggerConfig} onChange={onChange} />;
    default:
      return (
        <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Configuration for {triggerType} triggers is not available.
          </p>
        </div>
      );
  }
}

// =============================================================================
// Integration Event Config
// =============================================================================

interface IntegrationEventConfigProps {
  config: EventTriggerConfig;
  onChange: (config: EventTriggerConfig) => void;
}

function IntegrationEventConfig({ config, onChange }: IntegrationEventConfigProps) {
  const [customEvent, setCustomEvent] = useState('');

  const selectedSource = EVENT_SOURCES.find(s => s.value === config.source) || EVENT_SOURCES[0];

  const handleSourceChange = (sourceValue: string) => {
    onChange({
      ...config,
      source: sourceValue,
      eventName: '', // Reset event when source changes
    });
  };

  const handleEventChange = (eventName: string) => {
    onChange({ ...config, eventName });
  };

  return (
    <div className="space-y-4">
      {/* Integration Source */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Integration Source
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_SOURCES.map((source) => (
            <button
              key={source.value}
              onClick={() => handleSourceChange(source.value)}
              className={cn(
                'p-3 rounded-lg border text-sm font-medium transition-colors text-left',
                config.source === source.value
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
              )}
            >
              <Bell size={16} className="mb-1" />
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Event Type
        </label>
        {selectedSource.value === 'custom' ? (
          <input
            type="text"
            value={config.eventName || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            placeholder="Enter custom event name..."
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSource.events.map((event) => (
              <button
                key={event}
                onClick={() => handleEventChange(event)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  config.eventName === event
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {event}
              </button>
            ))}
          </div>
        )}
        {selectedSource.value !== 'custom' && (
          <p className="text-xs text-muted-foreground mt-2">
            Or enter a custom event name:
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              onBlur={() => {
                if (customEvent) {
                  handleEventChange(customEvent);
                }
              }}
              placeholder="custom.event.name"
              className="ml-2 px-2 py-1 bg-muted border-none rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-400">
          <strong>Note:</strong> Make sure you have connected your {selectedSource.label} integration
          in the Integrations settings to receive events.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// File Change Config
// =============================================================================

interface FileChangeConfigProps {
  config: FileChangeTriggerConfig;
  onChange: (config: FileChangeTriggerConfig) => void;
}

function FileChangeConfig({ config, onChange }: FileChangeConfigProps) {
  const [newPath, setNewPath] = useState('');

  const handleAddPath = () => {
    if (newPath && !config.paths?.includes(newPath)) {
      onChange({
        ...config,
        paths: [...(config.paths || []), newPath],
      });
      setNewPath('');
    }
  };

  const handleRemovePath = (path: string) => {
    onChange({
      ...config,
      paths: (config.paths || []).filter(p => p !== path),
    });
  };

  const handleToggleEvent = (event: 'create' | 'modify' | 'delete') => {
    const currentEvents = config.events || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter(e => e !== event)
      : [...currentEvents, event];
    onChange({ ...config, events: newEvents });
  };

  return (
    <div className="space-y-4">
      {/* File Patterns */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <div className="flex items-center gap-2">
            <FileCode size={14} />
            File Patterns
          </div>
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPath()}
              placeholder="src/**/*.ts, *.json, docs/*.md"
              className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleAddPath}
              disabled={!newPath}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
            </button>
          </div>

          {config.paths && config.paths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.paths.map((path) => (
                <span
                  key={path}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm text-foreground"
                >
                  <code>{path}</code>
                  <button
                    onClick={() => handleRemovePath(path)}
                    className="p-0.5 hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Use glob patterns to match files. Examples: <code>*.ts</code>, <code>src/**/*.tsx</code>
        </p>
      </div>

      {/* Event Types */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Trigger On
        </label>
        <div className="flex gap-2">
          {FILE_CHANGE_EVENTS.map((event) => (
            <button
              key={event.value}
              onClick={() => handleToggleEvent(event.value as 'create' | 'modify' | 'delete')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                config.events?.includes(event.value as 'create' | 'modify' | 'delete')
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20'
              )}
            >
              {event.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Email Trigger Config
// =============================================================================

interface EmailTriggerConfigComponentProps {
  config: EmailTriggerConfig;
  onChange: (config: EmailTriggerConfig) => void;
}

function EmailTriggerConfigComponent({ config, onChange }: EmailTriggerConfigComponentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail size={18} className="text-purple-400" />
        <span className="text-sm font-medium text-foreground">Email Trigger Settings</span>
      </div>

      {/* From Address Filter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          From Address (optional)
        </label>
        <input
          type="text"
          value={config.fromAddress || ''}
          onChange={(e) => onChange({ ...config, fromAddress: e.target.value })}
          placeholder="sender@example.com or *@domain.com"
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Filter by sender address. Use * as wildcard.
        </p>
      </div>

      {/* Subject Pattern */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Subject Pattern (optional)
        </label>
        <input
          type="text"
          value={config.subjectPattern || ''}
          onChange={(e) => onChange({ ...config, subjectPattern: e.target.value })}
          placeholder="[URGENT]* or regex pattern"
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Match emails with specific subject patterns.
        </p>
      </div>

      {/* Body Pattern */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Body Pattern (optional)
        </label>
        <input
          type="text"
          value={config.bodyPattern || ''}
          onChange={(e) => onChange({ ...config, bodyPattern: e.target.value })}
          placeholder="keyword or regex pattern"
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Match emails containing specific content.
        </p>
      </div>

      {/* Info */}
      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-purple-400">
          <strong>Note:</strong> Email triggers require an email integration to be configured.
          Incoming emails matching these filters will trigger the skill execution.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// API Call Config
// =============================================================================

interface ApiCallConfigProps {
  config: ApiCallTriggerConfig;
  onChange: (config: ApiCallTriggerConfig) => void;
}

function ApiCallConfig({ config, onChange }: ApiCallConfigProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={18} className="text-orange-400" />
        <span className="text-sm font-medium text-foreground">API Call Trigger Settings</span>
      </div>

      {/* Endpoint */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          API Endpoint
        </label>
        <input
          type="text"
          value={config.endpoint || ''}
          onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
          placeholder="/api/v1/resource"
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          The API endpoint path that will trigger this reflex.
        </p>
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          HTTP Method
        </label>
        <div className="flex gap-2">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => (
            <button
              key={method}
              onClick={() => onChange({ ...config, method })}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                config.method === method
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20'
              )}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
        <p className="text-xs text-orange-400">
          <strong>Note:</strong> API call triggers intercept requests to the specified endpoint.
          The skill will be executed before the original API handler processes the request.
        </p>
      </div>
    </div>
  );
}
