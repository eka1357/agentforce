"""
Execution trace event streaming via WebSocket broadcast.
"""

class ExecutionStream:
    def __init__(self):
        self.clients = set()

    def register(self, client):
        self.clients.add(client)

    def unregister(self, client):
        self.clients.discard(client)

    def broadcast(self, event: dict):
        # Stub for streaming events
        pass
