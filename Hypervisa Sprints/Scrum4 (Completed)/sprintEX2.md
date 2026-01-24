# Sprint EX2: Source Files Panel - Improved Collapsed State

## Goal
Transform the Source Files panel collapsed state from a narrow strip into an informative, compact view that still provides useful information.

## Prerequisites Completed By This Sprint
- Pattern established for informative collapsed panel states (reusable for Chat History)
- Smooth transition animations between expanded/collapsed states
- Mini file icons display pattern

## Dependencies From Previous Sprints
- **Sprint EX1**: Three-column layout structure and panel state management

## Deliverables

### Feature 1: Expanded Collapsed Width
- **Description**: Change the collapsed Source Files panel from ~40-50px to ~150-200px to allow meaningful content display.
- **Acceptance Criteria**:
  - [ ] Collapsed width is 150-200px (configurable)
  - [ ] Width is large enough to display summary information
  - [ ] Maintains visual distinction from expanded state (~300px)
  - [ ] Proportions work well with three-column layout
- **Technical Notes**: Update the width constant from Sprint EX1.

### Feature 2: Collapsed State Header
- **Description**: Display a compact header in the collapsed state showing key information at a glance.
- **Acceptance Criteria**:
  - [ ] Shows "Source Files" text (smaller font than expanded)
  - [ ] Shows expand icon (▶) that indicates clickability
  - [ ] Shows file count summary (e.g., "12/12" for selected/total)
  - [ ] Shows total size (e.g., "2.4 MB")
  - [ ] Layout example:
    ```
    ▶ Source Files
       12/12 • 2.4 MB
    ```
- **Technical Notes**: Calculate totals from current source files state.

### Feature 3: Mini File Icons Display
- **Description**: Show a compact visual representation of selected files using small icons in the collapsed state.
- **Acceptance Criteria**:
  - [ ] Display mini icons for selected source files
  - [ ] Icons arranged in a grid or compact list
  - [ ] File type indicated by icon (code, doc, image, etc.)
  - [ ] Overflow handling for many files (show first N + "+X more")
  - [ ] Icons are recognizable at small size
- **Technical Notes**: Reuse existing file type icon logic at smaller scale.

### Feature 4: Smooth Transition Animation
- **Description**: Implement smooth CSS transitions when toggling between expanded and collapsed states.
- **Acceptance Criteria**:
  - [ ] Transition duration: 300-400ms
  - [ ] Width animates smoothly
  - [ ] Content fades/transitions appropriately
  - [ ] No layout jumping or flashing
  - [ ] Animation feels polished and intentional
- **Technical Notes**: Use CSS transitions with appropriate easing (ease-out or ease-in-out).

### Feature 5: Click-to-Expand Behavior
- **Description**: The entire collapsed panel should be clickable to expand it.
- **Acceptance Criteria**:
  - [ ] Clicking anywhere on collapsed panel expands it
  - [ ] Cursor indicates clickability (pointer)
  - [ ] Hover state provides visual feedback
  - [ ] Existing collapse button in expanded state still works
- **Technical Notes**: Add click handler to collapsed container.

### Feature 6: Visual Design Consistency
- **Description**: Ensure the collapsed state maintains visual consistency with the expanded state and overall design system.
- **Acceptance Criteria**:
  - [ ] Same color scheme as expanded state
  - [ ] Consistent border/shadow styling
  - [ ] Proper padding and margins
  - [ ] Typography hierarchy maintained at smaller scale
  - [ ] Hover states match design patterns
- **Technical Notes**: Reference existing panel styles.

## Technical Considerations
- Collapsed state should be performant (no complex calculations on every render)
- File count and size should update reactively when source files change
- Consider memoization for mini icon grid to prevent unnecessary re-renders
- Transition should not block user interaction

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Collapsed state is informative and usable
- [ ] Transitions are smooth (no jank)
- [ ] Click-to-expand works reliably
- [ ] Visual design approved/consistent
- [ ] Pattern documented for reuse in Chat History collapse (Sprint EX5)

## Notes
- This establishes the pattern that will be mirrored for Chat History panel collapse
- The mini icons feature is optional if implementation proves complex - prioritize the header info
- Consider accessibility: collapsed state should still be keyboard navigable
