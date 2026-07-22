import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork, HelpCircle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';

export const ConditionNode = memo(({ id, data, selected }) => {
  const { label, config } = data;
  const expression = config?.expression || 'output.status == 200';

  const nodeExecutionState = useExecutionStore((state) => state.nodeStates[id]);
  const status = nodeExecutionState?.status || 'idle';

  return (
    <div
      className={`relative group min-w-[200px] rounded-xl border bg-dark-800/95 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        status === 'running'
          ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-rose-500/20'
          : status === 'done'
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
          : status === 'error'
          ? 'border-rose-500/80 ring-2 ring-rose-500/40'
          : selected
          ? 'border-brand-rose ring-2 ring-brand-rose/30'
          : 'border-white/10 hover:border-brand-rose/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-brand-rose !w-3 !h-3 !border-2 !border-dark-900"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '35%' }}
        className="!bg-emerald-400 !w-3 !h-3 !border-2 !border-dark-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '65%' }}
        className="!bg-rose-400 !w-3 !h-3 !border-2 !border-dark-900"
      />

      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
          <GitFork className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-100 leading-tight">{label}</h3>
          <span className="text-[10px] text-rose-400 uppercase tracking-wider font-mono">Condition</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Rule:</span>
        </div>
        <p className="text-[11px] font-mono text-gray-200 bg-dark-900/60 p-2 rounded-md border border-white/5 truncate">
          {expression}
        </p>
      </div>

      <div className="mt-2 text-[10px] flex justify-between items-center text-gray-400 font-mono">
        <div className="flex gap-2">
          <span className="text-emerald-400">● True</span>
          <span className="text-rose-400">● False</span>
        </div>

        {status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-rose-400" />}
        {status === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
