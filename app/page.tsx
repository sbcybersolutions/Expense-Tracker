'use client';

import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { Expense } from '@/types';
import { calculateSummary, downloadCSV } from '@/lib/utils';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { SummaryCards } from '@/components/SummaryCards';
import { SpendingChart } from '@/components/SpendingChart';
import { Button, Modal } from '@/components/ui';
import { Plus, Download, DollarSign } from 'lucide-react';

export default function Home() {
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses'>('dashboard');

  const summary = useMemo(() => calculateSummary(expenses), [expenses]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    addExpense(expenseData);
    setIsAddModalOpen(false);
  };

  const handleEditExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      setIsEditModalOpen(false);
      setEditingExpense(null);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export');
      return;
    }
    downloadCSV(expenses);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <DollarSign className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleExport}>
                <Download size={18} className="mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'expenses'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Expenses ({expenses.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <SummaryCards summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpendingChart summary={summary} />

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Expenses
                </h2>
                {expenses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 mb-4">No expenses yet</p>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={18} className="mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense.id}
                        className="bg-white rounded-lg shadow-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {expense.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              {expense.category}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">
                            ${expense.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {expenses.length > 5 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab('expenses')}
                        className="w-full"
                      >
                        View All Expenses
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDeleteExpense}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsAddModalOpen(false)}
          submitLabel="Add Expense"
        />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleEditExpense}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
            submitLabel="Update Expense"
          />
        )}
      </Modal>
    </div>
  );
}
