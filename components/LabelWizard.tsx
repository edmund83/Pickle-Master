import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface LabelWizardProps {
  item: InventoryItem;
  onClose: () => void;
}

const LabelWizard: React.FC<LabelWizardProps> = ({ item, onClose }) => {
  const [step, setStep] = useState(1);
  const [labelType, setLabelType] = useState('Barcode Label');
  const [paperSize, setPaperSize] = useState('US Letter (8.5in x 11in)');
  const [labelSize, setLabelSize] = useState('Medium (2 3/8in x 1 1/4in)');
  
  // Settings Toggles
  const [settings, setSettings] = useState({
    details: false,
    photo: false,
    logo: false,
    note: false,
    printStartPosition: false,
    instructions: false
  });

  // Selected Data Fields
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Printing State
  const [printQty, setPrintQty] = useState('1');
  const [sendEmail, setSendEmail] = useState(true);

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const renderStep1Sidebar = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Informational Banner */}
      <div className="bg-[#e7f3ff] text-[#0060b9] p-4 rounded-lg flex items-center gap-4 text-sm font-medium border border-[#cce5ff]">
        <div className="w-6 h-6 bg-[#1e88e5] rounded-full flex items-center justify-center text-white shrink-0">
          <i className="fa-solid fa-info text-[10px]"></i>
        </div>
        <span>This label will now be stored for easy reprinting.</span>
      </div>

      <div className="space-y-6">
        {/* Label Options Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Options</h4>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400 ml-1">Label type</label>
              <div className="relative">
                <select 
                  value={labelType} 
                  onChange={(e) => setLabelType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:ring-1 ring-rose-100 transition-all appearance-none"
                >
                  <option>QR Label</option>
                  <option>Barcode Label</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400 ml-1">Paper size</label>
              <div className="relative">
                <select 
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:ring-1 ring-rose-100 transition-all appearance-none"
                >
                  <option>US Letter (8.5in x 11in)</option>
                  <option>A4 (210mm x 297mm)</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400 ml-1">Label size</label>
              <div className="relative">
                <select 
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:ring-1 ring-rose-100 transition-all appearance-none"
                >
                  <option>Small (2in x 1in)</option>
                  <option>Medium (2 3/8in x 1 1/4in)</option>
                  <option>Large (4in x 2in)</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Switches section */}
      <div className="space-y-6 pt-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Include additional item details</span>
              <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
            </div>
            <div 
              onClick={() => setSettings({...settings, details: !settings.details})}
              className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.details ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.details ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Include photo</span>
              <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
            </div>
            <div 
              onClick={() => setSettings({...settings, photo: !settings.photo})}
              className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.photo ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.photo ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Include logo or icon</span>
              <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
            </div>
            <div 
              onClick={() => setSettings({...settings, logo: !settings.logo})}
              className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.logo ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.logo ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Add a note to label</span>
              <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
            </div>
            <div 
              onClick={() => setSettings({...settings, note: !settings.note})}
              className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.note ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.note ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2Sidebar = () => (
    <div className="space-y-10 animate-in fade-in duration-300">
      <section className="space-y-6">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
          PRINTING OPTIONS
        </h4>
        
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 ml-1">
              Label quantity <i className="fa-solid fa-circle-question text-slate-200 text-[10px]"></i>
            </label>
            <div className="relative">
              <select className="w-full bg-[#f1f2f4] border-none rounded-lg p-3 text-sm font-medium text-slate-700 outline-none appearance-none">
                <option>Custom</option>
                <option>Full Sheet</option>
              </select>
              <i className="fa-solid fa-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]"></i>
            </div>
          </div>
          <div className="w-[100px] space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 ml-1">Amount</label>
            <input 
              type="text" 
              value={printQty}
              onChange={(e) => setPrintQty(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 outline-none focus:ring-1 ring-rose-200" 
            />
          </div>
        </div>

        <div className="space-y-6 pt-4">
           <div className="flex items-center justify-between group">
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600">Choose label print start position</span>
               <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
             </div>
             <div 
               onClick={() => setSettings({...settings, printStartPosition: !settings.printStartPosition})}
               className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.printStartPosition ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
             >
               <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.printStartPosition ? 'right-0.5' : 'left-0.5'}`}></div>
             </div>
           </div>
           
           <div className="flex items-center justify-between group">
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600">Include printing instructions</span>
             </div>
             <div 
               onClick={() => setSettings({...settings, instructions: !settings.instructions})}
               className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${settings.instructions ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
             >
               <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${settings.instructions ? 'right-0.5' : 'left-0.5'}`}></div>
             </div>
           </div>

           <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-slate-600">Send copy to email</span>
                <div 
                  onClick={() => setSendEmail(!sendEmail)}
                  className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${sendEmail ? 'bg-[#6bb17f]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm ${sendEmail ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
              {sendEmail && (
                <div className="relative pt-1 animate-in slide-in-from-top-1">
                  <label className="absolute left-3 -top-2 bg-white px-1 text-[10px] font-medium text-slate-400 z-10">Email</label>
                  <input 
                    type="email" 
                    value="kktong83@gmail.com" 
                    readOnly 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none" 
                  />
                </div>
              )}
           </div>
        </div>
      </section>

      <section className="space-y-6">
         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">LABEL INFORMATION</h4>
         
         <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm">
               <span className="font-medium text-slate-500">Labels per sheet:</span>
               <span className="font-bold text-slate-800">18</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-sm">
               <span className="font-medium text-slate-500">Compatible with:</span>
               <span className="font-bold text-slate-800">Avery 6871, 30330</span>
            </div>
            <button className="text-[#de4a4a] text-[11px] font-bold hover:underline block pt-1">
              Purchase Blank Labels
            </button>
         </div>

         <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-slate-500">Printer type: <span className="text-slate-800 font-bold ml-1">laser</span></p>
            <p className="text-sm font-medium text-slate-500">Printer recommendation:</p>
            <button className="text-[#de4a4a] text-[11px] font-bold hover:underline block">
              Purchase Recommended Printers
            </button>
         </div>
      </section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-lg font-bold text-slate-700">Create Label</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Configuration Panel */}
          <div className="w-[440px] border-r border-slate-100 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
            {step === 1 ? renderStep1Sidebar() : renderStep2Sidebar()}
          </div>

          {/* Right Preview Panel */}
          <div className="flex-1 bg-[#f1f2f4] p-12 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Dynamic Ruler / Dimensions */}
             <div className="bg-white p-12 shadow-sm rounded-sm w-full max-w-[440px] aspect-[5.5/8.5] flex flex-col items-center justify-between text-center border border-slate-100 relative animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Ruler Lines */}
                <div className="absolute top-8 inset-x-12 flex items-center">
                   <div className="h-[1px] bg-slate-300 w-full relative">
                      <i className="fa-solid fa-caret-left absolute -left-1.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <i className="fa-solid fa-caret-right absolute -right-1.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-medium text-slate-400 tracking-wider bg-white px-4">
                        2 3/8in
                      </span>
                   </div>
                </div>
                <div className="absolute right-8 inset-y-12 flex items-center">
                   <div className="w-[1px] bg-slate-300 h-full relative">
                      <i className="fa-solid fa-caret-up absolute left-1/2 -translate-x-1/2 -top-1.5 text-slate-400"></i>
                      <i className="fa-solid fa-caret-down absolute left-1/2 -translate-x-1/2 -bottom-1.5 text-slate-400"></i>
                      <span className="absolute top-1/2 left-4 -translate-y-1/2 rotate-90 whitespace-nowrap text-[11px] font-medium text-slate-400 tracking-wider bg-white px-4">
                        1 1/4in
                      </span>
                   </div>
                </div>

                {/* Label Content */}
                <div className="w-full space-y-6 pt-12">
                  <h3 className="text-[1.1rem] font-bold text-slate-700 leading-tight tracking-tight">
                    {item.name || 'Item / Folder name displayed here'}
                  </h3>
                </div>

                <div className="flex-1 w-full flex flex-col justify-center px-4">
                   <div className="w-full flex flex-col items-center gap-1">
                      <div className="w-full h-16 bg-white flex items-center justify-center overflow-hidden">
                        {/* Fake Barcode Visual */}
                        <div className="flex items-center gap-[1px] h-full">
                           {[2,1,3,1,2,4,1,2,1,3,1,4,2,1,3,1,2,1,2,4,1,2,3,1,2].map((w,i) => (
                             <div key={i} style={{width: `${w}px`}} className="h-full bg-slate-900"></div>
                           ))}
                        </div>
                      </div>
                      <div className="w-full h-[2px] bg-[#de4a4a] opacity-60"></div>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] mt-1">S0003T0143</span>
                   </div>
                </div>

                <div className="w-full pt-6">
                </div>
             </div>
             
             {/* Bottom Hint */}
             <p className="mt-12 text-xs font-medium text-slate-400">Choose label type to see preview</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white relative">
          <div className="z-10">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                className="bg-white border border-slate-200 text-slate-500 px-10 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:text-slate-800 hover:border-slate-400 transition-all"
              >
                BACK
              </button>
            )}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
            <span className="text-sm font-medium text-slate-400">Step {step} of 2</span>
          </div>

          <div className="flex items-center gap-8 z-10">
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)} 
                className="px-14 py-3 bg-[#de4a4a] text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#c33b3b] transition-all"
              >
                NEXT
              </button>
            ) : (
              <>
                <button className="text-[11px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest px-2">
                  DOWNLOAD PDF
                </button>
                <button className="px-12 py-3 bg-[#de4a4a] text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#c33b3b] transition-all">
                  PRINT & SAVE LABEL
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelWizard;