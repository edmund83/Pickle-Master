
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import LabelWizard from './LabelWizard';
import MoveItemModal from './MoveItemModal';

interface ItemDetailViewProps {
  item: InventoryItem;
  onBack: () => void;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, onBack }) => {
  const [showLabelWizard, setShowLabelWizard] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(false);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Breadcrumbs & Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <button onClick={onBack} className="hover:text-slate-800">All Items</button>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
            <span>Storage Area</span>
          </nav>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-slate-800">{item.name}</h1>
            <div className="flex items-center gap-4 text-[10px] font-black">
              <span className="text-slate-400">Sortly ID: <span className="text-[#de4a4a] uppercase">{item.id.padStart(8, '0')}</span></span>
              <span className="text-slate-400">Updated at: {new Date(item.lastUpdated).toLocaleDateString()} {new Date(item.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMoveModal(true)}
            className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(!activeMenu)}
              className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
            >
              <i className="fa-solid fa-ellipsis"></i>
            </button>
            {activeMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 z-50 animate-in slide-in-from-top-2">
                <button onClick={() => {setShowLabelWizard(true); setActiveMenu(false);}} className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                  <i className="fa-solid fa-print w-5"></i> Print Label
                </button>
                <button className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                  <i className="fa-solid fa-bell w-5"></i> Set Alert
                </button>
                <button className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                  <i className="fa-solid fa-share-nodes w-5"></i> Export
                </button>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#de4a4a] text-white rounded-lg text-xs font-black uppercase shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all">
            <i className="fa-solid fa-pen"></i>
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <span>Quantity • units</span>
             <i className="fa-solid fa-shuffle"></i>
           </div>
           <p className="text-4xl font-black text-slate-800">{item.quantity}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <span>Min Level • units</span>
             <i className="fa-solid fa-circle-question"></i>
           </div>
           <div className="flex justify-between items-center">
             <p className="text-4xl font-black text-slate-800">{item.minQuantity}</p>
             <i className="fa-solid fa-bell text-slate-300"></i>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Price • per units
           </div>
           <p className="text-2xl font-black text-slate-800">MYR {item.price.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Total value
           </div>
           <p className="text-2xl font-black text-slate-800">MYR {(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Product Information Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 space-y-8">
            <h3 className="text-xl font-black text-slate-800">Product Information</h3>
            <p className="text-sm text-slate-400 font-medium">Adding an image to an item can improve work efficiency and make it easier to find.</p>
            
            <div className="relative aspect-video bg-slate-50 rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 group flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
              ) : (
                <div className="text-center space-y-3">
                  <i className="fa-regular fa-image text-4xl text-slate-300"></i>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">(Max 8 photos, 30 MB Total)<br/>Supports: JPG, PNG</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tags.length > 0 ? item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">#{tag}</span>
                  )) : <span className="text-slate-300">—</span>}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                <p className="mt-2 text-sm text-slate-600 font-medium">{item.notes || '—'}</p>
              </div>
            </div>
          </div>

          {/* QR & Barcode Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">QR & Barcode</h3>
              <button className="p-2 text-slate-400 hover:text-slate-800"><i className="fa-solid fa-print"></i></button>
            </div>
            <p className="text-sm text-slate-400 font-medium">You can use QR codes or barcodes to track the inventory of your products or assets.</p>
            <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-center border border-slate-100">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2">
                 <div className="text-[10px] font-black text-slate-400 mb-2">Created via <span className="text-[#de4a4a] italic">Sortly</span></div>
                 <div className="w-48 h-16 bg-slate-900 flex items-center justify-center">
                   {/* Mock Barcode */}
                   <div className="w-full h-full flex items-center justify-between px-2 gap-0.5">
                     {[1,2,3,1,2,4,2,1,5,2,1,3,1,2,1,3,2,1,1,2,1].map((w,i) => (
                       <div key={i} style={{width: `${w*2}px`}} className="h-full bg-white"></div>
                     ))}
                   </div>
                 </div>
                 <span className="text-[10px] font-black text-slate-800 tracking-[0.2em]">{item.barcode || 'SLSOLT0002'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Fields Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 flex flex-col h-fit sticky top-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">Custom Fields</h3>
            <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div className="flex-1 space-y-6">
            {item.customFields && Object.entries(item.customFields).length > 0 ? (
               Object.entries(item.customFields).map(([key, value]) => (
                 <div key={key} className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</label>
                   <p className="text-sm font-black text-slate-800">{value}</p>
                 </div>
               ))
            ) : (
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                These custom fields can be used to track unique information that does not fit into any of the default fields provided by Sortly.
              </p>
            )}
          </div>
        </div>
      </div>

      {showLabelWizard && <LabelWizard item={item} onClose={() => setShowLabelWizard(false)} />}
      {showMoveModal && <MoveItemModal item={item} onClose={() => setShowMoveModal(false)} />}
    </div>
  );
};

export default ItemDetailView;
