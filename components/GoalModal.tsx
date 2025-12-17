
import React from 'react';

interface GoalModalProps {
  onClose: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ onClose }) => {
  const goals = [
    "NEVER RUN OUT OF SUPPLIES",
    "FIND ITEMS INSTANTLY",
    "EVERYONE KNOWS WHERE STUFF IS",
    "SHOW PROFESSIONAL REPORTS",
    "TRACK VALUABLE ASSETS"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
        
        <div className="space-y-8 text-center">
          <h2 className="text-xl font-black text-slate-800 leading-tight">
            Great progress! What's your #1 goal with Sortly?
          </h2>
          
          <div className="flex flex-col gap-3">
            {goals.map((goal, i) => (
              <button 
                key={i}
                onClick={onClose}
                className="w-full py-3.5 px-6 bg-[#de4a4a] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#c33b3b] shadow-lg shadow-rose-100 transition-all active:scale-95"
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
