import React from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { X, Trash2, Copy, Sliders, Bot, Wrench, GitFork, Layers, Cpu, Sparkles } from 'lucide-react';

export const NodeInspector = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, deleteNode, duplicateNode } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const { id, type, data } = selectedNode;
  const { label, config = {} } = data;

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

  return (
    <div className="w-80 border-l border-white/10 bg-dark-800/95 backdrop-blur-xl p-5 flex flex-col h-[calc(100vh-4rem)] z-10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-purple" />
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Node Inspector</h2>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Title & Type Badge */}
      <div className="space-y-4 flex-1">
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Node Label
          </label>
          <input
            type="text"
            value={label || ''}
            onChange={handleLabelChange}
            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-gray-100 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Type-specific Settings */}
        {type === 'agent' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-purple" />
              <div>
                <h4 className="text-xs font-bold text-gray-100">LLM Agent Configuration</h4>
                <p className="text-[10px] text-gray-400">Model-agnostic reasoning node</p>
              </div>
            </div>

            {/* Model Provider */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Model Provider
              </label>
              <select
                value={config.model_provider || 'anthropic'}
                onChange={(e) => handleConfigChange('model_provider', e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
              >
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={config.model_name || ''}
                onChange={(e) => handleConfigChange('model_name', e.target.value)}
                placeholder="e.g. claude-3-5-sonnet-20241022"
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                System Prompt
              </label>
              <textarea
                rows={5}
                value={config.system_prompt || ''}
                onChange={(e) => handleConfigChange('system_prompt', e.target.value)}
                placeholder="Instructions for the agent..."
                className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-brand-500 transition-all font-mono leading-relaxed"
              />
            </div>

            {/* Temperature Slider */}
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
                MCP Server Name
              </label>
              <input
                type="text"
                value={config.mcp_server || ''}
                onChange={(e) => handleConfigChange('mcp_server', e.target.value)}
                placeholder="e.g. filesystem, web_search"
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Tool Name
              </label>
              <input
                type="text"
                value={config.tool_name || ''}
                onChange={(e) => handleConfigChange('tool_name', e.target.value)}
                placeholder="e.g. read_file, search_web"
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-brand-cyan focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {type === 'condition' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-rose-400" />
              <div>
                <h4 className="text-xs font-bold text-gray-100">Condition Expression</h4>
                <p className="text-[10px] text-gray-400">Evaluates upstream payload</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Rule Expression
              </label>
              <input
                type="text"
                value={config.expression || ''}
                onChange={(e) => handleConfigChange('expression', e.target.value)}
                placeholder="e.g. output.confidence > 0.8"
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
        )}

        {type === 'merge' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold text-gray-100">Merge Strategy</h4>
                <p className="text-[10px] text-gray-400">Combine parallel inputs</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Strategy
              </label>
              <select
                value={config.merge_strategy || 'combine_dict'}
                onChange={(e) => handleConfigChange('merge_strategy', e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-400"
              >
                <option value="combine_dict">Combine Dictionary</option>
                <option value="concat_text">Concatenate Text Output</option>
                <option value="wait_all">Wait for All (List)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-6 border-t border-white/10 flex gap-2">
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
    </div>
  );
};
