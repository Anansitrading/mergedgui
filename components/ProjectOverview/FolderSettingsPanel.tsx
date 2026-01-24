import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Project } from '../../types';
import { cn } from '../../utils/cn';

interface FolderSettingsPanelProps {
  project: Project;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (updates: Partial<Project>) => void;
}

// Predefined emoji icons for projects
const PRESET_ICONS = [
  '📊', '🎯', '💡', '📱', '🚀', '⭐',
  '📈', '🎨', '📁', '💼', '🔧', '📝',
  '🏗️', '👥', '📋', '🌟'
];

// Predefined color palette
const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
];

export function FolderSettingsPanel({
  project,
  position,
  onClose,
  onSave,
}: FolderSettingsPanelProps) {
  // Local state for form
  const [name, setName] = useState(project.name);
  const [selectedIcon, setSelectedIcon] = useState(
    project.icon.type === 'emoji' ? project.icon.value : '📁'
  );
  const [selectedColor, setSelectedColor] = useState(
    project.icon.backgroundColor || project.color || '#3b82f6'
  );
  const [label, setLabel] = useState(project.label || '');

  // Calculate position to keep panel in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y, window.innerHeight - 450),
  };

  const handleSave = () => {
    const updates: Partial<Project> = {
      name: name.trim() || project.name,
      icon: {
        type: 'emoji',
        value: selectedIcon,
        backgroundColor: selectedColor,
      },
      color: selectedColor,
      label: label.trim() || undefined,
    };
    onSave(updates);
    onClose();
  };

  const hasChanges =
    name !== project.name ||
    selectedIcon !== (project.icon.type === 'emoji' ? project.icon.value : '📁') ||
    selectedColor !== (project.icon.backgroundColor || project.color || '#3b82f6') ||
    label !== (project.label || '');

  return (
    <div
      className="fixed z-[60] w-72 bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium text-foreground">Folder Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Icon Preview */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg transition-all"
            style={{ backgroundColor: selectedColor }}
          >
            {selectedIcon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="text-sm font-medium text-foreground truncate">{name || 'Untitled'}</p>
            {label && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full">
                {label}
              </span>
            )}
          </div>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-1">
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all hover:scale-110',
                  selectedIcon === icon
                    ? 'bg-primary/20 ring-2 ring-primary ring-offset-1 ring-offset-card'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
                className={cn(
                  'w-7 h-7 rounded-full transition-all hover:scale-110 relative',
                  selectedColor === color.value && 'ring-2 ring-white ring-offset-2 ring-offset-card'
                )}
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.value && (
                  <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Label Input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Label <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Marketing, Dev, Q3"
            maxLength={20}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/20">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || !name.trim()}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-lg transition-all',
            hasChanges && name.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          Save
        </button>
      </div>
    </div>
  );
}
