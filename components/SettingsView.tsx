import React, { useState } from 'react';

interface SettingsViewProps {
  subView: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ subView }) => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [fieldStep, setFieldStep] = useState(1);
  const [selectedFieldTemplate, setSelectedFieldTemplate] = useState<string | null>(null);
  
  // Preferences State
  const [setTimeAutomatically, setSetTimeAutomatically] = useState(true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Feature Controls State
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);

  // Import State
  const [importStep, setImportStep] = useState(1);
  const [importMethod, setImportMethod] = useState<'quick' | 'advanced' | null>(null);

  // Addresses State
  const [addressDefault, setAddressDefault] = useState('Primary');

  // Teams State
  const [teamsNotifications, setTeamsNotifications] = useState({
    created: false,
    edited: false,
    moved: false,
    deleted: false
  });

  const renderPreferences = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Preferences</h1>
      
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-12">
        <section className="space-y-10">
          <h3 className="text-xl font-bold text-slate-700 opacity-80">General Preferences</h3>
          <div className="space-y-10">
            <div className="flex items-center gap-12">
              <div className="flex-1 relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-300 outline-none appearance-none pr-10 shadow-sm cursor-not-allowed" disabled>
                  <option>EST (UTC -05:00) EST</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-200"></i>
              </div>
              <div className="flex items-center gap-4 min-w-[160px]">
                <div 
                  onClick={() => setSetTimeAutomatically(!setTimeAutomatically)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${setTimeAutomatically ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${setTimeAutomatically ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
                <span className="text-xs font-medium text-slate-600">Set automatically</span>
              </div>
            </div>
            <div className="flex items-start gap-12">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Sort by</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>Updated at</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-4 pt-4 min-w-[160px]">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSortDirection('asc')}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${sortDirection === 'asc' ? 'border-[#de4a4a]' : 'border-slate-200'}`}>
                    {sortDirection === 'asc' && <div className="w-2 h-2 bg-[#de4a4a] rounded-full"></div>}
                  </div>
                  <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800">Ascending</span>
                </div>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSortDirection('desc')}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${sortDirection === 'desc' ? 'border-[#de4a4a]' : 'border-slate-200'}`}>
                    {sortDirection === 'desc' && <div className="w-2 h-2 bg-[#de4a4a] rounded-full"></div>}
                  </div>
                  <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800">Descending</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="h-px bg-slate-50 w-full"></div>
        <section className="space-y-8">
          <h3 className="text-xl font-bold text-slate-700 opacity-80">Email Preferences</h3>
          <div className="flex items-center justify-between group">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-700">Alerts</h4>
              <p className="text-xs font-medium text-slate-400">Email alerts will be sent to the email address associated with your account</p>
            </div>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${emailAlerts ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${emailAlerts ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
              <span className="text-xs font-medium text-slate-600">On</span>
            </div>
          </div>
        </section>
        <div className="h-px bg-slate-50 w-full"></div>
        <div className="pt-4">
          <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-lg font-black text-slate-400 text-[10px] uppercase tracking-widest hover:border-slate-400 hover:text-slate-600 transition-all active:scale-95 shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderManageAlerts = () => (
    <div className="max-w-7xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Manage Alerts</h1>
        <p className="text-sm text-slate-400 font-medium">These alerts serve as proactive measures to ensure efficient asset and consumption tracking.</p>
      </div>
      <div className="h-[1px] bg-slate-100 w-full"></div>
      <div className="flex flex-col items-center justify-center py-48 text-center space-y-6">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
          <i className="fa-regular fa-bell text-5xl opacity-40"></i>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-800">No active alerts</h3>
          <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
            You can set an alert from the item's edit mode or at the folder level.<br/>
            <span className="text-[#de4a4a] font-bold cursor-pointer hover:underline">Check out our help article</span> to learn more about alerts.
          </p>
        </div>
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderCompanyDetails = () => (
    <div className="max-w-7xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Company Details</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Company Info */}
          <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-10">
            <h3 className="text-xl font-bold text-slate-700 opacity-80">Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Enter Company Name*" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none focus:border-rose-300 transition-colors shadow-sm"
                />
              </div>
              <div className="space-y-2 relative">
                <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-medium text-slate-300 outline-none appearance-none pr-10 shadow-sm">
                  <option>Enter Industry</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Company Color</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#de4a4a] rounded shadow-sm"></div>
                  <select className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-10 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none shadow-sm">
                    <option>#DD2A3B</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Initials</label>
                <input 
                  type="text" 
                  defaultValue="S" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none shadow-sm"
                />
              </div>
            </div>
            <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all shadow-sm">
              SAVE CHANGES
            </button>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-10">
            <h3 className="text-xl font-bold text-slate-700 opacity-80">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Country</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>Malaysia</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Time zone</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>EST (UTC -05:00) EST</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Date Format</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>European (12/10/2025)</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Time Format</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>12-hour</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Currency</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>Malaysian Ringgit - MYR - RM</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Keep item with 0 quantity when moving</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>Always ask</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-1 ml-4 mb-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Decimals in Price</label>
                  <i className="fa-solid fa-circle-question text-[10px] text-slate-200"></i>
                </div>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-600 outline-none appearance-none pr-10 shadow-sm">
                    <option>0.01 (Default)</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400"></i>
                </div>
              </div>
            </div>
            <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all shadow-sm">
              SAVE CHANGES
            </button>
          </div>

          {/* Manage Account */}
          <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-10">
            <h3 className="text-xl font-bold text-slate-700 opacity-80">Manage Account</h3>
            <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-lg">
              Temporarily cancel your subscription. Once you cancel your subscription, you'll have the option to permanently delete your data afterward.
            </p>
            <div className="flex justify-end">
              <button className="px-10 py-3.5 bg-[#de4a4a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#c33b3b] shadow-xl shadow-rose-100 transition-all">
                CANCEL SUBSCRIPTION
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Logo */}
        <div className="space-y-8">
          <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center space-y-10">
            <h3 className="text-sm font-bold text-slate-700 opacity-80 w-full text-left">Company Logo</h3>
            <div className="relative group cursor-pointer">
              <span className="text-[60px] font-black text-[#de4a4a] italic tracking-tighter">Pickle</span>
              <div className="absolute -top-1 -right-4 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#de4a4a] transition-colors">
                <i className="fa-solid fa-pen text-[10px]"></i>
              </div>
            </div>
            <button className="w-full py-4 bg-white border border-slate-100 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all shadow-sm">
              UPDATE LOGO
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderAddresses = () => (
    <div className="max-w-7xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Addresses</h1>
        <button 
          onClick={() => setShowModal('new-address')}
          className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
        >
          NEW ADDRESS
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-48 text-center space-y-8">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <i className="fa-solid fa-location-dot text-4xl opacity-40"></i>
        </div>
        <div className="space-y-4 max-w-lg">
          <h3 className="text-3xl font-black text-slate-800">You don't have any addresses</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Enter addresses that relate to your business like <span className="font-bold text-slate-600">your warehouse's address</span> and <span className="font-bold text-slate-600">your preferred shipping and billing addresses</span>. Saved addresses can be quickly inserted in <span className="text-[#de4a4a] font-bold cursor-pointer hover:underline">purchase orders</span> and other features to save you time.
          </p>
        </div>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderBilling = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Plan & Billing</h1>
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-8">
        <div className="flex items-center justify-between pb-8 border-b border-slate-50">
           <div>
             <p className="text-lg font-black text-slate-800">Current Plan: <span className="text-[#de4a4a]">Ultra</span></p>
             <p className="text-xs text-slate-400 font-medium">Next renewal on Oct 26, 2025</p>
           </div>
           <button className="bg-slate-800 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">Manage Plan</button>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</h4>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <i className="fa-brands fa-cc-visa text-2xl text-slate-400"></i>
            <span className="text-sm font-bold text-slate-600">Visa ending in 4242</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[32px] font-black text-[#333c4d] tracking-tight">Manage Team</h1>
          <p className="text-sm font-medium text-slate-400">You've filled 1 of your 5 seats.</p>
        </div>
        <button className="bg-[#de4a4a] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all flex items-center gap-2">
          <i className="fa-solid fa-user-plus text-sm"></i>
          ADD SEATS
        </button>
      </div>

      {/* Help Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-6 shadow-sm max-w-lg">
        <div className="w-24 h-14 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
          <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-play text-[#de4a4a] text-sm"></i>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-600">Learn how to invite and manage access for your team</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#de4a4a] text-[10px] font-black underline uppercase">Watch Video Tutorial</a>
            <a href="#" className="text-[#de4a4a] text-[10px] font-black underline uppercase">View Help Article</a>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-10 py-6 w-[35%]">
                <div className="flex items-center gap-2">
                  USER <i className="fa-solid fa-arrow-down text-[8px]"></i>
                </div>
              </th>
              <th className="px-8 py-6">ROLE</th>
              <th className="px-8 py-6">STATUS</th>
              <th className="px-8 py-6">SEAT</th>
              <th className="px-8 py-6">LAST ACTIVE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Active User */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-10 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-sm">E</div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Edmund</p>
                    <p className="text-xs font-medium text-slate-400">kktong83@gmail.com</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">Owner</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">Accepted</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">Included</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">8:04 AM</td>
            </tr>
            {/* Empty Seats */}
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-slate-100 border-dashed rounded-full flex items-center justify-center text-slate-300 group-hover:border-[#de4a4a] group-hover:text-[#de4a4a] transition-all">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-slate-600 transition-colors">Invite User</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-300">—</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-300">—</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-300">Included</td>
                <td className="px-8 py-6 text-sm font-medium text-slate-300">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderCustomFields = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Custom Fields</h1>
        <button 
          onClick={() => setShowModal('custom-field')}
          className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
        >
          ADD CUSTOM FIELD
        </button>
      </div>
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-6">
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Custom fields allow you to track unique information that doesn't fit into default fields.
        </p>
        <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl opacity-40">
           <i className="fa-solid fa-list-check text-4xl mb-3 text-slate-200"></i>
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">No custom fields defined</p>
        </div>
      </div>
    </div>
  );

  const renderVendors = () => (
    <div className="max-w-7xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Vendors</h1>
        <button 
          onClick={() => setShowModal('new-vendor')}
          className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all"
        >
          NEW VENDOR
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-48 text-center space-y-8">
        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 shadow-inner">
          <i className="fa-solid fa-truck-field text-4xl opacity-40"></i>
        </div>
        <div className="space-y-4 max-w-lg">
          <h3 className="text-3xl font-black text-slate-800">You don't have any Vendors</h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Enter vendors that relate to your business like <span className="font-bold text-slate-600">manufacturers</span> or <span className="font-bold text-slate-600">suppliers</span>. Saved vendors can be quickly inserted in <span className="text-[#de4a4a] font-bold cursor-pointer hover:underline">purchase orders</span> and other features to save you time.
          </p>
        </div>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderFeatureControls = () => (
    <div className="max-w-7xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Feature Controls</h1>
        <p className="text-sm text-slate-400 font-medium">Customize and enhance your Pickle experience by toggling on advanced tools and features tailored to streamline your operations.</p>
      </div>
      <div className="h-[1px] bg-slate-100 w-full"></div>
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 min-h-[500px]">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AVAILABLE FEATURES</h3>
           <button onClick={() => setShowModal('enterprise-upsell')} className="px-6 py-2.5 bg-slate-50 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest">SAVE CHANGES</button>
        </div>
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
           <div className="p-6 flex items-center justify-between group">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3">
                    <i className="fa-solid fa-rotate-left text-slate-400 text-lg"></i>
                    <span className="text-sm font-black text-slate-800">Return to Origin</span>
                    <span className="bg-[#de4a4a] text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">NEW</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium ml-8">Assign specific folders to items to serve as their original location for faster move actions</p>
                 <button onClick={() => setShowFeatureDetails(!showFeatureDetails)} className="text-[#de4a4a] text-[10px] font-black uppercase tracking-widest ml-8 mt-2 flex items-center gap-2 hover:underline">
                   <i className={`fa-solid fa-chevron-${showFeatureDetails ? 'up' : 'down'}`}></i>
                   {showFeatureDetails ? 'Hide Details' : 'Show Details'}
                 </button>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disabled</span>
              </div>
           </div>
           {showFeatureDetails && (
             <div className="p-10 bg-slate-50/30 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col lg:flex-row gap-12">
                   <div className="flex-1 space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INFORMATION</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Return to Origin allows you to return items back to their designated “home” folder with a single click.</p>
                      <button className="text-[#de4a4a] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">Learn more <i className="fa-solid fa-arrow-up-right-from-square"></i></button>
                   </div>
                   <div className="lg:w-[350px] aspect-video bg-[#de4a4a] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer shadow-xl shadow-rose-100">
                      <div className="relative z-10 flex flex-col gap-2">
                        <span className="bg-white/20 text-white text-[8px] font-black px-2 py-0.5 rounded backdrop-blur-md uppercase self-start">JUST LAUNCHED 🚀</span>
                        <h4 className="text-white text-2xl font-black italic tracking-tighter leading-tight">Return to<br/>Origin</h4>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderBulkImport = () => (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-in fade-in duration-500">
       <div className="px-10 py-5 flex items-center justify-between border-b border-slate-100 h-20">
          <div className="flex items-center gap-3">
             <span className="text-[#de4a4a] text-3xl font-black italic tracking-tighter">Pickle</span>
          </div>
          
          <div className="flex-1 max-w-4xl px-20">
             <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between relative">
                   <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 -translate-y-1/2 z-0">
                     <div 
                       className="h-full bg-[#1e88e5] transition-all duration-500" 
                       style={{ width: `${(importStep - 1) * 25}%` }}
                     ></div>
                   </div>
                   {[1, 2, 3, 4, 5].map((s) => (
                     <div key={s} className="relative z-10 flex flex-col items-center">
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                         importStep === s ? 'bg-white border-[#1e88e5]' : importStep > s ? 'bg-[#1e88e5] border-[#1e88e5]' : 'bg-white border-slate-200'
                       }`}>
                         {importStep > s ? (
                           <i className="fa-solid fa-check text-white text-[8px]"></i>
                         ) : (
                           <div className={`w-1.5 h-1.5 rounded-full ${importStep === s ? 'bg-[#1e88e5]' : ''}`}></div>
                         )}
                       </div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                   <span className={importStep === 1 ? 'text-[#1e88e5]' : ''}>Import method</span>
                   <span className={importStep === 2 ? 'text-[#1e88e5]' : ''}>Upload file</span>
                   <span className={importStep === 3 ? 'text-[#1e88e5]' : ''}>Map fields</span>
                   <span className={importStep === 4 ? 'text-[#1e88e5]' : ''}>Review</span>
                   <span className={importStep === 5 ? 'text-[#1e88e5]' : ''}>Import</span>
                </div>
             </div>
          </div>
          
          <button 
            onClick={() => setImportStep(1)} 
            className="text-slate-400 hover:text-slate-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto">
          {importStep === 1 && (
            <div className="max-w-5xl w-full text-center space-y-20 animate-in fade-in zoom-in-95 duration-500">
              <h2 className="text-[2rem] font-black text-[#333c4d] tracking-tight">Choose the import method to upload<br/>items from your file</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
                 {/* Quick Import Card */}
                 <div className="relative group">
                    <p className="absolute -top-6 left-0 right-0 text-center text-[11px] font-black text-[#1e88e5] uppercase tracking-widest animate-pulse">Recommended for new users</p>
                    <button 
                      onClick={() => setImportStep(2)}
                      className="w-full bg-white border-2 border-slate-100 rounded-[2rem] p-16 text-left hover:border-[#1e88e5] transition-all hover:shadow-2xl hover:shadow-sky-50 flex flex-col gap-10 h-full"
                    >
                       <div className="flex flex-col gap-6">
                          <i className="fa-solid fa-file-invoice text-5xl text-slate-300 group-hover:text-[#1e88e5] transition-colors"></i>
                          <h3 className="text-2xl font-black text-[#333c4d]">Quick Import</h3>
                       </div>
                       
                       <div className="space-y-6">
                          <p className="text-sm font-medium text-slate-500 leading-relaxed">
                             Import your inventory from a .csv or .xlsx file in a snap and start managing your items in 1 minute
                          </p>
                          
                          <div className="space-y-2">
                             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Use to:</p>
                             <ul className="space-y-2 text-xs font-bold text-slate-600">
                                <li className="flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                   Quickly add items to a single folder
                                </li>
                                <li className="flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                   Use an existing .csv or .xlsx file
                                </li>
                             </ul>
                          </div>
                       </div>
                    </button>
                 </div>

                 {/* Advanced Import Card */}
                 <button 
                   onClick={() => setImportStep(2)}
                   className="w-full bg-white border-2 border-slate-100 rounded-[2rem] p-16 text-left hover:border-slate-400 transition-all hover:shadow-2xl hover:shadow-slate-50 flex flex-col gap-10 h-full group"
                 >
                    <div className="flex flex-col gap-6">
                       <i className="fa-solid fa-file-circle-check text-5xl text-slate-300 group-hover:text-slate-600 transition-colors"></i>
                       <h3 className="text-2xl font-black text-[#333c4d]">Advanced Import</h3>
                    </div>
                    
                    <div className="space-y-6">
                       <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          Use Pickle's import template to add all items types across multiple folders
                       </p>
                       
                       <div className="space-y-2">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Use to:</p>
                          <ul className="space-y-2 text-xs font-bold text-slate-600">
                             <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                Import items with multiple variants <i className="fa-solid fa-circle-question text-[10px] text-slate-200"></i>
                             </li>
                             <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                Import items into multiple folders
                             </li>
                             <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                Import folders
                             </li>
                          </ul>
                       </div>
                    </div>
                 </button>
              </div>
            </div>
          )}
          
          {importStep === 2 && (
            <div className="max-w-4xl w-full text-center space-y-12 animate-in slide-in-from-right-4 duration-500">
               <h2 className="text-3xl font-black text-[#333c4d]">Upload your file</h2>
               <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-24 bg-slate-50/30 flex flex-col items-center gap-8 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl text-sky-500">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-700">Drag & Drop your file here</p>
                    <p className="text-sm font-medium text-slate-400 italic">or click to browse from computer</p>
                  </div>
               </div>
               <button onClick={() => setImportStep(1)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">Change import method</button>
            </div>
          )}
       </div>
    </div>
  );

  const renderCreateLabels = () => (
    <div className="flex flex-col items-center justify-center py-48 opacity-30 text-center animate-in fade-in duration-500">
      <i className="fa-solid fa-barcode text-6xl text-slate-200 mb-6"></i>
      <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Label Printing</h3>
      <p className="text-sm font-bold text-slate-300 mt-2">Click below to open the label creation wizard</p>
      <button 
        onClick={() => setShowModal('create-label')}
        className="mt-8 bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all opacity-100"
      >
        CREATE LABELS
      </button>
    </div>
  );

  const renderSlack = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Integrate With Slack</h1>
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-8 max-w-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Integrate With Slack</h3>
          <p className="text-sm font-medium text-slate-400">Receive notifications and use Pickle right from Slack.</p>
        </div>
        <button className="bg-[#de4a4a] text-white px-10 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#c33b3b] transition-all">
          CONNECT
        </button>
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderTeams = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-[40px] font-black text-[#333c4d] tracking-tight">Microsoft Teams Integration</h1>
      <div className="bg-white rounded-[1rem] border border-slate-100 shadow-sm p-12 space-y-12">
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Step 1: Add URL <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
          </h3>
          <input 
            type="text" 
            placeholder="Add Target URL" 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-600 outline-none focus:ring-2 ring-rose-100 transition-all"
          />
        </section>

        <section className="space-y-8">
          <h3 className="text-lg font-bold text-slate-800">Step 2: Select notifications</h3>
          <div className="h-px bg-slate-100 w-full"></div>
          
          <div className="space-y-6">
            {Object.keys(teamsNotifications).map((key) => (
              <div key={key} className="flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-600 capitalize">{key}</span>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => setTeamsNotifications(prev => ({...prev, [key]: !prev[key as keyof typeof teamsNotifications]}))}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${teamsNotifications[key as keyof typeof teamsNotifications] ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${teamsNotifications[key as keyof typeof teamsNotifications] ? 'right-1' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-8">{teamsNotifications[key as keyof typeof teamsNotifications] ? 'On' : 'Off'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8">
          <button className="px-10 py-3.5 bg-white border border-slate-200 rounded-lg font-black text-slate-400 text-[10px] uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all">
            SAVE CHANGES
          </button>
        </div>
      </div>
      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderQuickBooks = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
      <h1 className="text-[32px] font-black text-[#333c4d] tracking-tight">QuickBooks Online</h1>
      <div className="h-[1px] bg-slate-100 w-full mt-4"></div>
      
      <div className="flex flex-col items-center py-20 opacity-30 text-center animate-in fade-in duration-500">
        <i className="fa-solid fa-leaf text-6xl text-slate-200 mb-6"></i>
        <h3 className="text-[2.5rem] font-black text-[#333c4d] tracking-tight">QuickBooks Online</h3>
        <button 
          onClick={() => setShowModal('quickbooks-modal')}
          className="mt-8 bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-[#c33b3b] transition-all opacity-100"
        >
          CONNECT TO QUICKBOOKS
        </button>
      </div>

      <div className="text-[11px] font-bold text-slate-300 mt-12 pl-4">Version: v10.84.0-R193.0.0</div>
    </div>
  );

  const renderViewContent = () => {
    switch(subView) {
      case 'preferences': return renderPreferences();
      case 'create-labels': return renderCreateLabels();
      case 'slack': return renderSlack();
      case 'teams': return renderTeams();
      case 'quickbooks': return renderQuickBooks();
      case 'company': return renderCompanyDetails();
      case 'addresses': return renderAddresses();
      case 'billing': return renderBilling();
      case 'team': return renderTeam();
      case 'custom-fields': return renderCustomFields();
      case 'vendors': return renderVendors();
      case 'alerts': return renderManageAlerts();
      case 'feature-controls': return renderFeatureControls();
      case 'bulk-import': return renderBulkImport();
      default: return renderPreferences();
    }
  };

  const suggestedFields = [
    { icon: 'fa-t', label: 'Serial Number' },
    { icon: 'fa-t', label: 'Model/Part Number' },
    { icon: 'fa-calendar-days', label: 'Purchase Date' },
    { icon: 'fa-calendar-days', label: 'Expiry Date' },
    { icon: 'fa-link', label: 'Product Link' },
    { icon: 'fa-t', label: 'Size' },
  ];

  return (
    <>
      {renderViewContent()}
      
      {/* Modals */}
      {showModal === 'custom-field' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[1.5rem] shadow-2xl flex flex-col h-[75vh] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Create Custom Field</h2>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-[45%] p-10 space-y-8 overflow-y-auto border-r border-slate-50">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUGGESTED FIELDS</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {suggestedFields.map(f => (
                      <button key={f.label} onClick={() => setSelectedFieldTemplate(f.label)} className={`p-4 border border-slate-100 rounded-lg flex items-center gap-3 text-left transition-all hover:border-[#de4a4a] group ${selectedFieldTemplate === f.label ? 'border-[#de4a4a] bg-rose-50/30' : 'bg-white'}`}>
                        <i className={`fa-solid ${f.icon} text-slate-300 group-hover:text-[#de4a4a]`}></i>
                        <span className="text-[11px] font-bold text-slate-600 truncate">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-slate-50/50 p-12 flex items-center justify-center">
                <div className="w-full h-full bg-[#f8fafc]/50 border border-slate-100 rounded-3xl"></div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {fieldStep} of 2</span>
              <button disabled className="px-10 py-3 bg-[#de4a4a]/40 text-white rounded-lg font-black text-[10px] uppercase tracking-widest cursor-not-allowed">NEXT</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Label Modal */}
      {showModal === 'create-label' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[1.5rem] shadow-2xl flex flex-col h-[75vh] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-700">Create Label</h2>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-[50%] p-10 space-y-10 overflow-y-auto border-r border-slate-50 bg-white">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UNLINKED LABELS</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    Create beautiful QR labels which can be linked to your items using Pickle's mobile app
                  </p>
                  <button className="flex items-center gap-3 text-[#de4a4a] text-[10px] font-bold uppercase tracking-widest hover:underline">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    Need to generate auto-linked QR and Barcode labels?
                  </button>
                </div>

                <div className="space-y-6 pt-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LABEL OPTIONS</h4>
                  <div className="space-y-4">
                    <input type="text" placeholder="Label name" className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-medium outline-none shadow-sm focus:ring-1 ring-[#de4a4a]/20" />
                    
                    <div className="relative">
                      <select className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-400 appearance-none shadow-sm focus:ring-1 ring-[#de4a4a]/20">
                        <option>Label type</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    </div>

                    <div className="relative">
                      <select className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-400 appearance-none shadow-sm focus:ring-1 ring-[#de4a4a]/20">
                        <option>Paper size</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    </div>

                    <div className="relative">
                      <select className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-400 appearance-none shadow-sm focus:ring-1 ring-[#de4a4a]/20">
                        <option>Label size</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-slate-50/30 p-12 flex flex-col items-center justify-center space-y-6">
                <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-white/50">
                  <span className="text-xs font-medium text-slate-400">Choose label type to see preview</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-center bg-white relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">Step 1 of 2</span>
              <button disabled className="ml-auto px-12 py-3 bg-[#de4a4a]/30 text-white rounded-lg font-black text-[10px] uppercase tracking-widest cursor-not-allowed">NEXT</button>
            </div>
          </div>
        </div>
      )}

      {/* New Address Modal */}
      {showModal === 'new-address' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[1.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Address</h2>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-slate-500">Set Default:</span>
                <div className="flex gap-2">
                  {['Primary', 'Shipping', 'Billing'].map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setAddressDefault(tag)}
                      className={`px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
                        addressDefault === tag 
                          ? 'bg-rose-50 border-[#de4a4a] text-[#de4a4a]' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Name*" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Address 1*" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Address 2" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                <input 
                  type="text" 
                  placeholder="City*" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                <input 
                  type="text" 
                  placeholder="State / Province / Region*" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                <input 
                  type="text" 
                  placeholder="Zip / Postal Code*" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
                />
                
                <div className="relative">
                  <select className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none pr-20 shadow-sm">
                    <option>Malaysia</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-300 pointer-events-none">
                    <i className="fa-solid fa-circle-xmark text-xs opacity-40"></i>
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-10 bg-white">
              <button 
                onClick={() => setShowModal(null)} 
                className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors"
              >
                CANCEL
              </button>
              <button 
                disabled 
                className="px-10 py-3.5 bg-rose-200 text-white rounded-xl font-black text-[11px] uppercase tracking-widest cursor-not-allowed shadow-sm"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Vendor Modal */}
      {showModal === 'new-vendor' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[1.5rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">New Vendor</h2>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-10 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <input 
                type="text" 
                placeholder="Name*" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              <input 
                type="text" 
                placeholder="Address 1*" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              <input 
                type="text" 
                placeholder="Address 2" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              <input 
                type="text" 
                placeholder="City*" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              <input 
                type="text" 
                placeholder="State / Province / Region*" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              <input 
                type="text" 
                placeholder="Zip / Postal Code*" 
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm" 
              />
              
              <div className="relative">
                <select className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none pr-20 shadow-sm">
                  <option>Malaysia</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-300 pointer-events-none">
                  <i className="fa-solid fa-circle-xmark text-xs opacity-40"></i>
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm pr-12" 
                />
                <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              </div>

              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-200 transition-colors shadow-sm pr-12" 
                />
                <i className="fa-solid fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-10 bg-white">
              <button 
                onClick={() => setShowModal(null)} 
                className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors"
              >
                CANCEL
              </button>
              <button 
                disabled 
                className="px-10 py-3.5 bg-rose-200 text-white rounded-xl font-black text-[11px] uppercase tracking-widest cursor-not-allowed shadow-sm"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Upsell Modal */}
      {showModal === 'enterprise-upsell' && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 z-10">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="flex-1 bg-slate-50/50 p-12 flex items-center justify-center">
               <div className="relative">
                  <img src="https://img.icons8.com/bubbles/400/open-box.png" alt="enterprise" className="w-72 h-72 opacity-80" />
               </div>
            </div>
            <div className="flex-1 p-16 space-y-10 flex flex-col justify-center">
               <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-800">Do even more with our <br/> <span className="text-[#de4a4a]">Enterprise</span> Plan:</h2>
                  <div className="space-y-4 pt-6">
                    {[
                      'Save time and improve accuracy by using the Pickle API.',
                      'Improve efficiencies by leveraging both saved reports and custom reports.',
                      'Get help when you need it through priority email support.'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                         <i className="fa-solid fa-check text-rose-400 mt-1"></i>
                         <p className="text-xs font-medium text-slate-500 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
               </div>
               <button className="w-full py-4 bg-[#de4a4a] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b] transition-all">
                 TALK TO US!
               </button>
            </div>
          </div>
        </div>
      )}

      {/* QuickBooks Modal - Overhauled to match screenshot exactly */}
      {showModal === 'quickbooks-modal' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 z-[110]">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            
            <div className="flex flex-col md:flex-row w-full h-[65vh]">
               {/* Left Column: Illustration */}
               <div className="flex-1 bg-white p-12 flex flex-col items-center justify-center text-center space-y-10 border-r border-slate-50">
                  <div className="w-full aspect-[4/3] bg-[#f1fcf1]/40 rounded-2xl flex items-center justify-center relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                     <img 
                        src="https://quickbooks.intuit.com/oidam/intuit/sbseg/en_us/QuickBooks/DotCom/Shared/In-Product/QuickBooks-Setup-Illustration.png" 
                        className="w-[85%] h-[85%] object-contain relative z-10" 
                        alt="QuickBooks Integration Illustration" 
                     />
                  </div>
                  <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest border-b-2 border-[#de4a4a] pb-1 hover:text-[#c33b3b] hover:border-[#c33b3b] transition-all">
                    Learn more about our integration with QuickBooks Online
                  </button>
               </div>

               {/* Right Column: Features & CTA */}
               <div className="flex-1 p-16 flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                     <h2 className="text-[1.75rem] font-black text-[#333c4d] leading-tight">
                        Optimize your workflow with <br/>
                        <span className="text-[#de4a4a]">QuickBooks Online</span>.
                     </h2>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed pt-2">
                        Connect to QuickBooks Online, making it fast and easy to send invoices from Pickle to existing QuickBooks Online accounts.
                     </p>
                  </div>

                  <ul className="space-y-4 pt-2">
                    {[
                      'Sync your QBO account',
                      'Send Purchase Orders to QBO',
                      'Send Invoices to QBO'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 group">
                        <i className="fa-solid fa-check text-[#de4a4a] text-xs"></i>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest self-start hover:underline">
                    All Premium Plan Features
                  </button>

                  <div className="pt-6">
                    <button className="w-full py-4 bg-[#de4a4a] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-rose-100 hover:bg-[#c33b3b] hover:-translate-y-0.5 active:scale-95 transition-all">
                      CONNECT WITH QUICKBOOKS
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsView;