# Common UI Patterns & UX Rationale

Reference for selecting and designing standard UI components correctly.

---

## Navigation

### Top Navigation Bar
**Use when**: Primary navigation with 3–7 destinations, desktop-first.
**UX notes**: Highlight active state clearly. Keep labels short (1–2 words). Don't hide primary actions in nav menus.

### Bottom Tab Bar (Mobile)
**Use when**: 3–5 primary destinations on mobile.
**UX notes**: Always show labels alongside icons. Use filled icon for active state. Keep to most-used destinations only.

### Sidebar Navigation
**Use when**: 5+ destinations, complex hierarchy, power users.
**UX notes**: Collapsible at md breakpoint. Show hierarchy with indentation. Support keyboard navigation.

---

## Forms

### Best Practices
- **Labels**: Always above the field, always visible (never inside the field as the only label)
- **Placeholder text**: Use for format hints only (e.g., "MM/DD/YYYY"), never for labels
- **Field order**: Follow logical/mental model order, not database order
- **Inline validation**: Validate on blur, not on keystroke (reduces anxiety)
- **Error messages**: Red border + icon + message below field. Message says what's wrong AND how to fix it.
- **Required fields**: Mark optional fields instead (fewer to mark usually)
- **Submit button**: Descriptive label ("Save changes" not "Submit"). Disable after click to prevent double-submit.

### Input Types by Data
| Data | Input Type |
|------|-----------|
| Short text | text |
| Email | email (triggers email keyboard on mobile) |
| Phone | tel |
| Number with decimals | number (or text for formatted numbers) |
| Password | password |
| Long text | textarea |
| Yes/No single | Toggle or Checkbox |
| One of few options (≤5) | Radio group |
| One of many options (>5) | Select dropdown |
| Many of many | Multi-select or Checkboxes |
| Date | Date picker (or text with format hint) |

---

## Feedback & Status

### Loading States
- **Skeleton screens** (preferred): Mirror the shape of incoming content. Reduces perceived wait time.
- **Spinner**: Use only for short waits (<3s) or when content shape is unknown.
- **Progress bar**: Use when duration is known or long (>3s).
- Always disable interactive elements while loading to prevent double-actions.

### Empty States
Every list/table/feed needs an empty state:
1. Illustration or icon
2. Friendly headline ("Nothing here yet")
3. Explanation (why it's empty)
4. Call-to-action (what to do next)

### Toast / Snackbar Notifications
- Success: Auto-dismiss after 3–5s
- Error: Persistent (require dismissal), include action to fix
- Position: Bottom-center on mobile, top-right on desktop
- Never stack more than 3

### Modals / Dialogs
- Use for: Destructive confirmations, focused tasks that don't need full navigation
- Max width: 560px for simple, 720px for complex
- Always: Backdrop, focus trap, close on Escape, close button visible
- Never use for: Complex forms (use a drawer or page instead)

### Drawers / Sheets
- Use for: Contextual detail, edit panels, filters
- Right drawer: Secondary actions, detail views
- Bottom sheet (mobile): Actions, pickers, filters

---

## Data Display

### Tables
- Align numbers right, text left
- Fixed header on scroll if >10 rows
- Row hover state for scannability
- Sortable columns: Show current sort direction clearly
- Pagination OR infinite scroll — never both

### Cards
- Use for: Scannable collections of similar items
- Always: Consistent height within a grid, clear CTA, hover state
- Image cards: Use consistent aspect ratios (16:9, 1:1, 4:3)

### Data Visualization
- Use charts only when trends or comparisons matter
- Label axes and data points directly where possible
- Color-blind safe: Use shapes/patterns as secondary encoding
- Avoid pie charts for >5 slices (use bar chart)

---

## Destructive Actions

Always follow this pattern:
1. Trigger action (button labeled "Delete", "Remove", etc.)
2. Confirmation dialog with clear consequence ("This will permanently delete X and cannot be undone.")
3. Confirm button is red/destructive style, labeled with the action ("Delete", not "Yes")
4. Cancel is the default focus

---

## Onboarding Patterns

### Progressive Onboarding (Preferred)
Reveal features contextually as users encounter them. Use tooltips, empty state CTAs, and inline hints.

### Setup Wizard
Use only when setup is genuinely required before the product has value (e.g., connecting an integration). Keep to <5 steps.

### Feature Tours
Use sparingly. Users skip them. Prefer contextual hints over upfront tours.
