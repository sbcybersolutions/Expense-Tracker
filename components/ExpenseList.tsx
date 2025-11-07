'use client';

import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, ExpenseFilters } from '@/types';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils';
import { Edit2, Trash2, Search } from 'lucide-react';
import { Button, Input, Select } from './ui';
import { parseISO, isWithinInterval } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categories: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    startDate: '',
    endDate: '',
    searchQuery: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (expense.category !== filters.category) return false;
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        const expenseDate = parseISO(expense.date);

        if (filters.startDate && filters.endDate) {
          const start = parseISO(filters.startDate);
          const end = parseISO(filters.endDate);
          if (!isWithinInterval(expenseDate, { start, end })) return false;
        } else if (filters.startDate) {
          const start = parseISO(filters.startDate);
          if (expenseDate < start) return false;
        } else if (filters.endDate) {
          const end = parseISO(filters.endDate);
          if (expenseDate > end) return false;
        }
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesDescription = expense.description
          .toLowerCase()
          .includes(query);
        const matchesCategory = expense.category.toLowerCase().includes(query);
        const matchesAmount = expense.amount.toString().includes(query);

        if (!matchesDescription && !matchesCategory && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search expenses..."
              value={filters.searchQuery || ''}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
            />
            <Search
              className="absolute right-3 top-2 text-gray-400"
              size={20}
            />
          </div>

          <Select
            value={filters.category || 'All'}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value as ExpenseCategory | 'All',
              })
            }
            options={categories.map((cat) => ({ value: cat, label: cat }))}
          />

          <Input
            type="date"
            placeholder="Start Date"
            value={filters.startDate || ''}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ''}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        {(filters.category !== 'All' ||
          filters.startDate ||
          filters.endDate ||
          filters.searchQuery) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  category: 'All',
                  startDate: '',
                  endDate: '',
                  searchQuery: '',
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-600">
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </p>
        <p className="text-sm font-semibold text-gray-900">
          Total: {formatCurrency(totalAmount)}
        </p>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No expenses found</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-1">{expense.description}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    title="Edit expense"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
