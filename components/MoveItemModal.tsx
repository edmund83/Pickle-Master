
import React, { useState } from 'react';
import { InventoryItem, Folder } from '../types';
import { MOCK_FOLDERS } from '../constants';

interface MoveItemModalProps {
  item: InventoryItem;
  onClose: () => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, onClose }) => {
  const [qty, setQty] = useState(1);
  const [leaveZero, setLeaveZero] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800">Move Item</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <div className="space-y-6">
             <h3 className="text-3xl font-black text-slate-800 tracking-tight">{item.name}</h3>
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantity to move</label>
                 <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100 focus-within:ring-2 ring-rose-100 transition-all">
                    <input 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="bg-transparent font-black text-xl outline-none w-20" 
                    />
                    <span className="text-sm font-bold text-slate-400 ml-auto uppercase tracking-tighter">of {item.quantity} units</span>
                 </div>
               </div>
               <div className="flex items-center gap-4 py-2">
                 <div 
                  onClick={() => setLeaveZero(!leaveZero)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${leaveZero ? 'bg-emerald-500' : 'bg-slate-200'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${leaveZero ? 'right-1' : 'left-1'}`}></div>
                 </div>
                 <span className="text-xs font-bold text-slate-500 flex items-center gap-1">Leave zero qty on item <i className="fa-solid fa-circle-question text-[10px] text-slate-300"></i></span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Move reason</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none text-sm font-bold text-slate-400">
                  <option>Select a reason...</option>
                  <option>Internal transfer</option>
                  <option>Customer shipment</option>
                  <option>Return to vendor</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Move notes</label>
               <input type="text" placeholder="Add a note" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300" />
             </div>
          </div>

          <div className="space-y-6 pt-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose destination folder:</label>
             <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input type="text" placeholder="Search folders" className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-rose-100" />
             </div>
             
             <div className="bg-slate-50/50 rounded-[2rem] p-8 space-y-6 border border-slate-100">
                <div className="flex items-center gap-3 cursor-pointer group">
                  <i className="fa-solid fa-calendar-check text-[#de4a4a] text-lg"></i>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">All Items</span>
                </div>
                <div className="ml-8 space-y-6 border-l-2 border-slate-200/50 pl-6">
                   {MOCK_FOLDERS.filter(f => !f.parentId).map(folder => (
                     <div key={folder.id} className="space-y-6">
                        <button 
                          onClick={() => setSelectedFolderId(folder.id)}
                          className={`flex items-center gap-4 w-full text-left transition-all ${selectedFolderId === folder.id ? 'text-[#de4a4a]' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <i className={`fa-solid fa-folder text-xl ${selectedFolderId === folder.id ? 'text-[#de4a4a]' : 'text-slate-300'}`}></i>
                          <span className="text-sm font-black uppercase tracking-tight">{folder.name}</span>
                        </button>
                        {MOCK_FOLDERS.filter(sub => sub.parentId === folder.id).map(sub => (
                          <button 
                            key={sub.id}
                            onClick={() => setSelectedFolderId(sub.id)}
                            className={`ml-10 flex items-center gap-4 w-full text-left transition-all ${selectedFolderId === sub.id ? 'text-[#de4a4a]' : 'text-slate-400 hover:text-slate-800'}`}
                          >
                            <i className={`fa-solid fa-folder-open text-lg ${selectedFolderId === sub.id ? 'text-[#de4a4a]' : 'text-slate-200'}`}></i>
                            <span className="text-sm font-bold">{sub.name}</span>
                          </button>
                        ))}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 border-t flex justify-end gap-6 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
           <button onClick={onClose} className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors">CANCEL</button>
           <button 
            disabled={!selectedFolderId}
            className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
              selectedFolderId ? 'bg-[#de4a4a] text-white shadow-rose-100 hover:bg-[#c33b3b] hover:-translate-y-0.5' : 'bg-rose-100 text-white cursor-not-allowed shadow-none'
            }`}
           >
             MOVE
           </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemModal;
