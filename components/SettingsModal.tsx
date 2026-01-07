import React from 'react';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold tracking-tight">System Configuration</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-foreground font-medium">Density</label>
                    <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                        <option>Comfortable</option>
                        <option>Compact</option>
                        <option>Dense</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-foreground font-medium">Theme</label>
                    <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                        <option>System</option>
                        <option>Dark</option>
                        <option>Light</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agent</h3>
            <div className="space-y-2">
                <label className="text-xs text-foreground font-medium">Gemini Model</label>
                <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                    <option>gemini-3-pro-preview</option>
                    <option>gemini-2.5-flash</option>
                </select>
            </div>
            <div className="flex items-center justify-between py-2">
                <label className="text-sm text-foreground">Auto-connect to WebSocket</label>
                <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-secondary/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}