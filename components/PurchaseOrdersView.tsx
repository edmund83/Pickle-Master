
import React from 'react';

interface PurchaseOrdersViewProps {
  onCreateNew: () => void;
}

const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ onCreateNew }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800">Purchase Orders</h1>
          <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
            Start a new Purchase Order, select items and input the desired quantity for ordering. Export as a PDF and send to your supplier. Mark as "Received" when items have been shipped.
          </p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
        >
          NEW PURCHASE ORDER
        </button>
      </div>

      {/* Tutorial Banner */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-sm overflow-hidden group">
        <div className="w-24 h-16 bg-[#de4a4a] rounded-xl flex items-center justify-center text-white relative cursor-pointer">
          <i className="fa-solid fa-play text-xl group-hover:scale-110 transition-transform"></i>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700">Learn how to create a Purchase Order</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#de4a4a] text-xs font-black underline">Watch Video Tutorial</a>
            <a href="#" className="text-[#de4a4a] text-xs font-black underline">View Help Article</a>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-48 space-y-10 text-center">
        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner group">
           <i className="fa-solid fa-cart-shopping transition-transform group-hover:scale-110"></i>
           <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-check"></i>
           </div>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-black text-slate-800">You don't have any purchase orders</h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Create a new purchase order and send it to your vendors to replenish your inventory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersView;
