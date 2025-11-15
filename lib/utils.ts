import { Expense, ExpenseCategory, ExpenseSummary, DatePreset, SortConfig, GroupByOption } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  differenceInDays
} from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return format(parseISO(date), 'MMM dd, yyyy');
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateExpense = (
  amount: string,
  category: ExpenseCategory,
  description: string
): string | null => {
  const amountNum = parseFloat(amount);

  if (!amount || isNaN(amountNum) || amountNum <= 0) {
    return 'Please enter a valid amount greater than 0';
  }

  if (!category) {
    return 'Please select a category';
  }

  if (!description.trim()) {
    return 'Please enter a description';
  }

  if (description.trim().length < 3) {
    return 'Description must be at least 3 characters';
  }

  return null;
};

export const getDateRangeFromPreset = (preset: DatePreset): { startDate: Date; endDate: Date } | null => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now)
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday)
      };
    case 'thisWeek':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 0 }),
        endDate: endOfWeek(now, { weekStartsOn: 0 })
      };
    case 'lastWeek':
      const lastWeek = subDays(now, 7);
      return {
        startDate: startOfWeek(lastWeek, { weekStartsOn: 0 }),
        endDate: endOfWeek(lastWeek, { weekStartsOn: 0 })
      };
    case 'thisMonth':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    case 'last3Months':
      return {
        startDate: startOfMonth(subMonths(now, 2)),
        endDate: endOfMonth(now)
      };
    case 'last6Months':
      return {
        startDate: startOfMonth(subMonths(now, 5)),
        endDate: endOfMonth(now)
      };
    case 'thisYear':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now)
      };
    case 'lastYear':
      const lastYear = subYears(now, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear)
      };
    case 'custom':
      return null;
    default:
      return null;
  }
};

export const sortExpenses = (expenses: Expense[], sortConfig: SortConfig): Expense[] => {
  return [...expenses].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.field) {
      case 'date':
        comparison = parseISO(a.date).getTime() - parseISO(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
};

export const groupExpenses = (expenses: Expense[], groupBy: GroupByOption): Record<string, Expense[]> => {
  if (groupBy === 'none') {
    return { 'All Expenses': expenses };
  }

  const groups: Record<string, Expense[]> = {};

  expenses.forEach((expense) => {
    let groupKey: string;

    switch (groupBy) {
      case 'category':
        groupKey = expense.category;
        break;
      case 'day':
        groupKey = format(parseISO(expense.date), 'MMM dd, yyyy');
        break;
      case 'week':
        const weekStart = startOfWeek(parseISO(expense.date), { weekStartsOn: 0 });
        groupKey = `Week of ${format(weekStart, 'MMM dd, yyyy')}`;
        break;
      case 'month':
        groupKey = format(parseISO(expense.date), 'MMMM yyyy');
        break;
      case 'year':
        groupKey = format(parseISO(expense.date), 'yyyy');
        break;
      case 'amountRange':
        if (expense.amount < 25) groupKey = '$0 - $25';
        else if (expense.amount < 50) groupKey = '$25 - $50';
        else if (expense.amount < 100) groupKey = '$50 - $100';
        else if (expense.amount < 250) groupKey = '$100 - $250';
        else if (expense.amount < 500) groupKey = '$250 - $500';
        else groupKey = '$500+';
        break;
      default:
        groupKey = 'All Expenses';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(expense);
  });

  return groups;
};

export const calculateSummary = (expenses: Expense[]): ExpenseSummary => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach((expense) => {
    categoryTotals[expense.category] += expense.amount;
  });

  const topCategory = Object.entries(categoryTotals).reduce(
    (max, [category, amount]) => {
      if (amount > (max?.amount || 0)) {
        return { category: category as ExpenseCategory, amount };
      }
      return max;
    },
    null as { category: ExpenseCategory; amount: number } | null
  );

  // Enhanced statistics
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  const sortedByAmount = [...expenses].sort((a, b) => a.amount - b.amount);
  const highestExpense = sortedByAmount[sortedByAmount.length - 1] || null;
  const lowestExpense = sortedByAmount[0] || null;

  // Calculate average daily
  let averageDaily = 0;
  if (expenses.length > 0) {
    const dates = expenses.map(e => parseISO(e.date));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const daysDiff = differenceInDays(now, oldestDate) + 1;
    averageDaily = daysDiff > 0 ? totalExpenses / daysDiff : 0;
  }

  // Average monthly (total / number of months with data)
  const averageMonthly = monthlyTotal; // Simplified for now

  return {
    totalExpenses,
    monthlyTotal,
    categoryTotals,
    topCategory,
    averageExpense,
    averageDaily,
    averageMonthly,
    highestExpense,
    lowestExpense,
    expenseCount: expenses.length,
  };
};

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Amount', 'Category', 'Description'];
  const rows = expenses.map((expense) => [
    formatDate(expense.date),
    expense.amount.toString(),
    expense.category,
    expense.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (expenses: Expense[]): void => {
  const csvContent = exportToCSV(expenses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: '#ef4444',
    Transportation: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Bills: '#f59e0b',
    Other: '#6b7280',
  };
  return colors[category];
};
