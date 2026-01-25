/**
 * Skill Templates
 * Pre-defined templates for common skill use cases
 * Task 3_5: Analytics & Polish
 */

import type { SkillCategory, SkillOutputFormat, InputSchemaField } from '../types/skills';

export interface SkillTemplate {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  promptTemplate: string;
  inputSchema: InputSchemaField[];
  outputFormat: SkillOutputFormat;
  suggestedModel: string;
  suggestedTemperature: number;
  suggestedMaxTokens: number;
  tags: string[];
  icon?: string;
}

export const SKILL_TEMPLATES: SkillTemplate[] = [
  // Marketing Category
  {
    id: 'marketing-copy-generator',
    name: 'Marketing Copy Generator',
    category: 'generation',
    description: 'Generate compelling marketing copy for products, services, or campaigns',
    promptTemplate: `You are an expert marketing copywriter with years of experience creating compelling, conversion-focused content.

Write marketing copy for the following:

Product/Service: {{product_name}}
Target Audience: {{target_audience}}
Tone: {{tone}}
Key Benefits: {{key_benefits}}

Create engaging copy that:
1. Captures attention immediately
2. Highlights the unique value proposition
3. Addresses the target audience's pain points
4. Includes a clear call-to-action

Output the copy in a format ready for use.`,
    inputSchema: [
      { name: 'product_name', type: 'string', description: 'Name of the product or service', required: true },
      { name: 'target_audience', type: 'string', description: 'Who is this marketing aimed at?', required: true },
      { name: 'tone', type: 'string', description: 'Desired tone (professional, casual, playful, urgent)', required: false, default: 'professional' },
      { name: 'key_benefits', type: 'string', description: 'Main benefits to highlight', required: true },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.7,
    suggestedMaxTokens: 2048,
    tags: ['marketing', 'copywriting', 'content'],
  },

  // Engineering Category
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    category: 'analysis',
    description: 'Analyze code for potential issues, bugs, and improvements',
    promptTemplate: `You are an experienced senior software engineer conducting a thorough code review.

Review the following code and provide detailed feedback:

\`\`\`{{language}}
{{code}}
\`\`\`

Context: {{context}}

Analyze the code for:
1. **Bugs & Errors**: Identify any bugs, logic errors, or potential runtime issues
2. **Security**: Check for security vulnerabilities (XSS, injection, etc.)
3. **Performance**: Suggest performance optimizations
4. **Code Quality**: Evaluate readability, maintainability, and adherence to best practices
5. **Suggestions**: Provide specific, actionable improvements

Format your response with clear sections and code examples where appropriate.`,
    inputSchema: [
      { name: 'code', type: 'string', description: 'The code to review', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: true },
      { name: 'context', type: 'string', description: 'Context about what the code does', required: false },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.3,
    suggestedMaxTokens: 4096,
    tags: ['engineering', 'code-review', 'development'],
  },

  // Documentation Category
  {
    id: 'documentation-generator',
    name: 'Documentation Generator',
    category: 'generation',
    description: 'Generate comprehensive documentation for code, APIs, or features',
    promptTemplate: `You are a technical writer creating clear, comprehensive documentation.

Generate documentation for the following:

Type: {{doc_type}}
Content: {{content}}
Audience: {{audience}}

Create documentation that includes:
1. **Overview**: Clear explanation of what this is and why it matters
2. **Usage**: How to use it with examples
3. **Parameters/Options**: Detailed description of all inputs
4. **Examples**: Practical code examples
5. **Notes**: Any important caveats or tips

Write in a clear, professional tone appropriate for {{audience}}.`,
    inputSchema: [
      { name: 'doc_type', type: 'string', description: 'Type of documentation (API, function, component, feature)', required: true },
      { name: 'content', type: 'string', description: 'The code or content to document', required: true },
      { name: 'audience', type: 'string', description: 'Target audience (developers, end-users, admins)', required: false, default: 'developers' },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.4,
    suggestedMaxTokens: 4096,
    tags: ['documentation', 'technical-writing', 'development'],
  },

  // Data Transformation Category
  {
    id: 'sql-query-builder',
    name: 'SQL Query Builder',
    category: 'transformation',
    description: 'Convert natural language descriptions to SQL queries',
    promptTemplate: `You are a database expert who converts natural language to optimized SQL queries.

Database Schema:
{{schema}}

Request: {{request}}

Generate a SQL query that:
1. Accurately fulfills the request
2. Is optimized for performance
3. Follows SQL best practices
4. Includes appropriate JOINs, WHERE clauses, etc.

Output only the SQL query with comments explaining complex parts.`,
    inputSchema: [
      { name: 'request', type: 'string', description: 'Natural language description of what you need', required: true },
      { name: 'schema', type: 'string', description: 'Database schema or table descriptions', required: true },
    ],
    outputFormat: 'code',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.2,
    suggestedMaxTokens: 2048,
    tags: ['sql', 'database', 'data'],
  },

  // Communication Category
  {
    id: 'email-composer',
    name: 'Professional Email Composer',
    category: 'communication',
    description: 'Draft professional emails for various business contexts',
    promptTemplate: `You are a professional communication specialist helping compose effective business emails.

Compose an email with the following details:

Purpose: {{purpose}}
Recipient: {{recipient}}
Key Points: {{key_points}}
Tone: {{tone}}

Write an email that:
1. Has a clear, engaging subject line
2. Opens with appropriate greeting
3. Communicates the key points clearly
4. Maintains a {{tone}} tone throughout
5. Includes appropriate call-to-action
6. Closes professionally

Format the output with Subject line, then the email body.`,
    inputSchema: [
      { name: 'purpose', type: 'string', description: 'Purpose of the email (follow-up, request, introduction, etc.)', required: true },
      { name: 'recipient', type: 'string', description: 'Who is receiving this email', required: true },
      { name: 'key_points', type: 'string', description: 'Main points to communicate', required: true },
      { name: 'tone', type: 'string', description: 'Desired tone (formal, friendly, urgent)', required: false, default: 'professional' },
    ],
    outputFormat: 'text',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.6,
    suggestedMaxTokens: 1024,
    tags: ['email', 'communication', 'business'],
  },

  // Analysis Category
  {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    category: 'analysis',
    description: 'Analyze data and provide insights, summaries, and recommendations',
    promptTemplate: `You are a data analyst providing insights from data.

Analyze the following data:

Data:
{{data}}

Analysis Focus: {{focus}}

Provide:
1. **Summary**: Key statistics and overview
2. **Insights**: Notable patterns, trends, or anomalies
3. **Visualizations**: Suggest appropriate charts/graphs
4. **Recommendations**: Actionable recommendations based on findings
5. **Questions**: Additional questions worth investigating

Be specific and support insights with data points.`,
    inputSchema: [
      { name: 'data', type: 'string', description: 'Data to analyze (can be JSON, CSV, or descriptive)', required: true },
      { name: 'focus', type: 'string', description: 'What aspect to focus the analysis on', required: false },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.4,
    suggestedMaxTokens: 4096,
    tags: ['analytics', 'data', 'insights'],
  },

  // Automation Category
  {
    id: 'task-breakdown',
    name: 'Task Breakdown Assistant',
    category: 'automation',
    description: 'Break down complex tasks into actionable steps',
    promptTemplate: `You are a project planning expert who helps break down complex tasks.

Task: {{task}}
Context: {{context}}
Constraints: {{constraints}}

Break this down into:
1. **Phases**: Major phases of work
2. **Steps**: Specific, actionable steps for each phase
3. **Dependencies**: What depends on what
4. **Estimates**: Rough effort estimates (S/M/L/XL)
5. **Risks**: Potential blockers or challenges

Format as a clear, numbered action plan.`,
    inputSchema: [
      { name: 'task', type: 'string', description: 'The task or project to break down', required: true },
      { name: 'context', type: 'string', description: 'Relevant context or background', required: false },
      { name: 'constraints', type: 'string', description: 'Any constraints or requirements', required: false },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.5,
    suggestedMaxTokens: 2048,
    tags: ['planning', 'project-management', 'productivity'],
  },

  // Custom/General Category
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    category: 'transformation',
    description: 'Summarize long content into concise, key-point summaries',
    promptTemplate: `You are an expert at distilling information into clear, concise summaries.

Content to summarize:
{{content}}

Summary length: {{length}}

Create a summary that:
1. Captures the main points and key takeaways
2. Maintains accuracy and nuance
3. Is well-organized and easy to scan
4. Fits the requested {{length}} length

Format with bullet points for easy reading.`,
    inputSchema: [
      { name: 'content', type: 'string', description: 'Content to summarize', required: true },
      { name: 'length', type: 'string', description: 'Desired length (brief, moderate, detailed)', required: false, default: 'moderate' },
    ],
    outputFormat: 'markdown',
    suggestedModel: 'claude-3-5-sonnet-20241022',
    suggestedTemperature: 0.3,
    suggestedMaxTokens: 1024,
    tags: ['summary', 'content', 'productivity'],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: SkillCategory): SkillTemplate[] {
  return SKILL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SkillTemplate | undefined {
  return SKILL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): SkillTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SKILL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique tags from templates
 */
export function getAllTemplateTags(): string[] {
  const tags = new Set<string>();
  SKILL_TEMPLATES.forEach((t) => t.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}
