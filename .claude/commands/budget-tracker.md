# Budget Tracker Enhancement

Add comprehensive budget management features to the Expense Tracker application to help users set spending limits and track their progress against budgets.

## Requirements

Implement the following budget management features:

### 1. Budget Data Model
Create a new type definition in `types/index.ts`:
- `Budget` interface with:
  - `id: string`
  - `category: ExpenseCategory | 'overall'` (for category-specific or overall budget)
  - `amount: number` (budget limit)
  - `period: 'weekly' | 'monthly' | 'yearly'`
  - `startDate: string`
  - `endDate?: string` (optional, for fixed-duration budgets)
  - `isActive: boolean`
  - `alertThreshold: number` (percentage to trigger warning, e.g., 80)
  - `createdAt: string`
  - `updatedAt: string`

### 2. Budget Context
Create `contexts/BudgetContext.tsx`:
- Store budgets in localStorage (key: 'expense-tracker-budgets')
- Provide CRUD operations for budgets
- Calculate budget status (remaining, percentage used, days left in period)
- Detect when budgets are exceeded or approaching limits

### 3. Budget UI Components

#### BudgetCard Component (`components/BudgetCard.tsx`)
- Display budget information with progress bar
- Show amount spent vs. budget limit
- Color-coded status (green: safe, yellow: warning, red: exceeded)
- Visual indicator for percentage used
- Quick actions: edit, delete

#### BudgetForm Component (`components/BudgetForm.tsx`)
- Form to create/edit budgets
- Select category or overall budget
- Set amount and period
- Configure alert threshold
- Date range picker for fixed-duration budgets

#### BudgetDashboard Component (`components/BudgetDashboard.tsx`)
- Overview of all active budgets
- Summary cards showing:
  - Total budgets set
  - Budgets on track
  - Budgets with warnings
  - Budgets exceeded
- List of budget cards
- Notifications/alerts for budgets approaching or exceeding limits

### 4. Integration

**Update ExpenseContext:**
- Add method to check expenses against budgets
- Trigger budget alerts when adding new expenses

**Update Dashboard (app/page.tsx):**
- Add new "Budgets" tab alongside "Dashboard" and "All Expenses"
- Display budget overview cards
- Show budget warnings/alerts prominently

**Update SummaryCards:**
- Add budget comparison data
- Show "X% of monthly budget used" if budget exists

### 5. Features to Implement

**Budget Alerts:**
- Show warning when adding expense that would exceed budget
- Display notification banner when budget threshold is reached
- Highlight over-budget categories in red

**Budget Analytics:**
- Calculate spending pace (on track to stay within budget?)
- Project end-of-period spending based on current trends
- Show historical budget performance

**Smart Defaults:**
- Suggest budget amounts based on historical spending
- Auto-renew budgets for new periods

### 6. Utility Functions
Add to `lib/utils.ts`:
- `calculateBudgetStatus(budget, expenses)` - returns current status
- `getBudgetPeriodDates(budget)` - returns start/end dates for current period
- `isBudgetExceeded(budget, expenses)` - boolean check
- `getSpendingPace(budget, expenses)` - returns daily/weekly spending rate
- `predictPeriodEnd(budget, expenses)` - forecast total spending

## Implementation Notes

- Ensure all budget data persists in localStorage
- Make the UI responsive and mobile-friendly
- Use existing UI components (Button, Card, Modal, Input, Select) for consistency
- Add proper TypeScript types for all new code
- Follow the existing code style and patterns
- Add appropriate icons from lucide-react
- Implement proper error handling and validation

## Success Criteria

- Users can create, edit, and delete budgets for categories or overall spending
- Budget progress is clearly visualized with progress bars and color coding
- Users receive clear warnings when approaching or exceeding budgets
- Budget data persists across sessions
- The feature integrates seamlessly with existing expense tracking functionality
