import asyncio
import json
from typing import Dict, Any, Callable, List, Optional
from backend.orchestrator.graph import GraphDefinition, GraphNode
from backend.agents.base_agent import BaseAgent
from backend.mcp.mcp_client import mcp_client_manager

class GraphExecutor:
    def __init__(self, graph_data: Dict[str, Any], event_callback: Callable[[str, Dict[str, Any]], Any]):
        if isinstance(graph_data, GraphDefinition):
            self.graph = graph_data
        else:
            self.graph = GraphDefinition(**graph_data)

        self.event_callback = event_callback
        self.node_outputs: Dict[str, Any] = {}
        self.node_states: Dict[str, str] = {node.id: "idle" for node in self.graph.nodes}
        self.node_events: Dict[str, asyncio.Event] = {node.id: asyncio.Event() for node in self.graph.nodes}

    async def _emit_event(self, event_type: str, payload: Dict[str, Any]):
        if asyncio.iscoroutinefunction(self.event_callback):
            await self.event_callback(event_type, payload)
        else:
            self.event_callback(event_type, payload)

    async def execute(self):
        """Walk the DAG and run nodes respecting dependencies and concurrent branches."""
        await self._emit_event("run_start", {"node_count": len(self.graph.nodes)})

        tasks = [asyncio.create_task(self._run_node(node)) for node in self.graph.nodes]
        await asyncio.gather(*tasks, return_exceptions=True)

        failed_nodes = [nid for nid, state in self.node_states.items() if state == "error"]
        status = "failed" if failed_nodes else "completed"

        await self._emit_event("run_end", {
            "status": status,
            "failed_nodes": failed_nodes,
            "outputs": {k: str(v)[:500] for k, v in self.node_outputs.items()}
        })

    async def _run_node(self, node: GraphNode):
        incoming_edges = self.graph.get_incoming_edges(node.id)
        parent_ids = [edge.source for edge in incoming_edges]

        for pid in parent_ids:
            if pid in self.node_events:
                await self.node_events[pid].wait()

        if self.node_states[node.id] == "skipped":
            await self._emit_event("skip", {"node_id": node.id, "reason": "Branch not taken"})
            self.node_events[node.id].set()
            return

        parent_failed = any(self.node_states.get(pid) == "error" for pid in parent_ids)
        if parent_failed:
            self.node_states[node.id] = "error"
            await self._emit_event("error", {
                "node_id": node.id,
                "error": "Aborted due to upstream parent failure"
            })
            self.node_events[node.id].set()
            return

        upstream_inputs = {}
        for edge in incoming_edges:
            parent_node = self.graph.get_node(edge.source)
            parent_label = parent_node.data.label if parent_node else edge.source
            if edge.source in self.node_outputs:
                upstream_inputs[parent_label] = self.node_outputs[edge.source]

        self.node_states[node.id] = "running"
        try:
            if node.type == "agent":
                await self._execute_agent_node(node, upstream_inputs)
            elif node.type == "tool":
                await self._execute_tool_node(node, upstream_inputs)
            elif node.type == "condition":
                await self._execute_condition_node(node, upstream_inputs)
            elif node.type == "merge":
                await self._execute_merge_node(node, upstream_inputs)
            else:
                raise ValueError(f"Unknown node type: {node.type}")

            self.node_states[node.id] = "done"

        except Exception as e:
            self.node_states[node.id] = "error"
            await self._emit_event("error", {
                "node_id": node.id,
                "error": str(e)
            })

        finally:
            self.node_events[node.id].set()

    async def _execute_agent_node(self, node: GraphNode, upstream_inputs: Dict[str, Any]):
        cfg = node.data.config
        agent = BaseAgent(
            node_id=node.id,
            label=node.data.label,
            system_prompt=cfg.system_prompt or "",
            model_provider=cfg.model_provider or "anthropic",
            model_name=cfg.model_name or "claude-3-5-sonnet-20241022",
            temperature=cfg.temperature if cfg.temperature is not None else 0.7
        )

        async def stream_callback(event_type: str, payload: Dict[str, Any]):
            await self._emit_event(event_type, payload)

        output = await agent.execute_stream(upstream_inputs, stream_callback)
        self.node_outputs[node.id] = output

    async def _execute_tool_node(self, node: GraphNode, upstream_inputs: Dict[str, Any]):
        cfg = node.data.config
        server = cfg.mcp_server or "filesystem"
        tool_name = cfg.tool_name or "read_file"
        tool_args = dict(cfg.tool_args or {})

        # Dynamically extract upstream agent output to override search query / path if available
        if upstream_inputs:
            upstream_text = "\n".join(str(v).strip() for v in upstream_inputs.values() if v)
            if upstream_text:
                if "query" in tool_name or "search" in tool_name or "fetch" in tool_name:
                    tool_args["query"] = upstream_text.replace("\n", " ")[:150]
                elif "file" in tool_name or "directory" in tool_name:
                    if not tool_args.get("path"):
                        tool_args["path"] = "."

        await self._emit_event("start", {"node_id": node.id, "label": node.data.label})
        await self._emit_event("tool_call", {
            "node_id": node.id,
            "server": server,
            "tool": tool_name,
            "args": tool_args
        })

        # Real MCP Tool Execution with dynamic parameters
        tool_result = await mcp_client_manager.call_tool(server, tool_name, tool_args)

        await self._emit_event("tool_result", {
            "node_id": node.id,
            "result": tool_result
        })
        await self._emit_event("end", {
            "node_id": node.id,
            "output": tool_result
        })

        self.node_outputs[node.id] = tool_result

    async def _execute_condition_node(self, node: GraphNode, upstream_inputs: Dict[str, Any]):
        cfg = node.data.config
        expression = cfg.expression or ""

        await self._emit_event("start", {"node_id": node.id, "label": node.data.label})

        combined_text = "\n".join(str(v) for v in upstream_inputs.values())
        is_true = True
        if "fail" in expression.lower() or "error" in expression.lower():
            is_true = "error" not in combined_text.lower() and "fail" not in combined_text.lower()

        chosen_handle = "true" if is_true else "false"

        outgoing_edges = self.graph.get_outgoing_edges(node.id)
        for edge in outgoing_edges:
            if edge.sourceHandle and edge.sourceHandle != chosen_handle:
                self.node_states[edge.target] = "skipped"

        output_msg = f"Condition evaluated '{expression}' -> {chosen_handle.upper()}"
        await self._emit_event("end", {
            "node_id": node.id,
            "output": output_msg,
            "chosen_branch": chosen_handle
        })

        self.node_outputs[node.id] = output_msg

    async def _execute_merge_node(self, node: GraphNode, upstream_inputs: Dict[str, Any]):
        cfg = node.data.config
        strategy = cfg.merge_strategy or "combine_dict"

        await self._emit_event("start", {"node_id": node.id, "label": node.data.label})

        if strategy == "concat_text":
            merged_output = "\n\n---\n\n".join(
                f"### {label}\n{val}" for label, val in upstream_inputs.items()
            )
        else:
            merged_output = json.dumps(upstream_inputs, indent=2)

        await self._emit_event("end", {
            "node_id": node.id,
            "output": merged_output
        })

        self.node_outputs[node.id] = merged_output
