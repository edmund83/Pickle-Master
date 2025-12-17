
import React, { useState } from 'react';
import { MOCK_FOLDERS, MOCK_ITEMS } from '../constants';

const AdvancedSearchView: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['folders', 'name', 'quantity', 'sortly-id']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const featureCards = [
    { icon: 'fa-folder', label: 'Folders', desc: 'Get a list of items in specific folders', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'fa-plus-minus', label: 'Quantity', desc: 'Filter items based on their stock levels', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'fa-plus-minus', label: 'Min Level', desc: 'Identify items below or above their min levels', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'fa-qrcode', label: 'Barcode / QR code', desc: 'Find all items matching specific barcodes or qr codes', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'fa-filter-circle-xmark', label: 'Custom filters', desc: 'Add filters matching any custom fields in your system', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: 'fa-clipboard-list', label: 'Summaries', desc: 'Group items with the same Sortly ID', color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const FilterSection = ({ id, label, children, hasSearch = false, badge = null, clearable = false }: any) => (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-4 flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <i className={`fa-solid fa-chevron-${expandedSections.includes(id) ? 'down' : 'right'} text-[10px] text-slate-400 group-hover:text-slate-800`}></i>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{label}</span>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {clearable && <span className="text-[10px] font-black text-[#de4a4a] hover:underline uppercase">Clear</span>}
          {hasSearch && <i className="fa-solid fa-magnifying-glass text-xs text-slate-300"></i>}
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
      <aside className="w-[320px] border-r border-slate-200 flex flex-col h-full bg-white shrink-0">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800">Filters</h2>
          <button className="text-[10px] font-black text-slate-400 hover:text-[#de4a4a] uppercase tracking-widest">Clear All</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Folders */}
          <FilterSection id="folders" label="Folders" badge={<span className="bg-slate-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full ml-1">All Folders</span>} hasSearch>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-4 h-4 bg-[#de4a4a] rounded flex items-center justify-center text-white text-[8px]">
                  <i className="fa-solid fa-check"></i>
                </div>
                <i className="fa-solid fa-folder-tree text-[#de4a4a] text-xs"></i>
                <span>All Items</span>
              </div>
              <div className="ml-6 space-y-3">
                {MOCK_FOLDERS.filter(f => !f.parentId).map(f => (
                  <div key={f.id} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center bg-[#de4a4a] border-[#de4a4a]">
                      <i className="fa-solid fa-check text-white text-[8px]"></i>
                    </div>
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Name */}
          <FilterSection id="name" label="Name" hasSearch>
            <div className="space-y-3">
              {['a', 'b', 'c'].map(n => (
                <div key={n} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-200 rounded"></div>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Quantity */}
          <FilterSection id="quantity" label="Quantity">
            <div className="space-y-4">
              <select className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none">
                <option>Any Units</option>
              </select>
              <div className="flex gap-2">
                <input type="text" placeholder="Min" className="flex-1 bg-white border border-slate-100 rounded-lg p-3 text-xs font-bold" />
                <input type="text" placeholder="Max" className="flex-1 bg-white border border-slate-100 rounded-lg p-3 text-xs font-bold" />
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                   <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                 </div>
                 <span className="text-xs font-bold text-slate-400">Exact value</span>
              </div>
            </div>
          </FilterSection>

          {/* Min Level */}
          <FilterSection id="min-level" label="Min Level">
            <select className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none">
              <option>Show Items:</option>
            </select>
          </FilterSection>

          {/* Sortly ID */}
          <FilterSection id="sortly-id" label="Sortly ID (SID)" badge={<span className="bg-[#de4a4a] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">1</span>} clearable hasSearch>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2">
                  SLSOLT0003 <i className="fa-solid fa-xmark cursor-pointer"></i>
                </span>
              </div>
              <div className="space-y-3">
                {['SLSOLT0001', 'SLSOLT0002', 'SLSOLT0003'].map(id => (
                  <div key={id} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${id === 'SLSOLT0003' ? 'bg-[#de4a4a] border-[#de4a4a]' : 'border-slate-200'}`}>
                      {id === 'SLSOLT0003' && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                    </div>
                    <span>{id}</span>
                  </div>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Barcode */}
          <FilterSection id="barcode" label="Barcode / QR code">
             <div className="relative">
                <input type="text" placeholder="Search Barcode / QR code" className="w-full p-3 pr-10 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold" />
                <i className="fa-solid fa-barcode absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
             </div>
          </FilterSection>

          {/* Notes */}
          <FilterSection id="notes" label="Notes" hasSearch>
             <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-200 rounded"></div>
                <span>Blank</span>
             </div>
          </FilterSection>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <button className="w-full py-4 bg-[#6bb17f] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5aa16d] transition-all shadow-lg shadow-emerald-50">
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-20 overflow-y-auto bg-slate-50/20">
        <div className="max-w-4xl w-full space-y-20">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight text-center lg:text-left">Advanced Search</h1>
          
          <div className="text-center space-y-16">
            <h3 className="text-xl font-bold text-slate-700">Create lists of items across your inventory using multiple filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12">
              {featureCards.map((card, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-5 animate-in fade-in duration-500 delay-[100ms]">
                  <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-slate-800 text-sm tracking-tight">{card.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[160px]">{card.desc}</p>
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
