import React, { useState } from 'react';

interface ProductNewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductNewsPanel: React.FC<ProductNewsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'updates' | 'roadmap'>('features');

  const featureRequests = [
    {
      votes: 23,
      title: 'Work Orders/Jobs in Pickle',
      description: 'Ability to create work orders or jobs in Pickle. Assign inventory to be consumed at a job. Once the job is...',
      author: 'Hassaan Shahid',
      tags: ['#New Feature 🆕'],
      comments: 2
    },
    {
      votes: 164,
      title: 'Fully Customizable Labels',
      description: 'Allow users to design labels by choosing what information to include or exclude, and adjust element...',
      author: 'Stephanie Platania',
      tags: ['#Improvement 👍'],
      comments: 8
    },
    {
      votes: 29,
      title: 'Auto-Generate Purchase Orders When Stock Falls Below Threshold',
      description: 'Send an automatic purchase order to a supplier/vendor when amount is low/below X number',
      author: 'Bas',
      tags: ['#Improvement 👍', '#Purchase Orders ⚠️'],
      comments: 0
    },
    {
      votes: 210,
      title: 'Multilinguality',
      description: 'Possibility, to translate Pickle App and Web app into multiple languages.',
      author: 'Andreas K',
      tags: ['#New Feature 🆕', '#Mobile 📱', '#Deal Breaker 💔'],
      comments: 32
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b flex flex-col gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#de4a4a] rounded flex items-center justify-center text-white font-black text-sm">P</div>
              <span className="font-black text-slate-800 text-lg">Pickle</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-800 transition-colors"><i className="fa-solid fa-magnifying-glass"></i></button>
              <button onClick={onClose} className="hover:text-slate-800 transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Suggest a feature, stay informed about our Roadmap, upvote your preferred features, and explore our most recent product releases.
          </p>

          {/* Tabs */}
          <div className="flex items-center border-b border-slate-100">
            {[
              { id: 'features', label: 'Feature Requests' },
              { id: 'updates', label: "What's New" },
              { id: 'roadmap', label: 'Roadmap' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 pb-3 text-[11px] font-black tracking-tight transition-all relative ${
                  activeTab === tab.id ? 'text-[#de4a4a]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#de4a4a]"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
          {activeTab === 'features' && (
            <>
              {/* Filter & Add */}
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all">
                  <i className="fa-solid fa-bars-staggered"></i>
                  <span>Trending</span>
                  <i className="fa-solid fa-chevron-down text-[8px] opacity-60"></i>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-800 hover:bg-slate-50 transition-all">
                  <i className="fa-solid fa-plus text-[#de4a4a]"></i>
                  <span>Add a Feature</span>
                </button>
              </div>

              {/* Request Cards */}
              <div className="space-y-4">
                {featureRequests.map((req, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 shrink-0 border border-slate-200 rounded-lg flex flex-col items-center justify-center bg-slate-50 group-hover:bg-[#de4a4a] group-hover:border-[#de4a4a] transition-all">
                        <i className="fa-solid fa-caret-up text-[10px] text-slate-400 group-hover:text-white"></i>
                        <span className="text-base font-black text-slate-800 group-hover:text-white leading-none mt-0.5">{req.votes}</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="font-black text-slate-800 text-sm leading-snug group-hover:text-[#de4a4a] transition-colors">{req.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{req.description}</p>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <i className="fa-solid fa-hand-pointer text-[#de4a4a] text-[10px] rotate-[270deg]"></i>
                          <span className="text-[10px] font-bold text-slate-400">{req.author}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-2">
                            {req.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                             <i className="fa-regular fa-comment text-xs"></i>
                             <span className="text-[10px] font-bold">{req.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'updates' && (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-4 opacity-50">
              <i className="fa-solid fa-newspaper text-4xl text-slate-200"></i>
              <p className="text-xs font-black text-slate-400 uppercase">No updates yet</p>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-4 opacity-50">
              <i className="fa-solid fa-map-location-dot text-4xl text-slate-200"></i>
              <p className="text-xs font-black text-slate-400 uppercase">Roadmap is being updated</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex items-center justify-center">
           <span className="text-[10px] font-bold text-slate-300">Powered by <span className="text-slate-400 hover:text-rose-400 cursor-pointer">frill.co</span></span>
        </div>
      </div>
    </div>
  );
};

export default ProductNewsPanel;