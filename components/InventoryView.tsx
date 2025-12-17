
import React, { useState, useEffect } from 'react';
import { InventoryItem, Folder } from '../types';
import { MOCK_ITEMS, MOCK_FOLDERS } from '../constants';
import GoalModal from './GoalModal';

interface InventoryViewProps {
  onSelectItem: (id: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ onSelectItem }) => {
  const [items] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [folders] = useState<Folder[]>(MOCK_FOLDERS.filter(f => !f.parentId));
  const [searchQuery, setSearchQuery] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGoalModal(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const totalQuantity = 3; // Matching screenshot
  const totalValue = 0.00; // Matching screenshot

  const columns = [
    { id: 'price', label: 'Price', checked: true },
    { id: 'value', label: 'Value', checked: true },
    { id: 'tags', label: 'Tags', checked: true },
    { id: 'notes', label: 'Notes', checked: true },
    { id: 'barcode1', label: 'Barcode / QR 1', checked: true },
    { id: 'barcode2', label: 'Barcode / QR 2', checked: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-black text-[#333c4d] tracking-tight">All Items</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-[#7c8691] font-bold hover:text-slate-800 transition-all text-sm">
            <i className="fa-solid fa-arrow-up-from-bracket rotate-180"></i>
            <span>Bulk Import</span>
          </button>
          <button className="bg-[#de4a4a] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#c33b3b] shadow-lg shadow-rose-100 transition-all">
            ADD ITEM
          </button>
          <button className="bg-[#de4a4a] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#c33b3b] shadow-lg shadow-rose-100 transition-all">
            ADD FOLDER
          </button>
        </div>
      </div>

      {/* Main Filter & Control Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative flex-1 max-w-sm">
               <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
               <input 
                type="text" 
                placeholder="Search All Items" 
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-1 ring-slate-200 font-medium text-sm transition-all"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300 border-l border-slate-100 pl-3">
                  <i className="fa-solid fa-barcode text-xl cursor-pointer hover:text-slate-600"></i>
                  <span className="bg-[#7c3aed] text-white text-[6px] font-black px-1 rounded absolute -top-1 -right-1">★</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-400">Group Items</span>
               <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
               <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                 <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
               </div>
             </div>

             <div className="flex items-center gap-2">
                <button className="text-xs font-bold text-slate-600 flex items-center gap-2 hover:text-slate-900 uppercase tracking-widest">
                  Updated At <i className="fa-solid fa-arrow-down text-[10px]"></i>
                </button>
             </div>

             <div className="flex items-center text-slate-400 text-lg">
                <i className="fa-solid fa-table-columns cursor-pointer hover:text-slate-600"></i>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-8 py-4 bg-slate-50/30 flex items-center gap-8 text-[#7c8691] font-medium text-sm border-b border-slate-100">
           <div className="flex items-baseline gap-2">
             <span className="text-lg">Folders:</span>
             <span className="text-xl font-black text-[#333c4d]">{folders.length}</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-lg">Items:</span>
             <span className="text-xl font-black text-[#333c4d]">0</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-lg">Total Quantity:</span>
             <span className="text-xl font-black text-[#333c4d]">{totalQuantity} units</span>
           </div>
           <div className="flex items-baseline gap-2">
             <span className="text-lg">Total Value:</span>
             <span className="text-xl font-black text-[#333c4d]">MYR {totalValue.toFixed(2)}</span>
           </div>
        </div>

        {/* Items Table */}
        <div className="relative">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5 w-12 text-center">
                   <div className="w-5 h-5 border-2 border-slate-200 rounded mx-auto"></div>
                </th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5 text-center">Quantity</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Tags</th>
                <th className="px-8 py-5 text-right relative">
                   <button 
                    onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                    className="flex items-center gap-2 bg-[#333c4d] text-white px-5 py-2 rounded-lg font-black text-xs ml-auto hover:bg-slate-700 transition-colors"
                   >
                      <i className="fa-solid fa-list-check"></i> Edit
                   </button>
                   
                   {/* Column Customizer Popover */}
                   {showColumnCustomizer && (
                    <div className="absolute right-8 top-16 w-[340px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 z-[100] animate-in slide-in-from-top-4 text-left normal-case">
                      <h4 className="text-sm font-black text-[#333c4d] mb-6">Customize Columns</h4>
                      <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">Drag to reorder <i className="fa-solid fa-circle-question text-slate-200"></i></p>
                      <div className="space-y-4 mb-10">
                        {columns.map(col => (
                          <div key={col.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${col.checked ? 'bg-[#de4a4a] border-[#de4a4a]' : 'border-slate-200'}`}>
                                 <i className="fa-solid fa-check text-white text-[10px]"></i>
                              </div>
                              <span className="text-sm font-bold text-slate-600">{col.label}</span>
                            </div>
                            <i className="fa-solid fa-grip-vertical text-slate-200 group-hover:text-slate-400 cursor-grab"></i>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-50">
                        <button className="flex-1 bg-[#de4a4a]/40 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-default">APPLY</button>
                        <button onClick={() => setShowColumnCustomizer(false)} className="text-[10px] font-black text-slate-800 uppercase tracking-widest hover:underline">CANCEL</button>
                      </div>
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {folders.map(folder => (
                <tr key={folder.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-6 text-center">
                     <div className="w-5 h-5 border-2 border-slate-200 rounded mx-auto group-hover:border-[#de4a4a] transition-colors"></div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] flex items-center justify-center relative shadow-sm">
                        <i className="fa-solid fa-folder text-slate-400 text-2xl"></i>
                        <span className="absolute -top-1 -right-1 bg-[#333c4d] text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm">NEW</span>
                      </div>
                      <span className="text-lg font-bold text-[#333c4d]">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">MYR 0.00</td>
                  <td className="px-8 py-6 text-slate-300">—</td>
                  <td className="px-8 py-6"></td>
                </tr>
              ))}
              {/* Items Row example matching the 1 unit stat */}
              <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-6 text-center">
                     <div className="w-5 h-5 border-2 border-slate-200 rounded mx-auto group-hover:border-[#de4a4a]"></div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] overflow-hidden relative border border-slate-100 shadow-sm">
                        <img src="https://picsum.photos/seed/itemA/100/100" className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 bg-[#333c4d] text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm">NEW</span>
                      </div>
                      <span className="text-lg font-bold text-[#333c4d]">Main Location</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold text-[#333c4d]">2 units</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">MYR 0.00</td>
                  <td className="px-8 py-6 text-slate-300">—</td>
                  <td className="px-8 py-6"></td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-8 py-6 text-center">
                     <div className="w-5 h-5 border-2 border-slate-200 rounded mx-auto group-hover:border-[#de4a4a]"></div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] overflow-hidden relative border border-slate-100 shadow-sm">
                        <img src="https://picsum.photos/seed/itemB/100/100" className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 bg-[#333c4d] text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm">NEW</span>
                      </div>
                      <span className="text-lg font-bold text-[#333c4d]">Storage Area</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold text-[#333c4d]">1 unit</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-300">—</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">MYR 0.00</td>
                  <td className="px-8 py-6 text-slate-300">—</td>
                  <td className="px-8 py-6"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-white flex items-center gap-4 border-t border-slate-50">
           <span className="text-sm font-medium text-slate-400">Show:</span>
           <div className="relative">
             <select className="bg-slate-50 border border-slate-100 rounded-xl text-xs font-black px-4 py-2 outline-none appearance-none pr-8">
               <option>20</option>
               <option>50</option>
             </select>
             <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-400"></i>
           </div>
           <span className="text-sm font-medium text-slate-400">per page</span>
        </div>
      </div>

      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} />}
    </div>
  );
};

export default InventoryView;
