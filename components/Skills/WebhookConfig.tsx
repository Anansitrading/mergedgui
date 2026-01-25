// WebhookConfig Component - Configure webhook trigger settings
// Task 3_2: Reflexes Implementation

import { useState } from 'react';
import { Copy, Check, RefreshCw, ExternalLink, Key, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { WebhookTriggerConfig } from '../../types/skills';

interface WebhookConfigProps {
  config: WebhookTriggerConfig;
  onChange: (config: WebhookTriggerConfig) => void;
  webhookUrl?: string;
  isNew?: boolean;
  onRegenerateSecret?: () => Promise<void>;
}

export function WebhookConfig({
  config,
  onChange,
  webhookUrl,
  isNew = false,
  onRegenerateSecret,
}: WebhookConfigProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = async (text: string, type: 'url' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      }
    } catch {
      // Clipboard API not available
    }
  };

  const handleRegenerateSecret = async () => {
    if (!onRegenerateSecret) return;
    setIsRegenerating(true);
    try {
      await onRegenerateSecret();
    } finally {
      setIsRegenerating(false);
    }
  };

  // Display URL (either from config or auto-generated)
  const displayUrl = webhookUrl || config.url || '';

  return (
    <div className="space-y-4">
      {/* Webhook URL */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Webhook URL
        </label>
        {isNew ? (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              A unique webhook URL will be generated when you create this reflex.
            </p>
            <p className="text-xs text-muted-foreground">
              Format: <code className="px-1 py-0.5 bg-muted rounded">https://api.kijko.nl/webhooks/reflex/&#123;id&#125;</code>
            </p>
          </div>
        ) : displayUrl ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg border border-border">
              <code className="text-sm text-foreground break-all">{displayUrl}</code>
            </div>
            <button
              onClick={() => handleCopy(displayUrl, 'url')}
              className={cn(
                'p-2 rounded-lg transition-colors shrink-0',
                copiedUrl
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              )}
              title={copiedUrl ? 'Copied!' : 'Copy URL'}
            >
              {copiedUrl ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">URL will be generated upon creation</p>
        )}
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          HTTP Method
        </label>
        <div className="flex gap-2">
          {(['POST', 'GET'] as const).map((method) => (
            <button
              key={method}
              onClick={() => onChange({ ...config, method })}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                config.method === method
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20'
              )}
            >
              {method}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          POST is recommended for webhook payloads with data
        </p>
      </div>

      {/* Webhook Secret */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <div className="flex items-center gap-2">
            <Key size={14} />
            Webhook Secret
          </div>
        </label>
        {isNew ? (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              A secret key will be auto-generated for signature verification.
            </p>
          </div>
        ) : config.secret ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted/50 rounded-lg border border-border">
                <code className="text-sm text-foreground">
                  {config.secret.slice(0, 10)}{'*'.repeat(20)}
                </code>
              </div>
              <button
                onClick={() => handleCopy(config.secret!, 'secret')}
                className={cn(
                  'p-2 rounded-lg transition-colors shrink-0',
                  copiedSecret
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                )}
                title={copiedSecret ? 'Copied!' : 'Copy Secret'}
              >
                {copiedSecret ? <Check size={18} /> : <Copy size={18} />}
              </button>
              {onRegenerateSecret && (
                <button
                  onClick={handleRegenerateSecret}
                  disabled={isRegenerating}
                  className={cn(
                    'p-2 rounded-lg transition-colors shrink-0',
                    'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
                    isRegenerating && 'opacity-50 cursor-not-allowed'
                  )}
                  title="Regenerate Secret"
                >
                  <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
            <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-400">
                Store this secret securely. It is used to verify that webhook requests are authentic.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No secret configured</p>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <ExternalLink size={14} />
          Integration Guide
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>To trigger this reflex, send an HTTP {config.method || 'POST'} request to the webhook URL:</p>
          <pre className="p-2 bg-muted rounded-md overflow-x-auto">
{`curl -X ${config.method || 'POST'} \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: <signature>" \\
  -d '{"event": "example", "data": {...}}' \\
  ${displayUrl || '<webhook-url>'}`}
          </pre>
          <p className="mt-2">
            <strong>Signature Verification:</strong> Calculate HMAC-SHA256 of the request body using
            the webhook secret and include it in the <code>X-Webhook-Signature</code> header.
          </p>
        </div>
      </div>
    </div>
  );
}
