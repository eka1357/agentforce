import pytest
import asyncio
from backend.orchestrator.executor import GraphExecutor
from backend.agents.model_adapter import ModelAdapterFactory, AnthropicAdapter

@pytest.mark.asyncio
async def test_model_adapter_factory():
  adapter = ModelAdapterFactory.get_adapter("anthropic")
  assert isinstance(adapter, AnthropicAdapter)

@pytest.mark.asyncio
async def test_linear_executor():
  graph_data = {
    "nodes": [
      {
        "id": "node-1",
        "type": "agent",
        "position": {"x": 0, "y": 0},
        "data": {
          "label": "Agent 1",
          "type": "agent",
          "config": {
            "system_prompt": "Prompt 1",
            "model_provider": "anthropic",
            "temperature": 0.5
          }
        }
      },
      {
        "id": "node-2",
        "type": "agent",
        "position": {"x": 200, "y": 0},
        "data": {
          "label": "Agent 2",
          "type": "agent",
          "config": {
            "system_prompt": "Prompt 2",
            "model_provider": "openai",
            "temperature": 0.5
          }
        }
      }
    ],
    "edges": [
      {"id": "e1", "source": "node-1", "target": "node-2"}
    ]
  }

  events = []
  async def mock_callback(event_type, payload):
    events.append((event_type, payload))

  executor = GraphExecutor(graph_data, mock_callback)
  await executor.execute()

  assert executor.node_states["node-1"] == "done"
  assert executor.node_states["node-2"] == "done"
  assert len(events) > 0
  event_types = [e[0] for e in events]
  assert "run_start" in event_types
  assert "run_end" in event_types
  assert "start" in event_types
  assert "token" in event_types
  assert "end" in event_types
