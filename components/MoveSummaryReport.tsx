
import React from 'react';

const MoveSummaryReport: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-layer-group"></i>
            <span>Default Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Move Summary</h1>
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
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-folder text-slate-300"></i>
             Source: Any folder
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200"><i className="fa-solid fa-repeat"></i></button>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-folder text-slate-300"></i>
             Destination: Any folder
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl"><i className="fa-solid fa-sliders"></i></button>
        </div>
        <div className="text-slate-400 text-xs font-bold flex items-center gap-3">
          <i className="fa-solid fa-calendar text-slate-200"></i>
          This Month <span className="text-slate-200">01/10/2025 - 31/10/2025</span>
          <i className="fa-solid fa-chevron-down text-[10px]"></i>
        </div>
      </div>

      <div className="flex flex-wrap gap-12 pt-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sources</p>
          <p className="text-4xl font-black text-slate-800">1</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destinations</p>
          <p className="text-4xl font-black text-slate-800">1</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Moved</p>
          <p className="text-4xl font-black text-slate-800">1</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity Moved</p>
          <p className="text-4xl font-black text-slate-800">1 <span className="text-lg text-slate-500 font-bold ml-1">unit</span></p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Value</p>
          <p className="text-4xl font-black text-slate-800">MYR 20.00</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Folder</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Folder</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Moved <i className="fa-solid fa-arrow-down ml-1"></i></th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity Moved</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-folder text-slate-400"></i>
                  <span className="text-sm font-medium text-slate-600">Storage Area</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                   <i className="fa-solid fa-arrow-right text-slate-300"></i>
                   <i className="fa-solid fa-folder text-slate-400"></i>
                   <span className="text-sm font-medium text-slate-600">Main Location</span>
                </div>
              </td>
              <td className="px-8 py-6 text-sm font-black text-slate-800">1</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-600 text-center">1 unit</td>
              <td className="px-8 py-6 text-sm font-black text-slate-800">MYR 20.00</td>
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

export default MoveSummaryReport;
