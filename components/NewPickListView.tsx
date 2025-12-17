
import React, { useState } from 'react';

interface NewPickListViewProps {
  onCancel: () => void;
}

const NewPickListView: React.FC<NewPickListViewProps> = ({ onCancel }) => {
  const [isScanningMode, setIsScanningMode] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <button onClick={onCancel} className="hover:text-slate-800">Pick Lists</button>
        </nav>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated: <span className="text-slate-800">12/10/2025 8:54 PM</span></span>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-6 py-3 font-black text-2xl text-slate-800 tracking-tight">
            PL-000001
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Draft</span>
            <span className="text-[10px] font-bold text-slate-300 italic">Fill out required fields before proceeding. <i className="fa-solid fa-circle-question ml-1"></i></span>
          </div>
        </div>
        <button onClick={onCancel} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500">CANCEL</button>
      </div>

      <div className="text-right px-4">
        <span className="text-[10px] font-bold text-slate-400">Created By: <span className="text-slate-800">Edmund</span></span>
        <span className="text-[10px] font-bold text-slate-400 ml-4">Date Created: <span className="text-slate-800">12/10/2025 8:54 PM</span></span>
      </div>

      {/* Main Settings Grid */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             Assign To * <i className="fa-solid fa-circle-question text-slate-200"></i>
           </label>
           <select className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold text-slate-400 outline-none">
             <option>Assign To*</option>
           </select>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
           <div className="relative">
             <input type="text" placeholder="Due Date" className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none" />
             <i className="fa-solid fa-calendar-days absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
           </div>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             Item Outcome when Picked* <i className="fa-solid fa-circle-question text-slate-200"></i>
           </label>
           <button className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-slate-800 transition-all">
             Choose Outcome
           </button>
        </div>
      </div>

      {/* Add Items Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 space-y-6">
           <div className="relative flex items-center gap-4">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder="Search to add items to the pick list" 
                className="flex-1 pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-rose-100 font-medium text-sm transition-all"
              />
              <button 
                onClick={() => setIsScanningMode(!isScanningMode)}
                className={`p-4 rounded-xl border border-slate-200 text-slate-600 transition-all ${isScanningMode ? 'bg-slate-800 text-white' : 'bg-white hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-barcode text-xl"></i>
              </button>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                 <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xs font-bold text-slate-400">Only show low-stock items</span>
           </div>
        </div>

        {isScanningMode ? (
          <div className="bg-slate-50/80 py-24 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
             <div className="flex flex-col items-center space-y-4">
                <button 
                  onClick={() => setIsScanningMode(false)} 
                  className="text-[10px] font-black text-[#de4a4a] uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  Close scanning mode <i className="fa-solid fa-xmark"></i>
                </button>
                <p className="text-[10px] font-bold text-slate-400">Scanning mode is enabled. Please use handheld scanner to perform search.</p>
             </div>
             
             <div className="flex flex-col items-center space-y-8 py-10 opacity-30">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-6xl text-slate-400 shadow-inner rotate-12">
                   <i className="fa-solid fa-barcode"></i>
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black text-slate-800">Scan QR / Barcode using scanner to search for items</h3>
                </div>
             </div>
          </div>
        ) : (
          <div className="border-t border-slate-50 bg-slate-50/30 h-48 flex flex-col items-center justify-center text-slate-200">
             <i className="fa-solid fa-box-open text-4xl mb-2"></i>
             <span className="text-[10px] font-black uppercase tracking-widest">No items added yet</span>
          </div>
        )}
      </div>

      {/* Ship To Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
           <h3 className="text-xl font-black text-slate-800">Ship To</h3>
           <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-slate-800">
             SELECT ADDRESS
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <input type="text" placeholder="Name" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 ring-slate-200" />
           <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Address 1" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium" />
              <input type="text" placeholder="Address 2" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium" />
           </div>
           <input type="text" placeholder="City" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium" />
           <input type="text" placeholder="State / Province / Region" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium" />
           <input type="text" placeholder="Zip / Postal Code" className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium" />
           <select className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 outline-none text-sm font-medium text-slate-400">
             <option>Country</option>
           </select>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-6">
        <h3 className="text-xl font-black text-slate-800">Notes</h3>
        <textarea 
          placeholder="Leave a note here for your team"
          className="w-full h-32 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 ring-slate-200 resize-none"
        ></textarea>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-6 pt-4">
        <button onClick={onCancel} className="px-10 py-4 bg-white border border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-800 transition-all">Cancel</button>
        <button className="px-12 py-4 bg-[#de4a4a] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b]">Create Pick List</button>
      </div>
    </div>
  );
};

export default NewPickListView;
