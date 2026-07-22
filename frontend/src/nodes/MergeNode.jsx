import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Combine, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';

export const MergeNode = memo(({ id, data, selected }) => {
  const { label, config } = data;
  const strategy = config?.merge_strategy || 'combine_dict';

  const nodeExecutionState = useExecutionStore((state) => state.nodeStates[id]);
  const status = nodeExecutionState?.status || 'idle';

  return (
    <div
      className={`relative group min-w-[200px] rounded-xl border bg-dark-800/95 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        status === 'running'
          ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-purple-500/20'
          : status === 'done'
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
          : status === 'error'
          ? 'border-rose-500/80 ring-2 ring-rose-500/40'
          : selected
          ? 'border-brand-purple ring-2 ring-brand-purple/30'
          : 'border-white/10 hover:border-brand-purple/50'
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

      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-100 leading-tight">{label}</h3>
          <span className="text-[10px] text-purple-400 uppercase tracking-wider font-mono">Merge Point</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
          <Combine className="w-3.5 h-3.5 text-purple-400" />
          <span>Strategy: <strong className="text-gray-200 font-mono">{strategy}</strong></span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400 flex justify-between items-center">
        <span>Parallel Fan-in</span>

        {status === 'idle' && <span className="text-gray-400 font-medium">⚪ Idle</span>}
        {status === 'running' && (
          <span className="text-purple-400 font-semibold flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" /> Merging...
          </span>
        )}
        {status === 'done' && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Joined
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

MergeNode.displayName = 'MergeNode';
