import asyncio
import json
from typing import Dict, Set

class ExecutionStreamManager:
    """Manages active WebSocket connections per run_id and broadcasts trace events."""
    def __init__(self):
        self.connections: Dict[str, Set[Any]] = {}

    def register(self, run_id: str, ws):
        if run_id not in self.connections:
            self.connections[run_id] = set()
        self.connections[run_id].add(ws)

    def unregister(self, run_id: str, ws):
        if run_id in self.connections:
            self.connections[run_id].discard(ws)
            if not self.connections[run_id]:
                del self.connections[run_id]

    def broadcast(self, run_id: str, event_type: str, payload: dict):
        if run_id not in self.connections:
            return

        message = json.dumps({"type": event_type, "payload": payload})
        dead_sockets = set()
        for ws in self.connections[run_id]:
            try:
                ws.send(message)
            except Exception:
                dead_sockets.add(ws)

        for ws in dead_sockets:
            self.connections[run_id].discard(ws)

stream_manager = ExecutionStreamManager()
