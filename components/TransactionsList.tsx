import React from 'react';
import { Transaction } from '../types';
// Fixed: Added missing Receipt import and removed unused ChevronRight
import { Trash2, ArrowUpCircle, ArrowDownCircle, Receipt } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionsList: React.FC<Props> = ({ transactions, onDelete }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-in slide-in-from-right duration-700 pb-32">
      <div className="flex justify-between items-end mb-8 px-2">
        <h2 className="text-3xl font-black dark:text-white tracking-tight">Extrato</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{transactions.length} Lançamentos</p>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
            <Receipt className="text-slate-300 dark:text-slate-700" size={48} strokeWidth={1} />
          </div>
          <p className="text-slate-400 font-medium">Seu histórico está vazio.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTransactions.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 border border-slate-100 dark:border-slate-800 hover:border-emerald-100 dark:hover:border-slate-700">
              <div className="flex items-center space-x-5">
                <div 
                  className={`p-4 rounded-2xl transition-colors ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}
                >
                  {t.type === 'income' ? <ArrowUpCircle size={24} strokeWidth={2.5} /> : <ArrowDownCircle size={24} strokeWidth={2.5} />}
                </div>
                <div>
                  <h4 className="font-black dark:text-white tracking-tight text-lg leading-tight">{t.description}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span 
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" 
                      style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}20`, color: CATEGORY_COLORS[t.category] }}
                    >
                      {t.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <span className={`text-lg font-black tracking-tighter ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="p-3 text-slate-200 hover:text-rose-500 dark:text-slate-800 dark:hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100 hover:scale-110 active:scale-90"
                >
                  <Trash2 size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionsList;