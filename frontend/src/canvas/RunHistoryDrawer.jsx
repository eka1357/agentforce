import React, { useState, useEffect } from 'react';
import { History, X, CheckCircle2, AlertTriangle, Clock, RefreshCw, FileText, ChevronRight, CornerDownRight } from 'lucide-react';
import { API_BASE_URL } from '../api/client';
import { useExecutionStore } from '../execution/useExecutionStore';

export const RunHistoryDrawer = ({ isOpen, onClose }) => {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/workflows/runs/history`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error('Failed to fetch run history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRuns = filterStatus === 'all'
    ? runs
    : runs.filter(r => r.status === filterStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 leading-tight">Execution Run History</h2>
                <p className="text-xs text-slate-400">View past workflow executions, status, and outputs</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={fetchHistory}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-mono">Filter:</span>
            {['all', 'completed', 'failed', 'paused', 'running'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Main Content Area: Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Run List Sidebar */}
            <div className="w-1/2 border-r border-slate-800/80 overflow-y-auto p-3 space-y-2">
              {filteredRuns.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No execution history found.
                </div>
              ) : (
                filteredRuns.map((run) => {
                  const isSelected = selectedRun?.id === run.id;
                  return (
                    <div
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          {run.id.slice(0, 8)}...
                        </span>
                        <div>
                          {run.status === 'completed' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                            </span>
                          )}
                          {run.status === 'failed' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-medium">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Failed
                            </span>
                          )}
                          {run.status === 'paused' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
                              <Clock className="w-3 h-3 mr-1" /> Paused
                            </span>
                          )}
                          {run.status === 'running' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-medium">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Started: {new Date(run.started_at).toLocaleTimeString()}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Run Details Panel */}
            <div className="w-1/2 overflow-y-auto p-4 bg-slate-950/40">
              {selectedRun ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Run Metadata
                    </h3>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div><strong className="text-slate-300">Run ID:</strong> <span className="font-mono text-indigo-400">{selectedRun.id}</span></div>
                      <div><strong className="text-slate-300">Started:</strong> {new Date(selectedRun.started_at).toLocaleString()}</div>
                      {selectedRun.finished_at && (
                        <div><strong className="text-slate-300">Finished:</strong> {new Date(selectedRun.finished_at).toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Outputs */}
                  <div>
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Node Outputs ({Object.keys(selectedRun.outputs || {}).length})
                    </h3>
                    {Object.keys(selectedRun.outputs || {}).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No node outputs recorded.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedRun.outputs).map(([nodeId, val]) => (
                          <div key={nodeId} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                            <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-300">
                              <CornerDownRight className="w-3.5 h-3.5" />
                              <span className="font-mono">{nodeId}</span>
                            </div>
                            <pre className="p-2 bg-slate-950 rounded text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                              {typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                  Select a run from the left to inspect detailed outputs.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
