
import React from 'react';

const PlanManagementView: React.FC = () => {
  const plans = [
    { id: 'free', name: 'Free', price: '0.00', icon: 'fa-paper-plane', items: '100', users: '1', customFields: '1', current: false, color: 'text-slate-400' },
    { id: 'advanced', name: 'Advanced', price: '49.00', icon: 'fa-parachute-box', items: '500', users: '2', customFields: '5', current: false, color: 'text-sky-500' },
    { id: 'ultra', name: 'Ultra', price: '149.00', icon: 'fa-plane', items: '2,000', users: '5', customFields: '10', current: true, color: 'text-[#de4a4a]' },
    { id: 'premium', name: 'Premium', price: '299.00', icon: 'fa-rocket', items: '5,000', users: '8', customFields: '20', current: false, color: 'text-amber-500' },
    { id: 'enterprise', name: 'Enterprise Custom', price: 'Custom', icon: 'fa-user-astronaut', items: '10,000+', users: '12+', customFields: 'Unlimited', current: false, color: 'text-indigo-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-16 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
         <h1 className="text-4xl font-black text-slate-800 tracking-tight">Manage plan</h1>
         <button className="text-[#de4a4a] font-black text-sm hover:underline uppercase tracking-widest">Compare all features</button>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white border-2 rounded-[2.5rem] p-10 flex items-center gap-12 transition-all ${plan.current ? 'border-[#de4a4a] shadow-2xl shadow-rose-50' : 'border-slate-50 shadow-sm'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-slate-50 ${plan.color}`}>
              <i className={`fa-solid ${plan.icon}`}></i>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                <p className="text-xl font-black text-slate-800 mt-1">${plan.price} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/mo</span></p>
                <button className="mt-4 text-[#de4a4a] text-[10px] font-black uppercase underline">See all features</button>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-bold text-slate-600"><span className="text-slate-900">{plan.items}</span> Items</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-bold text-slate-600"><span className="text-slate-900">{plan.users}</span> User License</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-bold text-slate-600">All Sortly <span className="text-[#de4a4a]">{plan.name === 'Free' ? 'Free' : 'Ultra'}</span> features</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <span className="text-sm font-bold text-slate-600"><span className="text-slate-900">{plan.customFields}</span> Custom Field</span>
                 </div>
              </div>

              <div className="text-right">
                {plan.current ? (
                  <div className="space-y-3">
                    <button className="w-full py-4 bg-[#de4a4a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all">RESUBSCRIBE</button>
                    <p className="text-[9px] text-slate-400 font-bold leading-tight">Your account will change to Free Plan on <span className="text-slate-800">Oct 26, 2025</span></p>
                  </div>
                ) : (
                  <button className="w-full py-4 bg-white border border-slate-100 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all">
                    {plan.id === 'enterprise' ? 'TALK TO SALES' : 'UPGRADE'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-slate-50 rounded-[3rem] p-16 space-y-12">
        <h2 className="text-2xl font-black text-slate-800">Manage plan options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
             <h4 className="font-black text-slate-800">Upgrading</h4>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">You can upgrade your plan at anytime by clicking the "Purchase now" or "14-day free trial" buttons. If you are upgrading from the free plan, you will need a valid credit card to start the trial.</p>
          </div>
          <div className="space-y-4">
             <h4 className="font-black text-slate-800">Downgrading</h4>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">To downgrade your plan, you will need to meet the limits of the lower plan to which you wish to downgrade. A downgrade button will only be available to click on if you meet the plan limits for a lower tier.</p>
          </div>
          <div className="space-y-4">
             <h4 className="font-black text-slate-800">Cancelling your subscription</h4>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">If you no longer wish to utilize your Sortly subscription, you have the option to cancel your subscription. The cancellation will take effect at your next renewal date, and you will have access to your account and data until then.</p>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
           <h3 className="text-lg font-black text-slate-800">Account settings</h3>
           <button className="px-12 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#de4a4a] hover:border-[#de4a4a] transition-all">MANAGE ACCOUNT SETTINGS</button>
        </div>
      </section>
    </div>
  );
};

export default PlanManagementView;
