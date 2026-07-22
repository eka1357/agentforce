import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useExecutionStore } from '../execution/useExecutionStore';
import { Save, FolderOpen, Play, Trash2, Sparkles, Layers, CheckCircle2, Loader2, Zap, Wrench, History } from 'lucide-react';
import { RunHistoryDrawer } from './RunHistoryDrawer';

export const Header = () => {
  const {
    workflowId,
    workflowName,
    workflowDescription,
    nodes,
    edges,
    setWorkflowMeta,
    saveCurrentWorkflow,
    isSaving,
    loadTemplate,
    clearCanvas,
    loadWorkflowsList,
    savedWorkflows,
    loadWorkflowById,
  } = useWorkflowStore();

  const { triggerRun, isExecuting, runStatus } = useExecutionStore();

  const [showWorkflowsMenu, setShowWorkflowsMenu] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    loadWorkflowsList();
  }, []);

  const handleSave = async () => {
    await saveCurrentWorkflow();
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  const handleExecute = async () => {
    const graphJson = { nodes, edges };
    await triggerRun(workflowId, graphJson);
  };

  return (
    <header className="h-16 border-b border-white/10 bg-dark-800/80 backdrop-blur-xl px-6 flex items-center justify-between z-20 relative">
      {/* Left: Branding & Workflow Title Editing */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-purple to-brand-cyan flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">AgentForge</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowMeta(e.target.value, workflowDescription)}
                className="bg-transparent text-sm font-bold text-gray-100 focus:outline-none focus:border-b focus:border-brand-500 px-1 py-0.5 rounded transition-all"
                placeholder="Workflow Name..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center: Template & Load Quick Selectors */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => loadTemplate('company-research')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-brand-600/20 to-brand-purple/20 text-brand-purple border border-brand-500/30 hover:border-brand-500 transition-all shadow-sm"
          title="Load Company Research Swarm Template"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Research Swarm</span>
        </button>

        <button
          onClick={() => loadTemplate('mcp-tool')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          title="Load Agent + MCP Tool Pipeline"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>MCP Tool Pipeline</span>
        </button>

        <button
          onClick={() => loadTemplate('simple-linear')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          title="Load 2-Node Linear Pipeline"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>2-Node Linear</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowWorkflowsMenu(!showWorkflowsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-700 text-gray-200 border border-white/5 hover:bg-dark-600 transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Saved ({savedWorkflows.length})</span>
          </button>

          {showWorkflowsMenu && (
            <div className="absolute top-full mt-2 right-0 w-64 rounded-xl border border-white/10 bg-dark-800 shadow-2xl backdrop-blur-xl p-2 z-50">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 border-b border-white/5">
                Saved Pipelines
              </div>
              <div className="max-h-48 overflow-y-auto mt-1 space-y-1">
                {savedWorkflows.length === 0 ? (
                  <div className="text-xs text-gray-400 p-2">No saved workflows yet.</div>
                ) : (
                  savedWorkflows.map((wf) => (
                    <button
                      key={wf.id}
                      onClick={() => {
                        loadWorkflowById(wf.id);
                        setShowWorkflowsMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs text-gray-200 hover:bg-dark-700 hover:text-white transition-all truncate flex flex-col"
                    >
                      <span className="font-semibold">{wf.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(wf.updated_at).toLocaleDateString()}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent"
          title="Clear canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Right: Actions (Save, History & Run) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-700 text-gray-200 border border-white/10 hover:bg-dark-600 hover:border-brand-500/50 transition-all shadow-md active:scale-95 cursor-pointer"
          title="View Past Execution Runs"
        >
          <History className="w-4 h-4 text-indigo-400" />
          <span>History</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-dark-700 text-gray-200 border border-white/10 hover:bg-dark-600 hover:border-brand-500/50 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
          ) : isSavedSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4 text-brand-purple" />
          )}
          <span>{isSaving ? 'Saving...' : isSavedSuccess ? 'Saved!' : 'Save Pipeline'}</span>
        </button>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
            isExecuting
              ? 'bg-amber-600 shadow-amber-500/25 animate-pulse'
              : runStatus === 'completed'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:brightness-110'
              : 'bg-gradient-to-r from-brand-600 to-brand-purple shadow-brand-500/25 hover:brightness-110'
          }`}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Executing Swarm...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Swarm</span>
            </>
          )}
        </button>
      </div>

      {/* Persistent Run History Drawer */}
      <RunHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </header>
  );
};
