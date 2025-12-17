import React from 'react';

interface FeatureGatedViewProps {
  onClose: () => void;
}

const FeatureGatedView: React.FC<FeatureGatedViewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[70vh] animate-in zoom-in-95 duration-500">
        {/* Left Side Video/Visual */}
        <div className="flex-1 bg-slate-50 p-12 flex flex-col justify-center gap-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#de4a4a]/5 rounded-full blur-3xl"></div>
           <div className="relative aspect-video bg-white rounded-3xl shadow-xl overflow-hidden group cursor-pointer border-4 border-white">
              <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 bg-[#de4a4a] rounded-full flex items-center justify-center text-white text-3xl shadow-2xl group-hover:scale-110 transition-all">
                    <i className="fa-solid fa-play ml-1"></i>
                 </div>
              </div>
           </div>
           <div className="space-y-2 text-center">
             <h3 className="font-black text-slate-800">Introducing: Manage Permissions Page</h3>
             <a href="#" className="text-[#de4a4a] text-xs font-black uppercase tracking-widest underline">How it works?</a>
           </div>
        </div>

        {/* Right Side Sales Copy */}
        <div className="flex-1 p-16 flex flex-col justify-center space-y-10 relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Role Permissions are now available in Pickle</h2>
            <p className="text-2xl font-black text-[#de4a4a]">Premium Plan</p>
          </div>

          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Configure access to your inventory and enhance collaboration using customizable role permissions.
          </p>

          <ul className="space-y-4">
            {[
              'Customize role name',
              'Allow admins to manage users',
              'Prevent accidental deletes',
              'Regulate user access to edit items & folders',
              'Share view only link with customers, clients or vendors'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <i className="fa-solid fa-check text-rose-400 mt-1 text-xs"></i>
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-6">
            <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest hover:underline">All Premium Plan Features</button>
            <button className="w-full py-5 bg-[#de4a4a] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-[#c33b3b] hover:-translate-y-1 active:scale-95 transition-all">
              PURCHASE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGatedView;