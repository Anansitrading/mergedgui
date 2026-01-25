// useSkills Hook - Data fetching and state management for Skills
// Task 2_2: Skills Library UI

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Skill, SkillCategory } from '../types/skills';

interface UseSkillsOptions {
  initialSearch?: string;
  initialCategory?: SkillCategory | 'all';
}

interface UseSkillsReturn {
  skills: Skill[];
  filteredSkills: Skill[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  category: SkillCategory | 'all';
  setCategory: (value: SkillCategory | 'all') => void;
  refetch: () => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
}

// Mock skills data for development
const MOCK_SKILLS: Skill[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Summarize Document',
    description: 'Condense long documents into concise summaries while preserving key information.',
    category: 'analysis',
    promptTemplate: 'Please summarize the following document:\n\n{{content}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.5, max_tokens: 2048 },
    outputFormat: 'markdown',
    isActive: true,
    executionCount: 47,
    lastExecutedAt: new Date('2025-01-20'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-20'),
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Code Review',
    description: 'Analyze code for bugs, security issues, and suggest improvements.',
    category: 'analysis',
    promptTemplate: 'Review this code and identify issues:\n\n```{{language}}\n{{code}}\n```',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.3, max_tokens: 4096 },
    outputFormat: 'markdown',
    isActive: true,
    executionCount: 123,
    lastExecutedAt: new Date('2025-01-24'),
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2025-01-24'),
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Blog Post Generator',
    description: 'Generate engaging blog posts on any topic with customizable tone and length.',
    category: 'generation',
    promptTemplate: 'Write a blog post about {{topic}} in a {{tone}} tone. Length: {{length}} words.',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.8, max_tokens: 4096 },
    outputFormat: 'markdown',
    isActive: true,
    executionCount: 31,
    lastExecutedAt: new Date('2025-01-18'),
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-18'),
  },
  {
    id: '4',
    userId: 'user-1',
    name: 'Email Composer',
    description: 'Draft professional emails with the right tone for any situation.',
    category: 'communication',
    promptTemplate: 'Write a {{type}} email to {{recipient}} about:\n\n{{context}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.6, max_tokens: 1024 },
    outputFormat: 'text',
    isActive: true,
    executionCount: 89,
    lastExecutedAt: new Date('2025-01-23'),
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2025-01-23'),
  },
  {
    id: '5',
    userId: 'user-1',
    name: 'Data Transformer',
    description: 'Convert data between formats (JSON, CSV, XML) with schema validation.',
    category: 'transformation',
    promptTemplate: 'Transform this {{inputFormat}} data to {{outputFormat}}:\n\n{{data}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.2, max_tokens: 8192 },
    outputFormat: 'json',
    isActive: true,
    executionCount: 56,
    lastExecutedAt: new Date('2025-01-22'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-22'),
  },
  {
    id: '6',
    userId: 'user-1',
    name: 'Report Automation',
    description: 'Generate periodic reports from data with customizable templates.',
    category: 'automation',
    promptTemplate: 'Generate a {{reportType}} report for:\n\n{{data}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.4, max_tokens: 4096 },
    outputFormat: 'markdown',
    isActive: false,
    executionCount: 12,
    lastExecutedAt: new Date('2025-01-10'),
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-10'),
  },
];

const SEARCH_DEBOUNCE_MS = 300;

export function useSkills(options: UseSkillsOptions = {}): UseSkillsReturn {
  const { initialSearch = '', initialCategory = 'all' } = options;

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState<SkillCategory | 'all'>(initialCategory);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch skills
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/skills');
      // const data = await response.json();
      // setSkills(data.skills);

      await new Promise(resolve => setTimeout(resolve, 500));
      setSkills(MOCK_SKILLS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      if (category !== 'all' && skill.category !== category) {
        return false;
      }

      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesName = skill.name.toLowerCase().includes(searchLower);
        const matchesDescription = skill.description?.toLowerCase().includes(searchLower) ?? false;

        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [skills, debouncedSearch, category]);

  const deleteSkill = useCallback(async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
      throw err;
    }
  }, []);

  return {
    skills,
    filteredSkills,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    refetch: fetchSkills,
    deleteSkill,
  };
}

// Category color mapping for badges
export const CATEGORY_COLORS: Record<SkillCategory, { bg: string; text: string }> = {
  analysis: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  generation: { bg: 'bg-green-500/10', text: 'text-green-400' },
  transformation: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  communication: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  automation: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  custom: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
};
