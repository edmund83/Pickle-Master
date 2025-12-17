
import React from 'react';
import { MOCK_HISTORY } from '../constants';

const HistoryView: React.FC = () => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'ADDED': return { icon: 'fa-circle-plus', color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'REMOVED': return { icon: 'fa-circle-minus', color: 'text-rose-500', bg: 'bg-rose-50' };
      case 'MOVED': return { icon: 'fa-arrows-split-up-and-left', color: 'text-indigo-500', bg: 'bg-indigo-50' };
      case 'QUANTITY_CHANGE': return { icon: 'fa-arrow-up-right-dots', color: 'text-blue-500', bg: 'bg-blue-50' };
      default: return { icon: 'fa-pen-to-square', color: 'text-slate-500', bg: 'bg-slate-50' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Activity History</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Download PDF</button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {MOCK_HISTORY.map((log) => {
            const style = getIcon(log.type);
            return (
              <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${style.bg} ${style.color}`}>
                  <i className={`fa-solid ${style.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-slate-800 text-sm truncate">{log.itemName}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-xs text-slate-500 font-medium">
                      {log.type === 'QUANTITY_CHANGE' && `Quantity updated by ${log.delta > 0 ? '+' : ''}${log.delta}`}
                      {log.type === 'MOVED' && `Moved from ${log.from} to ${log.to}`}
                      {log.type === 'ADDED' && `Added to initial inventory`}
                      {log.type === 'REMOVED' && `Removed from system`}
                    </p>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">User: {log.user}</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-500"><i className="fa-solid fa-circle-info"></i></button>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="text-center py-4">
        <button className="text-indigo-600 font-black text-sm hover:underline tracking-tight">Load more activity</button>
      </div>
    </div>
  );
};

export default HistoryView;
