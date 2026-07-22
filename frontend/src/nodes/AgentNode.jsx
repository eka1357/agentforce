import React, { memo, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Cpu, Sparkles, Loader2, CheckCircle2, AlertTriangle, Terminal, Maximize2 } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';

const providerColors = {
  anthropic: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  openai: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  gemini: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const providerLabels = {
  anthropic: 'Claude',
  openai: 'OpenAI',
  gemini: 'Gemini',
};

export const AgentNode = memo(({ id, data, selected }) => {
  const { label, config } = data;
  const provider = config?.model_provider || 'anthropic';
  const modelName = config?.model_name || 'claude-3-5-sonnet';

  const { expandNodeOutput } = useWorkflowStore();
  const nodeExecutionState = useExecutionStore((state) => state.nodeStates[id]);
  const status = nodeExecutionState?.status || 'idle';
  const streamedText = nodeExecutionState?.streamedText || '';
  const errorText = nodeExecutionState?.error || '';

  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamedText]);

  const handleExpand = (e) => {
    e.stopPropagation();
    expandNodeOutput(id);
  };

  return (
    <div
      className={`relative group min-w-[270px] max-w-[340px] rounded-xl border bg-dark-800/95 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        status === 'running'
          ? 'border-brand-500 ring-2 ring-brand-500/50 shadow-brand-500/20 animate-pulse-border'
          : status === 'done'
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
          : status === 'error'
          ? 'border-rose-500/80 ring-2 ring-rose-500/40'
          : selected
          ? 'border-brand-500 ring-2 ring-brand-500/30'
          : 'border-white/10 hover:border-brand-500/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-brand-purple !w-3 !h-3 !border-2 !border-dark-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-brand-purple !w-3 !h-3 !border-2 !border-dark-900"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 leading-tight">{label}</h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Agent Node</span>
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            providerColors[provider] || providerColors.anthropic
          }`}
        >
          {providerLabels[provider] || provider}
        </span>
      </div>

      {/* Model Info */}
      <div className="space-y-1.5 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-brand-purple" />
          <span className="truncate">{modelName}</span>
        </div>

        {config?.system_prompt && !streamedText && (
          <p className="text-[11px] text-gray-400 line-clamp-2 bg-dark-900/60 p-2 rounded-md border border-white/5 italic">
            "{config.system_prompt}"
          </p>
        )}
      </div>

      {/* Live Stream Output Box with nowheel nodrag classes for scrolling */}
      {(streamedText || status === 'running') && (
        <div className="mt-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-[10px] text-brand-cyan font-mono mb-1">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" /> Output Stream:
            </span>
            <button
              onClick={handleExpand}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/20 hover:bg-brand-500/40 text-brand-cyan transition-all font-semibold"
              title="Expand right side drawer"
            >
              <Maximize2 className="w-3 h-3" /> Expand Right
            </button>
          </div>

          <div
            ref={outputRef}
            onClick={handleExpand}
            className="nowheel nodrag max-h-36 overflow-y-auto bg-dark-900 p-2.5 rounded-lg text-[11px] font-mono text-gray-200 border border-white/10 leading-relaxed cursor-pointer hover:border-brand-500/50 transition-all select-text"
          >
            <span>{streamedText}</span>
            {status === 'running' && <span className="inline-block w-2 h-3 bg-brand-cyan animate-pulse ml-0.5" />}
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {status === 'error' && errorText && (
        <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
          {errorText}
        </div>
      )}

      {/* Footer Status Pill */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-cyan" /> Temp: {config?.temperature ?? 0.7}
        </span>

        {status === 'idle' && <span className="text-gray-400 font-medium">⚪ Idle</span>}
        {status === 'running' && (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Streaming...
          </span>
        )}
        {status === 'done' && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
          </span>
        )}
        {status === 'error' && (
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Error
          </span>
        )}
      </div>
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
