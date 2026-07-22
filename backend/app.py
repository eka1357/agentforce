import os
import sys

# Ensure root workspace directory is in sys.path for backend package imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sock import Sock
from dotenv import load_dotenv

load_dotenv()

from backend.models.database import init_db
from backend.api.workflows import workflows_bp
from backend.api.mcp import mcp_bp
from backend.orchestrator.stream import stream_manager

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
sock = Sock(app)

# Initialize Database tables
init_db()

# Register REST Blueprints
app.register_blueprint(workflows_bp)
app.register_blueprint(mcp_bp)

@sock.route('/ws/execution/<run_id>')
def execution_socket(ws, run_id):
    stream_manager.register(run_id, ws)
    try:
        while True:
            # Keep connection open and receive ping/heartbeat messages
            data = ws.receive()
            if data is None:
                break
    finally:
        stream_manager.unregister(run_id, ws)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "AgentForge Backend", "version": "1.0.0"}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
