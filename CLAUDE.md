# Expense Tracker - Project Context for Claude Code

## Project Overview

This is a modern, feature-rich expense tracking application built with Next.js 16, React 19, and TypeScript. The application allows users to track their personal expenses with powerful filtering, sorting, and visualization capabilities. All data is persisted client-side using localStorage, making it a fully offline-capable progressive web application.

## Tech Stack

### Core Technologies
- **Next.js 16.0.1**: React framework with App Router architecture
- **React 19.2.0**: UI library with latest concurrent features
- **TypeScript 5.9.3**: Type-safe development
- **Tailwind CSS 4.1.17**: Utility-first CSS framework for styling

### Key Dependencies
- **date-fns 4.1.0**: Date manipulation and formatting
- **lucide-react 0.553.0**: Modern icon library
- **recharts 3.3.0**: Charting library for data visualization

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles and Tailwind directives
│   ├── layout.tsx           # Root layout with ExpenseProvider
│   └── page.tsx             # Main page with dashboard and expense list
├── components/              # React components
│   ├── ExpenseForm.tsx      # Form for adding/editing expenses
│   ├── ExpenseList.tsx      # Advanced list with filtering/sorting/grouping
│   ├── SummaryCards.tsx     # Dashboard summary statistics
│   ├── SpendingChart.tsx    # Visual expense breakdown by category
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── index.ts
├── contexts/                # React Context providers
│   └── ExpenseContext.tsx   # Global expense state management
├── lib/                     # Utility functions
│   └── utils.ts            # Formatting, validation, calculations, export
├── types/                   # TypeScript type definitions
│   └── index.ts            # All type definitions and interfaces
├── package.json
├── tsconfig.json
├── next.config.js
└── postcss.config.mjs
```

## Architecture & Design Patterns

### State Management
- **Context API**: Global expense state managed via `ExpenseContext`
- **localStorage**: Automatic persistence of all expense data
- **Component State**: Local UI state (filters, modals, selections) in components

### Data Flow
1. User actions trigger methods from `useExpenses()` hook
2. Context updates state and automatically saves to localStorage
3. Components re-render with updated data via React's reactivity

### Key Architectural Decisions
- **Client-side only**: No backend, all data in localStorage (storage key: `'expense-tracker-data'`)
- **Optimistic updates**: Immediate UI updates without loading states for CRUD operations
- **Computed values**: Heavy use of `useMemo` for performance (filtering, sorting, grouping, summaries)
- **TypeScript strict mode**: Full type safety across the application

## Data Model

### Core Types (types/index.ts)

```typescript
// Primary expense object
interface Expense {
  id: string;                    // Generated via generateId()
  date: string;                  // ISO date string
  amount: number;                // Positive number
  category: ExpenseCategory;     // One of 6 predefined categories
  description: string;           // Min 3 characters
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}

// Categories
type ExpenseCategory = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

// Display and filtering
interface ExpenseFilters {
  categories?: ExpenseCategory[];
  startDate?: string;
  endDate?: string;
  datePreset?: DatePreset;
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface SortConfig {
  field: 'date' | 'amount' | 'category' | 'description';
  direction: 'asc' | 'desc';
}

type ViewMode = 'list' | 'compact' | 'detailed';
type GroupByOption = 'none' | 'category' | 'day' | 'week' | 'month' | 'year' | 'amountRange';
```

## Component Responsibilities

### app/page.tsx
**Main application container** with two tabs:
- **Dashboard**: Summary cards, spending chart, recent expenses (5 most recent)
- **All Expenses**: Full expense list with advanced filtering

Manages modals for add/edit operations and coordinates between child components.

### components/ExpenseList.tsx
**Most complex component** - handles:
- Advanced filtering (category, date range, amount range, search)
- Multi-field sorting with direction toggle
- Grouping expenses by various criteria
- Three view modes (list, compact, detailed)
- Bulk selection and deletion
- Filter presets (save/load custom filter combinations)
- Real-time summary statistics

**Important**: This component has significant local state and complex memoization chains. When modifying, ensure dependencies in `useMemo` hooks are complete.

### components/ExpenseForm.tsx
**Form component** for add/edit operations:
- Validates input before submission (via `validateExpense`)
- Supports initial data for editing
- Uncontrolled initially, then controlled after validation

### components/SummaryCards.tsx
**Dashboard statistics display**:
- Total expenses, monthly total, average expense
- Category breakdown with color coding
- Top spending category
- Daily and monthly averages
- Highest/lowest expense tracking

### contexts/ExpenseContext.tsx
**Global state provider**:
- CRUD operations: `addExpense`, `updateExpense`, `deleteExpense`
- Automatic localStorage sync
- Loading state during initial hydration
- Always wraps the app in `app/layout.tsx`

### lib/utils.ts
**Utility functions** - critical helpers:
- `formatCurrency()`: USD formatting
- `formatDate()`: Human-readable date display
- `generateId()`: Unique ID generation (timestamp + random)
- `validateExpense()`: Form validation with error messages
- `calculateSummary()`: Complex expense statistics computation
- `sortExpenses()`: Multi-field sorting logic
- `groupExpenses()`: Grouping logic for expense organization
- `getDateRangeFromPreset()`: Convert date presets to actual ranges
- `exportToCSV()` / `downloadCSV()`: CSV export functionality
- `getCategoryColor()`: Category color mapping for UI consistency

## Coding Conventions

### TypeScript
- **Strict mode enabled**: All code must be fully typed
- **No implicit any**: Always specify types
- **Interface over type**: Use `interface` for object shapes, `type` for unions/primitives
- **Path aliases**: Use `@/` prefix for imports (maps to project root)

### React Patterns
- **Functional components**: No class components
- **Hooks**: Heavy use of `useState`, `useEffect`, `useMemo`, `useContext`
- **Props destructuring**: Always destructure props in function signature
- **Event handlers**: Prefix with `handle` (e.g., `handleAddExpense`)
- **Client components**: Mark with `'use client'` when using hooks/browser APIs

### Styling
- **Tailwind CSS**: Utility-first approach
- **Responsive design**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Color system**:
  - Primary: `primary-{50,100,500,600}` (blue tones)
  - Categories: Defined in `getCategoryColor()` - **NEVER** change without updating all usages
- **Component variants**: Many components support variant props (`primary`, `secondary`, `ghost`, `danger`)

### File Organization
- **One component per file**: File name matches component name
- **Colocated types**: Component-specific types in same file, shared types in `types/index.ts`
- **Barrel exports**: UI components export via `components/ui/index.ts`

## Common Development Tasks

### Adding a New Expense Category
1. Update `ExpenseCategory` type in `types/index.ts`
2. Add color mapping in `getCategoryColor()` in `lib/utils.ts`
3. Update `categoryTotals` initialization in `calculateSummary()`
4. Update `categories` array in `components/ExpenseList.tsx`
5. Test filtering, grouping, and chart display

### Adding a New Filter
1. Add field to `ExpenseFilters` interface in `types/index.ts`
2. Update filter state in `ExpenseList.tsx`
3. Add filter logic in `filteredExpenses` useMemo
4. Add UI controls in filters panel
5. Include in `hasActiveFilters()` and `clearFilters()`

### Modifying the Data Model
⚠️ **CRITICAL**: Changing the `Expense` interface requires migration strategy:
- localStorage contains serialized expense arrays
- Users have existing data - breaking changes need migration
- Consider versioning: Add a `version` field to detect old data
- Write migration function to run on app load

### Adding New Summary Statistics
1. Add fields to `ExpenseSummary` type in `types/index.ts`
2. Implement calculation in `calculateSummary()` in `lib/utils.ts`
3. Display in `SummaryCards.tsx` component
4. Ensure proper memoization in `app/page.tsx`

### Creating a New UI Component
1. Create file in `components/ui/` (e.g., `Badge.tsx`)
2. Use TypeScript for props interface
3. Support common variants if applicable
4. Export from `components/ui/index.ts`
5. Use Tailwind for styling (no CSS modules)

## Testing Considerations

### Current State
- **No test suite currently implemented**
- Application is tested manually in browser

### Recommended Testing Approach
If implementing tests:
- **Unit tests**: Utility functions in `lib/utils.ts` (Jest)
- **Component tests**: React Testing Library for components
- **Integration tests**: Full user flows with localStorage mocking
- **E2E tests**: Playwright/Cypress for critical paths

### Critical Paths to Test
1. Add expense → persists to localStorage → appears in list
2. Edit expense → updates localStorage → reflects changes
3. Delete expense → removes from localStorage → disappears from list
4. Filters → correct expenses shown
5. Export CSV → correct data format
6. localStorage failure → graceful error handling

## Build & Development

### Available Scripts
```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint checking
```

### Environment
- **Node.js**: Latest LTS recommended
- **Package Manager**: npm (package-lock.json committed)
- **Development Port**: 3000 (configurable in Next.js)

### Build Output
- Static assets in `.next/`
- Production build can be deployed to Vercel, Netlify, or any Node.js host
- No environment variables required (client-side only app)

## Deployment

### Deployment Targets
- **Vercel**: Zero-config deployment (recommended)
- **Netlify**: Requires build command configuration
- **Static Export**: Can be exported as static HTML with `next export`

### Pre-deployment Checklist
1. Run `npm run build` to verify no type errors
2. Test in production mode with `npm start`
3. Verify localStorage works in target browser
4. Check responsive design on mobile devices
5. Test CSV export functionality

## Known Limitations & Considerations

### Data Persistence
- **localStorage only**: Data is not synced across devices
- **Browser-specific**: Clearing browser data loses all expenses
- **Size limits**: localStorage typically limited to 5-10MB
- **No backup**: Users should export CSV regularly

### Browser Compatibility
- Requires modern browser with ES2017+ support
- localStorage API required
- CSS Grid and Flexbox support needed

### Performance
- **Filtering/sorting**: O(n) operations, may slow with 1000+ expenses
- **Memoization**: Extensive use prevents unnecessary recalculations
- **Grouping**: Can create many DOM nodes with large datasets

## Future Enhancement Ideas

### Potential Features
- Cloud sync (Firebase, Supabase)
- Budget tracking and alerts
- Recurring expenses
- Multi-currency support
- PDF export with charts
- Import from bank CSV
- Mobile app (React Native)
- Dark mode
- Expense tags/labels
- Receipt photo uploads
- Category customization

### Technical Improvements
- Add test suite
- Implement data migration system
- Add error boundaries
- Implement undo/redo
- Add keyboard shortcuts
- Improve accessibility (ARIA labels)
- Add loading skeletons
- Implement virtual scrolling for large lists
- Add service worker for offline support

## Working with Claude Code

### When Making Changes
1. **Read first**: Always read files before modifying
2. **Type safety**: Ensure TypeScript compilation succeeds
3. **Dependency tracking**: Update `useMemo`/`useEffect` dependencies
4. **Testing**: Manual browser testing required (no automated tests)
5. **localStorage**: Remember data persists - may need to clear for testing

### Common Pitfalls
- Forgetting to update type definitions after model changes
- Not updating memoization dependencies (causes stale data)
- Breaking localStorage format (loses user data)
- Missing category color mappings (causes undefined colors)
- Not handling edge cases (empty expense list, zero amounts)

### Best Practices
- Keep components focused on single responsibility
- Extract complex logic to utility functions
- Use TypeScript for safety
- Test with various data states (empty, single item, many items)
- Consider mobile viewports
- Maintain consistent spacing and styling patterns

## Questions or Issues?

If you encounter unexpected behavior:
1. Check browser console for errors
2. Verify localStorage state: `localStorage.getItem('expense-tracker-data')`
3. Clear localStorage to reset: `localStorage.clear()`
4. Check TypeScript compilation: `npm run build`
5. Review recent git commits for changes

---

**Last Updated**: 2025-11-23
**Project Version**: 1.0.0
**Next.js Version**: 16.0.1
**React Version**: 19.2.0
