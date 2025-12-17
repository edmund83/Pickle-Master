
import React from 'react';

const ItemFlowReport: React.FC = () => {
  const data = [
    { name: 'A', folder: 'Main Location', decrease: '0 units', increase: '+ 1 unit', change: '+ 1 unit', txn: '1' },
    { name: 'B', folder: 'Storage Area', decrease: '0 units', increase: '+ 1 unit', change: '+ 1 unit', txn: '1' },
    { name: 'C', folder: 'Main Location', decrease: '0 units', increase: '+ 1 unit', change: '+ 1 unit', txn: '1' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-chart-simple"></i>
            <span>Default Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Item Flow</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-calendar-days text-sm"></i>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#de4a4a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b] transition-all">
            <i className="fa-solid fa-upload"></i>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600 shadow-sm">
            <i className="fa-solid fa-file-invoice text-slate-300"></i>
            Any item
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
          </button>
          <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600 shadow-sm">
            <i className="fa-solid fa-folder text-slate-300"></i>
            Any folder
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
          </button>
          <button className="p-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-200 shadow-sm transition-all">
            <i className="fa-solid fa-sliders"></i>
          </button>
        </div>
        <div className="bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-3 text-xs font-bold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-200 transition-all">
          <i className="fa-solid fa-calendar text-slate-400"></i>
          <span>This Month <span className="text-slate-400 font-medium ml-1">01/10/2025 - 31/10/2025</span></span>
          <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50/30 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Folder</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Qty Decrease</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Qty Increase</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Total Qty Change</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">
                Total Txn <i className="fa-solid fa-arrow-down ml-1 text-slate-300"></i>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-[#333c4d]">{row.name}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{row.folder}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500 text-right">{row.decrease}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500 text-right">{row.increase}</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500 text-right">{row.change}</td>
                <td className="px-8 py-6 text-sm font-black text-[#333c4d] text-right">{row.txn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Table Footer / Pagination */}
        <div className="p-6 bg-white flex items-center gap-4 border-t border-slate-50">
           <span className="text-[11px] font-bold text-slate-400">Show:</span>
           <div className="relative">
             <select className="bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black px-4 py-2 outline-none appearance-none pr-8">
               <option>20</option>
               <option>50</option>
             </select>
             <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-400"></i>
           </div>
           <span className="text-[11px] font-bold text-slate-400">per page</span>
        </div>
      </div>
    </div>
  );
};

export default ItemFlowReport;
