import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Combine } from 'lucide-react';

export const MergeNode = memo(({ data, selected }) => {
  const { label, config } = data;
  const strategy = config?.merge_strategy || 'combine_dict';

  return (
    <div
      className={`relative group min-w-[200px] rounded-xl border bg-dark-800/90 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        selected
          ? 'border-brand-purple ring-2 ring-brand-purple/30 shadow-purple-500/10'
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

      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400 flex justify-between">
        <span>Parallel Fan-in</span>
        <span className="text-purple-400 font-medium">Join</span>
      </div>
    </div>
  );
});

MergeNode.displayName = 'MergeNode';
