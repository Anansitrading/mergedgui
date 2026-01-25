/**
 * Skill Form Validation Schema
 * Uses Zod for comprehensive form validation
 */

import { z } from 'zod';
import type { SkillCategory, SkillOutputFormat } from '../types/skills';

// Category options
export const skillCategories: { value: SkillCategory; label: string; description: string }[] = [
  { value: 'analysis', label: 'Analysis', description: 'Analyze code, data, or content' },
  { value: 'generation', label: 'Generation', description: 'Generate new content or code' },
  { value: 'transformation', label: 'Transformation', description: 'Convert between formats' },
  { value: 'communication', label: 'Communication', description: 'Summarize or compose messages' },
  { value: 'automation', label: 'Automation', description: 'Automate repetitive tasks' },
  { value: 'custom', label: 'Custom', description: 'Custom skill type' },
];

// Output format options
export const outputFormats: { value: SkillOutputFormat; label: string }[] = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Plain Text' },
  { value: 'html', label: 'HTML' },
  { value: 'code', label: 'Code' },
];

// Available AI models
export const availableModels = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Fast and capable' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', description: 'Most capable, complex tasks' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', description: 'Fastest, simple tasks' },
] as const;

// Zod schema for skill form validation
export const skillFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),

  category: z.enum(['analysis', 'generation', 'transformation', 'communication', 'automation', 'custom'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),

  promptTemplate: z
    .string()
    .min(20, 'Prompt template must be at least 20 characters')
    .max(10000, 'Prompt template must be 10,000 characters or less'),

  model: z.string().min(1, 'Please select a model'),

  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(1, 'Temperature must be at most 1'),

  maxTokens: z
    .number()
    .min(1, 'Max tokens must be at least 1')
    .max(8192, 'Max tokens must be at most 8192'),

  outputFormat: z.enum(['markdown', 'json', 'text', 'html', 'code'], {
    errorMap: () => ({ message: 'Please select an output format' }),
  }),

  isActive: z.boolean(),
});

// Type inference from schema
export type SkillFormValues = z.infer<typeof skillFormSchema>;

// Default form values
export const defaultSkillFormValues: SkillFormValues = {
  name: '',
  description: '',
  category: 'custom',
  promptTemplate: '',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4096,
  outputFormat: 'markdown',
  isActive: true,
};

// Validation result types
type ValidationSuccess = { success: true; data: SkillFormValues };
type ValidationError = { success: false; errors: Record<string, string> };
type ValidationResult = ValidationSuccess | ValidationError;

// Validation helper function
export function validateSkillForm(data: unknown): ValidationResult {
  const result = skillFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data } as ValidationSuccess;
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors } as ValidationError;
}

// Individual field validators for real-time validation
export const fieldValidators = {
  name: (value: string) => {
    const result = skillFormSchema.shape.name.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  },

  description: (value: string) => {
    const result = skillFormSchema.shape.description.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message ?? null;
  },

  promptTemplate: (value: string) => {
    const result = skillFormSchema.shape.promptTemplate.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  },

  temperature: (value: number) => {
    const result = skillFormSchema.shape.temperature.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  },

  maxTokens: (value: number) => {
    const result = skillFormSchema.shape.maxTokens.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
  },
};
