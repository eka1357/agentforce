import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wrench, Server, Code, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';

export const ToolNode = memo(({ id, data, selected }) => {
  const { label, config } = data;
  const server = config?.mcp_server || 'filesystem';
  const toolName = config?.tool_name || 'read_file';

  const nodeExecutionState = useExecutionStore((state) => state.nodeStates[id]);
  const status = nodeExecutionState?.status || 'idle';
  const toolTrace = nodeExecutionState?.toolTrace;

  return (
    <div
      className={`relative group min-w-[230px] rounded-xl border bg-dark-800/95 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
        status === 'running'
          ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-amber-500/20'
          : status === 'done'
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
          : status === 'error'
          ? 'border-rose-500/80 ring-2 ring-rose-500/40'
          : selected
          ? 'border-brand-amber ring-2 ring-brand-amber/30'
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

      {/* Trace result preview */}
      {toolTrace?.result && (
        <div className="mt-2.5 p-2 bg-dark-900 rounded-lg text-[10px] font-mono text-gray-300 border border-white/10 truncate">
          Result: {toolTrace.result}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between">
        <span>MCP Standard</span>

        {status === 'idle' && <span className="text-gray-400 font-medium">⚪ Idle</span>}
        {status === 'running' && (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Executing...
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

ToolNode.displayName = 'ToolNode';
