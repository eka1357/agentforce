from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

NodeType = Literal["agent", "tool", "condition", "merge", "human"]

class NodeConfig(BaseModel):
    # Agent config
    system_prompt: Optional[str] = ""
    model_provider: Optional[str] = "anthropic"  # anthropic, openai, gemini
    model_name: Optional[str] = "claude-3-5-sonnet-20241022"
    temperature: Optional[float] = 0.7
    
    # Tool config
    mcp_server: Optional[str] = ""
    tool_name: Optional[str] = ""
    tool_args: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Condition config
    expression: Optional[str] = ""
    
    # Human Approval config
    approval_prompt: Optional[str] = "Please review the upstream output and approve or provide feedback."
    require_feedback: Optional[bool] = False

    # General / Merge config
    merge_strategy: Optional[str] = "combine_dict"

class NodeData(BaseModel):
    label: str
    type: NodeType
    config: NodeConfig = Field(default_factory=NodeConfig)

class GraphNode(BaseModel):
    id: str
    type: NodeType
    position: Dict[str, float]
    data: NodeData

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    condition: Optional[str] = None

class GraphDefinition(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)

    def get_node(self, node_id: str) -> Optional[GraphNode]:
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None

    def get_incoming_edges(self, node_id: str) -> List[GraphEdge]:
        return [edge for edge in self.edges if edge.target == node_id]

    def get_outgoing_edges(self, node_id: str) -> List[GraphEdge]:
        return [edge for edge in self.edges if edge.source == node_id]

    def get_in_degrees(self) -> Dict[str, int]:
        degrees = {node.id: 0 for node in self.nodes}
        for edge in self.edges:
            if edge.target in degrees:
                degrees[edge.target] += 1
        return degrees

    def get_parent_ids(self, node_id: str) -> List[str]:
        return [edge.source for edge in self.get_incoming_edges(node_id)]

    def get_child_ids(self, node_id: str) -> List[str]:
        return [edge.target for edge in self.get_outgoing_edges(node_id)]
