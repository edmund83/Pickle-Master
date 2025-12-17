import React, { useState } from 'react';
import { MOCK_FOLDERS } from '../constants';

const AdvancedSearchView: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['date-alerts', 'tags', 'sortly-id', 'barcode', 'notes']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const featureCards = [
    { icon: 'fa-folder', label: 'Folders', desc: 'Get a list of items in specific folders' },
    { icon: 'fa-plus-minus', label: 'Quantity', desc: 'Filter items based on their stock levels' },
    { icon: 'fa-plus-minus', label: 'Min Level', desc: 'Identify items below or above their min levels' },
    { icon: 'fa-qrcode', label: 'Barcode / QR code', desc: 'Find all items matching specific barcodes or qr codes' },
    { icon: 'fa-filter', label: 'Custom filters', desc: 'Add filters matching any custom fields in your system' },
    { icon: 'fa-clipboard-list', label: 'Summaries', desc: 'Group items with the same Pickle ID' },
  ];

  const FilterSection = ({ id, label, children, hasSearch = false, badge = null, clearable = false }: any) => (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-5 flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <i className={`fa-solid fa-chevron-${expandedSections.includes(id) ? 'up' : 'down'} text-[10px] text-slate-400`}></i>
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em]">{label}</span>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {clearable && <button className="text-[10px] font-black text-[#de4a4a] hover:underline uppercase tracking-widest">Clear</button>}
          {hasSearch && <i className="fa-solid fa-magnifying-glass text-xs text-sky-500"></i>}
        </div>
      </button>
      {expandedSections.includes(id) && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full -m-10 bg-white overflow-hidden">
      {/* Filters Sidebar */}
      <aside className="w-[320px] border-r border-slate-200 flex flex-col h-full bg-white shrink-0 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-black text-[#333c4d]">Filters</h2>
          <button className="text-[10px] font-black text-[#de4a4a] hover:underline uppercase tracking-widest">Clear All</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Top Selection Dropdown */}
          <div className="p-6 border-b border-slate-100">
            <div className="relative">
              <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none appearance-none pr-10">
                <option>With Quantity Alerts set</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
            </div>
          </div>

          {/* Date Alerts */}
          <FilterSection id="date-alerts" label="Date Alerts">
            <div className="space-y-3">
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-400 outline-none appearance-none pr-10 shadow-sm">
                  <option>Select Date type field:</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
              </div>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-300 outline-none appearance-none pr-10 shadow-sm">
                  <option>Show Items:</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-200"></i>
              </div>
            </div>
          </FilterSection>

          {/* Tags */}
          <FilterSection id="tags" label="Tags" hasSearch>
            <p className="text-[11px] font-bold text-slate-400 italic">No data available</p>
          </FilterSection>

          {/* Pickle ID */}
          <FilterSection 
            id="sortly-id" 
            label="Pickle ID (SID)" 
            badge={<span className="bg-[#1e88e5] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">1</span>} 
            clearable 
            hasSearch
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-slate-200">
                  SLSOLT0003 <i className="fa-solid fa-xmark cursor-pointer text-slate-400 hover:text-rose-500"></i>
                </span>
              </div>
              <div className="space-y-4 pt-2">
                {['SLSOLT0001', 'SLSOLT0002', 'SLSOLT0003'].map(id => (
                  <div key={id} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-4 h-4 border-2 rounded transition-colors ${id === 'SLSOLT0003' ? 'bg-[#1e88e5] border-[#1e88e5]' : 'border-slate-200 bg-white'}`}>
                      {id === 'SLSOLT0003' && <i className="fa-solid fa-check text-white text-[8px] flex items-center justify-center h-full"></i>}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${id === 'SLSOLT0003' ? 'text-slate-800' : 'text-slate-500'}`}>{id}</span>
                  </div>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Barcode */}
          <FilterSection id="barcode" label="Barcode / QR code">
             <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input type="text" placeholder="Search Barcode / QR code" className="w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 ring-sky-100" />
                <i className="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
             </div>
          </FilterSection>

          {/* Notes */}
          <FilterSection id="notes" label="Notes" hasSearch>
             <div className="flex items-center gap-4 cursor-pointer group">
                <div className="w-4 h-4 border-2 border-slate-200 rounded transition-colors group-hover:border-sky-500"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-800">Blank</span>
             </div>
          </FilterSection>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button className="w-full py-4 bg-[#6bb17f] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5aa16d] transition-all shadow-lg shadow-emerald-50 active:scale-[0.98]">
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-12 bg-white overflow-y-auto">
        <div className="max-w-4xl w-full space-y-16 flex flex-col items-center">
          <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight text-center w-full">Advanced Search</h1>
          
          <div className="text-center space-y-24 w-full">
            <h3 className="text-[1.35rem] font-bold text-[#333c4d] opacity-80">Create lists of items across your inventory using multiple filters</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-20 w-full px-12">
              {featureCards.map((card, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-6 group animate-in fade-in duration-700">
                  <div className={`w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-2xl text-[#1e88e5] shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-[#333c4d] text-base tracking-tight">{card.label}</p>
                    <p className="text-[11px] text-[#7c8691] font-bold leading-relaxed max-w-[180px]">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvancedSearchView;