'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Expense, ExpenseCategory, ExpenseFilters, DatePreset, SortConfig, ViewMode, GroupByOption, FilterPreset } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, getDateRangeFromPreset, sortExpenses, groupExpenses, generateId } from '@/lib/utils';
import { Edit2, Trash2, Search, ChevronDown, ChevronUp, ArrowUpDown, Filter, X, Save, Bookmark, Check } from 'lucide-react';
import { Button, Input, Select, Card } from './ui';
import { parseISO, isWithinInterval, format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categories: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

const datePresets: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    categories: [],
    startDate: '',
    endDate: '',
    datePreset: undefined,
    searchQuery: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc',
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Load filter presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('expense-filter-presets');
    if (saved) {
      try {
        setFilterPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load filter presets', e);
      }
    }
  }, []);

  // Save filter presets to localStorage
  const saveFilterPresets = (presets: FilterPreset[]) => {
    localStorage.setItem('expense-filter-presets', JSON.stringify(presets));
    setFilterPresets(presets);
  };

  // Handle date preset selection
  const handleDatePresetChange = (preset: DatePreset) => {
    setFilters({ ...filters, datePreset: preset });

    if (preset === 'custom') {
      return;
    }

    const range = getDateRangeFromPreset(preset);
    if (range) {
      setFilters({
        ...filters,
        datePreset: preset,
        startDate: format(range.startDate, 'yyyy-MM-dd'),
        endDate: format(range.endDate, 'yyyy-MM-dd'),
      });
    }
  };

  // Toggle category selection
  const toggleCategory = (category: ExpenseCategory) => {
    const current = filters.categories || [];
    const newCategories = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setFilters({ ...filters, categories: newCategories });
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(expense.category)) return false;
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

      // Amount range filter
      if (filters.minAmount !== undefined && expense.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== undefined && expense.amount > filters.maxAmount) {
        return false;
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

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    return sortExpenses(filteredExpenses, sortConfig);
  }, [filteredExpenses, sortConfig]);

  // Group expenses
  const groupedExpenses = useMemo(() => {
    return groupExpenses(sortedExpenses, groupBy);
  }, [sortedExpenses, groupBy]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const averageAmount = useMemo(() => {
    return filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
  }, [filteredExpenses, totalAmount]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: [],
      startDate: '',
      endDate: '',
      datePreset: undefined,
      searchQuery: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.categories && filters.categories.length > 0) ||
      filters.startDate ||
      filters.endDate ||
      filters.searchQuery ||
      filters.minAmount !== undefined ||
      filters.maxAmount !== undefined
    );
  };

  // Toggle sort direction
  const handleSort = (field: typeof sortConfig.field) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ field, direction: 'desc' });
    }
  };

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map(e => e.id)));
    }
  };

  const toggleSelectExpense = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedExpenses.size} expenses?`)) {
      selectedExpenses.forEach(id => onDelete(id));
      setSelectedExpenses(new Set());
    }
  };

  // Save current filters as preset
  const saveCurrentFiltersAsPreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: generateId(),
      name: presetName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    saveFilterPresets([...filterPresets, newPreset]);
    setPresetName('');
    setShowSavePreset(false);
  };

  // Load filter preset
  const loadFilterPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  // Delete filter preset
  const deleteFilterPreset = (id: string) => {
    saveFilterPresets(filterPresets.filter(p => p.id !== id));
  };

  // Render expense card based on view mode
  const renderExpenseCard = (expense: Expense) => {
    const isSelected = selectedExpenses.has(expense.id);

    if (viewMode === 'compact') {
      return (
        <div
          key={expense.id}
          className={`bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow border-2 ${
            isSelected ? 'border-primary-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectExpense(expense.id)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(expense.category) }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{formatDate(expense.date)}</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'detailed') {
      return (
        <div
          key={expense.id}
          className={`bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border-2 ${
            isSelected ? 'border-primary-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectExpense(expense.id)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 mt-1"
              />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {expense.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{expense.description}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(expense.date)} • Created {formatDate(expense.createdAt)}
                </p>
              </div>
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
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-gray-600">
              Amount
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(expense.amount)}
            </div>
          </div>
        </div>
      );
    }

    // Default list view
    return (
      <div
        key={expense.id}
        className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-2 ${
          isSelected ? 'border-primary-500' : 'border-transparent'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelectExpense(expense.id)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 mt-1"
            />
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
              <p className="text-gray-900 mb-1 font-medium">{expense.description}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </p>
            </div>
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
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>

            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={16} className="mr-1" />
                Clear All
              </Button>
            )}

            {selectedExpenses.size > 0 && (
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                <Trash2 size={16} className="mr-1" />
                Delete {selectedExpenses.size} Selected
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="list">List</option>
              <option value="compact">Compact</option>
              <option value="detailed">Detailed</option>
            </select>

            <span className="text-sm text-gray-600 ml-2">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="none">None</option>
              <option value="category">Category</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="amountRange">Amount Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          {/* Search and Date Preset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="absolute right-3 top-2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            <select
              value={filters.datePreset || 'custom'}
              onChange={(e) => handleDatePresetChange(e.target.value as DatePreset)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {datePresets.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range (shown when custom) */}
          {filters.datePreset === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                label="Start Date"
              />

              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                label="End Date"
              />
            </div>
          )}

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount?.toString() || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              label="Minimum Amount"
            />

            <Input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount?.toString() || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              label="Maximum Amount"
            />
          </div>

          {/* Category Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = filters.categories?.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: isSelected ? 'white' : getCategoryColor(category) }}
                    />
                    {category}
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Presets */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Filter Presets
              </label>
              {hasActiveFilters() && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSavePreset(!showSavePreset)}
                >
                  <Bookmark size={14} className="mr-1" />
                  Save Current
                </Button>
              )}
            </div>

            {showSavePreset && (
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
                <Button size="sm" onClick={saveCurrentFiltersAsPreset}>
                  <Save size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            )}

            {filterPresets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filterPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-md text-sm"
                  >
                    <button
                      onClick={() => loadFilterPreset(preset)}
                      className="hover:underline font-medium"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deleteFilterPreset(preset.id)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          {[
            { field: 'date' as const, label: 'Date' },
            { field: 'amount' as const, label: 'Amount' },
            { field: 'category' as const, label: 'Category' },
            { field: 'description' as const, label: 'Description' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                sortConfig.field === field
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
              {sortConfig.field === field && (
                sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md p-4 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90">Showing</p>
            <p className="text-2xl font-bold">{filteredExpenses.length}</p>
            <p className="text-xs opacity-75">of {expenses.length} expenses</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Average</p>
            <p className="text-2xl font-bold">{formatCurrency(averageAmount)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Selected</p>
            <p className="text-2xl font-bold">{selectedExpenses.size}</p>
          </div>
        </div>
        {selectedExpenses.size > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedExpenses.size === filteredExpenses.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded"
              />
              {selectedExpenses.size === filteredExpenses.length ? 'Deselect All' : 'Select All'}
            </label>
          </div>
        )}
      </div>

      {/* Expense List with Grouping */}
      <div className="space-y-6">
        {Object.entries(groupedExpenses).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No expenses found</p>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-3">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          Object.entries(groupedExpenses).map(([groupName, groupExpenses]) => {
            const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="bg-gray-100 rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{groupName}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{groupExpenses.length} expenses</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(groupTotal)}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {groupExpenses.map(renderExpenseCard)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
