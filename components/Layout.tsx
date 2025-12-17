
import React, { useState } from 'react';
import { MOCK_TENANTS } from '../constants';
import ProductNewsPanel from './ProductNewsPanel';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  subView?: string;
  setSubView?: (view: string) => void;
  tags?: string[];
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, subView, setSubView, tags = [] }) => {
  const [selectedTenant] = useState(MOCK_TENANTS[0]);
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  const primaryNav = [
    { id: 'dashboard', icon: 'fa-table-cells-large', label: 'Dashboard' },
    { id: 'inventory', icon: 'fa-box-archive', label: 'Items' },
    { id: 'search', icon: 'fa-magnifying-glass', label: 'Search' },
    { id: 'tags', icon: 'fa-tag', label: 'Tags', badge: 'New' },
    { id: 'picking', icon: 'fa-shuffle', label: 'Workflows' },
    { id: 'reports', icon: 'fa-chart-simple', label: 'Reports' },
  ];

  const secondaryNavs: Record<string, any[]> = {
    reports: [
      { id: 'hub', icon: 'fa-house-signal', label: 'Reports Dashboard' },
      { id: 'history', icon: 'fa-clock-rotate-left', label: 'Activity History' },
      { id: 'summary', icon: 'fa-layer-group', label: 'Inventory Summary', children: [
        { id: 'inventory-summary', icon: 'fa-bookmark', label: 'Overview' },
        { id: 'low-stock', icon: 'fa-bookmark', label: 'Low Stock' },
        { id: 'transactions', icon: 'fa-repeat', label: 'Transactions' },
        { id: 'item-flow', icon: 'fa-chart-line', label: 'Item Flow' },
      ]},
      { id: 'move-summary', icon: 'fa-right-from-bracket', label: 'Move Summary' },
      { id: 'user-activity', icon: 'fa-users', label: 'User Activity Summary' },
    ],
    settings: [
      { id: 'profile', icon: 'fa-user', label: 'User Profile' },
      { id: 'preferences', icon: 'fa-gear', label: 'Preferences' },
      { id: 'company', icon: 'fa-building', label: 'Company Details' },
      { id: 'addresses', icon: 'fa-location-dot', label: 'Addresses' },
      { id: 'billing', icon: 'fa-credit-card', label: 'Plan & Billing' },
      { id: 'team', icon: 'fa-users-gear', label: 'User Access Control' },
      { id: 'custom-fields', icon: 'fa-list-check', label: 'Custom Fields' },
      { id: 'uom', icon: 'fa-ruler-combined', label: 'Units of Measure' },
      { id: 'vendors', icon: 'fa-truck-field', label: 'Vendors' },
      { id: 'alerts', icon: 'fa-bell', label: 'Manage Alerts' },
      { id: 'bulk-import', icon: 'fa-file-import', label: 'Bulk Import' },
      { id: 'feature-controls', icon: 'fa-bolt', label: 'Feature Controls' },
      { id: 'create-labels', icon: 'fa-barcode', label: 'Create Labels' },
      { id: 'public-api', icon: 'fa-code', label: 'Public API (beta)' },
      { id: 'slack', icon: 'fa-slack', label: 'Slack' },
      { id: 'teams', icon: 'fa-microsoft', label: 'Microsoft Teams' },
      { id: 'quickbooks', icon: 'fa-leaf', label: 'QuickBooks Online' },
    ],
    inventory: [
      { id: 'all', icon: 'fa-calendar-check', label: 'All Items', active: true },
      { id: 'main', icon: 'fa-folder', label: 'Main Location' },
      { id: 'storage', icon: 'fa-folder', label: 'Storage Area' },
      { id: 'truck', icon: 'fa-folder', label: 'Truck' },
    ],
    picking: [
      { id: 'pick-lists', icon: 'fa-list-check', label: 'Pick Lists' },
      { id: 'purchase-orders', icon: 'fa-cart-shopping', label: 'Purchase Orders' },
      { id: 'moves', icon: 'fa-right-from-bracket', label: 'Quick Moves' },
      { id: 'receives', icon: 'fa-truck-ramp-box', label: 'Quick Receive' },
    ],
    tags: tags.map(t => ({ id: t, icon: 'fa-tag', label: t }))
  };

  const currentSecondary = secondaryNavs[activeView];

  return (
    <div className="flex h-screen w-full overflow-hidden font-['Inter'] bg-[#f5f6f8]">
      {/* Primary Sidebar - Sortly Red */}
      <aside className="w-[85px] bg-[#de4a4a] flex flex-col items-center py-6 shrink-0 z-40 shadow-xl">
        <div className="mb-10">
          <span className="text-white text-3xl font-black italic tracking-tighter">S</span>
        </div>
        <nav className="flex-1 w-full space-y-2">
          {primaryNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1.5 w-full py-4 transition-all relative group ${
                activeView === item.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <i className={`fa-solid ${item.icon} text-xl text-white opacity-80 group-hover:opacity-100`}></i>
                {item.badge && (
                  <span className="absolute -top-2 -right-3 bg-white text-[#de4a4a] text-[7px] font-black px-1 rounded shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-white opacity-90 uppercase tracking-tight">{item.label}</span>
              {activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center w-full">
           <button 
            onClick={() => setIsNewsOpen(true)}
            className={`flex flex-col items-center gap-1.5 w-full py-4 hover:bg-white/5 transition-all text-white/70 hover:text-white ${isNewsOpen ? 'bg-white/10' : ''}`}
           >
             <i className="fa-solid fa-bullhorn text-lg"></i>
             <span className="text-[9px] font-bold uppercase tracking-tight">News</span>
           </button>
           <button 
            onClick={() => setActiveView('help')}
            className={`flex flex-col items-center gap-1.5 w-full py-4 hover:bg-white/5 transition-all relative ${
              activeView === 'help' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
            }`}
           >
             <i className="fa-solid fa-circle-question text-lg"></i>
             <span className="text-[9px] font-bold uppercase tracking-tight">Help</span>
             {activeView === 'help' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
           </button>
           <button 
            onClick={() => setActiveView('notifications')}
            className={`flex flex-col items-center gap-1.5 w-full py-4 transition-all relative ${
              activeView === 'notifications' ? 'bg-white/20' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
           >
             <i className="fa-solid fa-bell text-xl"></i>
             <span className="text-[9px] font-bold uppercase tracking-tight">Notifications</span>
             {activeView === 'notifications' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
           </button>
           <button 
            onClick={() => setActiveView('settings')}
            className={`flex flex-col items-center gap-1.5 w-full py-4 transition-all ${
              activeView === 'settings' ? 'bg-white/10' : 'hover:bg-white/5 text-white/70 hover:text-white'
            }`}
           >
             <i className="fa-solid fa-gear text-xl"></i>
             <span className="text-[9px] font-bold uppercase tracking-tight">Settings</span>
           </button>
        </div>
      </aside>

      {/* Secondary Sidebar - White Contextual */}
      {currentSecondary && activeView !== 'search' && activeView !== 'help' && (
        <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-300 relative">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
             <div className="relative flex-1">
               <i className="fa-solid fa-magnifying-glass absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
               <input type="text" placeholder={`Search ${activeView === 'tags' ? 'tags' : 'items'}`} className="w-full pl-6 pr-2 py-1 text-sm outline-none placeholder:text-slate-300 font-medium" />
             </div>
             {activeView !== 'tags' && activeView !== 'picking' && (
              <button className="text-slate-300 hover:text-slate-500"><i className="fa-solid fa-chevron-left text-xs"></i></button>
             )}
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            {currentSecondary.length === 0 && activeView === 'tags' && (
              <div className="p-4 text-center py-10 opacity-30">
                 <i className="fa-solid fa-tag text-3xl mb-4"></i>
                 <p className="text-[10px] font-black uppercase">No tags yet</p>
              </div>
            )}
            {currentSecondary.map((item) => (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => setSubView?.(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    (subView === item.id || item.active) ? 'bg-[#de4a4a]/5 text-[#de4a4a] border-l-4 border-[#de4a4a] rounded-l-none' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5 ${ (subView === item.id || item.active) ? 'text-[#de4a4a]' : 'text-slate-400'}`}></i>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                </button>
                {item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child: any) => (
                      <button
                        key={child.id}
                        onClick={() => setSubView?.(child.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          subView === child.id ? 'bg-[#de4a4a] text-white' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <i className={`fa-solid ${child.icon} text-[10px]`}></i>
                        <span className="truncate">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Links for Inventory View */}
          {activeView === 'inventory' && (
            <div className="p-4 border-t border-slate-100 space-y-1">
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                <i className="fa-solid fa-clock-rotate-left w-5 text-slate-400"></i>
                <span>History</span>
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                <i className="fa-solid fa-trash-can w-5 text-slate-400"></i>
                <span>Trash</span>
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <section className="flex-1 overflow-y-auto custom-scrollbar relative">
           {/* Global Alert Bar */}
           <div className="w-full bg-[#333c4d] text-white px-8 py-3 flex items-center justify-between text-xs font-medium sticky top-0 z-[50]">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-lock text-slate-400"></i>
                <span>Your email (kktong83@gmail.com) hasn't been confirmed. Please confirm it.</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white text-slate-800 px-3 py-1.5 rounded font-black uppercase text-[10px] hover:bg-slate-100">Resend Email</button>
                <button className="text-white/60 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              </div>
           </div>
          <div className="p-10 min-h-full bg-white">
            {children}
          </div>
          {/* Chat Bubble Float */}
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#de4a4a] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-50">
            <i className="fa-solid fa-comment"></i>
          </button>
        </section>
      </main>

      {/* Product News Side Panel */}
      <ProductNewsPanel isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
    </div>
  );
};

export default Layout;
