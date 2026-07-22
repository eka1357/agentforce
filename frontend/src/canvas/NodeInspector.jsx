import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useExecutionStore } from '../execution/useExecutionStore';
import { X, Trash2, Copy, Sliders, Bot, Wrench, GitFork, Layers, Cpu, Sparkles, FileText, Download, Check, Maximize2, Minimize2, AlignLeft, Hash, Activity, Terminal, ListFilter } from 'lucide-react';

const MODEL_PRESETS = [
  { label: 'Claude 3.5 Sonnet', id: 'anthropic/claude-3.5-sonnet', provider: 'anthropic' },
  { label: 'GPT-4o', id: 'openai/gpt-4o', provider: 'openai' },
  { label: 'Gemini 2.0 Flash', id: 'google/gemini-2.0-flash-exp:free', provider: 'gemini' },
  { label: 'DeepSeek R1', id: 'deepseek/deepseek-r1:free', provider: 'openai' },
  { label: 'Llama 3.3 70B', id: 'meta-llama/llama-3.3-70b-instruct:free', provider: 'anthropic' },
  { label: 'Qwen 2.5 72B', id: 'qwen/qwen-2.5-72b-instruct', provider: 'openai' },
];

const PROMPT_SNIPPET_PRESETS = [
  { label: 'Financial Analyst', prompt: 'You analyze company balance sheets, revenue growth, profit margins, and valuation multiples. Output a clear financial summary.' },
  { label: 'News Intelligence', prompt: 'You gather recent media coverage, headlines, press releases, and market sentiment.' },
  { label: 'Competitor Intelligence', prompt: 'You map out key market competitors, market share dynamics, and strategic positioning.' },
  { label: 'Executive Summarizer', prompt: 'Synthesize all incoming intelligence streams into a single, structured executive brief with actionable recommendations.' },
];

export const NodeInspector = () => {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    deleteNode,
    duplicateNode,
    isInspectorExpanded,
    toggleInspectorExpanded
  } = useWorkflowStore();

  const { nodeStates, traceEvents } = useExecutionStore();

  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'output' | 'trace'
  const [copied, setCopied] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeState = selectedNode ? (nodeStates[selectedNode.id] || {}) : {};
  const outputText = nodeState.streamedText || nodeState.toolTrace?.result || '';
  const nodeEvents = selectedNode ? traceEvents.filter((e) => e.payload?.node_id === selectedNode.id) : [];

  // Auto-switch to output tab when selecting a node that has output
  useEffect(() => {
    if (selectedNodeId && outputText) {
      setActiveTab('output');
    }
  }, [selectedNodeId]);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;
  const { label, config = {} } = data;
  const wordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
  const charCount = outputText.length;

  const handleConfigChange = (key, value) => {
    updateNodeData(id, {
      config: {
        ...config,
        [key]: value
      }
    });
  };

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isJson = type === 'tool';
    const blob = new Blob([outputText], { type: isJson ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(label || 'node').toLowerCase().replace(/\s+/g, '-')}.${isJson ? 'json' : 'md'}`;
    a.click();
  };

  return (
    <aside
      className={`border-l border-white/10 bg-dark-800/95 backdrop-blur-2xl p-5 flex flex-col h-[calc(100vh-4rem)] z-30 shadow-2xl overflow-y-auto select-text transition-all duration-300 ease-in-out ${
        isInspectorExpanded ? 'w-[640px] xl:w-[50vw]' : 'w-96'
      }`}
    >
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-purple" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Node Inspector</h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleInspectorExpanded()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs font-mono"
            title={isInspectorExpanded ? 'Collapse side panel' : 'Expand side panel'}
          >
            {isInspectorExpanded ? <Minimize2 className="w-4 h-4 text-brand-cyan" /> : <Maximize2 className="w-4 h-4 text-brand-cyan" />}
          </button>

          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Tabs: Config | Output | Trace Log */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-dark-900 rounded-xl border border-white/5 mb-4">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'config'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Config</span>
        </button>

        <button
          onClick={() => setActiveTab('output')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'output'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Output</span>
          {outputText && <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1.5" />}
        </button>

        <button
          onClick={() => setActiveTab('trace')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'trace'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Trace ({nodeEvents.length})</span>
        </button>
      </div>

      {/* Node Label Editing */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
          Node Title
        </label>
        <input
          type="text"
          value={label || ''}
          onChange={handleLabelChange}
          className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-100 focus:outline-none focus:border-brand-500 transition-all"
        />
      </div>

      {/* TAB 1: CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="space-y-4 flex-1">
          {type === 'agent' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-purple" />
                <div>
                  <h4 className="text-xs font-bold text-gray-100">LLM Agent Settings</h4>
                  <p className="text-[10px] text-gray-400">Swappable Model Reasoning Node</p>
                </div>
              </div>

              {/* 1-Click Model Quick Selector */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Model Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {MODEL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        handleConfigChange('model_name', preset.id);
                        handleConfigChange('model_provider', preset.provider);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate ${
                        config.model_name === preset.id
                          ? 'bg-brand-500/20 text-brand-cyan border-brand-500 shadow-sm'
                          : 'bg-dark-900 text-gray-300 border-white/10 hover:border-brand-500/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Model ID
                </label>
                <input
                  type="text"
                  value={config.model_name || 'openai/gpt-oss-20b:free'}
                  onChange={(e) => handleConfigChange('model_name', e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-brand-cyan focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Prompt Snippet Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    System Prompt
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleConfigChange('system_prompt', e.target.value);
                    }}
                    className="bg-dark-900 border border-white/10 rounded text-[10px] text-brand-cyan px-2 py-0.5"
                  >
                    <option value="">Insert Prompt Preset...</option>
                    {PROMPT_SNIPPET_PRESETS.map((p) => (
                      <option key={p.label} value={p.prompt}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={6}
                  value={config.system_prompt || ''}
                  onChange={(e) => handleConfigChange('system_prompt', e.target.value)}
                  placeholder="Instructions for the agent..."
                  className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-brand-500 transition-all font-mono leading-relaxed"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Temperature
                  </label>
                  <span className="text-xs font-mono text-brand-cyan">{config.temperature ?? 0.7}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature ?? 0.7}
                  onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-brand-500 bg-dark-900 rounded-lg h-1.5 cursor-pointer"
                />
              </div>
            </div>
          )}

          {type === 'tool' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-gray-100">MCP Tool Binding</h4>
                  <p className="text-[10px] text-gray-400">Model Context Protocol tool call</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  MCP Server
                </label>
                <select
                  value={config.mcp_server || 'web_search'}
                  onChange={(e) => {
                    const s = e.target.value;
                    const defaultTool = s === 'filesystem' ? 'read_file' : s === 'web_search' ? 'fetch_job_postings' : 'get_status';
                    handleConfigChange('mcp_server', s);
                    handleConfigChange('tool_name', defaultTool);
                  }}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="web_search">web_search (Live Web Intelligence)</option>
                  <option value="filesystem">filesystem (Local Workspace)</option>
                  <option value="system_info">system_info (Environment Info)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Tool Function
                </label>
                <select
                  value={config.tool_name || 'fetch_job_postings'}
                  onChange={(e) => handleConfigChange('tool_name', e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-brand-cyan focus:outline-none focus:border-amber-400"
                >
                  {config.mcp_server === 'web_search' ? (
                    <>
                      <option value="fetch_job_postings">fetch_job_postings</option>
                      <option value="search_web">search_web</option>
                    </>
                  ) : config.mcp_server === 'system_info' ? (
                    <option value="get_status">get_status</option>
                  ) : (
                    <>
                      <option value="read_file">read_file</option>
                      <option value="list_directory">list_directory</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {type === 'condition' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Rule Expression
                </label>
                <input
                  type="text"
                  value={config.expression || ''}
                  onChange={(e) => handleConfigChange('expression', e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none"
                />
              </div>
            </div>
          )}

          {type === 'merge' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Merge Strategy
                </label>
                <select
                  value={config.merge_strategy || 'combine_dict'}
                  onChange={(e) => handleConfigChange('merge_strategy', e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
                >
                  <option value="combine_dict">Combine Dictionary</option>
                  <option value="concat_text">Concatenate Text Output</option>
                  <option value="wait_all">Wait for All (List)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE OUTPUT SHEET */}
      {activeTab === 'output' && (
        <div className="flex-1 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/5 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-300">
                <AlignLeft className="w-3.5 h-3.5 text-brand-purple" /> {wordCount} Words
              </span>
              <span className="flex items-center gap-1 text-gray-300">
                <Hash className="w-3.5 h-3.5 text-brand-cyan" /> {charCount} Chars
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-700 border border-white/5 text-gray-300 transition-all text-xs flex items-center gap-1"
                title="Copy markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-purple" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-700 border border-white/5 text-gray-300 transition-all text-xs flex items-center gap-1"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-dark-950/90 p-4 rounded-xl border border-white/10 font-mono text-xs text-gray-100 leading-relaxed whitespace-pre-wrap break-words selection:bg-brand-500 selection:text-white shadow-inner">
            {outputText ? (
              <span>{outputText}</span>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic text-center p-4">
                No execution output yet for this node. Click "Execute Swarm" in top toolbar to run.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRACE LOG FEED */}
      {activeTab === 'trace' && (
        <div className="flex-1 flex flex-col space-y-2 overflow-y-auto font-mono text-[11px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" /> WebSocket Stream Trace ({nodeEvents.length} events)
          </div>

          {nodeEvents.length === 0 ? (
            <div className="p-4 text-center text-gray-400 italic bg-dark-900 rounded-xl border border-white/5">
              No trace events recorded for this node yet.
            </div>
          ) : (
            nodeEvents.map((evt, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-dark-900 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold px-1.5 py-0.5 rounded ${
                    evt.type === 'start' ? 'bg-amber-500/20 text-amber-400' :
                    evt.type === 'end' ? 'bg-emerald-500/20 text-emerald-400' :
                    evt.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-brand-500/20 text-brand-cyan'
                  }`}>
                    {evt.type.toUpperCase()}
                  </span>
                  <span className="text-gray-400">{evt.timestamp}</span>
                </div>
                <div className="text-gray-300 text-[10px] truncate">
                  {evt.type === 'token' ? `Token chunk: "${evt.payload?.token}"` : JSON.stringify(evt.payload || {})}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 mt-4 border-t border-white/10 flex gap-2">
        <button
          onClick={() => duplicateNode(id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-dark-700 text-gray-200 hover:bg-dark-600 border border-white/5 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </button>

        <button
          onClick={() => deleteNode(id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </aside>
  );
};
