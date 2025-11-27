import React from 'react';
import { PenLine, History, Sparkles } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.CAPTURE, label: '记录', icon: <PenLine size={22} /> },
    { view: ViewState.HISTORY, label: '历史', icon: <History size={22} /> },
    { view: ViewState.SUMMARY, label: '总结', icon: <Sparkles size={22} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[320px]">
      <nav className="mx-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-2 py-2">
        <div className="flex justify-between items-center relative">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-50/80 rounded-xl -z-10 animate-fade-in" />
                )}
                
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;