
import React from 'react';

interface ReportsHubProps {
  onSelectReport: (reportId: string) => void;
}

const ReportsHub: React.FC<ReportsHubProps> = ({ onSelectReport }) => {
  const reportCards = [
    { id: 'history', icon: 'fa-clock-rotate-left', title: 'Activity History', desc: "Keep tabs on all users' changes to items, folders, tags, & more." },
    { id: 'inventory-summary', icon: 'fa-layer-group', title: 'Inventory Summary', desc: "Review your inventory's quantity, value, & location at a glance." },
    { id: 'transactions', icon: 'fa-repeat', title: 'Transactions', desc: "Monitor all inventory movements, updates, and deletions for efficient team oversight." },
    { id: 'item-flow', icon: 'fa-chart-line', title: 'Item Flow', desc: "Track quantity fluctuations for your inventory using flexible filtering options." },
    { id: 'move-summary', icon: 'fa-right-from-bracket', title: 'Move Summary', desc: "Monitor all inventory folder changes that occur within a specified time frame." },
    { id: 'user-activity', icon: 'fa-users', title: 'User Activity Summary', desc: "Track how team members interact with your inventory & filter for actions that matter most to you." },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black text-slate-800 tracking-tight">Reports</h1>

      {/* Tutorial Banner */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center gap-6 shadow-sm">
        <div className="w-40 h-24 bg-[#de4a4a] rounded-xl flex items-center justify-center text-white relative group cursor-pointer overflow-hidden">
           <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform" />
           <div className="absolute inset-0 flex items-center justify-center">
             <i className="fa-solid fa-play text-2xl"></i>
           </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700">Learn about reports, saved reports, and report subscriptions</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#de4a4a] text-xs font-black underline hover:text-[#c33b3b]">Watch Video Tutorial</a>
            <a href="#" className="text-[#de4a4a] text-xs font-black underline hover:text-[#c33b3b]">Read Help Article</a>
          </div>
        </div>
      </div>

      {/* Saved Reports Section */}
      <div className="bg-[#de4a4a] rounded-[2rem] p-8 relative overflow-hidden">
        <div className="flex items-start gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
              <i className="fa-solid fa-bookmark"></i>
              <span>Saved Reports (1)</span>
            </div>
            <div 
              onClick={() => onSelectReport('low-stock')}
              className="bg-white/20 hover:bg-white/30 transition-all backdrop-blur-md p-6 rounded-2xl border border-white/20 w-48 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <i className="fa-solid fa-layer-group text-white text-xl"></i>
                <i className="fa-solid fa-ellipsis-vertical text-white/60"></i>
              </div>
              <p className="text-white font-black text-sm">Low Stock</p>
              <p className="text-white/60 text-[10px] font-bold mt-1">12/10/2025</p>
              <div className="mt-4 bg-white text-[#de4a4a] text-[8px] font-black py-1 px-3 rounded-full inline-block uppercase">Inventory Summary</div>
            </div>
          </div>

          <div className="flex-1 pt-4 text-white space-y-4">
            <h3 className="text-2xl font-black flex items-center gap-4">
              <i className="fa-solid fa-plus text-lg"></i>
              <span>Saving reports saves time!</span>
            </h3>
            <ol className="text-sm font-bold text-white/80 space-y-2">
              <li>1. Click on a report type below.</li>
              <li>2. Apply helpful filters to that report.</li>
              <li>3. Click save near the top right.</li>
            </ol>
          </div>
        </div>
        {/* Abstract shapes for background aesthetic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportCards.map((card) => (
          <div 
            key={card.id}
            onClick={() => onSelectReport(card.id)}
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col items-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 text-2xl group-hover:text-[#de4a4a] group-hover:bg-rose-50 transition-all">
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800">{card.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsHub;
