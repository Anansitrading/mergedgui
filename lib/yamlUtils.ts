// YAML Utilities for Skill Builder
// Handles YAML frontmatter parsing and stringifying

import yaml from 'js-yaml';
import type { SkillDraft } from '../types/skillDraft';

/**
 * YAML formatting options
 */
export interface YamlFormatOptions {
  indent?: number; // Spaces per indentation level (default: 2)
  lineWidth?: number; // Max line width (default: 80)
  quotingType?: 'single' | 'double'; // Quote style for strings
  forceQuotes?: boolean; // Always quote strings
}

const defaultOptions: YamlFormatOptions = {
  indent: 2,
  lineWidth: 80,
  quotingType: 'single',
  forceQuotes: false,
};

/**
 * YAML frontmatter structure for skills
 */
interface SkillFrontmatter {
  name: string;
  description: string;
  dependencies: string[];
  trigger: 'pre-tool' | 'post-tool';
  scope: 'global' | 'local';
  tags: string[];
}

/**
 * Convert a SkillDraft to YAML frontmatter string
 */
export function draftToYaml(
  draft: SkillDraft,
  options: YamlFormatOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };

  const frontmatter: SkillFrontmatter = {
    name: draft.name || 'untitled-skill',
    description: draft.description || '',
    dependencies: draft.dependencies,
    trigger: draft.trigger,
    scope: draft.scope,
    tags: draft.tags,
  };

  try {
    const yamlContent = yaml.dump(frontmatter, {
      indent: opts.indent,
      lineWidth: opts.lineWidth,
      quotingType: opts.quotingType === 'single' ? "'" : '"',
      forceQuotes: opts.forceQuotes,
      sortKeys: false, // Preserve key order
      noRefs: true, // Don't use YAML references
    });

    return `---\n${yamlContent}---`;
  } catch (error) {
    console.error('Failed to generate YAML:', error);
    return '---\n# Error generating YAML\n---';
  }
}

/**
 * Convert a SkillDraft to full skill file content (YAML + markdown)
 */
export function draftToFullContent(
  draft: SkillDraft,
  options: YamlFormatOptions = {}
): string {
  const yamlSection = draftToYaml(draft, options);
  const markdownSection = generateMarkdownBody(draft);

  return `${yamlSection}\n\n${markdownSection}`;
}

/**
 * Generate markdown body from draft
 */
function generateMarkdownBody(draft: SkillDraft): string {
  const lines: string[] = [];

  // Title
  if (draft.name) {
    lines.push(`# ${draft.name}`);
    lines.push('');
  }

  // Description
  if (draft.description) {
    lines.push(draft.description);
    lines.push('');
  }

  // Dependencies section
  if (draft.dependencies.length > 0) {
    lines.push('## Dependencies');
    lines.push('');
    draft.dependencies.forEach((dep) => {
      lines.push(`- ${dep}`);
    });
    lines.push('');
  }

  // Instructions
  if (draft.instructions) {
    lines.push('## Instructions');
    lines.push('');
    lines.push(draft.instructions);
  }

  return lines.join('\n');
}

/**
 * Parse YAML frontmatter from full content
 */
export function parseYamlFrontmatter(content: string): {
  frontmatter: Partial<SkillFrontmatter> | null;
  body: string;
  error?: string;
} {
  // Match YAML frontmatter between --- markers
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      body: content,
      error: 'No YAML frontmatter found',
    };
  }

  try {
    const frontmatter = yaml.load(match[1]) as Partial<SkillFrontmatter>;
    const body = content.slice(match[0].length).trim();

    return { frontmatter, body };
  } catch (error) {
    return {
      frontmatter: null,
      body: content,
      error: `Invalid YAML: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate YAML content
 */
export function validateYaml(yamlContent: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = yaml.load(yamlContent);

    if (typeof parsed !== 'object' || parsed === null) {
      errors.push('YAML must be an object');
      return { isValid: false, errors, warnings };
    }

    const obj = parsed as Record<string, unknown>;

    // Check required fields
    if (!obj.name || typeof obj.name !== 'string') {
      errors.push('Missing or invalid "name" field');
    }

    // Check trigger value
    if (obj.trigger && !['pre-tool', 'post-tool'].includes(obj.trigger as string)) {
      errors.push('Invalid "trigger" value. Must be "pre-tool" or "post-tool"');
    }

    // Check scope value
    if (obj.scope && !['global', 'local'].includes(obj.scope as string)) {
      errors.push('Invalid "scope" value. Must be "global" or "local"');
    }

    // Check dependencies is array
    if (obj.dependencies && !Array.isArray(obj.dependencies)) {
      errors.push('"dependencies" must be an array');
    }

    // Check tags is array
    if (obj.tags && !Array.isArray(obj.tags)) {
      errors.push('"tags" must be an array');
    }

    // Warnings for optional fields
    if (!obj.description) {
      warnings.push('No "description" provided');
    }

    if (!obj.dependencies || (Array.isArray(obj.dependencies) && obj.dependencies.length === 0)) {
      warnings.push('No dependencies specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`YAML syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Format/prettify YAML content
 */
export function formatYaml(
  yamlContent: string,
  options: YamlFormatOptions = {}
): { formatted: string; error?: string } {
  const opts = { ...defaultOptions, ...options };

  try {
    // Parse and re-dump to format
    const parsed = yaml.load(yamlContent);
    const formatted = yaml.dump(parsed, {
      indent: opts.indent,
      lineWidth: opts.lineWidth,
      quotingType: opts.quotingType === 'single' ? "'" : '"',
      forceQuotes: opts.forceQuotes,
      sortKeys: false,
      noRefs: true,
    });

    return { formatted };
  } catch (error) {
    return {
      formatted: yamlContent,
      error: `Failed to format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
