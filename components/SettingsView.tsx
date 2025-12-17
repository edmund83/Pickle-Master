import React, { useState } from 'react';

interface SettingsViewProps {
  subView: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ subView }) => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [fieldStep, setFieldStep] = useState(1);
  const [selectedFieldTemplate, setSelectedFieldTemplate] = useState<string | null>(null);
  const [importStep, setImportStep] = useState(1);
  const [showFeatureDetails, setShowFeatureDetails] = useState(false);

  // --- Sub-View Renderers ---

  const renderPreferences = () => (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-slate-800 tracking-tight">Preferences</h1>
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-12 space-y-12">
        <section className="space-y-8">
          <h3 className="text-xl font-bold text-slate-700">General Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Time Zone</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">Set automatically</span>
                </div>
              </div>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none text-slate-800 font-medium">
                <option>EST (UTC -05:00) EST</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">Sort by</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none text-slate-800 font-medium mb-4">
                <option>Updated at</option>
              </select>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center"></div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800">Ascending</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border-[6px] border-[#de4a4a] flex items-center justify-center"></div>
                  <span className="text-sm font-bold text-slate-800">Descending</span>
                </label>
              </div>
            </div>
          </div>
        </section>
        <hr className="border-slate-100" />
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-700">Email Preferences</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Alerts</p>
              <p className="text-sm text-slate-400">Email alerts will be sent to the email address associated with your account</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xs font-bold text-slate-600">On</span>
            </div>
          </div>
        </section>
        <div className="pt-8">
          <button className="px-8 py-3 bg-white border border-slate-300 rounded-xl font-black text-slate-400 text-sm uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompanyDetails = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-slate-800 tracking-tight">Company Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 space-y-8">
            <h3 className="text-xl font-bold text-slate-700">Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Enter Company Name*" className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm" />
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm">
                <option>Enter Industry</option>
              </select>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Color</label>
                <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm w-full">
                  <option>#DD2A3B</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initials</label>
                <input type="text" placeholder="S" className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm w-full" />
              </div>
            </div>
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-400 text-sm uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all">Save Changes</button>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 space-y-8">
            <h3 className="text-xl font-bold text-slate-700">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>Malaysia</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>EST (UTC -05:00) EST</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>European (12/10/2025)</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>12-hour</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>Malaysian Ringgit - MYR - RM</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>Always ask</option></select>
              <select className="bg-slate-50 p-4 rounded-xl border-none outline-none font-medium text-sm"><option>0.01 (Default)</option></select>
            </div>
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-slate-400 text-sm uppercase tracking-widest hover:border-slate-800 hover:text-slate-800 transition-all">Save Changes</button>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 space-y-8">
            <h3 className="text-xl font-bold text-slate-700">Manage Account</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Temporarily cancel your subscription. Once you cancel your subscription, you'll have the option to permanently delete your data afterward.</p>
            <button className="bg-rose-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700">Cancel Subscription</button>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 space-y-8 h-fit sticky top-8 text-center">
          <h3 className="text-xl font-bold text-slate-700">Company Logo</h3>
          <div className="w-32 h-32 mx-auto flex items-center justify-center relative group">
             <div className="text-[#de4a4a] text-6xl font-black italic tracking-tighter">Sortly</div>
             <button className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-pen text-xs"></i></button>
          </div>
          <button className="w-full py-3 bg-white border border-slate-100 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:text-slate-800 hover:border-slate-800 transition-all">Update Logo</button>
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Addresses</h1>
        <button onClick={() => setShowModal('address')} className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100">New Address</button>
      </div>
      <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center bg-white rounded-[3rem] border border-slate-100">
        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center text-4xl shadow-inner"><i className="fa-solid fa-location-dot"></i></div>
        <div className="space-y-4 max-w-sm">
          <h3 className="text-2xl font-black text-slate-800">You don't have any addresses</h3>
          <p className="text-sm text-slate-400 font-medium">Enter addresses that relate to your business like <span className="font-bold text-slate-600">your warehouse's address</span> and <span className="font-bold text-slate-600">your preferred shipping and billing addresses</span>.</p>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-slate-800 tracking-tight">Plan & Billing</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Current Plan</h3>
            <div>
              <p className="text-xl font-black text-slate-800">Ultra <span className="text-slate-400 font-medium text-sm">(Monthly)</span></p>
              <p className="text-4xl font-black text-slate-800 mt-2">$149.00 <i className="fa-solid fa-circle-info text-xs text-slate-300"></i></p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">per month</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Your free trial ends on <span className="font-black text-slate-700">Oct 26, 2025</span>. You will be charged for $149.00 on trial end.</p>
            <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:text-slate-800">Switch to Yearly</button>
          </div>
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-cart-flatbed text-4xl text-slate-200"></i>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Usage</h3>
           <div className="space-y-6">
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-500">Items</span>
                 <span className="text-slate-800">3 / 2000</span>
               </div>
               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-300 w-[1%]"></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-500">Custom Fields</span>
                 <span className="text-slate-800">0 / 10</span>
               </div>
               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-300 w-0"></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-500">User Licenses</span>
                 <span className="text-slate-800">1 / 5</span>
               </div>
               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-300 w-[20%]"></div>
               </div>
             </div>
           </div>
           <div className="flex gap-4 pt-2">
             <button className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Manage Plan</button>
             <button className="bg-white border border-slate-100 text-slate-400 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Add Seats</button>
           </div>
        </div>
      </div>
    </div>
  );

  // Fix: Added missing renderTeam function
  const renderTeam = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Team Access Control</h1>
        <button className="bg-rose-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 opacity-50 cursor-not-allowed">Add User</button>
      </div>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">
        Manage your team's access levels and permissions. <span className="text-rose-500 font-black cursor-pointer hover:underline">Upgrade to Premium</span> to unlock advanced role-based access control.
      </p>
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Access</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-100 text-[#de4a4a] rounded-full flex items-center justify-center font-bold text-xs uppercase">EC</div>
                  <div>
                    <p className="font-bold text-slate-800">Edmund Carter</p>
                    <p className="text-[10px] text-slate-400">edmund@example.com</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-sm font-bold text-slate-600">Owner</td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500 text-center">Full Access</td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase">Active</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomFields = () => (
    <div className="max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Custom Fields</h1>
        <button onClick={() => { setShowModal('custom-field'); setFieldStep(1); }} className="bg-rose-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100">Add Custom Field</button>
      </div>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">You can add 10 custom fields on the ultra plan. <span className="font-bold text-slate-800">0 of 10 custom fields added</span>. <span className="text-rose-500 font-black cursor-pointer hover:underline">upgrade</span> to get more custom fields</p>
      <div className="flex flex-col items-center justify-center py-48 opacity-30">
        <i className="fa-solid fa-list-check text-6xl text-slate-200"></i>
        <h3 className="text-2xl font-black text-slate-400 mt-6">No Custom Fields</h3>
      </div>
    </div>
  );

  const renderBulkImport = () => (
    <div className="max-w-6xl mx-auto py-12 space-y-16 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-12 relative">
         <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
         {[
           { step: 1, label: 'Import method' },
           { step: 2, label: 'Upload file' },
           { step: 3, label: 'Map fields' },
           { step: 4, label: 'Review' },
           { step: 5, label: 'Import' },
         ].map(s => (
           <div key={s.step} className="flex flex-col items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${s.step <= importStep ? 'bg-[#de4a4a] text-white shadow-lg shadow-rose-100' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                {s.step < importStep ? <i className="fa-solid fa-check"></i> : s.step}
             </div>
             <span className={`text-[9px] font-black uppercase tracking-widest ${s.step === importStep ? 'text-[#de4a4a]' : 'text-slate-300'}`}>{s.label}</span>
           </div>
         ))}
      </div>

      {importStep === 1 && (
        <div className="text-center space-y-16">
          <h2 className="text-3xl font-black text-slate-800">Choose the import method to upload items from your file</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div onClick={() => setImportStep(2)} className="bg-white p-12 rounded-[2rem] border-2 border-slate-50 hover:border-[#de4a4a] transition-all group cursor-pointer shadow-sm text-left relative overflow-hidden">
               <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-sky-500 uppercase tracking-widest">Recommended for new users</span>
               <div className="flex items-start gap-6 mt-6">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl text-slate-300 group-hover:text-[#de4a4a] transition-all"><i className="fa-solid fa-file-invoice"></i></div>
                 <div className="space-y-4">
                   <h4 className="text-xl font-black text-slate-800">Quick Import</h4>
                   <p className="text-sm text-slate-400 font-medium leading-relaxed">Import your inventory from a .csv or .xlsx file in a snap and start managing your items in 1 minute</p>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-300 uppercase">Use to:</p>
                     <ul className="text-xs font-bold text-slate-500 space-y-2">
                       <li>• Quickly add items to a single folder</li>
                       <li>• Use an existing .csv or .xlsx file</li>
                     </ul>
                   </div>
                 </div>
               </div>
            </div>
            <div className="bg-white p-12 rounded-[2rem] border-2 border-slate-50 hover:border-[#de4a4a] transition-all group cursor-pointer shadow-sm text-left">
               <div className="flex items-start gap-6">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl text-slate-300 group-hover:text-[#de4a4a] transition-all"><i className="fa-solid fa-file-zipper"></i></div>
                 <div className="space-y-4">
                   <h4 className="text-xl font-black text-slate-800">Advanced Import</h4>
                   <p className="text-sm text-slate-400 font-medium leading-relaxed">Use Sortly's import template to add all items types across multiple folders</p>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-300 uppercase">Use to:</p>
                     <ul className="text-xs font-bold text-slate-500 space-y-2">
                       <li>• Import items with multiple variants <i className="fa-solid fa-circle-question text-[10px]"></i></li>
                       <li>• Import items into multiple folders</li>
                       <li>• Import folders</li>
                     </ul>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderViewContent = () => {
    switch(subView) {
      case 'preferences': return renderPreferences();
      case 'company': return renderCompanyDetails();
      case 'addresses': return renderAddresses();
      case 'billing': return renderBilling();
      case 'team': return renderTeam();
      case 'custom-fields': return renderCustomFields();
      case 'bulk-import': return renderBulkImport();
      default: return renderPreferences();
    }
  };

  return (
    <>
      {renderViewContent()}
      
      {/* Custom Field Modal */}
      {showModal === 'custom-field' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(null)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex h-[80vh] animate-in zoom-in-95 duration-300 overflow-hidden">
             <div className="w-[45%] border-r border-slate-100 p-12 space-y-10 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-2xl font-black text-slate-800">Create Custom Field</h2>
                   <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-800 transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
                </div>

                {fieldStep === 1 ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Fields</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { icon: 'fa-i-cursor', label: 'Serial Number' },
                            { icon: 'fa-i-cursor', label: 'Model/Part Number' },
                            { icon: 'fa-calendar-days', label: 'Purchase Date' },
                            { icon: 'fa-calendar-days', label: 'Expiry Date' },
                            { icon: 'fa-link', label: 'Product Link' },
                            { icon: 'fa-i-cursor', label: 'Size' },
                          ].map(f => (
                            <div 
                              key={f.label} 
                              onClick={() => { setSelectedFieldTemplate(f.label); setFieldStep(2); }}
                              className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-xl hover:ring-2 ring-rose-50 transition-all group"
                            >
                               <i className={`fa-solid ${f.icon} text-slate-300 group-hover:text-[#de4a4a] text-lg transition-colors`}></i>
                               <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{f.label}</span>
                            </div>
                          ))}
                       </div>
                       <div className="flex items-center gap-4 py-6">
                          <div className="flex-1 h-px bg-slate-100"></div>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
                          <div className="flex-1 h-px bg-slate-100"></div>
                       </div>
                       <button onClick={() => { setSelectedFieldTemplate('Custom'); setFieldStep(2); }} className="text-[#de4a4a] font-black text-sm uppercase tracking-widest hover:underline text-left">Create your own field</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Options</h4>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Field Name* <i className="fa-solid fa-circle-question text-slate-200"></i></label>
                           <input type="text" defaultValue={selectedFieldTemplate || ''} className="w-full bg-slate-50 p-4 rounded-xl border-none outline-none font-bold text-slate-800 focus:ring-2 ring-rose-100" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Default Value</label>
                           <div className="relative">
                              <input type="text" className="w-full bg-slate-50 p-4 pr-12 rounded-xl border-none outline-none font-bold text-slate-800" />
                              <i className="fa-solid fa-calendar-days absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                           <div className="w-10 h-5 bg-slate-100 rounded-full relative cursor-not-allowed opacity-50"><div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                           <span className="text-xs font-bold text-slate-300">Apply default value to all existing items</span>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Enter Placeholder Text <i className="fa-solid fa-circle-question text-slate-200"></i></label>
                           <input type="text" placeholder="e.g. Expiry Date" className="w-full bg-slate-50 p-4 rounded-xl border-none outline-none font-bold text-slate-800" />
                        </div>
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Applicable To:</label>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-sm font-bold text-slate-700">Items</span>
                                 <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm font-bold text-slate-700">Folders</span>
                                 <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer"><div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                <div className="mt-auto pt-10 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {fieldStep} of 2</span>
                   <div className="flex gap-4">
                     {fieldStep === 1 ? (
                        <button disabled className="bg-rose-100 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed">NEXT</button>
                     ) : (
                        <>
                           <button onClick={() => setFieldStep(1)} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">BACK</button>
                           <button onClick={() => setShowModal(null)} className="bg-[#de4a4a] text-white px-12 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-[#c33b3b]">SAVE</button>
                        </>
                     )}
                   </div>
                </div>
             </div>

             <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-20 relative">
                <div className="absolute top-12 left-12 w-32 h-32 bg-[#de4a4a]/5 rounded-full blur-3xl"></div>
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sample Value:</span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <i className="fa-solid fa-circle-xmark text-xs cursor-pointer hover:text-rose-500"></i>
                        <i className="fa-solid fa-calendar-days text-xs"></i>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase">{selectedFieldTemplate || 'Field Name'}</p>
                      <p className="text-xl font-black text-slate-800">14/03/2023</p>
                   </div>
                   <div className="pt-6 border-t border-slate-50 space-y-4">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Field Type: <span className="text-slate-900 ml-1">Date</span></p>
                      <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-300 italic">{selectedFieldTemplate || 'Placeholder...'}</span>
                         <i className="fa-solid fa-calendar-days text-xs text-slate-200"></i>
                      </div>
                   </div>
                </div>
                <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Live Preview</p>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsView;