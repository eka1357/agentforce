import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Cpu, Sparkles } from 'lucide-react';

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

export const AgentNode = memo(({ data, selected }) => {
  const { label, config } = data;
  const provider = config?.model_provider || 'anthropic';
  const modelName = config?.model_name || 'claude-3-5-sonnet';

  return (
    <div
      className={`relative group min-w-[240px] rounded-xl border bg-dark-800/90 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        selected
          ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-indigo-500/10'
          : 'border-white/10 hover:border-brand-500/50'
      }`}
    >
      {/* Handles */}
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-500/20">
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

      {/* Model & Config Details */}
      <div className="space-y-1.5 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-brand-purple" />
          <span className="truncate">{modelName}</span>
        </div>

        {config?.system_prompt && (
          <p className="text-[11px] text-gray-400 line-clamp-2 bg-dark-900/60 p-2 rounded-md border border-white/5 italic">
            "{config.system_prompt}"
          </p>
        )}
      </div>

      {/* Footer Indicator */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-cyan" /> Temp: {config?.temperature ?? 0.7}
        </span>
        <span className="text-emerald-400 font-medium">Ready</span>
      </div>
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
