import React from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Bot, Wrench, GitFork, Layers, Plus, Info } from 'lucide-react';

const nodePaletteItems = [
  {
    type: 'agent',
    label: 'AI Agent Node',
    description: 'LLM Reasoning Node with custom prompts & swapped models (Claude, OpenAI, Gemini).',
    icon: Bot,
    gradient: 'from-brand-500 to-brand-purple',
    badge: 'Core',
  },
  {
    type: 'tool',
    label: 'MCP Tool Node',
    description: 'Executes external MCP Server tools (files, APIs, web search).',
    icon: Wrench,
    gradient: 'from-amber-500 to-orange-600',
    badge: 'MCP',
  },
  {
    type: 'condition',
    label: 'Branch Condition',
    description: 'Evaluates logical rules to dynamically direct workflow paths.',
    icon: GitFork,
    gradient: 'from-rose-500 to-red-600',
    badge: 'Logic',
  },
  {
    type: 'merge',
    label: 'Branch Merge',
    description: 'Combines outputs from multiple concurrent parallel branches.',
    icon: Layers,
    gradient: 'from-purple-500 to-indigo-600',
    badge: 'Flow',
  },
];

export const Sidebar = () => {
  const { addNode } = useWorkflowStore();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 border-r border-white/10 bg-dark-800/90 backdrop-blur-xl p-4 flex flex-col h-[calc(100vh-4rem)] z-10 select-none">
      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span>Node Palette</span>
        </h2>
        <p className="text-[11px] text-gray-400 mt-1">
          Drag nodes onto the canvas or click <Plus className="inline w-3 h-3 text-brand-500" /> to add.
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {nodePaletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              onClick={() => addNode(item.type)}
              className="group relative rounded-xl border border-white/10 bg-dark-900/80 hover:bg-dark-700 p-3.5 cursor-grab active:cursor-grabbing hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-100 group-hover:text-brand-cyan transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                  {item.badge}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-snug">
                {item.description}
              </p>

              <div className="mt-2 flex justify-end">
                <span className="text-[10px] text-brand-500 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3" /> Add to Canvas
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <span>Connect output handles to input handles to define DAG execution flow.</span>
      </div>
    </aside>
  );
};
