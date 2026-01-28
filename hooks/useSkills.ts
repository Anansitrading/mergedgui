// useSkills Hook - Data fetching and state management for Skills
// Task 2_2: Skills Library UI

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Skill, SkillCategory } from '../types/skills';

interface UseSkillsOptions {
  initialSearch?: string;
  initialCategory?: SkillCategory | 'all';
  includePublic?: boolean; // Include public/community skills
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

// Mock user's own skills
const MOCK_MY_SKILLS: Skill[] = [
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
    isPublic: false,
    executionCount: 47,
    starCount: 3,
    rating: 4.2,
    ratingCount: 15,
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
    isPublic: false,
    executionCount: 123,
    starCount: 24,
    rating: 4.8,
    ratingCount: 42,
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
    isPublic: false,
    executionCount: 31,
    starCount: 7,
    rating: 3.9,
    ratingCount: 8,
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
    isPublic: false,
    executionCount: 89,
    starCount: 15,
    rating: 4.5,
    ratingCount: 28,
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
    isPublic: false,
    executionCount: 56,
    starCount: 9,
    rating: 4.1,
    ratingCount: 12,
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
    isPublic: false,
    executionCount: 12,
    starCount: 0,
    lastExecutedAt: new Date('2025-01-10'),
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-10'),
  },
];

// Mock public/community skills
const MOCK_PUBLIC_SKILLS: Skill[] = [
  {
    id: 'pub-1',
    userId: 'community',
    name: 'Meeting Notes Summarizer',
    description: 'Transform meeting transcripts into structured, actionable summaries.',
    category: 'analysis',
    promptTemplate: 'Summarize this meeting transcript:\n\n{{transcript}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.4, max_tokens: 2048 },
    outputFormat: 'markdown',
    isActive: true,
    isPublic: true,
    executionCount: 1523,
    starCount: 89,
    rating: 4.7,
    ratingCount: 156,
    lastExecutedAt: new Date('2025-01-25'),
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'pub-2',
    userId: 'community',
    name: 'API Documentation Generator',
    description: 'Generate comprehensive API documentation from code or specifications.',
    category: 'generation',
    promptTemplate: 'Generate API documentation for:\n\n{{code}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.3, max_tokens: 4096 },
    outputFormat: 'markdown',
    isActive: true,
    isPublic: true,
    executionCount: 892,
    starCount: 67,
    rating: 4.9,
    ratingCount: 203,
    lastExecutedAt: new Date('2025-01-24'),
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2025-01-24'),
  },
  {
    id: 'pub-3',
    userId: 'community',
    name: 'SQL Query Optimizer',
    description: 'Analyze and optimize SQL queries for better performance.',
    category: 'analysis',
    promptTemplate: 'Optimize this SQL query:\n\n{{query}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.2, max_tokens: 2048 },
    outputFormat: 'code',
    isActive: true,
    isPublic: true,
    executionCount: 2341,
    starCount: 145,
    rating: 4.6,
    ratingCount: 312,
    lastExecutedAt: new Date('2025-01-25'),
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'pub-4',
    userId: 'community',
    name: 'Social Media Post Creator',
    description: 'Create engaging social media posts for multiple platforms.',
    category: 'generation',
    promptTemplate: 'Create a {{platform}} post about:\n\n{{topic}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.8, max_tokens: 1024 },
    outputFormat: 'text',
    isActive: true,
    isPublic: true,
    executionCount: 3456,
    starCount: 234,
    rating: 4.4,
    ratingCount: 521,
    lastExecutedAt: new Date('2025-01-25'),
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'pub-5',
    userId: 'community',
    name: 'Contract Analyzer',
    description: 'Review contracts and highlight key terms, risks, and obligations.',
    category: 'analysis',
    promptTemplate: 'Analyze this contract:\n\n{{contract}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.3, max_tokens: 4096 },
    outputFormat: 'markdown',
    isActive: true,
    isPublic: true,
    executionCount: 567,
    starCount: 45,
    rating: 4.8,
    ratingCount: 89,
    lastExecutedAt: new Date('2025-01-23'),
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2025-01-23'),
  },
  {
    id: 'pub-6',
    userId: 'community',
    name: 'Unit Test Generator',
    description: 'Generate comprehensive unit tests for your code.',
    category: 'generation',
    promptTemplate: 'Generate unit tests for:\n\n```{{language}}\n{{code}}\n```',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.4, max_tokens: 4096 },
    outputFormat: 'code',
    isActive: true,
    isPublic: true,
    executionCount: 1876,
    starCount: 123,
    rating: 4.5,
    ratingCount: 267,
    lastExecutedAt: new Date('2025-01-25'),
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'pub-7',
    userId: 'community',
    name: 'Slack Message Formatter',
    description: 'Transform plain text into well-formatted Slack messages with emojis.',
    category: 'communication',
    promptTemplate: 'Format this for Slack:\n\n{{message}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.6, max_tokens: 1024 },
    outputFormat: 'text',
    isActive: true,
    isPublic: true,
    executionCount: 987,
    starCount: 56,
    rating: 4.2,
    ratingCount: 134,
    lastExecutedAt: new Date('2025-01-24'),
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2025-01-24'),
  },
  {
    id: 'pub-8',
    userId: 'community',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV data to JSON with automatic type detection.',
    category: 'transformation',
    promptTemplate: 'Convert this CSV to JSON:\n\n{{csv}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.1, max_tokens: 8192 },
    outputFormat: 'json',
    isActive: true,
    isPublic: true,
    executionCount: 2134,
    starCount: 98,
    rating: 4.3,
    ratingCount: 187,
    lastExecutedAt: new Date('2025-01-25'),
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2025-01-25'),
  },
  {
    id: 'pub-9',
    userId: 'community',
    name: 'Weekly Report Generator',
    description: 'Generate professional weekly status reports from bullet points.',
    category: 'automation',
    promptTemplate: 'Generate a weekly report from:\n\n{{notes}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.5, max_tokens: 2048 },
    outputFormat: 'markdown',
    isActive: true,
    isPublic: true,
    executionCount: 1234,
    starCount: 78,
    rating: 4.6,
    ratingCount: 198,
    lastExecutedAt: new Date('2025-01-24'),
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2025-01-24'),
  },
  {
    id: 'pub-10',
    userId: 'community',
    name: 'Bug Report Formatter',
    description: 'Structure bug reports with reproduction steps and expected behavior.',
    category: 'communication',
    promptTemplate: 'Format this bug report:\n\n{{description}}',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.3, max_tokens: 1024 },
    outputFormat: 'markdown',
    isActive: true,
    isPublic: true,
    executionCount: 456,
    starCount: 34,
    rating: 4.1,
    ratingCount: 67,
    lastExecutedAt: new Date('2025-01-22'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-22'),
  },
];

// Combine all skills for the "All" tab
const MOCK_ALL_SKILLS: Skill[] = [...MOCK_MY_SKILLS, ...MOCK_PUBLIC_SKILLS];

const SEARCH_DEBOUNCE_MS = 300;

export function useSkills(options: UseSkillsOptions = {}): UseSkillsReturn {
  const { initialSearch = '', initialCategory = 'all', includePublic = true } = options;

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
      // Return all skills (including public) or just user's own skills
      setSkills(includePublic ? MOCK_ALL_SKILLS : MOCK_MY_SKILLS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  }, [includePublic]);

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
