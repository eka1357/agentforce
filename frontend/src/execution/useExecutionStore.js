import { create } from 'zustand';

export const useExecutionStore = create((set, get) => ({
  runId: null,
  isExecuting: false,
  runStatus: 'idle',
  nodeStates: {},

  resetExecution: () => {
    set({
      runId: null,
      isExecuting: false,
      runStatus: 'idle',
      nodeStates: {}
    });
  },

  setNodeState: (nodeId, stateUpdate) => {
    const current = get().nodeStates[nodeId] || {
      status: 'idle',
      streamedText: '',
      toolTrace: null,
      error: null
    };

    set({
      nodeStates: {
        ...get().nodeStates,
        [nodeId]: {
          ...current,
          ...stateUpdate
        }
      }
    });
  },

  triggerRun: async (workflowId, graphJson) => {
    get().resetExecution();
    set({ isExecuting: true, runStatus: 'running' });

    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph_json: graphJson })
      });

      if (!res.ok) {
        throw new Error(`Failed to trigger workflow run: ${res.statusText}`);
      }

      const data = await res.json();
      const runId = data.run_id;
      set({ runId });

      // Connect to WebSocket stream
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/execution/${runId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WS Connected] Stream active for run ${runId}`);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          const { type, payload } = msg;
          const nodeId = payload?.node_id;

          if (type === 'start' && nodeId) {
            get().setNodeState(nodeId, { status: 'running', streamedText: '', error: null });
          } else if (type === 'token' && nodeId) {
            const currentText = get().nodeStates[nodeId]?.streamedText || '';
            get().setNodeState(nodeId, {
              status: 'running',
              streamedText: currentText + payload.token
            });
          } else if (type === 'tool_call' && nodeId) {
            get().setNodeState(nodeId, {
              status: 'running',
              toolTrace: { call: payload }
            });
          } else if (type === 'tool_result' && nodeId) {
            const currentTrace = get().nodeStates[nodeId]?.toolTrace || {};
            get().setNodeState(nodeId, {
              toolTrace: { ...currentTrace, result: payload.result }
            });
          } else if (type === 'end' && nodeId) {
            get().setNodeState(nodeId, { status: 'done' });
          } else if (type === 'error' && nodeId) {
            get().setNodeState(nodeId, { status: 'error', error: payload.error });
          } else if (type === 'run_end') {
            set({
              isExecuting: false,
              runStatus: payload.status === 'completed' ? 'completed' : 'failed'
            });
            ws.close();
          }
        } catch (err) {
          console.error('[WS Parse Error]:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS Connection Error]:', err);
      };

      ws.onclose = () => {
        console.log('[WS Connection Closed]');
        set({ isExecuting: false });
      };

    } catch (err) {
      console.error('[Run Trigger Error]:', err);
      set({ isExecuting: false, runStatus: 'failed' });
    }
  }
}));
