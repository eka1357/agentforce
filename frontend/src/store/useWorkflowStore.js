import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { saveWorkflow as saveWorkflowApi, fetchWorkflow as fetchWorkflowApi, fetchWorkflows as fetchWorkflowsApi } from '../api/client';
import { COMPANY_RESEARCH_TEMPLATE } from '../templates/companyResearchSwarm';
import { SIMPLE_LINEAR_TEMPLATE } from '../templates/simpleLinearPipeline';
import { MCP_TOOL_PIPELINE_TEMPLATE } from '../templates/mcpToolPipeline';

export const useWorkflowStore = create((set, get) => ({
  workflowId: 'company-research-swarm',
  workflowName: 'Company Research Agent Swarm',
  workflowDescription: 'Multi-agent swarm analyzing financials, news, competitors, and hiring trends.',
  nodes: COMPANY_RESEARCH_TEMPLATE.graph_json.nodes,
  edges: COMPANY_RESEARCH_TEMPLATE.graph_json.edges,
  selectedNodeId: null,
  isInspectorExpanded: false,
  isSaving: false,
  savedWorkflows: [],

  toggleInspectorExpanded: (expand) => {
    set({ isInspectorExpanded: expand !== undefined ? expand : !get().isInspectorExpanded });
  },

  expandNodeOutput: (id) => {
    set({ selectedNodeId: id, isInspectorExpanded: true });
  },

  // React Flow Handlers
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  // Node CRUD operations
  addNode: (type, position) => {
    const id = `node-${Date.now()}`;
    const labels = {
      agent: 'New Agent',
      tool: 'MCP Tool Node',
      condition: 'Branch Condition',
      merge: 'Branch Merge'
    };

    const defaultConfig = {
      agent: {
        system_prompt: 'You are a specialized agent.',
        model_provider: 'openai',
        model_name: 'openai/gpt-oss-20b:free',
        temperature: 0.7
      },
      tool: {
        mcp_server: 'web_search',
        tool_name: 'fetch_job_postings',
        tool_args: {}
      },
      condition: {
        expression: 'output.contains("SUCCESS")'
      },
      merge: {
        merge_strategy: 'combine_dict'
      }
    };

    const newNode = {
      id,
      type,
      position: position || { x: 250, y: 150 },
      data: {
        label: labels[type] || 'New Node',
        type,
        config: defaultConfig[type] || {}
      }
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id
    });
  },

  updateNodeData: (id, dataUpdate) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...dataUpdate,
              config: {
                ...node.data.config,
                ...(dataUpdate.config || {})
              }
            }
          };
        }
        return node;
      })
    });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId
    });
  },

  duplicateNode: (id) => {
    const targetNode = get().nodes.find((node) => node.id === id);
    if (!targetNode) return;

    const newId = `node-${Date.now()}`;
    const newNode = {
      ...targetNode,
      id: newId,
      position: {
        x: targetNode.position.x + 30,
        y: targetNode.position.y + 30
      },
      data: JSON.parse(JSON.stringify(targetNode.data))
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: newId
    });
  },

  setWorkflowMeta: (name, description) => {
    set({ workflowName: name, workflowDescription: description });
  },

  // Templates
  loadTemplate: (templateKey) => {
    let tpl = COMPANY_RESEARCH_TEMPLATE;
    if (templateKey === 'simple-linear') {
      tpl = SIMPLE_LINEAR_TEMPLATE;
    } else if (templateKey === 'mcp-tool') {
      tpl = MCP_TOOL_PIPELINE_TEMPLATE;
    }

    set({
      workflowId: tpl.id,
      workflowName: tpl.name,
      workflowDescription: tpl.description,
      nodes: tpl.graph_json.nodes,
      edges: tpl.graph_json.edges,
      selectedNodeId: null
    });
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null
    });
  },

  // API Async Actions
  saveCurrentWorkflow: async () => {
    set({ isSaving: true });
    try {
      const payload = {
        id: get().workflowId,
        name: get().workflowName,
        description: get().workflowDescription,
        graph_json: {
          nodes: get().nodes,
          edges: get().edges
        }
      };
      await saveWorkflowApi(payload);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      set({ isSaving: false });
    }
  },

  loadWorkflowsList: async () => {
    try {
      const list = await fetchWorkflowsApi();
      set({ savedWorkflows: list });
    } catch (err) {
      console.error('Failed to load workflows list:', err);
    }
  },

  loadWorkflowById: async (id) => {
    try {
      const wf = await fetchWorkflowApi(id);
      if (wf && wf.graph_json) {
        set({
          workflowId: wf.id,
          workflowName: wf.name,
          workflowDescription: wf.description || '',
          nodes: wf.graph_json.nodes || [],
          edges: wf.graph_json.edges || [],
          selectedNodeId: null
        });
      }
    } catch (err) {
      console.error(`Failed to load workflow ${id}:`, err);
    }
  }
}));
