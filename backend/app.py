import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from backend.models.database import init_db
from backend.api.workflows import workflows_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Database tables
init_db()

# Register Blueprints
app.register_blueprint(workflows_bp)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "AgentForge Backend", "version": "1.0.0"}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
