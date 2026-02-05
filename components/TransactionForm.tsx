
import React, { useState } from 'react';
import { TransactionType, Category, Transaction } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { Plus, X } from 'lucide-react';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd, onClose }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAdd({
      type,
      category,
      amount: Number(amount),
      description: description || category,
      date,
    });
    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Nova Transação</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-gray-500'}`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                Receita
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-4 text-2xl font-bold bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Mercado..."
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 ${type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`}
            >
              Adicionar {type === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
