import { useRef, useCallback, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof User;
  action: () => void;
  variant?: 'default' | 'danger';
}

export function UserDropdown({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenSettings,
  onLogout,
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const menuItems: MenuItem[] = [
    { id: 'profile', label: 'My Profile', icon: User, action: onOpenProfile },
    { id: 'settings', label: 'Settings', icon: Settings, action: onOpenSettings },
    { id: 'logout', label: 'Log out', icon: LogOut, action: onLogout, variant: 'danger' },
  ];

  // Close on click outside
  useClickOutside(dropdownRef, onClose, isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (isOpen && firstItemRef.current) {
      // Small delay to allow animation to start
      requestAnimationFrame(() => {
        firstItemRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const items = dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]'
      );
      if (!items) return;

      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = index < items.length - 1 ? index + 1 : 0;
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = index > 0 ? index - 1 : items.length - 1;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        case 'Tab':
          // Close on tab out
          onClose();
          return;
      }

      if (newIndex !== null) {
        items[newIndex].focus();
      }
    },
    [onClose]
  );

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-orientation="vertical"
      aria-label="User menu"
      className={cn(
        'absolute right-0 top-full mt-2 z-50',
        'w-56 py-1',
        'bg-card border border-border rounded-lg shadow-lg shadow-black/20',
        // Animation
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
        'duration-150 ease-out'
      )}
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === menuItems.length - 1;
        const isDanger = item.variant === 'danger';

        return (
          <div key={item.id}>
            {isDanger && (
              <div className="my-1 border-t border-border" role="separator" />
            )}
            <button
              ref={index === 0 ? firstItemRef : undefined}
              role="menuitem"
              onClick={() => handleItemClick(item.action)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm',
                'transition-colors duration-100',
                'focus:outline-none focus-visible:bg-muted',
                isDanger
                  ? 'text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default UserDropdown;
