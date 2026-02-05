
import React from 'react';
import { Database as DbIcon, CheckCircle2, RefreshCw } from 'lucide-react';

interface Props {
  status: 'saving' | 'synced' | 'error';
}

const SyncIndicator: React.FC<Props> = ({ status }) => {
  return (
    <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-all duration-300">
      {status === 'saving' ? (
        <>
          <RefreshCw size={12} className="text-emerald-500 animate-spin" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Salvando...</span>
        </>
      ) : status === 'error' ? (
        <>
          <DbIcon size={12} className="text-rose-500" />
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Erro de DB</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Banco Local OK</span>
        </>
      )}
    </div>
  );
};

export default SyncIndicator;
