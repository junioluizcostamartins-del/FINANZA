
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, View, Transaction, Budget, Goal, User } from './types';
import { DEFAULT_BUDGETS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import BudgetManager from './components/BudgetManager';
import TransactionForm from './components/TransactionForm';
import GoalForm from './components/GoalForm';
import Auth from './components/Auth';
import LogoutModal from './components/LogoutModal';
import SyncIndicator from './components/SyncIndicator';
import { db } from './services/db';
import { LayoutDashboard, Receipt, Target, User as UserIcon, BarChart3, Plus, Settings, ChevronLeft, ChevronRight, Calendar, LogOut, ChevronRight as ChevronIcon, Database as DbIcon, RefreshCw, Moon, Sun } from 'lucide-react';

const SESSION_KEY = 'finanza_session';

const App: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saving' | 'synced' | 'error'>('synced');
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [state, setState] = useState<AppState>({
    transactions: [],
    budgets: DEFAULT_BUDGETS,
    goals: [],
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    currentUser: null
  });

  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [refDate, setRefDate] = useState(new Date());

  useEffect(() => {
    db.init().then(() => {
      setDbReady(true);
      if (currentUser) {
        loadUserData(currentUser.email);
      }
    }).catch(err => {
      console.error(err);
      setSyncStatus('error');
    });
  }, []);

  const loadUserData = async (email: string) => {
    try {
      const data = await db.getUserData(email);
      if (data) {
        setState(prev => ({ ...prev, ...data, currentUser }));
      } else {
        setState({
          transactions: [],
          budgets: DEFAULT_BUDGETS,
          goals: [{ id: '1', title: 'Reserva de Emergência', targetAmount: 5000, currentAmount: 0, deadline: '2025-12-31' }],
          darkMode: state.darkMode,
          currentUser
        });
      }
    } catch (err) {
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (dbReady && currentUser) {
      setSyncStatus('saving');
      const timer = setTimeout(async () => {
        try {
          await db.saveUserData(currentUser.email, state);
          setSyncStatus('synced');
        } catch (err) {
          setSyncStatus('error');
        }
      }, 500);
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return () => clearTimeout(timer);
    }
  }, [state, currentUser, dbReady]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.email);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setState({
      transactions: [],
      budgets: DEFAULT_BUDGETS,
      goals: [],
      darkMode: state.darkMode,
      currentUser: null
    });
    setActiveView(View.DASHBOARD);
    setShowLogoutModal(false);
  };

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getUTCMonth() === refDate.getUTCMonth() && d.getUTCFullYear() === refDate.getUTCFullYear();
    });
  }, [state.transactions, refDate]);

  const changeMonth = (offset: number) => {
    setRefDate(prev => {
      const d = new Date(prev);
      d.setUTCMonth(d.getUTCMonth() + offset);
      return d;
    });
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addOrUpdateGoal = (g: Omit<Goal, 'id'> & { id?: string }) => {
    setState(prev => {
      if (g.id) {
        return {
          ...prev,
          goals: prev.goals.map(goal => goal.id === g.id ? { ...g, id: g.id } as Goal : goal)
        };
      } else {
        const newGoal: Goal = {
          ...g,
          id: Math.random().toString(36).substr(2, 9)
        } as Goal;
        return {
          ...prev,
          goals: [...prev.goals, newGoal]
        };
      }
    });
  };

  const deleteGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const updateBudgets = (budgets: Budget[]) => {
    setState(prev => ({ ...prev, budgets }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard transactions={filteredTransactions} budgets={state.budgets} goals={state.goals} refDate={refDate} />;
      case View.TRANSACTIONS:
        return <TransactionsList transactions={filteredTransactions} onDelete={deleteTransaction} />;
      case View.BUDGET:
        return <BudgetManager budgets={state.budgets} transactions={filteredTransactions} onSave={updateBudgets} />;
      case View.GOALS:
        return (
          <div className="pb-24 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black mb-8 dark:text-white px-2 tracking-tight">Suas Metas</h2>
            <div className="space-y-4">
               {state.goals.length > 0 ? state.goals.map(goal => (
                 <button 
                  key={goal.id} 
                  onClick={() => { setSelectedGoal(goal); setShowGoalModal(true); }}
                  className="w-full text-left bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
                 >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-black text-xl dark:text-white leading-tight">{goal.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-500 font-black text-lg">R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">de R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        style={{ width: `${Math.min((goal.currentAmount/goal.targetAmount)*100, 100)}%` }}
                      />
                    </div>
                 </button>
               )) : (
                 <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                   <p className="text-slate-400 italic">Nenhuma meta ainda. Que tal planejar algo?</p>
                 </div>
               )}
               <button 
                onClick={() => { setSelectedGoal(null); setShowGoalModal(true); }}
                className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] hover:text-emerald-500 hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all flex items-center justify-center space-x-3 font-bold uppercase tracking-widest text-xs"
               >
                 <Plus size={20} />
                 <span>Criar Nova Meta</span>
               </button>
            </div>
          </div>
        );
      case View.PROFILE:
        return (
          <div className="pb-24 animate-in fade-in duration-500">
            <div className="flex flex-col items-center mb-10 pt-4">
              <div className="relative group">
                <div className="w-32 h-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-[3rem] flex items-center justify-center text-emerald-600 mb-6 border-4 border-white dark:border-[#0f172a] shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <UserIcon size={64} strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-4 right-0 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                  <Settings size={18} className="text-slate-400" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-widest mt-1">{currentUser.email}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Personalização</h4>
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${state.darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-50 text-amber-500'}`}>
                      {state.darkMode ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <span className="font-black text-slate-700 dark:text-slate-200 block leading-none">Modo Escuro</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{state.darkMode ? 'Ativado' : 'Desativado'}</span>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1.5 transition-colors ${state.darkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${state.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Gerenciamento</h4>
                <div className="p-5 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                      <DbIcon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="font-black text-slate-700 dark:text-slate-200 block leading-none">Armazenamento</span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">IndexedDB Engine</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />

                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-between p-5 hover:bg-rose-50 dark:hover:bg-rose-500/5 rounded-3xl transition-all text-rose-500 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center">
                      <LogOut size={24} strokeWidth={1.5} />
                    </div>
                    <span className="font-black text-lg">Sair da Conta</span>
                  </div>
                  <ChevronIcon size={20} className="text-rose-200 group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] py-8">
                Finanza Premium • v1.0.4
              </p>
            </div>
          </div>
        );
    }
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="relative">
          <RefreshCw className="text-emerald-500 animate-spin mb-6" size={48} strokeWidth={1.5} />
          <div className="absolute inset-0 blur-2xl bg-emerald-500/20 animate-pulse" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">Acessando Cofre...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 flex flex-col max-w-2xl mx-auto shadow-2xl relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      <header className="px-6 pt-8 pb-6 sticky top-0 bg-slate-50/90 dark:bg-[#020617]/90 backdrop-blur-xl z-40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none">FINANZA</h1>
              <SyncIndicator status={syncStatus} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">
              {activeView === View.PROFILE ? 'Preferências' : `Olá, ${currentUser.name.split(' ')[0]}!`}
            </p>
          </div>
          <button 
            onClick={() => setActiveView(View.PROFILE)} 
            className={`p-1 border-2 transition-all rounded-2xl ${activeView === View.PROFILE ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 scale-105' : 'border-transparent bg-white dark:bg-slate-900 shadow-sm'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <UserIcon size={20} strokeWidth={2} />
            </div>
          </button>
        </div>

        {activeView !== View.PROFILE && activeView !== View.GOALS && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-700">
            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center space-x-3 font-black dark:text-white uppercase tracking-wider text-xs">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <Calendar size={14} className="text-emerald-500" />
              </div>
              <span className="min-w-[120px] text-center">
                {refDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 sm:px-6">
        {renderContent()}
      </main>

      {/* FAB - Adjusted for Dark Mode depth */}
      {activeView !== View.PROFILE && activeView !== View.GOALS && (
        <button 
          onClick={() => setShowTransactionModal(true)}
          className="fixed bottom-28 right-6 sm:right-[calc(50%-12rem)] z-40 bg-emerald-500 dark:bg-emerald-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-90 transition-all flex items-center justify-center border-4 border-white dark:border-[#020617]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      {/* Bottom Nav - Midnight Style */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-5 z-40 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center">
          <NavButton active={activeView === View.DASHBOARD} icon={<LayoutDashboard size={22} />} label="Painel" onClick={() => setActiveView(View.DASHBOARD)} />
          <NavButton active={activeView === View.TRANSACTIONS} icon={<Receipt size={22} />} label="Extrato" onClick={() => setActiveView(View.TRANSACTIONS)} />
          <NavButton active={activeView === View.BUDGET} icon={<BarChart3 size={22} />} label="Metas" onClick={() => setActiveView(View.BUDGET)} />
          <NavButton active={activeView === View.GOALS} icon={<Target size={22} />} label="Planos" onClick={() => setActiveView(View.GOALS)} />
          <NavButton active={activeView === View.PROFILE} icon={<UserIcon size={22} />} label="Perfil" onClick={() => setActiveView(View.PROFILE)} />
        </div>
      </nav>

      {showTransactionModal && (
        <TransactionForm onAdd={addTransaction} onClose={() => setShowTransactionModal(false)} />
      )}

      {showGoalModal && (
        <GoalForm
          goal={selectedGoal}
          onSave={addOrUpdateGoal}
          onDelete={deleteGoal}
          onClose={() => { setShowGoalModal(false); setSelectedGoal(null); }}
        />
      )}

      {showLogoutModal && (
        <LogoutModal 
          onConfirm={confirmLogout} 
          onCancel={() => setShowLogoutModal(false)} 
        />
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-2 transition-all group ${active ? 'text-emerald-500 dark:text-emerald-400 scale-110' : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'}`}>
    <div className={`p-1 transition-all ${active ? 'scale-110' : 'group-active:scale-90'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
