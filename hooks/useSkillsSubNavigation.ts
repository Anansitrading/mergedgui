import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SkillsSubTabType = 'my-skills' | 'all-skills' | 'community-skills';

const VALID_SUBTABS: SkillsSubTabType[] = ['my-skills', 'all-skills', 'community-skills'];
const DEFAULT_SUBTAB: SkillsSubTabType = 'my-skills';
const SUBTAB_PARAM = 'subtab';

function isValidSubTab(value: string | null): value is SkillsSubTabType {
  return value !== null && VALID_SUBTABS.includes(value as SkillsSubTabType);
}

export function useSkillsSubNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSubTab: SkillsSubTabType = useMemo(() => {
    const subtabParam = searchParams.get(SUBTAB_PARAM);
    return isValidSubTab(subtabParam) ? subtabParam : DEFAULT_SUBTAB;
  }, [searchParams]);

  const setActiveSubTab = useCallback(
    (subtab: SkillsSubTabType) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (subtab === DEFAULT_SUBTAB) {
            // Remove the subtab param if it's the default to keep URLs clean
            newParams.delete(SUBTAB_PARAM);
          } else {
            newParams.set(SUBTAB_PARAM, subtab);
          }
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Handle keyboard shortcuts (Cmd/Ctrl + Shift + 1/2/3 for subtabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) + Shift is pressed
      const isModifierPressed = (e.metaKey || e.ctrlKey) && e.shiftKey;
      if (!isModifierPressed) return;

      // Ignore if focus is in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case '1':
        case '!':
          e.preventDefault();
          setActiveSubTab('my-skills');
          break;
        case '2':
        case '@':
          e.preventDefault();
          setActiveSubTab('all-skills');
          break;
        case '3':
        case '#':
          e.preventDefault();
          setActiveSubTab('community-skills');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveSubTab]);

  return {
    activeSubTab,
    setActiveSubTab,
    subtabs: VALID_SUBTABS,
  };
}
