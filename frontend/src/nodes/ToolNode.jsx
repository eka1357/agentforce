import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Wrench, Server, Code, Loader2, CheckCircle2, AlertTriangle, Radio, Maximize2 } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { checkMCPHealth } from '../api/mcpApi';

export const ToolNode = memo(({ id, data, selected }) => {
  const { label, config } = data;
  const server = config?.mcp_server || 'filesystem';
  const toolName = config?.tool_name || 'read_file';

  const { expandNodeOutput } = useWorkflowStore();
  const [mcpHealthStatus, setMcpHealthStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    checkMCPHealth(server).then((res) => {
      if (isMounted) {
        setMcpHealthStatus(res.status === 'connected' ? 'connected' : 'error');
      }
    });
    return () => { isMounted = false; };
  }, [server]);

  const nodeExecutionState = useExecutionStore((state) => state.nodeStates[id]);
  const status = nodeExecutionState?.status || 'idle';
  const toolTrace = nodeExecutionState?.toolTrace;
  const resultText = toolTrace?.result || '';

  const handleExpand = (e) => {
    e.stopPropagation();
    expandNodeOutput(id);
  };

  return (
    <div
      className={`relative group min-w-[250px] max-w-[320px] rounded-xl border bg-dark-800/95 backdrop-blur-md p-4 transition-all duration-200 shadow-xl ${
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

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 leading-tight">{label}</h3>
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">MCP Tool Node</span>
          </div>
        </div>
      </div>

      {/* Config Details */}
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

      {/* Real Tool Result Payload Display with nowheel nodrag classes */}
      {resultText && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">
            <span>Real MCP Return:</span>
            <button
              onClick={handleExpand}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition-all font-mono lowercase"
              title="Expand right side drawer"
            >
              <Maximize2 className="w-2.5 h-2.5" /> expand
            </button>
          </div>

          <div
            onClick={handleExpand}
            className="nowheel nodrag max-h-32 overflow-y-auto p-2 bg-dark-900 rounded-lg text-[10px] font-mono text-emerald-300 border border-white/10 leading-relaxed cursor-pointer hover:border-amber-400/50 transition-all select-text"
          >
            <pre className="whitespace-pre-wrap break-all">{resultText}</pre>
          </div>
        </div>
      )}

      {/* Real Connection Status Indicator */}
      <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          MCP Protocol
        </span>

        {status === 'running' ? (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Calling Tool...
          </span>
        ) : status === 'done' ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Executed
          </span>
        ) : mcpHealthStatus === 'connected' ? (
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
          </span>
        ) : (
          <span className="text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Disconnected
          </span>
        )}
      </div>
    </div>
  );
});

ToolNode.displayName = 'ToolNode';
