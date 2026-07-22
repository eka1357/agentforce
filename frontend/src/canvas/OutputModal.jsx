import React, { useState, useEffect } from 'react';
import { Bot, Wrench, X, Copy, Download, Check, Sparkles, FileText, Activity, Hash, AlignLeft } from 'lucide-react';

export const OutputModal = ({ isOpen, onClose, title, subtitle, content, nodeType = 'agent', modelName = '' }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const textContent = content || '';
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const isJson = nodeType === 'tool';
    const blob = new Blob([textContent], { type: isJson ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'output').toLowerCase().replace(/\s+/g, '-')}.${isJson ? 'json' : 'md'}`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 sm:p-6 transition-all animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-dark-800/95 border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden select-text transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-dark-900/60 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              nodeType === 'agent'
                ? 'bg-gradient-to-br from-brand-600 via-brand-purple to-brand-cyan shadow-brand-500/25'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
            }`}>
              {nodeType === 'agent' ? <Bot className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-100">{title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-cyan border border-brand-500/30">
                  {nodeType === 'agent' ? 'AI Agent Output' : 'MCP Tool Return'}
                </span>
              </div>
              {subtitle && <p className="text-xs text-gray-400 font-mono mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-700 hover:bg-dark-600 text-gray-200 border border-white/10 hover:border-brand-500/50 transition-all shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-purple" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-cyan border border-brand-500/30 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-1"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Bar */}
        <div className="px-6 py-2.5 bg-dark-900/40 border-b border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-300">
              <AlignLeft className="w-3.5 h-3.5 text-brand-purple" /> {wordCount} Words
            </span>
            <span className="flex items-center gap-1 text-gray-300">
              <Hash className="w-3.5 h-3.5 text-brand-cyan" /> {charCount} Characters
            </span>
            {modelName && (
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Model: {modelName}
              </span>
            )}
          </div>

          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Complete Response
          </span>
        </div>

        {/* Formatted Output Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-dark-900/90 font-mono text-sm leading-relaxed text-gray-100 whitespace-pre-wrap break-words selection:bg-brand-500 selection:text-white">
          {textContent ? (
            <div className="bg-dark-950/80 p-5 rounded-xl border border-white/10 shadow-inner">
              {textContent}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 italic">
              No content generated for this node yet. Click "Execute Swarm" to run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
