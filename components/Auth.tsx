
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Wallet, RefreshCw } from 'lucide-react';
import { db } from '../services/db';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await db.getUsers();

      if (isLogin) {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } else {
        if (users.find(u => u.email === email)) {
          setError('Este e-mail já está cadastrado.');
          setLoading(false);
          return;
        }
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          password
        };
        await db.saveUser(newUser);
        onLogin(newUser);
      }
    } catch (err) {
      setError('Erro ao acessar o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-4 bg-emerald-500 rounded-3xl shadow-emerald-500/20 shadow-2xl mb-6">
            <Wallet size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">FINANZA</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isLogin ? 'Bem-vindo de volta!' : 'Comece sua jornada financeira hoje'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold ml-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95 mt-4 disabled:opacity-70"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
