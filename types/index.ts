export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: ExpenseCategory;
  description: string;
}

export type SortField = 'date' | 'amount' | 'category' | 'description';
export type SortDirection = 'asc' | 'desc';
export type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'lastYear' | 'custom';
export type ViewMode = 'list' | 'compact' | 'detailed';
export type GroupByOption = 'none' | 'category' | 'day' | 'week' | 'month' | 'year' | 'amountRange';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface ExpenseFilters {
  categories?: ExpenseCategory[];
  startDate?: string;
  endDate?: string;
  datePreset?: DatePreset;
  searchQuery?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface DisplaySettings {
  viewMode: ViewMode;
  groupBy: GroupByOption;
  sortConfig: SortConfig;
  itemsPerPage: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: ExpenseFilters;
  createdAt: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  monthlyTotal: number;
  categoryTotals: Record<ExpenseCategory, number>;
  topCategory: {
    category: ExpenseCategory;
    amount: number;
  } | null;
  averageExpense: number;
  averageDaily: number;
  averageMonthly: number;
  highestExpense: Expense | null;
  lowestExpense: Expense | null;
  expenseCount: number;
}
