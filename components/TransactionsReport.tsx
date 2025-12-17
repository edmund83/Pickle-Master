
import React from 'react';

const TransactionsReport: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-repeat"></i>
            <span>Default Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Transactions</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-calendar-days"></i>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#de4a4a] text-white rounded-xl text-sm font-black shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all">
            <i className="fa-solid fa-upload"></i>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
           <div className="relative flex-1 max-w-sm">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input type="text" placeholder="Search Transactions" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-medium" />
           </div>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-file-invoice text-slate-300"></i>
             Any item
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-folder text-slate-300"></i>
             Any folder
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-repeat text-slate-300"></i>
             Any transaction
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl"><i className="fa-solid fa-sliders"></i></button>
        </div>
        <div className="text-slate-600 bg-slate-100 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3">
          <i className="fa-solid fa-calendar text-slate-400"></i>
          This Month <span className="text-slate-400">01/10/2025 - 31/10/2025</span>
          <i className="fa-solid fa-chevron-down text-[10px]"></i>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Transaction Date <i className="fa-solid fa-arrow-down"></i>
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty Change</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Notes</th>
              <th className="px-8 py-5 text-right">
                <button className="flex items-center gap-2 text-slate-600 font-bold text-sm ml-auto bg-slate-100 px-4 py-2 rounded-lg">
                  <i className="fa-solid fa-list-check"></i> Edit
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { time: '8:35 PM', name: 'C', change: '+ 1 unit', type: 'Create' },
              { time: '8:35 PM', name: 'B', change: '+ 1 unit', type: 'Create' },
              { time: '8:35 PM', name: 'A', change: '+ 1 unit', type: 'Create' },
            ].map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{t.time}</td>
                <td className="px-8 py-6 text-sm font-black text-slate-800">{t.name}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-600 text-right">{t.change}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-600">{t.type}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-300">—</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-6 bg-slate-50/50 flex items-center gap-4 border-t border-slate-100">
           <span className="text-sm font-medium text-slate-400">Show:</span>
           <select className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
             <option>20</option>
             <option>50</option>
           </select>
           <span className="text-sm font-medium text-slate-400">per page</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionsReport;
