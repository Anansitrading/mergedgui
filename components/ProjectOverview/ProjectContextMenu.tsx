import { useEffect, useRef, useState } from 'react';
import { Trash2, UserPlus, Star, Archive, ArchiveRestore, ExternalLink } from 'lucide-react';
import { Project } from '../../types';

interface ProjectContextMenuProps {
  project: Project;
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onOpen?: () => void;
  onShare?: () => void;
  onToggleStarred?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export function ProjectContextMenu({
  project,
  x,
  y,
  onClose,
  onDelete,
  onOpen,
  onShare,
  onToggleStarred,
  onArchive,
  onUnarchive,
}: ProjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);

      if (!isInsideMenu) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, showDeleteConfirm]);

  const adjustedPosition = {
    x: Math.min(x, window.innerWidth - 280),
    y: Math.min(y, window.innerHeight - 300),
  };

  const menuItems = [
    {
      icon: ExternalLink,
      label: 'Open',
      onClick: () => {
        onOpen?.();
        onClose();
      },
    },
    {
      icon: UserPlus,
      label: 'Share',
      onClick: () => {
        onShare?.();
        onClose();
      },
    },
    {
      icon: Star,
      label: project.starred ? 'Remove from starred' : 'Add to starred',
      onClick: () => {
        onToggleStarred?.();
        onClose();
      },
    },
    {
      icon: project.archived ? ArchiveRestore : Archive,
      label: project.archived ? 'Unarchive' : 'Archive',
      onClick: () => {
        if (project.archived) {
          onUnarchive?.();
        } else {
          onArchive?.();
        }
        onClose();
      },
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => {
        setShowDeleteConfirm(true);
      },
      destructive: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Project Name Header */}
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs text-muted-foreground truncate">{project.name}</p>
      </div>

      {showDeleteConfirm ? (
        /* Delete Confirmation */
        <div className="p-3">
          <p className="text-sm font-medium text-foreground mb-2">
            Delete project?
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            This cannot be undone.
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Menu Items */
        <div className="py-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  item.destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
