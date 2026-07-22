from backend.orchestrator.graph import GraphDefinition, GraphNode, GraphEdge

def test_graph_validation():
  sample_data = {
    "nodes": [
      {
        "id": "node-1",
        "type": "agent",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "Test Agent",
          "type": "agent",
          "config": {
            "system_prompt": "Test Prompt",
            "model_provider": "anthropic",
            "model_name": "claude-3-5-sonnet-20241022",
            "temperature": 0.5
          }
        }
      }
    ],
    "edges": []
  }

  graph = GraphDefinition(**sample_data)
  assert len(graph.nodes) == 1
  assert graph.nodes[0].id == "node-1"
  assert graph.nodes[0].data.config.model_provider == "anthropic"

def test_human_node_validation():
  sample_data = {
    "nodes": [
      {
        "id": "human-1",
        "type": "human",
        "position": {"x": 200, "y": 200},
        "data": {
          "label": "Human Checkpoint",
          "type": "human",
          "config": {
            "approval_prompt": "Approve this report?"
          }
        }
      }
    ],
    "edges": []
  }

  graph = GraphDefinition(**sample_data)
  assert len(graph.nodes) == 1
  assert graph.nodes[0].type == "human"
  assert graph.nodes[0].data.config.approval_prompt == "Approve this report?"
