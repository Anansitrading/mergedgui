# Sprint EX1: Foundation - Three-Column Layout Structure

## Goal
Establish the foundational three-column layout that will support Source Files, Chat Window, and Chat History panels.

## Prerequisites Completed By This Sprint
- Three-column flex layout ready for Chat History panel integration
- Layout container structure for responsive panel behavior
- Foundation for independent panel collapse states

## Dependencies From Previous Sprints
None - This is the foundational sprint.

## Deliverables

### Feature 1: Three-Column Container Layout
- **Description**: Refactor the current two-column layout (Source Files + Chat) to a three-column layout that accommodates the new Chat History panel on the right.
- **Acceptance Criteria**:
  - [x] Main container uses flexbox with three child sections
  - [x] Left section: Source Files panel (existing)
  - [x] Center section: Chat Window (existing, flex-grow to fill space)
  - [x] Right section: Chat History panel placeholder (new)
  - [x] Layout maintains existing functionality
- **Technical Notes**:
  ```
  ┌─────────────┬──────────────────┬─────────────┐
  │Source Files │   Chat Window    │Chat History │
  │   (left)    │     (center)     │   (right)   │
  └─────────────┴──────────────────┴─────────────┘
  ```

### Feature 2: Panel Width Configuration
- **Description**: Define and implement configurable widths for each panel section.
- **Acceptance Criteria**:
  - [x] Source Files expanded width: ~300px
  - [x] Source Files collapsed width: ~180px (placeholder, improved in Sprint EX2)
  - [x] Chat History expanded width: ~280px
  - [x] Chat History collapsed width: ~180px (placeholder)
  - [x] Chat Window: flex (fills remaining space)
  - [x] Widths defined as constants/variables for easy adjustment
- **Technical Notes**: Use CSS custom properties or style constants for maintainability.

### Feature 3: Chat History Panel Placeholder
- **Description**: Create a basic placeholder component for the Chat History panel that will be populated in later sprints.
- **Acceptance Criteria**:
  - [x] Right panel container exists and renders
  - [x] Shows "Chat History" header with placeholder content
  - [x] Basic styling consistent with Source Files panel
  - [x] Panel is visible in the three-column layout
- **Technical Notes**: This is a structural placeholder - functionality comes in Sprint EX3.

### Feature 4: Responsive Width Behavior
- **Description**: Implement the responsive behavior where Chat Window expands/contracts based on side panel states.
- **Acceptance Criteria**:
  - [x] Both panels open: Source Files | Chat | History (all visible)
  - [x] Left collapsed: [narrow] | Chat (wider) | History
  - [x] Right collapsed: Source Files | Chat (wider) | [narrow]
  - [x] Both collapsed: [narrow] | Chat (maximum width) | [narrow]
  - [x] Chat window always fills available horizontal space
- **Technical Notes**: Use CSS flexbox with `flex-grow: 1` on chat window.

### Feature 5: Panel State Management Setup
- **Description**: Set up state management to track expanded/collapsed state for both side panels independently.
- **Acceptance Criteria**:
  - [x] State variable for Source Files panel collapsed state
  - [x] State variable for Chat History panel collapsed state
  - [x] Both panels can be toggled independently
  - [x] State changes trigger proper re-renders
- **Technical Notes**: Prepare for localStorage persistence (implemented in Sprint EX4).

## Technical Considerations
- Maintain backwards compatibility with existing Source Files and Chat functionality
- Use consistent spacing/margins between all three sections
- Ensure smooth CSS transitions are possible (transitions added in Sprint EX2)
- Consider mobile/narrow screen behavior (can be addressed in final polish sprint)

## Definition of Done
- [x] All acceptance criteria met
- [x] Three-column layout renders correctly
- [x] Existing Source Files functionality unaffected
- [x] Existing Chat Window functionality unaffected
- [x] No console errors or warnings introduced
- [ ] Layout tested at various viewport widths

## Notes
- This sprint focuses purely on layout structure - no Chat History functionality yet
- The collapsed states will show narrow placeholders; proper collapsed content comes in Sprint EX2 and EX5
- This foundation enables parallel work on Source Files improvements and Chat History features
