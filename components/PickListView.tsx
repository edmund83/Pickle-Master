
import React from 'react';

interface PickListViewProps {
  onCreateNew: () => void;
}

const PickListView: React.FC<PickListViewProps> = ({ onCreateNew }) => {
  const steps = [
    { title: 'Add items', desc: 'Add items to your pick list' },
    { title: 'Assign and Mark as "Ready to Pick"', desc: 'Assign the pick list to a user and set as "Ready to Pick"' },
    { title: 'Pick items', desc: 'A user will receive a notification and can start picking the items on mobile or web.' },
    { title: 'Done!', desc: 'Quantity of items will update automatically when items are picked.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800">Pick Lists</h1>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            Easily request items for pickup with ZenInventory's Pick Lists. Create a list, add items, and assign it to a user for review or pickup. Quantities update automatically after items are picked.
          </p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
        >
          NEW PICK LIST
        </button>
      </div>

      {/* Tutorial Banner */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-sm overflow-hidden group">
        <div className="w-24 h-16 bg-[#de4a4a] rounded-xl flex items-center justify-center text-white relative cursor-pointer">
          <i className="fa-solid fa-play text-xl group-hover:scale-110 transition-transform"></i>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700">Learn how to create a Pick List</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#de4a4a] text-xs font-black underline">Watch Video Tutorial</a>
            <a href="#" className="text-[#de4a4a] text-xs font-black underline">View Help Article</a>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Search Pick Lists (e.g., PL-213)" 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-[#de4a4a]/10 font-medium text-sm"
          />
        </div>
        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600">
          <i className="fa-solid fa-sliders"></i>
        </button>
      </div>

      {/* List Header */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-4 grid grid-cols-6 gap-4">
        {['PICK LIST #', 'ASSIGNED TO', 'DUE DATE', 'STATUS', 'ITEM OUTCOME', 'LAST UPDATED'].map(h => (
          <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
        ))}
      </div>

      {/* Empty State / How to Use */}
      <div className="flex flex-col lg:flex-row items-center justify-center py-20 gap-20">
        <div className="relative w-80 h-64 bg-rose-50 rounded-[4rem] flex items-center justify-center shadow-inner overflow-hidden">
           <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl animate-pulse"></div>
           <div className="relative bg-white w-48 h-56 rounded-2xl shadow-2xl border border-slate-100 p-4 space-y-4 translate-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                 </div>
                 <span className="text-[8px] font-black text-slate-400">Pick List</span>
              </div>
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-slate-50 rounded border border-slate-100"></div>
                         <div className="space-y-1">
                            <div className="w-12 h-1 bg-slate-200 rounded"></div>
                            <div className="w-8 h-0.5 bg-slate-100 rounded"></div>
                         </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full border-2 ${i === 2 ? 'bg-[#de4a4a] border-[#de4a4a]' : 'border-slate-100'}`}>
                         {i === 2 && <i className="fa-solid fa-check text-white text-[5px] flex items-center justify-center h-full"></i>}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           {/* Decorative dots */}
           <div className="absolute top-10 right-10 grid grid-cols-3 gap-2 opacity-20">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-slate-900 rounded-full"></div>)}
           </div>
        </div>

        <div className="max-w-md space-y-10">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">How to use pick lists</h2>
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-6 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                  idx === 3 ? 'bg-slate-50 text-slate-400 border-2 border-slate-200' : 'bg-white border-2 border-slate-100 text-slate-300'
                }`}>
                  {idx === 3 ? <i className="fa-solid fa-check"></i> : idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-lg group-hover:text-[#de4a4a] transition-colors">{step.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onCreateNew}
            className="bg-[#de4a4a] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-105 transition-all"
          >
            NEW PICK LIST
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickListView;
