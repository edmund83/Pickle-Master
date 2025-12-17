
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface LabelWizardProps {
  item: InventoryItem;
  onClose: () => void;
}

const LabelWizard: React.FC<LabelWizardProps> = ({ item, onClose }) => {
  const [step, setStep] = useState(1);
  const [labelType, setLabelType] = useState('QR Label');
  const [includePhoto, setIncludePhoto] = useState(true);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-black text-slate-800">Create Label</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Options */}
          <div className="w-[45%] border-r border-slate-100 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-white">
            {step === 1 ? (
              <>
                <div className="bg-sky-50 text-sky-800 p-6 rounded-2xl flex items-center gap-4 text-sm font-bold border border-sky-100 shadow-sm">
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">
                    <i className="fa-solid fa-info"></i>
                  </div>
                  <span>This label will now be stored for easy reprinting.</span>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Label type</label>
                    <div className="relative">
                      <select 
                        value={labelType} 
                        onChange={(e) => setLabelType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all appearance-none"
                      >
                        <option>QR Label</option>
                        <option>Barcode Label</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Paper size</label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all appearance-none">
                        <option>US Letter (8.5in x 11in)</option>
                        <option>A4 (210mm x 297mm)</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm">
                    {['Notes', 'Price', 'Min Level', 'Tags', 'Total Value'].map(field => (
                      <div key={field} className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer group">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{field}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${field === 'Min Level' ? 'border-[#de4a4a] bg-[#de4a4a]' : 'border-slate-200 bg-white'}`}>
                          {field === 'Min Level' && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-700">Include photo</span>
                       <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
                     </div>
                     <div 
                      onClick={() => setIncludePhoto(!includePhoto)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${includePhoto ? 'bg-emerald-500' : 'bg-slate-200'}`}
                     >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${includePhoto ? 'right-1' : 'left-1'}`}></div>
                     </div>
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">The first photo of the item will be used on the label</p>
                   
                   <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-700">Include logo or icon</span>
                       <i className="fa-solid fa-circle-question text-slate-200 text-sm"></i>
                     </div>
                     <div className="w-12 h-6 bg-slate-100 rounded-full relative cursor-not-allowed">
                       <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm opacity-50"></div>
                     </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-8">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                    <i className="fa-solid fa-print text-rose-500"></i>
                    Printing Options
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
                        Label quantity <i className="fa-solid fa-circle-question text-slate-200"></i>
                      </label>
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none">
                        <option>Custom</option>
                        <option>Full Sheet</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Amount</label>
                      <input type="number" defaultValue={1} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-700 flex items-center gap-2">Choose label print start position <i className="fa-solid fa-circle-question text-slate-200"></i></span>
                     <div className="w-12 h-6 bg-slate-100 rounded-full relative cursor-not-allowed opacity-50"><div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-700">Include printing instructions</span>
                     <div className="w-12 h-6 bg-slate-100 rounded-full relative cursor-not-allowed opacity-50"><div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Send copy to email</span>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                        <input type="email" value="kktong83@gmail.com" readOnly className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed" />
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label Information</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-white">
                         <span className="text-sm font-bold text-slate-500">Labels per sheet:</span>
                         <span className="text-sm font-black text-slate-800">18</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-500">Compatible with:</span>
                         <span className="text-sm font-black text-slate-800">Avery 6871, 30330</span>
                      </div>
                      <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest hover:underline pt-2">Purchase Blank Labels</button>
                   </div>
                   <div className="pt-6 border-t border-white space-y-3">
                      <p className="text-sm font-bold text-slate-500">Printer type: <span className="text-slate-800 font-black uppercase ml-1">laser</span></p>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed">Printer recommendation:</p>
                      <button className="text-[#de4a4a] text-xs font-black uppercase tracking-widest hover:underline">Purchase Recommended Printers</button>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Preview */}
          <div className="flex-1 bg-slate-50 p-16 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Decorative Background Element */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#de4a4a]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
             
             <div className="bg-white p-12 shadow-2xl rounded-sm w-full max-w-sm aspect-[5.5/8.5] flex flex-col items-center justify-between text-center border border-slate-100 relative group animate-in slide-in-from-bottom-4">
                {/* Scale Indicators */}
                <div className="absolute top-6 inset-x-8 flex items-center justify-between">
                   <div className="h-[1px] bg-slate-200 w-full relative">
                      <i className="fa-solid fa-caret-left absolute -left-1.5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <i className="fa-solid fa-caret-right absolute -right-1.5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-2">
                        {labelType === 'QR Label' ? '5 1/2in' : '2 3/8in'}
                      </span>
                   </div>
                </div>
                <div className="absolute left-8 inset-y-12 flex items-center justify-center">
                   <div className="w-[1px] bg-slate-200 h-full relative">
                      <i className="fa-solid fa-caret-up absolute left-1/2 -translate-x-1/2 -top-1.5 text-slate-300"></i>
                      <i className="fa-solid fa-caret-down absolute left-1/2 -translate-x-1/2 -bottom-1.5 text-slate-300"></i>
                      <span className="absolute top-1/2 left-4 -translate-y-1/2 rotate-90 whitespace-nowrap text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-2">
                        {labelType === 'QR Label' ? '8 1/2in' : '1 1/4in'}
                      </span>
                   </div>
                </div>

                <div className="w-full space-y-6 pt-12">
                  <h3 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                    {item.name || 'Item / Folder name displayed here'}
                  </h3>
                  <div className="h-[1px] bg-rose-200 w-full opacity-60"></div>
                </div>

                {labelType === 'QR Label' && (
                  <div className="w-full text-left space-y-2 mt-8 px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field name</p>
                    <p className="text-sm font-bold text-slate-800">Field value</p>
                  </div>
                )}

                <div className="w-full flex items-end justify-between border-t border-slate-50 pt-10 mt-auto">
                   {includePhoto ? (
                     <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center relative">
                        {item.imageUrl ? (
                           <img src={item.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase">Photo displayed here</p>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center">
                        <i className="fa-regular fa-image text-slate-100 text-3xl"></i>
                     </div>
                   )}
                   
                   <div className="flex flex-col items-center gap-3">
                      {labelType === 'QR Label' ? (
                        <div className="w-24 h-24 bg-white border border-slate-100 p-4 flex items-center justify-center shadow-sm rounded-xl">
                           <i className="fa-solid fa-qrcode text-6xl text-slate-800"></i>
                        </div>
                      ) : (
                        <div className="w-32 h-16 bg-white border border-slate-100 p-2 flex flex-col items-center justify-center gap-1 shadow-sm rounded-lg">
                           <div className="w-full h-8 bg-slate-900 flex items-center justify-between px-1 gap-0.5">
                             {[...Array(20)].map((_, i) => <div key={i} className="h-full bg-white" style={{width: `${Math.random()*3}px`}}></div>)}
                           </div>
                           <span className="text-[8px] font-black text-slate-600 tracking-[0.3em]">S0003T0143</span>
                        </div>
                      )}
                      <span className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">{item.barcode || 'S0003T0143'}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 border-t flex items-center justify-between bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {step} of 2</div>
          <div className="flex gap-4">
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)} 
                className="px-12 py-4 bg-[#de4a4a] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-[#c33b3b] hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                NEXT
              </button>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-800 hover:border-slate-800 transition-all">BACK</button>
                <div className="flex gap-4">
                   <button className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">DOWNLOAD PDF</button>
                   <button className="px-12 py-4 bg-[#de4a4a] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-[#c33b3b] transition-all">PRINT & SAVE LABEL</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelWizard;
