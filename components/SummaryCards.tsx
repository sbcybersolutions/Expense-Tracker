'use client';

import React from 'react';
import { ExpenseSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from './ui';
import { DollarSign, Calendar, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Hash } from 'lucide-react';

interface SummaryCardsProps {
  summary: ExpenseSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Expenses
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.expenseCount} transaction{summary.expenseCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <DollarSign className="text-primary-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  This Month
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary.monthlyTotal)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {formatCurrency(summary.averageDaily)}/day
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Category */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Top Category
                </p>
                {summary.topCategory ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {summary.topCategory.category}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatCurrency(summary.topCategory.amount)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Expense */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Average Expense
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.averageExpense)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Hash className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highest Expense */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Highest Expense
                </p>
                {summary.highestExpense ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(summary.highestExpense.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                      {summary.highestExpense.description}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowUpCircle className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lowest Expense */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Lowest Expense
                </p>
                {summary.lowestExpense ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(summary.lowestExpense.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                      {summary.lowestExpense.description}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">N/A</p>
                )}
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <ArrowDownCircle className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
