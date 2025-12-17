
import React from 'react';

const LowStockReport: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-layer-group"></i>
            <span>Saved Inventory Summary Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Low Stock</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-calendar-days"></i>
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500">
            <i className="fa-solid fa-bookmark"></i>
            <span>SAVED</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#de4a4a] text-white rounded-xl text-sm font-black shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all">
            <i className="fa-solid fa-upload"></i>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
           <div className="relative flex-1 max-w-sm">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input type="text" placeholder="Search Items" className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-slate-100 font-medium" />
             <i className="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600"></i>
           </div>
           <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-file-invoice text-slate-300"></i>
             Any item
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-folder text-slate-300"></i>
             Any folder
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="relative p-3 bg-slate-700 text-white rounded-xl shadow-lg">
             <i className="fa-solid fa-sliders"></i>
             <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#de4a4a] rounded-full border-2 border-[#f5f6f8] text-[9px] font-black flex items-center justify-center">1</span>
           </button>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400">Group Items</span>
             <i className="fa-solid fa-circle-question text-slate-300 text-sm"></i>
             <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
               <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
             </div>
           </div>
           <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2">
             <i className="fa-solid fa-camera text-slate-400 text-xs"></i>
             <span className="text-[10px] font-black text-slate-500 uppercase">Snapshots</span>
             <span className="bg-[#de4a4a] text-white text-[8px] font-black px-1.5 py-0.5 rounded">NEW</span>
           </div>
        </div>
      </div>

      {/* Summary Area */}
      <div className="flex gap-12 pt-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Quantity</p>
          <p className="text-4xl font-black text-slate-800">1 <span className="text-lg text-slate-500 font-bold ml-1">unit</span></p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-4xl font-black text-slate-800">MYR 20.00</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Level</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Folder</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
              <th className="px-8 py-5 flex justify-end">
                <button className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <i className="fa-solid fa-list-check"></i> Edit
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100">
                    <img src="https://picsum.photos/seed/inventoryB/100/100" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1 rounded">NEW</span>
                  </div>
                  <span className="font-bold text-slate-800">B</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-rose-100 text-[#de4a4a] text-[10px] font-black rounded-lg">1 unit</span>
              </td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">2 units</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">MYR 20.00</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">MYR 20.00</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">Storage Area</td>
              <td className="px-8 py-6 text-slate-300">—</td>
              <td></td>
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

export default LowStockReport;
