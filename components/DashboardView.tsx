
import React, { useState } from 'react';
import { MOCK_ITEMS, MOCK_FOLDERS, MOCK_HISTORY } from '../constants';
import { ItemStatus } from '../types';

interface DashboardViewProps {
  onSelectItem: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onSelectItem }) => {
  const [isFolderDrawerOpen, setIsFolderDrawerOpen] = useState(false);
  
  const totalQuantity = MOCK_ITEMS.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = MOCK_ITEMS.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const restockingItems = MOCK_ITEMS.filter(item => item.quantity <= item.minQuantity);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Banner */}
      <div className="fixed top-0 left-[100px] right-0 bg-slate-700 text-white px-8 py-3 z-[60] flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-lock text-slate-400"></i>
          <span>Your email (kktong83@gmail.com) hasn't been confirmed. Please confirm it.</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white text-slate-800 px-4 py-1.5 rounded-lg font-black text-xs uppercase hover:bg-slate-100">Resend Email</button>
          <button className="text-white opacity-60 hover:opacity-100"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
          <button 
            onClick={() => setIsFolderDrawerOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#de4a4a] text-white rounded-lg text-xs font-black uppercase shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
          >
            <i className="fa-solid fa-sliders"></i>
            <span>Set Folders</span>
          </button>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Folders:</p>
          <span className="px-4 py-1.5 bg-slate-600 text-white rounded-full text-xs font-bold">All Folders</span>
        </div>

        {/* Inventory Summary Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Inventory Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-4 text-xl relative">
                <i className="fa-solid fa-file-lines"></i>
                <div className="absolute -top-1 -right-1 text-slate-300 text-[10px]"><i className="fa-solid fa-circle-question"></i></div>
              </div>
              <p className="text-4xl font-black text-slate-800">{MOCK_ITEMS.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Items</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4 text-xl">
                <i className="fa-solid fa-folder"></i>
              </div>
              <p className="text-4xl font-black text-slate-800">{MOCK_FOLDERS.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Folders</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center mb-4 text-xl">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <p className="text-4xl font-black text-slate-800">{totalQuantity}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Quantity</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-50 text-[#de4a4a] rounded-xl flex items-center justify-center mb-4 text-xl">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <p className="text-4xl font-black text-slate-800">{totalValue.toLocaleString()}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Value</p>
            </div>
          </div>
        </section>

        {/* Restocking Alerts Section */}
        <section className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-wand-magic-sparkles text-emerald-500"></i>
              <h2 className="text-lg font-black text-slate-800">Items that need restocking</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>At or Below Min Level</span>
              <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <i className="fa-solid fa-sliders"></i>
              </button>
            </div>
          </div>
          
          {restockingItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-xl flex items-center justify-center text-4xl">
                <i className="fa-solid fa-file-lines"></i>
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-bold">No items found.</p>
                <p className="text-slate-400 text-sm">Try selecting a different filter.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restockingItems.map(item => (
                <div key={item.id} onClick={() => onSelectItem(item.id)} className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-100 shrink-0">
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-rose-500 uppercase">{item.quantity} {item.quantity === 1 ? 'unit' : 'units'} left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Items Section */}
        <section className="mt-12 space-y-6">
          <h2 className="text-lg font-black text-slate-800">Recent Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_ITEMS.slice(0, 4).map(item => (
              <div key={item.id} onClick={() => onSelectItem(item.id)} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img src={item.imageUrl} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                  <span className="absolute top-4 right-4 bg-slate-700/80 text-white text-[9px] font-black px-2 py-0.5 rounded backdrop-blur-sm uppercase">NEW</span>
                </div>
                <div className="p-5 space-y-4">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight truncate">{item.name}</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                      <p className="text-sm font-black text-slate-800">{item.quantity} unit</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</p>
                      <p className="text-sm font-black text-slate-800">MYR {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-800">Recent Activity</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">All Activity</span>
              <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <i className="fa-solid fa-sliders text-slate-500"></i>
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_HISTORY.slice(0, 5).map(log => (
              <div key={log.id} className="py-4 flex items-center justify-between group hover:bg-slate-50/50 -mx-4 px-4 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">{log.user}</span> 
                    {log.type === 'ADDED' ? ' created item ' : ' updated '} 
                    <span className="font-bold text-slate-800" onClick={() => onSelectItem(log.itemId)}>{log.itemName}</span> 
                    in <span className="font-bold text-slate-800">Main Location</span>
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <div className="py-6 text-center">
            <button className="text-[#de4a4a] text-sm font-bold hover:underline">View all activity</button>
          </div>
        </section>
      </div>

      {/* Folder Selection Drawer */}
      {isFolderDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFolderDrawerOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Folders</h2>
              <button onClick={() => setIsFolderDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" placeholder="Search folders" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-[#de4a4a]/20" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-calendar-check text-[#de4a4a] text-lg"></i>
                    <span className="font-bold text-slate-800">All Items</span>
                  </div>
                  <div className="w-5 h-5 bg-[#de4a4a] rounded flex items-center justify-center text-white text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>

                <div className="ml-6 space-y-4 border-l-2 border-slate-50 pl-4">
                  {MOCK_FOLDERS.filter(f => !f.parentId).map(folder => (
                    <div key={folder.id} className="space-y-3">
                      <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-folder text-slate-300"></i>
                          <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{folder.name}</span>
                        </div>
                        <div className="w-5 h-5 bg-[#de4a4a] rounded flex items-center justify-center text-white text-[10px]">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      </div>
                      {MOCK_FOLDERS.filter(sub => sub.parentId === folder.id).map(sub => (
                        <div key={sub.id} className="ml-6 flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-3">
                            <i className="fa-solid fa-folder text-slate-200"></i>
                            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900">{sub.name}</span>
                          </div>
                          <div className="w-5 h-5 bg-[#de4a4a] rounded flex items-center justify-center text-white text-[10px]">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50/50 flex gap-4">
              <button className="flex-1 bg-[#de4a4a] text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b]">Apply</button>
              <button onClick={() => setIsFolderDrawerOpen(false)} className="px-6 py-3 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-slate-800">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
