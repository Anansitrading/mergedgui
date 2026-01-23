# Sprint EX3: Chat History Panel - UI Structure & Components

## Goal
Build the complete Chat History panel UI with all visual components, list rendering, and basic interactions (without data persistence).

## Prerequisites Completed By This Sprint
- Fully functional Chat History panel UI
- Chat item components with preview and metadata
- Date/time grouping for chat organization
- Foundation ready for data persistence integration

## Dependencies From Previous Sprints
- **Sprint EX1**: Three-column layout with Chat History placeholder container
- **Sprint EX2**: Visual patterns for panel styling (consistency)

## Deliverables

### Feature 1: Chat History Panel Header
- **Description**: Create the header section of the Chat History panel with title and action buttons.
- **Acceptance Criteria**:
  - [ ] Header shows "Chat History" or "History" title
  - [ ] Header includes icon (clock or scroll icon)
  - [ ] "New Chat" button positioned prominently (top of panel)
  - [ ] Collapse button (◀) to minimize panel
  - [ ] Header styling matches Source Files panel header
- **Technical Notes**:
  ```
  ┌─────────────────────┐
  │ 🕐 Chat History  ◀  │
  │ [+ New Chat]        │
  └─────────────────────┘
  ```

### Feature 2: Chat History Item Component
- **Description**: Create a reusable component for individual chat history items.
- **Acceptance Criteria**:
  - [ ] Displays timestamp (e.g., "Today, 14:30" or "Yesterday")
  - [ ] Shows preview text (first question/topic, 1-2 lines max)
  - [ ] Optionally shows message count badge
  - [ ] Truncates long preview text with ellipsis
  - [ ] Consistent height for list uniformity
- **Technical Notes**:
  ```typescript
  interface ChatHistoryItemProps {
    id: string;
    timestamp: Date;
    title: string;
    preview: string;
    messageCount: number;
    isActive: boolean;
  }
  ```

### Feature 3: Chat History List with Scrolling
- **Description**: Render the list of chat history items in a scrollable container.
- **Acceptance Criteria**:
  - [ ] Vertical scrollable list
  - [ ] Chronological sorting (newest at top)
  - [ ] Smooth scroll behavior
  - [ ] Subtle dividers between items
  - [ ] Empty state when no history exists
- **Technical Notes**: Use virtualized list if performance becomes an issue with many items.

### Feature 4: Date/Time Grouping
- **Description**: Group chat items by date for easier navigation.
- **Acceptance Criteria**:
  - [ ] Group headers: "Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"
  - [ ] Group headers are sticky or clearly visible
  - [ ] Proper date formatting for timestamps
  - [ ] Relative time for recent items (e.g., "2 hours ago")
- **Technical Notes**: Use date-fns or similar for date manipulation.

### Feature 5: Interactive States
- **Description**: Implement hover, active, and selected states for chat items.
- **Acceptance Criteria**:
  - [ ] Hover state: subtle background highlight
  - [ ] Active/current chat: distinct highlight/border
  - [ ] Click handler on each item (triggers chat load - actual loading in EX4)
  - [ ] Cursor indicates clickability
  - [ ] Focus states for keyboard navigation
- **Technical Notes**: Active chat state managed by parent component.

### Feature 6: Item Action Menu
- **Description**: Add contextual actions for each chat history item.
- **Acceptance Criteria**:
  - [ ] Actions appear on hover (icons) or via right-click menu
  - [ ] Available actions: Rename, Delete
  - [ ] Delete shows confirmation dialog
  - [ ] Rename allows inline editing or modal
  - [ ] Actions are accessible but not intrusive
- **Technical Notes**: Actions will connect to data layer in Sprint EX4.

### Feature 7: Search/Filter Input
- **Description**: Add a search input to filter chat history.
- **Acceptance Criteria**:
  - [ ] Search input below header
  - [ ] Filters list by chat title/preview content
  - [ ] Clear button to reset search
  - [ ] Shows "No results" when search matches nothing
  - [ ] Debounced search (300ms)
- **Technical Notes**: Client-side filtering of loaded history.

## Technical Considerations
- Components should be stateless where possible, receiving data via props
- Use mock data for development and testing
- Ensure components are accessible (ARIA labels, keyboard navigation)
- Consider loading states for when data is being fetched
- Style components to match existing design system

## Mock Data Structure
```typescript
// Use for development until Sprint EX4 connects real data
const mockChatHistory: ChatHistoryItem[] = [
  {
    id: '1',
    timestamp: new Date(),
    title: 'Authentication Flow',
    preview: 'How do I implement JWT authentication in this project?',
    messageCount: 12,
    lastActivity: new Date()
  },
  // ... more mock items
];
```

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Panel renders correctly in three-column layout
- [ ] All interactive states work (hover, click, active)
- [ ] Search/filter functions correctly
- [ ] Action menu appears and triggers callbacks
- [ ] Empty state displays appropriately
- [ ] Components work with mock data
- [ ] Visual design matches Source Files panel

## Notes
- This sprint focuses on UI/UX - data persistence comes in Sprint EX4
- Use callbacks/props for actions; actual implementation connects later
- The "New Chat" button should clear current chat (prepare callback, implement in EX4)
- Test with varying amounts of mock data (0, 5, 50, 100+ items)
