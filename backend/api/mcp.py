from flask import Blueprint, jsonify, request
from backend.mcp.mcp_client import mcp_client_manager

mcp_bp = Blueprint("mcp", __name__, url_prefix="/api/mcp")

@mcp_bp.route("/servers", methods=["GET"])
def get_mcp_servers():
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        servers = loop.run_until_complete(mcp_client_manager.list_servers())
        return jsonify(servers), 200
    finally:
        loop.close()

@mcp_bp.route("/health/<server_name>", methods=["GET"])
def get_mcp_health(server_name):
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        health = loop.run_until_complete(mcp_client_manager.get_server_health(server_name))
        return jsonify(health), 200
    finally:
        loop.close()

@mcp_bp.route("/call", methods=["POST"])
def call_mcp_tool_test():
    data = request.get_json() or {}
    server_name = data.get("server", "filesystem")
    tool_name = data.get("tool", "list_directory")
    tool_args = data.get("args", {})

    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(mcp_client_manager.call_tool(server_name, tool_name, tool_args))
        return jsonify({"server": server_name, "tool": tool_name, "result": result}), 200
    finally:
        loop.close()
