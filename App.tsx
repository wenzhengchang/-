import React, { useState, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Loader2, Quote, Zap } from 'lucide-react';
import { ViewState, Thought, Summary } from './types';
import Navigation from './components/Navigation';
import ThoughtCard from './components/ThoughtCard';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateTagsForThought, generateDailySummary } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>(ViewState.CAPTURE);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [inputText, setInputText] = useState('');
  
  // AI Status States
  const [isTagging, setIsTagging] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedThoughts = localStorage.getItem('mindflow_thoughts');
    const savedSummaries = localStorage.getItem('mindflow_summaries');
    if (savedThoughts) setThoughts(JSON.parse(savedThoughts));
    if (savedSummaries) setSummaries(JSON.parse(savedSummaries));
  }, []);

  useEffect(() => {
    localStorage.setItem('mindflow_thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  useEffect(() => {
    localStorage.setItem('mindflow_summaries', JSON.stringify(summaries));
  }, [summaries]);

  // --- Handlers ---

  const handleAddThought = async () => {
    if (!inputText.trim()) return;

    const newThought: Thought = {
      id: Date.now().toString(),
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
      tags: [],
    };

    const tempThoughts = [newThought, ...thoughts];
    setThoughts(tempThoughts);
    setInputText('');
    setIsTagging(true);

    try {
      const tags = await generateTagsForThought(newThought.content);
      setThoughts(current => 
        current.map(t => t.id === newThought.id ? { ...t, tags } : t)
      );
    } catch (err) {
      console.error("Tagging failed silently", err);
    } finally {
      setIsTagging(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (thoughts.length === 0) {
      setErrorMsg("还没有记录任何灵感，无法生成总结。");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSummarizing(true);
    setView(ViewState.SUMMARY); 

    try {
      const summaryContent = await generateDailySummary(thoughts);
      
      const newSummary: Summary = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        content: summaryContent,
        createdAt: new Date().toISOString(),
      };

      setSummaries([newSummary, ...summaries]);
    } catch (err) {
      setErrorMsg("生成总结失败，请检查网络。");
    } finally {
      setIsSummarizing(false);
    }
  };

  // --- Render Sections ---

  const renderCaptureView = () => (
    <div className="flex flex-col h-full max-w-lg mx-auto px-6 pt-12 pb-32">
      <header className="mb-10 text-center animate-fade-in-down">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-3 tracking-tight">MindFlow</h1>
        <p className="text-slate-500 font-medium">让思绪自由流动，让 AI 为你编织。</p>
      </header>

      <div className="flex-1 flex flex-col justify-start mb-6 relative z-10">
        <div className="group relative bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.04)] border border-white/50 p-1 transition-all focus-within:shadow-[0_20px_40px_rgb(79,70,229,0.1)] focus-within:bg-white focus-within:scale-[1.01] duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="此刻，你在想什么？..."
            className="w-full h-48 p-5 text-lg text-slate-700 placeholder-slate-300 resize-none focus:outline-none bg-transparent rounded-2xl leading-relaxed"
            style={{ fontFamily: 'Noto Serif SC, serif' }} // Use serif for writing to feel more personal
          />
          <div className="flex justify-between items-center px-4 pb-4 mt-2">
             <div className="flex items-center space-x-2">
                {isTagging ? (
                  <span className="flex items-center text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">
                    <Loader2 size={12} className="animate-spin mr-2"/> 分析主题中...
                  </span>
                ) : (
                   <span className="flex items-center text-xs font-medium text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-full">
                     <Zap size={12} className="mr-1.5" /> AI 自动分类
                   </span>
                )}
             </div>
             
             <button
               onClick={handleAddThought}
               disabled={!inputText.trim()}
               className={`rounded-2xl p-3.5 transition-all duration-300 flex items-center justify-center ${
                 inputText.trim() 
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1 transform scale-100' 
                  : 'bg-slate-100 text-slate-300 scale-95'
               }`}
             >
               <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />
             </button>
          </div>
        </div>
      </div>

      {/* Recent thoughts preview */}
      {thoughts.length > 0 && (
        <div className="space-y-4 animate-fade-in-up delay-100">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">最近记录</h3>
          </div>
          {thoughts.slice(0, 2).map(thought => (
            <div key={thought.id} className="opacity-90 hover:opacity-100 transition-opacity">
               <ThoughtCard thought={thought} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistoryView = () => (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">时光轴</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">共 {thoughts.length} 个灵感碎片</p>
        </div>
        <button 
          onClick={handleGenerateSummary}
          disabled={isSummarizing || thoughts.length === 0}
          className="group relative px-5 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-semibold text-indigo-600 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center">
             {isSummarizing ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2 group-hover:text-amber-500 transition-colors"/>}
             立即整理
          </div>
        </button>
      </header>
      
      {thoughts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="bg-white p-6 rounded-full shadow-md mb-6 rotate-3">
             <Quote size={32} className="text-indigo-300" />
          </div>
          <p className="text-slate-500 font-medium text-lg">一片空白...</p>
          <p className="text-slate-400 text-sm mt-2">去首页写下你的第一个想法吧</p>
        </div>
      ) : (
        <div className="space-y-5 animate-stagger-list">
          {thoughts.map((thought, index) => (
            <div key={thought.id} style={{animationDelay: `${index * 50}ms`}} className="animate-fade-in-up">
              <ThoughtCard thought={thought} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummaryView = () => (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32 min-h-screen">
       <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">智能洞察</h2>
        <p className="text-sm text-slate-500 mt-2">AI 帮你把碎片编织成网</p>
      </header>

      {isSummarizing && (
        <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-3xl p-10 text-center shadow-lg mb-8 animate-pulse">
           <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Loader2 size={32} className="animate-spin text-indigo-600" />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">正在深度思考...</h3>
           <p className="text-slate-500 text-sm">正在聚类主题、提取核心洞察</p>
        </div>
      )}

      {!isSummarizing && summaries.length === 0 ? (
        <div className="text-center py-24 px-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl">
           <p className="text-slate-400 font-medium mb-6">暂无生成的文档</p>
           <button 
             onClick={handleGenerateSummary}
             className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
           >
             ✨ 生成今日总结
           </button>
        </div>
      ) : (
        <div className="space-y-10">
          {summaries.map((summary) => (
            <article key={summary.id} className="bg-white rounded-[24px] shadow-[0_15px_35px_rgb(0,0,0,0.05)] border border-slate-100/50 overflow-hidden ring-1 ring-slate-900/5">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                  <Sparkles size={120} />
                </div>
                <div className="flex justify-between items-end text-white relative z-10">
                  <div>
                    <span className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">MindFlow Report</span>
                    <span className="font-bold text-xl tracking-tight">每日灵感日报</span>
                  </div>
                  <span className="text-sm font-medium bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">{summary.date}</span>
                </div>
              </div>
              <div className="p-8">
                <MarkdownRenderer content={summary.content} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  // --- Main Layout ---

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
      
      {/* Toast Notification */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md text-red-500 px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center z-[100] border border-red-100 ring-1 ring-red-50">
          <AlertCircle size={20} className="mr-3" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="h-full relative z-0">
        {view === ViewState.CAPTURE && renderCaptureView()}
        {view === ViewState.HISTORY && renderHistoryView()}
        {view === ViewState.SUMMARY && renderSummaryView()}
      </main>

      {/* Navigation */}
      <Navigation currentView={view} setView={setView} />
    </div>
  );
};

export default App;