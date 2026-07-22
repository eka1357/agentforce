import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../store/useWorkflowStore';
import { useExecutionStore } from '../execution/useExecutionStore';
import { AgentNode } from '../nodes/AgentNode';
import { ToolNode } from '../nodes/ToolNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { MergeNode } from '../nodes/MergeNode';
import { HumanNode } from '../nodes/HumanNode';
import { Play, CheckCircle2, Loader2, AlertTriangle, Layers, Activity, Sparkles, Clock } from 'lucide-react';

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
  merge: MergeNode,
  human: HumanNode,
};

const FlowCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useWorkflowStore();

  const { isExecuting, runStatus, nodeStates } = useExecutionStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect for execution duration
  useEffect(() => {
    let timer;
    if (isExecuting) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExecuting]);

  // Compute execution stats
  const totalNodes = nodes.length;
  const completedNodes = Object.values(nodeStates).filter((s) => s.status === 'done').length;
  const runningNodes = Object.values(nodeStates).filter((s) => s.status === 'running').length;
  const errorNodes = Object.values(nodeStates).filter((s) => s.status === 'error').length;

  // Dynamic edge styling based on execution status of source nodes
  const dynamicEdges = edges.map((edge) => {
    const sourceState = nodeStates[edge.source]?.status || 'idle';
    let strokeColor = '#6366F1'; // default purple
    let strokeWidth = 2;
    let animated = true;

    if (sourceState === 'running') {
      strokeColor = '#F59E0B'; // glowing amber
      strokeWidth = 3;
    } else if (sourceState === 'done') {
      strokeColor = '#10B981'; // emerald green
      strokeWidth = 2.5;
    } else if (sourceState === 'error') {
      strokeColor = '#F43F5E'; // rose red
      strokeWidth = 2.5;
    }

    return {
      ...edge,
      animated,
      style: { stroke: strokeColor, strokeWidth }
    };
  });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      {/* Floating Execution HUD Stats Bar */}
      {(isExecuting || runStatus !== 'idle') && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-dark-800/90 backdrop-blur-2xl border border-white/15 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-5 text-xs text-gray-200 font-mono animate-fade-in select-none">
          <div className="flex items-center gap-2">
            {isExecuting ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" /> Executing Pipeline...
              </span>
            ) : runStatus === 'completed' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Pipeline Complete
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertTriangle className="w-4 h-4" /> Pipeline Failed
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-300">
              <Layers className="w-3.5 h-3.5 text-brand-purple" />
              Progress: <strong className="text-white">{completedNodes}/{totalNodes}</strong> Nodes
            </span>

            {runningNodes > 0 && (
              <span className="text-amber-400">
                ({runningNodes} Active)
              </span>
            )}

            {errorNodes > 0 && (
              <span className="text-rose-400">
                ({errorNodes} Failed)
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1 text-brand-cyan">
            <Clock className="w-3.5 h-3.5" />
            <span>Time: <strong>{elapsedSeconds}s</strong></span>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={dynamicEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#1F2937" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'agent') return '#6366F1';
            if (n.type === 'tool') return '#F59E0B';
            if (n.type === 'condition') return '#F43F5E';
            if (n.type === 'merge') return '#8B5CF6';
            return '#374151';
          }}
          maskColor="rgba(11, 15, 23, 0.7)"
          className="!bg-dark-800 !border !border-white/10 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
};

export const Canvas = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
};
