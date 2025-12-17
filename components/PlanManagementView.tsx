import React from 'react';

interface PlanManagementViewProps {
  onManagePlan: () => void;
}

const PlanManagementView: React.FC<PlanManagementViewProps> = ({ onManagePlan }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Plan & Billing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Plan Card */}
        <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-10 flex flex-col justify-between relative overflow-hidden h-[400px]">
          <div className="space-y-8 relative z-10">
            <h3 className="text-[1.1rem] font-bold text-slate-500 opacity-80">Current Plan</h3>
            <div className="space-y-1">
              <p className="text-xl font-black text-[#333c4d]">Ultra <span className="font-medium text-slate-400 text-lg">(Monthly)</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[2.5rem] font-black text-[#333c4d] leading-none">$149.00</span>
                <i className="fa-solid fa-circle-info text-slate-300 text-sm mt-2"></i>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">per month</p>
            </div>
            <div className="space-y-1 pt-4">
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Your free trial ends on <span className="font-bold text-[#333c4d]">Oct 26, 2025</span>
              </p>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                You will be charged for $149.00 on trial end
              </p>
            </div>
          </div>

          <div className="pt-8">
            <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-[#333c4d] text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all shadow-sm">
              SWITCH TO YEARLY
            </button>
          </div>

          {/* Illustration Overlay */}
          <div className="absolute top-20 right-10 w-40 opacity-90 pointer-events-none">
             <div className="relative">
                <img src="https://img.icons8.com/bubbles/400/box.png" className="w-full" alt="illustration" />
                <div className="absolute -top-4 -right-2 transform rotate-12">
                   <img src="https://img.icons8.com/bubbles/200/box.png" className="w-16 h-16" alt="box" />
                </div>
             </div>
          </div>
        </div>

        {/* Usage Card */}
        <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-10 flex flex-col justify-between h-[400px]">
          <div className="space-y-8">
            <h3 className="text-[1.1rem] font-bold text-slate-500 opacity-80">Usage</h3>
            
            <div className="space-y-10">
              {/* Items Usage */}
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Items</span>
                  <span className="text-[#333c4d]">3 / 2000</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 w-[1%]" style={{ width: '0.15%' }}></div>
                </div>
              </div>

              {/* Custom Fields Usage */}
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Custom Fields</span>
                  <span className="text-[#333c4d]">0 / 10</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 w-0"></div>
                </div>
              </div>

              {/* User Licenses Usage */}
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>User Licenses</span>
                  <span className="text-[#333c4d]">1 / 5</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 w-[20%]"></div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
               <i className="fa-regular fa-comment-dots text-slate-300 mt-0.5 text-lg"></i>
               <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                 Your business is growing - please take advantage of the plan upgrade.
               </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              onClick={onManagePlan}
              className="flex-1 py-3.5 bg-[#de4a4a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b] transition-all"
            >
              MANAGE PLAN
            </button>
            <button className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all shadow-sm">
              ADD SEATS
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div className="space-y-8 flex-1">
            <h3 className="text-[1.1rem] font-bold text-slate-500 opacity-80">Payment Method</h3>
            <div className="space-y-2">
               <p className="text-xl font-black text-[#333c4d]">Mastercard ending 2075</p>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Expiration: <span className="text-slate-600 font-bold">05 / 2029</span></p>
            </div>
            <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-[#333c4d] text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all shadow-sm">
              UPDATE BILLING DETAILS
            </button>
          </div>

          {/* Credit Card Visual */}
          <div className="relative w-full max-w-[380px] aspect-[1.58/1] bg-[#333c4d] rounded-2xl p-8 shadow-2xl overflow-hidden group">
             {/* Card texture/abstract circle */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
             
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">mastercard</span>
                   <span className="text-xs font-black text-white tracking-widest opacity-80">05 / 2029</span>
                </div>

                <div className="space-y-1">
                   <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-1.5 mr-2">
                           {[1, 2, 3, 4].map(j => <div key={j} className="w-1 h-1 bg-white rounded-full opacity-60"></div>)}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex items-end justify-end">
                   <span className="text-xl font-black text-white/90 tracking-widest">2075</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12">
        <h3 className="text-[1.1rem] font-bold text-slate-500 opacity-80 mb-10">Payment History</h3>
        
        <div className="space-y-4">
           <div className="grid grid-cols-4 gap-8 py-6 border-b border-slate-50 group hover:bg-slate-50/50 -mx-6 px-6 rounded-xl transition-all">
              <div className="text-sm font-bold text-[#333c4d]">
                 Oct 26, 2025 <span className="ml-3 font-medium text-slate-400 uppercase text-[10px]">Scheduled</span>
              </div>
              <div className="col-span-2 text-sm font-medium text-slate-500">
                 Ultra Plan (Monthly)
              </div>
              <div className="text-right text-sm font-black text-[#333c4d]">
                 $149.00
              </div>
           </div>
        </div>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );
};

export default PlanManagementView;