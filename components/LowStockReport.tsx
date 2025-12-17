
import React, { useState } from 'react';

const LowStockReport: React.FC = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['date-alerts', 'tags', 'sortly-id', 'barcode', 'notes']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const FilterSection = ({ id, label, children }: any) => (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-4 flex items-center justify-between group"
      >
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</span>
        <i className={`fa-solid fa-chevron-${expandedSections.includes(id) ? 'up' : 'down'} text-[10px] text-slate-300`}></i>
      </button>
      {expandedSections.includes(id) && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative h-full -m-10 animate-in fade-in duration-500 flex">
      {/* Main Content Area */}
      <div className={`flex-1 p-10 overflow-y-auto custom-scrollbar transition-all duration-300 ${isFilterPanelOpen ? 'bg-black/5' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Top Breadcrumb & Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <i className="fa-solid fa-layer-group"></i>
                <span>Saved Inventory Summary Report</span>
              </div>
              <h1 className="text-3xl font-black text-[#333c4d] tracking-tight">Low Stock</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-calendar-days text-sm"></i>
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                <i className="fa-solid fa-bookmark"></i>
                <span>SAVED</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#de4a4a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b] transition-all">
                <i className="fa-solid fa-upload"></i>
                <span>EXPORT</span>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
               <div className="relative flex-1 max-w-sm">
                 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                 <input type="text" placeholder="Search Items" className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 ring-slate-100 font-medium text-sm shadow-sm" />
                 <i className="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-slate-600 border-l border-slate-100 pl-3"></i>
               </div>
               <button className="px-5 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 text-xs font-bold text-slate-500 shadow-sm">
                 <i className="fa-solid fa-file-invoice text-slate-300"></i>
                 Any item
                 <i className="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
               </button>
               <button className="px-5 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 text-xs font-bold text-slate-500 shadow-sm">
                 <i className="fa-solid fa-folder text-slate-300"></i>
                 Any folder
                 <i className="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
               </button>
               <button 
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="relative p-3.5 bg-[#333c4d] text-white rounded-xl shadow-lg hover:bg-slate-700 transition-all"
               >
                 <i className="fa-solid fa-sliders"></i>
                 <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#de4a4a] rounded-full border-2 border-white text-[9px] font-black flex items-center justify-center">1</span>
               </button>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                 <span className="text-[11px] font-bold text-slate-400">Group Items</span>
                 <i className="fa-solid fa-circle-question text-slate-200 text-xs"></i>
                 <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                   <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
               </div>
               <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 border border-slate-200/50">
                 <i className="fa-solid fa-camera text-slate-400 text-xs"></i>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Snapshots</span>
                 <span className="bg-[#de4a4a] text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</span>
               </div>
            </div>
          </div>

          {/* Large Summary Stats */}
          <div className="flex gap-16 pt-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Quantity</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#333c4d]">1</span>
                <span className="text-xl text-slate-400 font-bold">unit</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Value</p>
              <p className="text-4xl font-black text-[#333c4d]">MYR 20.00</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Level</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Folder</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
                  <th className="px-8 py-5 flex justify-end">
                    <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors">
                      <i className="fa-solid fa-table-list"></i> Edit
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] overflow-hidden relative border border-slate-100 shadow-sm">
                        <img src="https://picsum.photos/seed/inventoryB/100/100" className="w-full h-full object-cover opacity-90" />
                        <span className="absolute -top-1 -right-1 bg-[#333c4d] text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm">NEW</span>
                      </div>
                      <span className="font-bold text-[#333c4d] text-base">B</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3.5 py-1.5 bg-[#de4a4a] text-white text-[9px] font-black rounded-lg shadow-lg shadow-rose-100">1 unit</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">2 units</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">MYR 20.00</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">MYR 20.00</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">Storage Area</td>
                  <td className="px-8 py-6 text-slate-300">—</td>
                  <td className="px-8 py-6"></td>
                </tr>
              </tbody>
            </table>
            <div className="p-6 bg-white flex items-center gap-4 border-t border-slate-50">
               <span className="text-[11px] font-bold text-slate-400">Show:</span>
               <div className="relative">
                 <select className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-black px-4 py-2 outline-none appearance-none pr-8">
                   <option>20</option>
                   <option>50</option>
                 </select>
                 <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-400"></i>
               </div>
               <span className="text-[11px] font-bold text-slate-400">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Filtering Sidebar */}
      {isFilterPanelOpen && (
        <aside className="w-[350px] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full shrink-0 z-50 animate-in slide-in-from-right duration-300">
          <div className="px-6 py-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-[#333c4d]">Filters</h2>
              <span className="w-5 h-5 bg-[#de4a4a] rounded-full text-white text-[9px] font-black flex items-center justify-center">1</span>
            </div>
            <button className="text-[10px] font-black text-slate-400 hover:text-[#de4a4a] uppercase tracking-widest transition-colors">Clear All</button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Date Alerts */}
            <FilterSection id="date-alerts" label="Date Alerts">
              <div className="space-y-3">
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-[11px] font-black text-slate-400 outline-none appearance-none pr-8">
                    <option>Select Date type field:</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                </div>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-[11px] font-black text-slate-400 outline-none appearance-none pr-8">
                    <option>Show Items:</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                </div>
              </div>
            </FilterSection>

            {/* Tags */}
            <FilterSection id="tags" label="Tags">
              <div className="space-y-4">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                  <input type="text" placeholder="Search Tags" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 italic text-center py-2">No data available</p>
              </div>
            </FilterSection>

            {/* Sortly ID */}
            <FilterSection id="sortly-id" label="Sortly ID">
              <div className="space-y-4">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                  <input type="text" placeholder="Search Sortly ID" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                </div>
                <div className="space-y-3 pt-2">
                  {['SLSOLT0001', 'SLSOLT0002', 'SLSOLT0003'].map(id => (
                    <div key={id} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center group-hover:border-rose-200"></div>
                      <span className="text-xs font-bold text-slate-500 uppercase group-hover:text-slate-900">{id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FilterSection>

            {/* Barcode / QR Code */}
            <FilterSection id="barcode" label="Barcode / QR Code">
               <div className="relative">
                 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                 <input type="text" placeholder="Search Barcode / QR Code" className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                 <i className="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
               </div>
            </FilterSection>

            {/* Notes */}
            <FilterSection id="notes" label="Notes">
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-[11px] font-black text-slate-400 outline-none appearance-none pr-8">
                  <option>Select...</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
              </div>
            </FilterSection>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
            <button className="w-full py-4 bg-[#de4a4a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-[#c33b3b] transition-all">
              Apply
            </button>
            <button 
              onClick={() => setIsFilterPanelOpen(false)}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default LowStockReport;
