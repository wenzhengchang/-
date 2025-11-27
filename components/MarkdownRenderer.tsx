import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="prose prose-slate max-w-none">
      {lines.map((line, index) => {
        // H1 - Main Title
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-6 mb-6 text-slate-800 tracking-tight leading-tight relative pl-4">
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-full"></span>
              {line.replace('# ', '')}
            </h1>
          );
        }
        // H2 - Section Title
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-lg font-bold mt-8 mb-4 text-indigo-900 bg-indigo-50/50 inline-block px-3 py-1 rounded-lg">
              {line.replace('## ', '')}
            </h2>
          );
        }
        // H3 - Sub Title
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-base font-semibold mt-4 mb-2 text-slate-700">{line.replace('### ', '')}</h3>;
        }
        // List item
        if (line.trim().startsWith('- ')) {
          return (
            <div key={index} className="flex items-start mb-3 ml-1 group">
              <span className="text-indigo-400 mr-3 mt-1.5 transition-transform group-hover:scale-125 duration-200">•</span>
              <p className="flex-1 leading-7 text-slate-600 font-normal">{line.replace('- ', '')}</p>
            </div>
          );
        }
        // Quote / Highlight
        if (line.trim().startsWith('> ')) {
             return (
                 <blockquote key={index} className="border-l-4 border-indigo-200 pl-4 py-2 my-4 bg-slate-50 rounded-r-lg italic text-slate-600">
                     {line.replace('> ', '')}
                 </blockquote>
             )
        }
        // Empty line
        if (line.trim() === '') {
          return <div key={index} className="h-3"></div>;
        }
        // Normal text
        return <p key={index} className="mb-3 leading-7 text-slate-600 font-light">{line}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;