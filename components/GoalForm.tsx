
import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { X, Target, Trash2 } from 'lucide-react';

interface Props {
  goal?: Goal | null;
  onSave: (goal: Omit<Goal, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const GoalForm: React.FC<Props> = ({ goal, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(goal?.title || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount.toString() || '');
  const [deadline, setDeadline] = useState(goal?.deadline || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    onSave({
      id: goal?.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">
              {goal ? 'Editar Meta' : 'Nova Meta'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título da Meta</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reserva de Emergência, Carro Novo..."
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Já Guardado</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Limite</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95"
              >
                {goal ? 'Salvar Alterações' : 'Criar Meta'}
              </button>
              
              {goal && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente excluir esta meta?')) {
                      onDelete(goal.id);
                      onClose();
                    }
                  }}
                  className="w-full py-3 text-rose-500 font-medium flex items-center justify-center space-x-2"
                >
                  <Trash2 size={18} />
                  <span>Excluir Meta</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalForm;
