import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UserCheck, ShieldAlert, CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { useExecutionStore } from '../execution/useExecutionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { API_BASE_URL } from '../api/client';

export const HumanNode = memo(({ id, data, selected }) => {
  const { nodeStates, currentRunId } = useExecutionStore();
  const { isExecuting } = useWorkflowStore();
  
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = nodeStates[id]?.status || 'idle';
  const prompt = data?.config?.approval_prompt || 'Please review the upstream data and approve or provide feedback.';

  const handleAction = async (action) => {
    if (!currentRunId) return;
    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/workflows/runs/${currentRunId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: id,
          action,
          feedback,
        }),
      });
    } catch (err) {
      console.error('Failed to submit human approval action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`relative w-80 rounded-xl border transition-all duration-300 shadow-lg backdrop-blur-md ${
        selected ? 'ring-2 ring-amber-500 shadow-amber-950/40' : ''
      } ${
        state === 'paused'
          ? 'bg-amber-950/40 border-amber-500/60 shadow-amber-500/20 animate-pulse'
          : state === 'done'
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20'
          : state === 'error'
          ? 'bg-slate-900/90 border-red-500/40 shadow-red-950/20'
          : 'bg-slate-900/90 border-slate-700 shadow-black/40 hover:border-slate-600'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-900 hover:scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80 bg-slate-950/40 rounded-t-xl">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 leading-tight">
              {data.label || 'Human Approval'}
            </h3>
            <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider">
              Checkpoint
            </span>
          </div>
        </div>

        {/* State Badge */}
        <div>
          {state === 'paused' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-3 h-3 mr-1 animate-spin" /> Awaiting User
            </span>
          )}
          {state === 'done' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
            </span>
          )}
          {state === 'error' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" /> Rejected
            </span>
          )}
          {state === 'idle' && (
            <span className="text-[10px] text-slate-500 font-mono">IDLE</span>
          )}
        </div>
      </div>

      {/* Prompt Body & Action Controls */}
      <div className="p-3.5 space-y-3">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans">
          <span className="text-[10px] font-mono text-amber-400/80 block mb-1 uppercase font-semibold">
            Instruction:
          </span>
          {prompt}
        </div>

        {/* Active Pause Action Panel */}
        {state === 'paused' && (
          <div className="space-y-2.5 pt-1 border-t border-amber-500/20">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add optional feedback or instructions for downstream agents..."
              rows={2}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve & Proceed
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-900 hover:scale-125 transition-transform"
      />
    </div>
  );
});

HumanNode.displayName = 'HumanNode';
