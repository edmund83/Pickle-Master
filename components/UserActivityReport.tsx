
import React from 'react';

const UserActivityReport: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-users"></i>
            <span>Default Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">User Activity Summary</h1>
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
             <input type="text" placeholder="Search users" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-medium" />
           </div>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-user text-slate-300 text-xs"></i>
             Any user
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50"><i className="fa-solid fa-sliders"></i></button>
        </div>
        <div className="text-slate-600 bg-slate-100 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3">
          <i className="fa-solid fa-calendar text-slate-400"></i>
          This Month <span className="text-slate-400">01/10/2025 - 31/10/2025</span>
          <i className="fa-solid fa-chevron-down text-[10px]"></i>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-4">
        {[
          { label: 'Users', val: '1' },
          { label: 'Items Moved', val: '1' },
          { label: 'Quantity Updated', val: '0' },
          { label: 'Items Created', val: '3' },
          { label: 'Items Deleted', val: '0' },
          { label: 'Items Restored', val: '0' },
          { label: 'Items Cloned', val: '0' },
          { label: 'Items Merged', val: '0' },
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-slate-800">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6 overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                User <i className="fa-solid fa-arrow-down"></i>
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Moved</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Updated</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Created</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Deleted</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Restored</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Cloned</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Items Merged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs">E</div>
                  <span className="font-bold text-slate-800">Edmund</span>
                </div>
              </td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">1</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">0</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">3</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">0</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">0</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">0</td>
              <td className="px-8 py-6 text-center text-sm font-medium text-slate-800">0</td>
            </tr>
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

export default UserActivityReport;
