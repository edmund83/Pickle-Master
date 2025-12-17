
import React, { useState, useRef } from 'react';
import { scanLabel } from '../services/geminiService';

const ReceivingView: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const result = await scanLabel(base64String);
        setScannedData(result);
      } catch (error) {
        console.error("Scanning failed", error);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Smart Receiving</h2>
          <p className="text-indigo-100 text-sm opacity-90">Upload a photo of a packing slip or shipment label to auto-populate inventory.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center space-x-2"
        >
          <i className="fa-solid fa-camera"></i>
          <span>Scan Shipment</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-800 border-b pb-4">Manual Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
              <input 
                type="text" 
                value={scannedData?.productName || ''}
                onChange={(e) => setScannedData({...scannedData, productName: e.target.value})}
                className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label>
                <input 
                  type="text" 
                  value={scannedData?.sku || ''}
                  onChange={(e) => setScannedData({...scannedData, sku: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                <input 
                  type="number" 
                  value={scannedData?.quantity || 0}
                  onChange={(e) => setScannedData({...scannedData, quantity: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            <button className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all mt-4">
              Add to Stock
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
          {scanning ? (
            <>
              <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-slate-800">AI Analysis in progress...</p>
              <p className="text-sm text-slate-500">Extracting details from your shipment label.</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl text-slate-300">
                 <i className="fa-solid fa-file-invoice"></i>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">No scan data yet. Upload a document or image to see the magic happen.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivingView;
