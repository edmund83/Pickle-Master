
import React, { useState, useEffect } from 'react';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tagName: string) => void;
  initialValue?: string;
  mode: 'add' | 'edit';
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, onSave, initialValue = '', mode }) => {
  const [tagName, setTagName] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTagName(initialValue);
    setError(null);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (tagName.trim().length <= 1) {
      setError('Tag should be more than 1 character');
      return;
    }
    onSave(tagName.trim());
    setTagName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-800">{mode === 'add' ? 'Add Tag' : 'Edit Tag'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              value={tagName}
              onChange={(e) => {
                setTagName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Tag name"
              className={`w-full text-lg font-bold border-b-2 py-2 outline-none transition-colors ${
                error ? 'border-rose-500' : 'border-slate-100 focus:border-[#de4a4a]'
              }`}
            />
            {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-tight">{error}</p>}
          </div>
        </div>

        <div className="p-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              tagName.trim().length > 0 
                ? 'bg-rose-100 text-[#de4a4a] hover:bg-rose-200' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {mode === 'add' ? 'ADD' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
