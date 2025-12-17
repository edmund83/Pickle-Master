import React from 'react';

const HelpView: React.FC = () => {
  const mainCategories = [
    {
      title: 'Getting Started',
      icon: 'fa-rocket',
      desc: 'Get the basics on Pickle best practices, adding and updating items, setting up inventory, and more.',
      color: 'text-rose-500'
    },
    {
      title: 'Billing & Account',
      icon: 'fa-window-maximize',
      desc: 'How to make subscription changes and manage and update your account settings.',
      color: 'text-orange-500'
    },
    {
      title: 'Barcodes & Labels',
      icon: 'fa-qrcode',
      desc: 'Pickle inventory software comes with built-in barcode and QR code capabilities, making it easy to scan, track, and manage your inventory.',
      color: 'text-rose-600'
    },
    {
      title: 'FAQ',
      icon: 'fa-lightbulb',
      desc: 'Commonly asked questions including plan information, accessing Pickle, and upcoming features.',
      color: 'text-amber-400'
    }
  ];

  const sections = [
    'Getting Started', 'Training Resources', 'Customizing Account', 'QR Labels & Barcodes',
    'Reporting', 'Workflows', 'Billing & Account', "FAQ's"
  ];

  return (
    <div className="flex flex-col h-full -m-10 bg-white overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      {/* Red Header Section */}
      <section className="bg-[#de4a4a] py-24 px-10 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Looking for answers? Start here.</h1>
          <div className="flex items-center max-w-2xl mx-auto bg-white rounded-full p-2 shadow-2xl">
            <div className="flex-1 flex items-center px-6 gap-3">
              <i className="fa-solid fa-magnifying-glass text-slate-300"></i>
              <input 
                type="text" 
                placeholder="Search for articles..." 
                className="w-full py-3 outline-none text-slate-800 font-medium placeholder:text-slate-300"
              />
            </div>
            <button className="bg-[#1e293b] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">
              Search
            </button>
          </div>
        </div>
        
        {/* Wave Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white opacity-20" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)' }}></div>
      </section>

      {/* Main Categories Grid */}
      <section className="px-10 py-20 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainCategories.map((cat, idx) => (
            <div 
              key={idx} 
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col items-center text-center space-y-6 hover:-translate-y-2 transition-all cursor-pointer group"
            >
              <div className={`w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-4xl ${cat.color} group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${cat.icon}`}></i>
              </div>
              <h3 className="text-xl font-black text-slate-800">{cat.title}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Sections Grid */}
      <section className="px-10 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, idx) => (
            <button 
              key={idx} 
              className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-center font-black text-slate-700 hover:text-[#de4a4a] text-sm"
            >
              {section}
            </button>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-auto relative">
         <div className="h-32 bg-[#de4a4a]" style={{ clipPath: 'polygon(0 80%, 100% 0, 100% 100%, 0 100%)' }}></div>
         <div className="bg-[#de4a4a] pb-12 pt-4 px-10 text-center space-y-12">
            <button className="bg-[#1e293b] text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl">
              Submit a request
            </button>
            
            <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
               <p className="text-white/60 text-xs font-bold">© ZenInventory Help Center</p>
               <div className="flex items-center gap-6">
                 {['facebook', 'twitter', 'youtube', 'linkedin', 'instagram'].map(s => (
                   <a key={s} href="#" className="text-white/60 hover:text-white transition-colors text-lg">
                     <i className={`fa-brands fa-${s}`}></i>
                   </a>
                 ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default HelpView;