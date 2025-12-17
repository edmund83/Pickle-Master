import React from 'react';

interface ManagePlanViewProps {
  onBack: () => void;
}

const ManagePlanView: React.FC<ManagePlanViewProps> = ({ onBack }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0.00',
      icon: 'fa-paper-plane',
      features: [
        { label: '100 Items', icon: 'fa-circle' },
        { label: 'All Pickle Free features', icon: 'fa-circle' },
        { label: '1 User License', icon: 'fa-circle' },
        { label: '1 Custom Field', icon: 'fa-circle' },
      ],
      buttonText: 'DOWNGRADE SCHEDULED',
      buttonVariant: 'secondary',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: '$49.00',
      icon: 'fa-parachute-box',
      features: [
        { label: '500 Items', icon: 'fa-circle' },
        { label: 'All Pickle Free features', icon: 'fa-circle' },
        { label: '2 User Licenses', icon: 'fa-circle' },
        { label: '5 Custom Fields', icon: 'fa-circle' },
      ],
      buttonText: 'DOWNGRADE',
      buttonVariant: 'secondary',
    },
    {
      id: 'ultra',
      name: 'Ultra',
      price: '$149.00',
      icon: 'fa-plane',
      features: [
        { label: '2,000 Items', icon: 'fa-circle' },
        { label: 'All Pickle Advanced features', icon: 'fa-circle' },
        { label: '5 User Licenses', icon: 'fa-circle' },
        { label: '10 Custom Fields', icon: 'fa-circle' },
      ],
      buttonText: 'RESUBSCRIBE',
      buttonVariant: 'primary',
      subText: 'Your account will change to Free Plan on Oct 26, 2025',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$299.00',
      icon: 'fa-rocket',
      features: [
        { label: '5,000 Items', icon: 'fa-circle' },
        { label: 'All Pickle Ultra features', icon: 'fa-circle' },
        { label: '8 User Licenses', icon: 'fa-circle' },
        { label: '20 Custom Fields', icon: 'fa-circle' },
      ],
      buttonText: 'UPGRADE',
      buttonVariant: 'secondary',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      price: 'Custom',
      icon: 'fa-user-astronaut',
      desc: 'For organizations that need additional security, control, and support',
      features: [
        { label: '10000+ Items', icon: 'fa-circle' },
        { label: 'All Pickle Premium features', icon: 'fa-circle' },
        { label: '12+ User Licenses', icon: 'fa-circle' },
        { label: 'Unlimited Custom Fields', icon: 'fa-circle' },
      ],
      buttonText: 'TALK TO SALES',
      buttonVariant: 'secondary',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 px-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Back Button and Title */}
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-[#de4a4a] text-[10px] font-black uppercase tracking-widest hover:underline">
          <i className="fa-solid fa-chevron-left text-[8px]"></i> Back
        </button>
        <h1 className="text-2xl font-black text-[#333c4d] tracking-tight">Manage plan</h1>
      </div>

      {/* Change Plan Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-sm font-black text-[#333c4d] uppercase tracking-widest">Change plan</h2>
          <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest hover:underline">Compare all features</button>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center gap-10 hover:shadow-md transition-all group">
              <div className="flex items-center gap-6 w-[20%]">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-[#de4a4a] text-2xl group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${plan.icon}`}></i>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#333c4d]">{plan.name}</h3>
                  <p className="text-base font-black text-[#333c4d]">
                    {plan.price === 'Custom' ? 'Custom' : `${plan.price}/mo`}
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-2">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                    <span className="text-[11px] font-bold text-slate-700">{feat.label}</span>
                  </div>
                ))}
                {plan.desc && (
                  <p className="col-span-2 text-[10px] font-medium text-slate-400 mt-2">{plan.desc}</p>
                )}
                <button className="col-span-2 text-[#de4a4a] text-[10px] font-black uppercase tracking-widest hover:underline text-left mt-2 self-start">See all features</button>
              </div>

              <div className="w-[200px] flex flex-col items-center gap-3">
                <button className={`w-full py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                  plan.buttonVariant === 'primary' 
                    ? 'bg-[#de4a4a] text-white shadow-lg shadow-rose-100 hover:bg-[#c33b3b]' 
                    : 'bg-white border border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-600'
                }`}>
                  {plan.buttonText}
                </button>
                {plan.subText && (
                  <p className="text-[9px] font-bold text-slate-500 text-center leading-tight">
                    {plan.subText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manage Plan Options Text Section */}
      <section className="space-y-8 pt-8">
        <h2 className="text-sm font-black text-[#333c4d] uppercase tracking-widest border-b border-slate-100 pb-4">Manage plan options</h2>
        
        <div className="space-y-10">
          <div className="space-y-3">
            <h3 className="text-base font-black text-[#333c4d]">Upgrading</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
              You can upgrade your plan at anytime by clicking the "Purchase now" or "14-day free trial" buttons. If you are upgrading from the free plan, you will need a valid credit card to start the trial. Your credit card will be charged after the trial period ends. You may notice a temporary pre-authorization of $0.50 to verify your card. This hold will automatically disappear, and the amount will be returned to you within a week.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-black text-[#333c4d]">Downgrading</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
              To downgrade your plan, you will need to meet the limits of the lower plan to which you wish to downgrade. A downgrade button will only be available to click on if you meet the plan limits for a lower tier. You can find a list of limits for all plans available <span className="text-[#de4a4a] cursor-pointer hover:underline">here</span>.
            </p>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
              When downgrading to the Pickle Free plan, you'll have access to your current plan until the next billing cycle. At the end of the billing cycle, your account will be downgraded, and your credit card will no longer be charged.
            </p>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
              When downgrading from a paid plan to a lower-tiered paid plan, your plan will be downgraded immediately and you'll get credit which will be applied to future payments.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-black text-[#333c4d]">Cancelling your subscription</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
              If you no longer wish to utilize your Pickle subscription, you have the option to cancel your subscription. The cancellation will take effect at your next renewal date, and you will have access to your account and data until then. Once your subscription is cancelled and your renewal date has passed, you will no longer have access to your account. Should you wish to reactivate your subscription and its associated account data, your data will be stored within Pickle for two years. If you wish to permanently delete your data, you will have the option to do so during the subscription cancellation process.
            </p>
          </div>
        </div>
      </section>

      {/* Account Settings Section */}
      <section className="space-y-6 pt-12 border-t border-slate-100">
        <h2 className="text-sm font-black text-[#333c4d] uppercase tracking-widest">Account settings</h2>
        <button className="px-8 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-[#333c4d] text-[11px] uppercase tracking-widest hover:border-slate-800 transition-all shadow-sm">
          MANAGE ACCOUNT SETTINGS
        </button>
      </section>
    </div>
  );
};

export default ManagePlanView;