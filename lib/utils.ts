import { Expense, ExpenseCategory, ExpenseSummary } from '@/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

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

  return {
    totalExpenses,
    monthlyTotal,
    categoryTotals,
    topCategory,
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
