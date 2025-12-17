
import React, { useState } from 'react';
import { MOCK_ITEMS, MOCK_FOLDERS } from '../constants';

const InventorySummaryReport: React.FC = () => {
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

  const totalQty = MOCK_ITEMS.reduce((s, i) => s + i.quantity, 0);
  const totalVal = MOCK_ITEMS.reduce((s, i) => s + (i.price * i.quantity), 0);

  const columns = [
    { id: 'min-level', label: 'Min Level', checked: true },
    { id: 'price', label: 'Price', checked: true },
    { id: 'value', label: 'Value', checked: true },
    { id: 'folder', label: 'Folder', checked: true },
    { id: 'tags', label: 'Tags', checked: true },
    { id: 'notes', label: 'Notes', checked: true },
    { id: 'barcode1', label: 'Barcode / QR 1', checked: true },
    { id: 'barcode2', label: 'Barcode / QR 2', checked: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <i className="fa-solid fa-layer-group"></i>
            <span>Default Report</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Summary</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-calendar-days"></i>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#de4a4a] text-white rounded-xl text-sm font-black shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all">
            <i className="fa-solid fa-upload"></i>
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
           <div className="relative flex-1 max-w-sm">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input type="text" placeholder="Search Items" className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-slate-100 font-medium" />
             <i className="fa-solid fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 border-l border-slate-100 pl-3"></i>
           </div>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-file-invoice text-slate-300"></i>
             Any item
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-600">
             <i className="fa-solid fa-folder text-slate-300"></i>
             Any folder
             <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
           </button>
           <button className="relative p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50">
             <i className="fa-solid fa-sliders"></i>
           </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Group Items</span>
          <i className="fa-solid fa-circle-question text-slate-300 text-sm"></i>
          <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Quantity</p>
          <p className="text-4xl font-black text-slate-800">{totalQty} <span className="text-lg text-slate-500 font-bold ml-1">units</span></p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-4xl font-black text-slate-800">MYR {totalVal.toLocaleString()}.00</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Min Level</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Folder</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</th>
              <th className="px-8 py-5 text-right">
                <button 
                  onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                  className="flex items-center gap-2 text-slate-600 font-bold text-sm ml-auto bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200"
                >
                  <i className="fa-solid fa-list-check"></i> Edit
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ITEMS.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 relative">
                      <img src={item.imageUrl} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black px-1 rounded">NEW</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1 text-[10px] font-black rounded-lg ${item.quantity <= item.minQuantity ? 'bg-rose-100 text-[#de4a4a]' : 'bg-slate-100 text-slate-600'}`}>
                    {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                  </span>
                </td>
                <td className="px-8 py-6 text-center text-sm font-medium text-slate-500">
                  {item.minQuantity ? `${item.minQuantity} units` : '—'}
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">
                  {item.price ? `MYR ${item.price.toFixed(2)}` : '—'}
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">
                   {item.price ? `MYR ${(item.price * item.quantity).toFixed(2)}` : '—'}
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">
                   {MOCK_FOLDERS.find(f => f.id === item.folderId)?.name || 'Main Location'}
                </td>
                <td className="px-8 py-6 text-slate-300">
                   {item.tags.length > 0 ? (
                     <div className="flex gap-1">
                        {item.tags.slice(0, 1).map(t => <span key={t} className="text-xs text-slate-500">#{t}</span>)}
                        {item.tags.length > 1 && <span className="text-xs text-slate-400">+{item.tags.length-1}</span>}
                     </div>
                   ) : '—'}
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column Customizer Dropdown */}
        {showColumnCustomizer && (
          <div className="absolute right-8 top-20 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 z-20 animate-in slide-in-from-top-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Customize Columns</h4>
            <div className="space-y-3 mb-6">
              <p className="text-[10px] text-slate-400 font-bold mb-2">Drag to reorder <i className="fa-solid fa-circle-question"></i></p>
              {columns.map(col => (
                <div key={col.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${col.checked ? 'bg-[#de4a4a] border-[#de4a4a]' : 'border-slate-200'}`}>
                       <i className="fa-solid fa-check text-white text-[8px]"></i>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{col.label}</span>
                  </div>
                  <i className="fa-solid fa-grip-vertical text-slate-200 group-hover:text-slate-400 cursor-grab"></i>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowColumnCustomizer(false)}
                className="flex-1 bg-rose-200 text-rose-500 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-300"
              >
                Apply
              </button>
              <button onClick={() => setShowColumnCustomizer(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">Cancel</button>
            </div>
          </div>
        )}

        <div className="p-6 bg-slate-50/50 flex items-center gap-4 border-t border-slate-100">
           <span className="text-sm font-medium text-slate-400">Show:</span>
           <select className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none">
             <option>20</option>
             <option>50</option>
           </select>
           <span className="text-sm font-medium text-slate-400">per page</span>
        </div>
      </div>
    </div>
  );
};

export default InventorySummaryReport;
