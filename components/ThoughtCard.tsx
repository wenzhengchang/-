import React from 'react';
import { Thought } from '../types';
import { Tag, Clock } from 'lucide-react';

interface ThoughtCardProps {
  thought: Thought;
}

const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought }) => {
  const timeString = new Date(thought.createdAt).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="group bg-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-sm hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] hover:bg-white transition-all duration-300 mb-4 border border-white/50">
      <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap mb-4 font-normal tracking-wide">
        {thought.content}
      </p>
      
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2 flex-wrap">
          {thought.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50/80 text-indigo-600 text-xs font-medium tracking-wide transition-colors group-hover:bg-indigo-100/80"
            >
              <Tag size={10} className="mr-1.5 opacity-70" />
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-slate-500 transition-colors">
          <Clock size={12} />
          <span className="text-xs font-medium">{timeString}</span>
        </div>
      </div>
    </div>
  );
};

export default ThoughtCard;