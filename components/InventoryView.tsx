
import React, { useState, useEffect } from 'react';
import { InventoryItem, Folder, ItemStatus } from '../types';
import { MOCK_ITEMS, MOCK_FOLDERS } from '../constants';
import GoalModal from './GoalModal';

interface InventoryViewProps {
  onSelectItem: (id: string) => void;
}

type ViewMode = 'grid' | 'list' | 'table';

const InventoryView: React.FC<InventoryViewProps> = ({ onSelectItem }) => {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    // Show the progress goal modal after a short delay on initial load
    const timer = setTimeout(() => setShowGoalModal(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">All Items</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold hover:text-slate-800 transition-all text-sm">
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Bulk Import</span>
          </button>
          <button className="bg-[#de4a4a] text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#c33b3b] shadow-lg shadow-rose-100 transition-all">
            Add Item
          </button>
          <button className="bg-[#de4a4a] text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#c33b3b] shadow-lg shadow-rose-100 transition-all">
            Add Folder
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 w-full">
           <div className="relative flex-1 max-w-sm">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input 
              type="text" 
              placeholder="Search All Items" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-rose-100 font-medium text-sm transition-all"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300 border-l border-slate-200 pl-2">
                <i className="fa-solid fa-barcode text-lg cursor-pointer hover:text-slate-600"></i>
                <i className="fa-solid fa-qrcode text-lg cursor-pointer hover:text-slate-600"></i>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400">Group Items</span>
             <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
             <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
               <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
             </div>
           </div>

           <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
              <button className="text-xs font-bold text-slate-600 flex items-center gap-2 hover:text-slate-900">
                Updated At <i className="fa-solid fa-arrow-down text-[10px]"></i>
              </button>
           </div>

           <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center rounded ${viewMode === 'grid' ? 'bg-white shadow text-[#de4a4a]' : 'text-slate-400'}`}>
                <i className="fa-solid fa-table-cells-large"></i>
              </button>
              <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center rounded ${viewMode === 'list' ? 'bg-white shadow text-[#de4a4a]' : 'text-slate-400'}`}>
                <i className="fa-solid fa-list"></i>
              </button>
              <button onClick={() => setViewMode('table')} className={`w-8 h-8 flex items-center justify-center rounded ${viewMode === 'table' ? 'bg-white shadow text-[#de4a4a]' : 'text-slate-400'}`}>
                <i className="fa-solid fa-table"></i>
              </button>
           </div>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-2 border-b border-slate-100">
         <div className="flex items-baseline gap-2">
           <span className="text-sm font-bold text-slate-400">Folders:</span>
           <span className="text-xl font-black text-slate-800">{folders.length}</span>
         </div>
         <div className="flex items-baseline gap-2">
           <span className="text-sm font-bold text-slate-400">Items:</span>
           <span className="text-xl font-black text-slate-800">0</span>
         </div>
         <div className="flex items-baseline gap-2">
           <span className="text-sm font-bold text-slate-400">Total Quantity:</span>
           <span className="text-xl font-black text-slate-800">{totalQuantity} <span className="text-xs font-bold text-slate-400 ml-1">units</span></span>
         </div>
         <div className="flex items-baseline gap-2">
           <span className="text-sm font-bold text-slate-400">Total Value:</span>
           <span className="text-xl font-black text-slate-800">MYR {totalValue.toLocaleString()}</span>
         </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {folders.map(folder => (
            <div 
              key={folder.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="h-44 bg-[#9499a3] flex items-center justify-center relative">
                 <i className="fa-solid fa-folder text-white text-7xl opacity-80 group-hover:scale-110 transition-transform"></i>
                 <span className="absolute top-4 right-4 bg-slate-700/80 text-white text-[9px] font-black px-2 py-0.5 rounded backdrop-blur-sm uppercase">NEW</span>
              </div>
              <div className="p-6 space-y-4 bg-white">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{folder.name}</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-slate-300 text-xs"></i>
                    <span className="text-xs font-bold text-slate-500">0 Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MYR 0.00</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View (As seen in the screenshots) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 w-12">
                   <div className="w-5 h-5 border-2 border-slate-200 rounded"></div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
                <th className="px-8 py-5 text-right">
                   <button className="flex items-center gap-2 text-slate-600 font-bold text-xs ml-auto">
                      <i className="fa-solid fa-list-check"></i> Edit
                   </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {folders.map(folder => (
                <tr key={folder.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                     <div className="w-5 h-5 border-2 border-slate-200 rounded group-hover:border-[#de4a4a]"></div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center relative">
                        <i className="fa-solid fa-folder text-slate-400 text-xl"></i>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-black px-1 rounded">NEW</span>
                      </div>
                      <span className="font-bold text-slate-800">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-medium text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-600">MYR 0.00</td>
                  <td className="px-8 py-6 text-slate-300">—</td>
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
      )}

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} />}
    </div>
  );
};

export default InventoryView;
