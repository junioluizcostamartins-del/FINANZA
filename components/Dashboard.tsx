
import React, { useState, useEffect } from 'react';
import { Transaction, Budget, Goal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS } from '../constants';
import { TrendingUp, TrendingDown, Wallet, Sparkles, AlertCircle } from 'lucide-react';
import { generateFinancialInsight } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  refDate: Date;
}

const Dashboard: React.FC<Props> = ({ transactions, budgets, goals, refDate }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    setInsight(null);
  }, [refDate]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const budgetAlerts = budgets.filter(b => {
    const spent = expenseByCategory[b.category] || 0;
    return b.limit > 0 && spent >= b.limit * 0.8;
  });

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    try {
      const text = await generateFinancialInsight(transactions, budgets, goals);
      setInsight(text);
    } catch (err) {
      setInsight("Houve um erro ao gerar sua análise.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Balance Card - Now with Dark Mode Glow */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 dark:shadow-emerald-900/40">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
              <h1 className="text-4xl font-black tracking-tight">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h1>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <Wallet size={24} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp size={16} className="text-emerald-300" />
                <p className="text-[10px] font-bold uppercase text-emerald-100/60">Ganhos</p>
              </div>
              <p className="font-bold text-lg">R$ {totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown size={16} className="text-rose-300" />
                <p className="text-[10px] font-bold uppercase text-emerald-100/60">Gastos</p>
              </div>
              <p className="font-bold text-lg">R$ {totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
      </div>

      {/* Insight Section - Refined for Dark Mode */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <Sparkles className="text-amber-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold dark:text-white leading-tight">Dicas Inteligentes</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={handleGetInsight}
            disabled={loadingInsight}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loadingInsight ? 'Analisando...' : insight ? 'Novo Insight' : 'Analisar Mês'}
          </button>
        </div>
        {insight ? (
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {insight}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic px-1">
            Toque em analisar para receber dicas personalizadas sobre seus gastos de {refDate.toLocaleDateString('pt-BR', { month: 'long' })}.
          </p>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black mb-6 dark:text-white tracking-tight px-2">Categorias</h3>
          <div className="h-64 relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[entry.name] || '#ccc'} 
                        className="filter drop-shadow-sm"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#000'
                    }} 
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm italic border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-3xl">
                Sem dados para este mês.
              </div>
            )}
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total</p>
                  <p className="text-lg font-black dark:text-white">R$ {totalExpense.toFixed(0)}</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }}></div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black mb-6 dark:text-white tracking-tight px-2">Suas Metas</h3>
          <div className="space-y-5">
            {goals.length > 0 ? goals.map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xs font-black dark:text-slate-200 uppercase tracking-wide">{goal.title}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Faltam R$ {(goal.targetAmount - goal.currentAmount).toFixed(0)}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-500">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-sm font-medium">Defina sua primeira meta!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
