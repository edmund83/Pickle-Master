
import React, { useState } from 'react';
import TagModal from './TagModal';

interface TagsViewProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onAddTag: (tag: string) => void;
  onEditTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tag: string) => void;
}

const TagsView: React.FC<TagsViewProps> = ({ tags, selectedTag, onSelectTag, onAddTag, onEditTag, onDeleteTag }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingTagName, setEditingTagName] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleAdd = (name: string) => {
    onAddTag(name);
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEdit = (name: string) => {
    onEditTag(editingTagName, name);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingTagName('');
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 relative">
      {!selectedTag && tags.length === 0 ? (
        /* Zero State */
        <div className="flex flex-col items-center space-y-10 text-center">
          <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center text-5xl text-slate-300 rotate-12">
            <i className="fa-solid fa-tag"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-800">You don't have any tags</h1>
            <p className="text-sm font-bold text-slate-400">Click Add Tag to get started!</p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={openAddModal}
              className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-100 hover:scale-105 transition-all"
            >
              <i className="fa-solid fa-plus"></i> ADD TAG
            </button>
            <a href="#" className="text-[#de4a4a] text-[10px] font-black uppercase tracking-widest border-b border-[#de4a4a] pb-0.5 hover:text-rose-700 hover:border-rose-700">What are tags? How do I use them?</a>
          </div>
        </div>
      ) : (
        /* Tag Selected or list view */
        <div className="w-full h-full space-y-12">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">{selectedTag || 'Tags'}</h1>
            <button 
              onClick={openAddModal}
              className="bg-[#de4a4a] text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-100"
            >
              <i className="fa-solid fa-plus mr-2"></i> ADD TAG
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center pt-24 space-y-8 opacity-60">
            <div className="text-5xl text-slate-200">
               <i className="fa-solid fa-tag"></i>
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-black text-slate-800">No items with this tag</h3>
               <p className="text-sm font-bold text-slate-400">Add this tag to items or folders to show them here.</p>
               <a href="#" className="inline-block text-[#de4a4a] text-xs font-black underline mt-4">Learn More</a>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4">
           <div className="bg-[#333c4d] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                <i className="fa-solid fa-check"></i>
              </div>
              <span className="text-xs font-bold">Tag has been successfully created</span>
              <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white ml-4"><i className="fa-solid fa-xmark"></i></button>
           </div>
        </div>
      )}

      <TagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={modalMode === 'add' ? handleAdd : handleEdit}
        initialValue={editingTagName}
        mode={modalMode}
      />
    </div>
  );
};

export default TagsView;
