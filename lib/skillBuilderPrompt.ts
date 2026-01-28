// AI Prompt and Utilities for Skill Builder
// System prompt and tag detection for conversational skill building

import type { SkillDraft, SkillBuilderMessage, ProposedSkillConfig } from '../types/skillDraft';

/**
 * System prompt for the skill builder AI agent
 */
export const SKILL_BUILDER_SYSTEM_PROMPT = `You are an AI assistant helping users create Claude Code skills. Your role is to:

1. **Understand Requirements**: Listen to what the user needs and ask clarifying questions
2. **Propose Configurations**: Suggest skill configurations based on their needs
3. **Iterate**: Refine based on feedback until the skill is complete

## Skill Structure
Skills are defined with YAML frontmatter and markdown instructions:
- **name**: Short identifier in kebab-case (e.g., "staged-deploy", "code-review")
- **description**: Brief explanation of what the skill does
- **dependencies**: List of required tools or other skills
- **trigger**: When to run - "pre-tool" (before tool execution) or "post-tool" (after)
- **scope**: Applicability - "global" (all projects) or "local" (current project only)
- **tags**: Categories for organization

## Your Response Format
When proposing a configuration, ALWAYS include a JSON block at the end of your message using this exact format:

\`\`\`skill-config
{
  "detectedTags": ["tag1", "tag2"],
  "suggestedTrigger": "pre-tool",
  "suggestedScope": "local",
  "configChanges": {
    "name": "skill-name",
    "description": "What the skill does",
    "dependencies": ["tool1", "tool2"],
    "instructions": "Detailed instructions in markdown..."
  }
}
\`\`\`

## Guidelines
- Be concise and action-oriented
- Detect relevant tags from the user's description automatically
- Suggest sensible defaults for trigger (usually "pre-tool") and scope (usually "local")
- If the user rejects your proposal, ask what they'd like to change
- Use markdown formatting in your explanations
- When the skill is complete, confirm and provide a summary

## Available Tags
Common tag categories: deployment, testing, documentation, communication, analysis, transformation, automation, security, monitoring, refactoring, debugging

## Example
User: "I need a skill to review code before committing"
Assistant: I'll help you create a code review skill. Here's my proposal:

**Code Review Skill**
This skill will analyze your staged changes before committing, checking for:
- Code style and formatting issues
- Potential bugs or anti-patterns
- Missing documentation

\`\`\`skill-config
{
  "detectedTags": ["refactoring", "analysis"],
  "suggestedTrigger": "pre-tool",
  "suggestedScope": "local",
  "configChanges": {
    "name": "code-review",
    "description": "Reviews code changes before committing",
    "dependencies": ["git"],
    "instructions": "Review all staged changes for code quality issues..."
  }
}
\`\`\`
`;

/**
 * Tag detection patterns
 */
const TAG_DETECTION_PATTERNS: Record<string, RegExp[]> = {
  deployment: [/deploy/i, /release/i, /rollout/i, /launch/i, /ship/i, /publish/i],
  testing: [/test/i, /spec/i, /validate/i, /verify/i, /qa/i, /assert/i],
  documentation: [/doc/i, /readme/i, /comment/i, /explain/i, /annotate/i],
  communication: [/slack/i, /email/i, /notify/i, /message/i, /alert/i],
  analysis: [/analy/i, /review/i, /inspect/i, /audit/i, /check/i],
  transformation: [/transform/i, /convert/i, /migrate/i, /format/i, /parse/i],
  automation: [/automat/i, /schedule/i, /cron/i, /workflow/i, /pipeline/i],
  security: [/secur/i, /auth/i, /encrypt/i, /secret/i, /credential/i, /vulnerability/i],
  monitoring: [/monitor/i, /log/i, /metric/i, /trace/i, /observe/i],
  refactoring: [/refactor/i, /clean/i, /improve/i, /optimize/i, /restructure/i],
  debugging: [/debug/i, /fix/i, /error/i, /bug/i, /issue/i, /troubleshoot/i],
};

/**
 * Detect tags from text content
 */
export function detectTags(text: string): string[] {
  const detected = new Set<string>();

  for (const [tag, patterns] of Object.entries(TAG_DETECTION_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      detected.add(tag);
    }
  }

  return Array.from(detected);
}

/**
 * Parse skill-config JSON block from AI response
 */
export function parseSkillConfig(content: string): ProposedSkillConfig | null {
  // Match ```skill-config ... ``` block
  const configRegex = /```skill-config\s*([\s\S]*?)```/;
  const match = content.match(configRegex);

  if (!match) {
    return null;
  }

  try {
    const config = JSON.parse(match[1].trim()) as ProposedSkillConfig;

    // Validate required fields
    if (!config.configChanges) {
      return null;
    }

    // Set defaults for missing fields
    return {
      detectedTags: config.detectedTags || [],
      suggestedTrigger: config.suggestedTrigger || 'pre-tool',
      suggestedScope: config.suggestedScope || 'local',
      configChanges: config.configChanges,
    };
  } catch (error) {
    console.error('Failed to parse skill-config:', error);
    return null;
  }
}

/**
 * Remove skill-config block from content for display
 */
export function removeSkillConfigBlock(content: string): string {
  return content.replace(/```skill-config\s*[\s\S]*?```/g, '').trim();
}

/**
 * Build conversation context for Claude API
 */
export function buildConversationContext(
  messages: SkillBuilderMessage[],
  currentDraft: SkillDraft
): { systemPrompt: string; conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> } {
  // Add current draft state to system prompt
  const draftContext = currentDraft.name
    ? `\n\n## Current Skill Draft State
\`\`\`yaml
name: ${currentDraft.name}
description: ${currentDraft.description}
dependencies: [${currentDraft.dependencies.join(', ')}]
trigger: ${currentDraft.trigger}
scope: ${currentDraft.scope}
tags: [${currentDraft.tags.join(', ')}]
\`\`\`
`
    : '';

  const systemPrompt = SKILL_BUILDER_SYSTEM_PROMPT + draftContext;

  // Convert messages to Claude format
  const conversationHistory = messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return { systemPrompt, conversationHistory };
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
