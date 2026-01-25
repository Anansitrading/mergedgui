# Specification: Dashboard Navigation Refactor + Skills Feature

## Overview

This specification covers the refactoring of the Kijko dashboard to use tab-based navigation and the implementation of a complete Skills management system with Habits (scheduled executions) and Reflexes (triggered executions).

## Functional Requirements

### FR1: Tab-Based Navigation
- **FR1.1**: Dashboard displays three tabs: Projects, Integrations, Skills
- **FR1.2**: Tab state persists in URL query parameter (`?tab=projects`)
- **FR1.3**: Deep linking to specific tabs works
- **FR1.4**: Default tab is Projects
- **FR1.5**: Tab switching does not reload the page

### FR2: User Avatar & Dropdown
- **FR2.1**: User avatar displayed in header (right side)
- **FR2.2**: Avatar shows user photo or fallback initials
- **FR2.3**: Click on avatar opens dropdown menu
- **FR2.4**: Dropdown contains: My Profile, Settings, Log out
- **FR2.5**: Settings button removed from header

### FR3: Settings Migration
- **FR3.1**: Integrations moved from Settings to dedicated tab
- **FR3.2**: My Profile moved from Settings to dropdown-accessible modal
- **FR3.3**: Settings sidebar updated to reflect changes
- **FR3.4**: Remaining Settings items: General, Notifications, Security, Billing, Members, Advanced Security, Audit Log

### FR4: Skills Management
- **FR4.1**: Users can create AI skills with prompt templates
- **FR4.2**: Skills support configurable parameters (model, temperature, max_tokens)
- **FR4.3**: Skills can define input schemas for dynamic forms
- **FR4.4**: Users can edit and delete skills
- **FR4.5**: Skills have categories for organization

### FR5: Skill Execution
- **FR5.1**: Users can manually execute skills
- **FR5.2**: Execution generates dynamic input form based on schema
- **FR5.3**: Execution calls Claude API with configured parameters
- **FR5.4**: Response renders with markdown support
- **FR5.5**: Execution logs stored in database

### FR6: Habits (Scheduled Skills)
- **FR6.1**: Users can schedule skills with cron expressions
- **FR6.2**: Cron builder provides presets and visual configuration
- **FR6.3**: Habits display human-readable schedule descriptions
- **FR6.4**: Habits execute automatically at scheduled times
- **FR6.5**: Users can pause/resume habits

### FR7: Reflexes (Triggered Skills)
- **FR7.1**: Users can configure trigger-based skill execution
- **FR7.2**: Webhook triggers generate unique URLs
- **FR7.3**: Integration event triggers connect to existing integrations
- **FR7.4**: Conditions can filter when reflexes fire
- **FR7.5**: Users can enable/disable reflexes

### FR8: Support Chat
- **FR8.1**: Floating chat widget in bottom-right corner
- **FR8.2**: Chat expands to show message history
- **FR8.3**: AI-powered responses with user context
- **FR8.4**: Conversation history maintained within session

### FR9: Analytics & Templates
- **FR9.1**: Skill execution statistics displayed
- **FR9.2**: Pre-built skill templates available
- **FR9.3**: Onboarding flow for new Skills users
- **FR9.4**: Performance metrics tracked (tokens, duration)

## Non-Functional Requirements

### NFR1: Performance
- **NFR1.1**: Page load time < 2 seconds
- **NFR1.2**: Tab switch < 100ms
- **NFR1.3**: Skill execution response < 3 seconds (API dependent)
- **NFR1.4**: Support 50+ skills without performance degradation

### NFR2: Security
- **NFR2.1**: Row Level Security on all skill-related tables
- **NFR2.2**: Users can only access their own skills
- **NFR2.3**: API keys stored securely (env variables)
- **NFR2.4**: Webhook URLs unique and unguessable

### NFR3: Accessibility
- **NFR3.1**: Keyboard navigation for all features
- **NFR3.2**: ARIA labels on interactive elements
- **NFR3.3**: Focus management in modals
- **NFR3.4**: Screen reader compatible

### NFR4: Responsiveness
- **NFR4.1**: Mobile: 1-column grid, full-screen modals
- **NFR4.2**: Tablet: 2-column grid, adjusted modals
- **NFR4.3**: Desktop: 3-column grid, standard modals
- **NFR4.4**: Horizontal tab scroll on mobile

## Acceptance Criteria

### Sprint 1: Navigation Foundation
- [ ] Three tabs visible and functional
- [ ] URL query parameter sync working
- [ ] User avatar with dropdown implemented
- [ ] Integrations migrated to tab
- [ ] My Profile migrated to modal
- [ ] Settings menu updated
- [ ] No regressions in existing features

### Sprint 2: Skills Feature Foundation
- [ ] Database schema deployed with RLS
- [ ] Skills CRUD operations working
- [ ] Skills library UI with search/filter
- [ ] Skill creation form with validation
- [ ] Skill detail/edit view functional
- [ ] Manual skill execution with Claude API
- [ ] Execution logging implemented

### Sprint 3: Automation & Polish
- [ ] Habits with cron scheduling working
- [ ] Background execution reliable
- [ ] Reflexes with webhooks functional
- [ ] Condition evaluation accurate
- [ ] Support chat UI polished
- [ ] Support chat AI integrated
- [ ] Analytics dashboard accurate
- [ ] Skill templates available
- [ ] Onboarding flow for new users
- [ ] Performance optimized
- [ ] All tests passing

## Out of Scope

- Multi-user collaboration on skills (future)
- Skill marketplace/sharing (future)
- Advanced workflow chains (future)
- Mobile native app (future)
- Real-time collaborative editing (future)

## Technical Constraints

- Frontend: React 19.2.3 + TypeScript 5.8.2
- Build: Vite 6.2.0
- Styling: Tailwind CSS 4.1.18
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API
- Scheduling: pg_cron or external scheduler

## Dependencies

- Claude API access (Anthropic API key)
- Supabase project with pg_cron extension
- Existing authentication system
- Existing integration framework
