import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Zap, Play, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useSkills, CATEGORY_COLORS } from '../../../../hooks/useSkills';
import type { Skill, SkillCategory } from '../../../../types/skills';

interface SkillSelectorPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelectSkill: (skill: Skill) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  analysis: 'Analysis',
  generation: 'Generation',
  transformation: 'Transformation',
  communication: 'Communication',
  automation: 'Automation',
  custom: 'Custom',
};

export function SkillSelectorPopover({ anchorRef, onSelectSkill, onClose }: SkillSelectorPopoverProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { skills, loading } = useSkills();

  // Calculate position from anchor button
  useEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px gap above button
        left: rect.left,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  // Auto-focus search input on mount
  useEffect(() => {
    if (position) {
      searchInputRef.current?.focus();
    }
  }, [position]);

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose, anchorRef]);

  // Handle Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      if (!skill.isActive) return false;
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [skills, search, selectedCategory]);

  // Get unique categories from active skills
  const availableCategories = useMemo(() => {
    const cats = new Set(skills.filter(s => s.isActive).map(s => s.category));
    return Array.from(cats) as SkillCategory[];
  }, [skills]);

  if (!position) return null;

  const popover = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-[61] w-80 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        style={{
          bottom: `${window.innerHeight - position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Skill Library</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10'
            )}
          >
            All
          </button>
          {availableCategories.map(cat => {
            const colors = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors',
                  selectedCategory === cat
                    ? `${colors.bg} ${colors.text}`
                    : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10'
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* Skills List */}
        <div className="max-h-64 overflow-y-auto border-t border-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">
                {search ? 'No skills match your search' : 'No skills available'}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {filteredSkills.map(skill => {
                const colors = CATEGORY_COLORS[skill.category];
                return (
                  <button
                    key={skill.id}
                    onClick={() => onSelectSkill(skill)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-lg shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200 truncate">
                          {skill.name}
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-medium rounded capitalize shrink-0',
                            colors.bg,
                            colors.text
                          )}
                        >
                          {skill.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {skill.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-600">
                        <Play className="w-2.5 h-2.5" />
                        <span>{skill.executionCount} runs</span>
                      </div>
                    </div>

                    {/* Use indicator on hover */}
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                      Use
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-white/5">
          <p className="text-[10px] text-gray-600">
            Use skill ( or Type / )
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(popover, document.body);
}
