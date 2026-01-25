import { useCallback, useRef } from 'react';
import { User, Store, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SkillsSubTabType } from '../../hooks/useSkillsSubNavigation';

interface SkillsSubTabsProps {
  activeSubTab: SkillsSubTabType;
  onSubTabChange: (subtab: SkillsSubTabType) => void;
}

interface SubTabConfig {
  id: SkillsSubTabType;
  label: string;
  shortcut: number;
  icon: typeof User;
  description: string;
}

const SKILLS_SUBTABS: SubTabConfig[] = [
  {
    id: 'my-skills',
    label: 'My Skills',
    shortcut: 1,
    icon: User,
    description: 'Your activated and custom skills'
  },
  {
    id: 'all-skills',
    label: 'All Skills',
    shortcut: 2,
    icon: Store,
    description: 'Browse the skills marketplace'
  },
  {
    id: 'community-skills',
    label: 'Community',
    shortcut: 3,
    icon: Users,
    description: 'Skills shared by the community'
  },
];

export function SkillsSubTabs({ activeSubTab, onSubTabChange }: SkillsSubTabsProps) {
  const tabRefs = useRef<Map<SkillsSubTabType, HTMLButtonElement>>(new Map());

  const setTabRef = useCallback(
    (id: SkillsSubTabType) => (el: HTMLButtonElement | null) => {
      if (el) {
        tabRefs.current.set(id, el);
      } else {
        tabRefs.current.delete(id);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : SKILLS_SUBTABS.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < SKILLS_SUBTABS.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = SKILLS_SUBTABS.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSubTabChange(SKILLS_SUBTABS[currentIndex].id);
          return;
      }

      if (newIndex !== null) {
        const newTab = SKILLS_SUBTABS[newIndex];
        const tabElement = tabRefs.current.get(newTab.id);
        tabElement?.focus();
        onSubTabChange(newTab.id);
      }
    },
    [onSubTabChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Skills sections"
      className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit"
    >
      {SKILLS_SUBTABS.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeSubTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={setTabRef(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSubTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={`${tab.label} (⌘⇧${tab.shortcut})`}
          >
            <Icon size={16} className={cn(isActive ? 'text-primary' : '')} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { SKILLS_SUBTABS };
