import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wrench, Server, Code } from 'lucide-react';

export const ToolNode = memo(({ data, selected }) => {
  const { label, config } = data;
  const server = config?.mcp_server || 'filesystem';
  const toolName = config?.tool_name || 'read_file';

  return (
    <div
      className={`relative group min-w-[220px] rounded-xl border bg-dark-800/90 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        selected
          ? 'border-brand-amber ring-2 ring-brand-amber/30 shadow-amber-500/10'
          : 'border-white/10 hover:border-brand-amber/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-brand-amber !w-3 !h-3 !border-2 !border-dark-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-brand-amber !w-3 !h-3 !border-2 !border-dark-900"
      />

      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 leading-tight">{label}</h3>
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">MCP Tool</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
          <Server className="w-3.5 h-3.5 text-amber-400" />
          <span>Server: <strong className="text-gray-200">{server}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
          <Code className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Tool: <strong className="text-brand-cyan">{toolName}</strong></span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between">
        <span>MCP Standard</span>
        <span className="text-emerald-400 font-medium">Connected</span>
      </div>
    </div>
  );
});

ToolNode.displayName = 'ToolNode';
