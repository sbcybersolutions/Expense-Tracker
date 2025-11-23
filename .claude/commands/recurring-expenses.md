# Recurring Expenses Enhancement

Add automatic recurring expense functionality to help users manage regular bills, subscriptions, and other predictable expenses without manual entry.

## Requirements

Implement a comprehensive recurring expense system that automatically creates expense entries based on schedules.

### 1. Recurring Expense Data Model
Create new type definitions in `types/index.ts`:

**RecurringExpense Interface:**
- `id: string`
- `amount: number`
- `category: ExpenseCategory`
- `description: string`
- `frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'`
- `startDate: string` (when recurrence starts)
- `endDate?: string | null` (optional end date, null for indefinite)
- `nextOccurrence: string` (next scheduled date)
- `lastProcessed?: string` (last date an expense was created)
- `dayOfMonth?: number` (for monthly/quarterly/yearly, 1-31)
- `dayOfWeek?: number` (for weekly, 0-6 where 0 is Sunday)
- `isActive: boolean`
- `autoCreate: boolean` (automatically create expense or require confirmation)
- `reminderDays?: number` (days before occurrence to show reminder)
- `createdAt: string`
- `updatedAt: string`

**RecurringExpenseInstance Interface:**
- `recurringExpenseId: string`
- `scheduledDate: string`
- `status: 'pending' | 'created' | 'skipped'`
- `expenseId?: string` (link to created expense)
- `createdAt: string`

### 2. Recurring Expense Context
Create `contexts/RecurringExpenseContext.tsx`:
- Store recurring expenses in localStorage (key: 'expense-tracker-recurring')
- Store instances in localStorage (key: 'expense-tracker-recurring-instances')
- CRUD operations for recurring expenses
- Calculate next occurrence dates
- Process due recurring expenses (create actual expenses)
- Manage reminders and notifications

### 3. Background Processing
Implement automatic processing:
- Check for due recurring expenses on app load
- Process recurring expenses that are due (create actual expense entries)
- Update next occurrence dates
- Handle missed occurrences (backfill or skip based on settings)

### 4. UI Components

#### RecurringExpenseCard Component (`components/RecurringExpenseCard.tsx`)
- Display recurring expense details
- Show next occurrence date and countdown
- Status indicator (active/paused)
- Frequency badge
- Quick actions: edit, pause/resume, delete
- History of created expenses

#### RecurringExpenseForm Component (`components/RecurringExpenseForm.tsx`)
- Form to create/edit recurring expenses
- Amount, category, description fields (reuse from ExpenseForm)
- Frequency selector with visual examples
- Start date picker
- Optional end date picker
- Day of month selector (for monthly+)
- Day of week selector (for weekly)
- Auto-create toggle
- Reminder settings
- Preview of next 5 occurrences

#### RecurringExpenseList Component (`components/RecurringExpenseList.tsx`)
- List all recurring expenses
- Filter by category, frequency, status
- Sort by next occurrence, amount, frequency
- Bulk actions (pause all, activate all)
- Summary stats (total monthly recurring, count by category)

#### UpcomingRecurringExpenses Component (`components/UpcomingRecurringExpenses.tsx`)
- Widget for dashboard showing next 7 days of recurring expenses
- Allows manual creation or skipping
- Shows total upcoming amount

### 5. Integration Points

**Update ExpenseContext:**
- Add method to link created expenses to recurring expense instances
- Track which expenses were auto-generated

**Update Dashboard (app/page.tsx):**
- Add "Recurring" tab
- Show upcoming recurring expenses widget on main dashboard
- Display notifications for pending recurring expenses requiring confirmation

**Update SummaryCards:**
- Add card showing total monthly recurring expenses
- Show percentage of budget that's recurring vs. one-time

**Expense List:**
- Add badge/icon to expenses created from recurring templates
- Link back to recurring expense template

### 6. Core Features

**Smart Scheduling:**
- Calculate next occurrence based on frequency
- Handle month-end dates (e.g., 31st for February becomes 28th/29th)
- Skip weekends option (move to next business day)
- Handle DST transitions properly

**Processing Logic:**
- Auto-create expenses for recurring items when due
- For manual confirmation: show pending list with approve/skip
- Backfill missed occurrences (optional setting)
- Create instances X days in advance (configurable)

**Notifications:**
- Show badge count for pending recurring expenses
- Reminder notifications X days before (if configured)
- Alert for paused recurring expenses
- Summary of processed recurring expenses

**History & Tracking:**
- View all expenses created from a recurring template
- Statistics on recurring vs. one-time expenses
- Detect and warn about duplicate manual entries

### 7. Utility Functions
Add to `lib/utils.ts`:
- `calculateNextOccurrence(recurring)` - returns next date based on frequency
- `generateOccurrences(recurring, count)` - preview next N occurrences
- `shouldProcessRecurring(recurring)` - check if due for processing
- `processRecurringExpense(recurring, expenseContext)` - create expense
- `getUpcomingRecurring(allRecurring, days)` - get upcoming in X days
- `calculateMonthlyRecurringTotal(allRecurring)` - estimate monthly total

### 8. Settings & Configuration
Add recurring expense settings:
- Auto-process time (e.g., "Check at midnight")
- Backfill missed occurrences (yes/no)
- Default reminder days
- Advance creation days (create X days before due)

## Implementation Notes

- All data persists in localStorage with atomic updates
- Use date-fns for robust date calculations
- Implement proper timezone handling
- Add comprehensive validation (end date after start date, etc.)
- Use existing UI component library for consistency
- Make all components responsive
- Add proper TypeScript types throughout
- Include detailed JSDoc comments for complex logic
- Consider edge cases (leap years, month-end dates, etc.)

## Success Criteria

- Users can create recurring expenses with various frequencies
- Recurring expenses automatically create expense entries when due
- Users receive reminders before recurring expenses are due
- Next occurrence dates are calculated correctly for all frequencies
- Users can pause/resume recurring expenses
- History shows all expenses created from recurring templates
- The system handles edge cases (month-end, leap years) correctly
- UI clearly distinguishes auto-generated from manual expenses
- Performance remains good with many recurring expenses

## Example Use Cases

1. **Monthly Rent**: $1500, monthly on 1st, indefinite
2. **Netflix Subscription**: $15.99, monthly on 15th, auto-create
3. **Biweekly Groceries**: $150, every 2 weeks on Sunday
4. **Quarterly Insurance**: $450, quarterly, reminder 7 days before
5. **Annual Membership**: $99, yearly on specific date
