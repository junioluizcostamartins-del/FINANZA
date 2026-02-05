
import React, { useState } from 'react';
import { Budget, Category, Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Target, Save } from 'lucide-react';

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
  onSave: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<Props> = ({ budgets, transactions, onSave }) => {
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(budgets);

  // Transactions are already filtered for the reference month in App.tsx
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleUpdateLimit = (category: Category, limit: string) => {
    const value = parseFloat(limit) || 0;
    setLocalBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: value } : b));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localBudgets);
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold dark:text-white">Orçamento Mensal</h2>
        <button 
          onClick={handleSubmit}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 shadow-lg transition-all"
        >
          <Save size={18} />
          <span>Salvar</span>
        </button>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Defina quanto você planeja gastar em cada categoria para o mês selecionado.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {EXPENSE_CATEGORIES.map(cat => {
          const budget = localBudgets.find(b => b.category === cat) || { category: cat, limit: 0 };
          const spent = expenseByCategory[cat] || 0;
          const progress = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
          
          return (
            <div key={cat} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target size={18} className="text-emerald-500" />
                  <span className="font-bold dark:text-white">{cat}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">R$</span>
                  <input
                    type="number"
                    value={budget.limit || ''}
                    onChange={(e) => handleUpdateLimit(cat, e.target.value)}
                    placeholder="0,00"
                    className="w-24 p-2 text-right bg-gray-50 dark:bg-slate-700 dark:text-white rounded-lg border-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {budget.limit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Gasto: R$ {spent.toFixed(2)}</span>
                    <span className={progress >= 90 ? 'text-rose-500 font-bold' : 'text-gray-400'}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${progress >= 90 ? 'bg-rose-500' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </form>
    </div>
  );
};

export default BudgetManager;
