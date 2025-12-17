
import React, { useState } from 'react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1); // subStep 1: choice, subStep 2: refine
  const [choice, setChoice] = useState<string | null>(null);
  const [folders, setFolders] = useState(['Main Location', 'Storage Area', 'Truck']);
  const [items, setItems] = useState([{ name: 'A', qty: 1, folder: 'Main Location' }, { name: 'B', qty: 1, folder: 'Storage Area' }, { name: 'C', qty: 1, folder: 'Main Location' }]);

  const choices = [
    { id: 'location', title: 'By Location', desc: 'Where is it?', icon: 'fa-location-dot' },
    { id: 'person', title: 'By Person', desc: 'Who has it?', icon: 'fa-user' },
    { id: 'category', title: 'By Item Category', desc: 'What type is it?', icon: 'fa-box' },
    { id: 'unsure', title: "I'm not sure", desc: 'Help me decide.', icon: 'fa-pen-to-square' },
  ];

  const handleNext = () => {
    if (step === 1 && subStep === 1) setSubStep(2);
    else if (step === 1 && subStep === 2) setStep(2);
    else if (step === 2) setStep(3);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-3xl"></div>
      
      <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-500">
        <button onClick={onComplete} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800 transition-colors">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="p-16">
          {step === 1 && subStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800">Let's create your main folders</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">How is your inventory organized right now? Think about how you naturally group things. Most people start with one of these approaches:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {choices.map((c) => (
                  <button 
                    key={c.id}
                    onClick={() => { setChoice(c.id); handleNext(); }}
                    className="flex items-center gap-4 p-6 border-2 border-slate-50 rounded-2xl text-left hover:border-[#de4a4a] hover:bg-rose-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#de4a4a] transition-colors shadow-sm">
                      <i className={`fa-solid ${c.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{c.title}</h4>
                      <p className="text-xs text-slate-400 font-bold">{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && subStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800">Let's create your main folders</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Based on your selection, here are some recommended main folders to help you get started. You can rename them now or add new ones later.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Main Folder Names</p>
                   {folders.map((f, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <input 
                          type="text" 
                          value={f} 
                          onChange={(e) => {
                            const newF = [...folders];
                            newF[i] = e.target.value;
                            setFolders(newF);
                          }}
                          className="flex-1 bg-slate-50 border-none p-4 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-1 ring-rose-200" 
                        />
                        <button className="text-slate-200 hover:text-rose-500"><i className="fa-solid fa-trash-can"></i></button>
                     </div>
                   ))}
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 space-y-6">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Folder Preview</p>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-rose-500 font-black text-sm">
                         <i className="fa-solid fa-calendar-check"></i>
                         <span>All Items</span>
                      </div>
                      <div className="ml-6 space-y-4 border-l-2 border-slate-100 pl-4">
                         {folders.map((f, i) => (
                           <div key={i} className="flex items-center gap-3 text-slate-600 font-bold text-xs opacity-60">
                             <i className="fa-solid fa-folder"></i>
                             <span>{f}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-black text-slate-800">Add some items to your folders</h2>
                <p className="text-sm text-slate-400 font-medium">More details, like custom fields and tags, can be added later</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                 <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-50 bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Item Name</span>
                    <span>Quantity (Units)</span>
                    <span>Folder Name</span>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-3 gap-4 p-4 items-center">
                         <input type="text" value={item.name} className="bg-slate-50 p-3 rounded-lg text-sm font-bold border-none outline-none" />
                         <input type="number" value={item.qty} className="bg-slate-50 p-3 rounded-lg text-sm font-bold border-none outline-none" />
                         <select className="bg-slate-50 p-3 rounded-lg text-sm font-bold border-none outline-none">
                            {folders.map(f => <option key={f}>{f}</option>)}
                         </select>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-5xl">🎉</div>
              <div className="space-y-4 max-w-md">
                <h2 className="text-3xl font-black text-slate-800 leading-tight">Great Start! You're on your way.</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">With your folders set up, you're ready to build your searchable system. Here's a secret: the more you add, the more powerful ZenInventory becomes.</p>
              </div>
              <div className="w-full text-left space-y-4 py-6 border-y border-slate-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Your next moves:</p>
                <div className="space-y-3">
                   {['Add more folders and items.', 'Snap photos and add in details on the item details page', "Try everyone's favorite: the Search Item feature"].map((move, i) => (
                     <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <i className="fa-solid fa-check text-emerald-500"></i>
                        <span>{move}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-16 py-8 border-t border-slate-50 bg-white flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-300 uppercase">Step {step} of 2</span>
           <div className="flex gap-4">
              {step > 1 && step < 3 && (
                <button onClick={() => setStep(step - 1)} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400">BACK</button>
              )}
              <button 
                onClick={handleNext}
                className="px-12 py-3 bg-[#de4a4a] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all"
              >
                {step === 3 ? 'VIEW MY WORKSPACE' : 'NEXT'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
