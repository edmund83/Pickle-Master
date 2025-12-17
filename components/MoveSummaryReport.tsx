
import React, { useState } from 'react';
import { MOCK_FOLDERS } from '../constants';

const MoveSummaryReport: React.FC = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['source-folders', 'destination-folders']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const FolderFilterTree = ({ label }: { label: string }) => (
    <div className="space-y-4">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
        <input 
          type="text" 
          placeholder="Search folders" 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 ring-slate-200" 
        />
      </div>
      
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between group cursor-pointer bg-slate-50 p-2.5 rounded-lg -mx-2">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-calendar-check text-[#de4a4a] text-sm"></i>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">All Items</span>
          </div>
          <div className="w-4 h-4 bg-[#de4a4a] rounded flex items-center justify-center text-white text-[8px]">
            <i className="fa-solid fa-check"></i>
          </div>
        </div>

        <div className="ml-6 space-y-3 border-l-2 border-slate-50 pl-4">
          {MOCK_FOLDERS.filter(f => !f.parentId).slice(0, 3).map(folder => (
            <div key={folder.id} className="space-y-3">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-folder text-slate-400 text-sm"></i>
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">{folder.name}</span>
                </div>
                <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center bg-[#de4a4a] border-[#de4a4a]">
                  <i className="fa-solid fa-check text-white text-[8px]"></i>
                </div>
              </div>
            </div>
          ))}
          {/* Specific folders from screenshot */}
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-folder text-slate-400 text-sm"></i>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">Main Location</span>
            </div>
            <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center bg-[#de4a4a] border-[#de4a4a]">
              <i className="fa-solid fa-check text-white text-[8px]"></i>
            </div>
          </div>
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-folder text-slate-400 text-sm"></i>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">Storage Area</span>
            </div>
            <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center bg-[#de4a4a] border-[#de4a4a]">
              <i className="fa-solid fa-check text-white text-[8px]"></i>
            </div>
          </div>
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="fa-regular fa-folder text-slate-300 text-sm"></i>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">Truck</span>
            </div>
            <div className="w-4 h-4 border-2 border-slate-200 rounded flex items-center justify-center bg-[#de4a4a] border-[#de4a4a]">
              <i className="fa-solid fa-check text-white text-[8px]"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-full -m-10 animate-in fade-in duration-500 flex bg-white overflow-hidden">
      {/* Main Content Area */}
      <div className={`flex-1 p-10 overflow-y-auto custom-scrollbar transition-all duration-300 ${isFilterPanelOpen ? 'bg-black/[0.02]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <i className="fa-solid fa-layer-group"></i>
                <span>Default Report</span>
              </div>
              <h1 className="text-3xl font-black text-[#333c4d] tracking-tight">Move Summary</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                <i className="fa-solid fa-calendar-days text-sm"></i>
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
               <button className="px-5 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-500 shadow-sm">
                 <i className="fa-solid fa-folder text-slate-300"></i>
                 Source: Any folder
                 <i className="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
               </button>
               <button className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all">
                 <i className="fa-solid fa-repeat rotate-90"></i>
               </button>
               <button className="px-5 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-500 shadow-sm">
                 <i className="fa-solid fa-folder text-slate-300"></i>
                 Destination: Any folder
                 <i className="fa-solid fa-chevron-down text-[8px] text-slate-400"></i>
               </button>
               <button 
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
               >
                 <i className="fa-solid fa-sliders"></i>
               </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="flex flex-wrap gap-16 pt-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sources</p>
              <p className="text-4xl font-black text-[#333c4d]">1</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Destinations</p>
              <p className="text-4xl font-black text-[#333c4d]">1</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Items Moved</p>
              <p className="text-4xl font-black text-[#333c4d]">1</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity Moved</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#333c4d]">1</span>
                <span className="text-xl text-slate-400 font-bold uppercase tracking-tight">unit</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Value</p>
              <p className="text-4xl font-black text-[#333c4d]">MYR 20.00</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Source Folder</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Destination Folder</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Items Moved <i className="fa-solid fa-arrow-down ml-1 text-slate-300"></i>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Quantity Moved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <i className="fa-solid fa-folder text-slate-400 text-lg"></i>
                      <span className="text-sm font-bold text-[#333c4d]">Storage Area</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-6">
                       <i className="fa-solid fa-arrow-right text-slate-300"></i>
                       <div className="flex items-center gap-4">
                        <i className="fa-solid fa-folder text-slate-400 text-lg"></i>
                        <span className="text-sm font-bold text-[#333c4d]">Main Location</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-sm font-black text-[#333c4d]">1</td>
                  <td className="px-8 py-7 text-sm font-bold text-slate-500">1 unit</td>
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
            <h2 className="text-xl font-black text-[#333c4d]">Filters</h2>
            <button className="text-[10px] font-black text-slate-400 hover:text-[#de4a4a] uppercase tracking-widest transition-colors">Clear All</button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Source Folders */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('source-folders')}
                className="w-full px-6 py-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Source Folders</span>
                  <span className="bg-slate-700 text-white text-[8px] font-black px-2 py-0.5 rounded-full">All Folders</span>
                </div>
                <i className={`fa-solid fa-chevron-${expandedSections.includes('source-folders') ? 'up' : 'down'} text-[10px] text-slate-300`}></i>
              </button>
              {expandedSections.includes('source-folders') && (
                <div className="px-6 pb-8 animate-in slide-in-from-top-1 duration-200">
                  <FolderFilterTree label="Source" />
                </div>
              )}
            </div>

            {/* Destination Folders */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('destination-folders')}
                className="w-full px-6 py-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Destination Folders</span>
                  <span className="bg-slate-700 text-white text-[8px] font-black px-2 py-0.5 rounded-full">All Folders</span>
                </div>
                <i className={`fa-solid fa-chevron-${expandedSections.includes('destination-folders') ? 'up' : 'down'} text-[10px] text-slate-300`}></i>
              </button>
              {expandedSections.includes('destination-folders') && (
                <div className="px-6 pb-8 animate-in slide-in-from-top-1 duration-200">
                  <FolderFilterTree label="Destination" />
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
            <button className="w-full py-4 bg-[#de4a4a]/50 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-default">
              Apply
            </button>
            <button 
              onClick={() => setIsFilterPanelOpen(false)}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default MoveSummaryReport;
