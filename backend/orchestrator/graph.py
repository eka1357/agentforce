from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

NodeType = Literal["agent", "tool", "condition", "merge"]

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
