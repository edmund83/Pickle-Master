
import React, { useState, useEffect } from 'react';
import { analyzeInventory, inventoryChat } from '../services/geminiService';
import { MOCK_ITEMS } from '../constants';

interface Insight {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const AISmartAssistant: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await analyzeInventory(MOCK_ITEMS);
      setInsights(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await inventoryChat(userMsg, MOCK_ITEMS);
      setMessages(prev => [...prev, { role: 'ai', content: response || 'No response' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-h-[calc(100vh-140px)]">
      {/* Actionable Insights Section */}
      <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center justify-between sticky top-0 bg-slate-50/50 py-2 backdrop-blur-sm z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Predictions</h2>
          <button onClick={fetchInsights} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">
            <i className="fa-solid fa-rotate-right mr-1"></i> Refresh
          </button>
        </div>
        
        {loading && insights.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-32"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-6 rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full ${
                  insight.severity === 'high' ? 'bg-rose-500' : 'bg-indigo-500'
                }`}></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-2 h-2 rounded-full ${
                    insight.severity === 'high' ? 'bg-rose-500 animate-pulse' : insight.severity === 'medium' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}></span>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{insight.title}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{insight.description}</p>
                <button className="w-full py-2.5 bg-slate-50 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all">
                  Apply Suggestion
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat / Assistant Section */}
      <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 className="font-black text-slate-800">Inventory Copilot</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> Analyzing Live Data
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-ellipsis-vertical text-xl"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-inner flex items-center justify-center text-4xl text-slate-200">
                 <i className="fa-solid fa-comment-dots"></i>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">How can I help today?</p>
                <p className="text-xs font-medium text-slate-500">"Show me items with no movement in 30 days"<br/>"Draft a purchase order for low stock apple products"</p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-[1.75rem] text-sm leading-relaxed shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none font-medium' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none font-medium'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 px-6 py-4 rounded-[1.75rem] rounded-tl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t">
          <form onSubmit={handleChat} className="flex items-center gap-3 bg-slate-100 p-2 rounded-[2rem] border border-slate-200 focus-within:ring-2 ring-indigo-500 transition-all">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the AI about your warehouse..."
              className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              <i className="fa-solid fa-arrow-up text-lg"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AISmartAssistant;
