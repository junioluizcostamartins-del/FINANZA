
import React from 'react';
import { LogOut, X, ShieldAlert } from 'lucide-react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-6 animate-bounce">
            <LogOut size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sair da Conta?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            Você está saindo da sua sessão. Seus dados financeiros permanecem <span className="text-emerald-600 dark:text-emerald-400 font-semibold">seguros</span> e salvos localmente neste dispositivo.
          </p>

          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Confirmar Saída</span>
            </button>
            
            <button
              onClick={onCancel}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95"
            >
              Continuar Logado
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-center space-x-2 border-t border-slate-100 dark:border-slate-800">
          <ShieldAlert size={14} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Privacidade Garantida</span>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
