import pytest
import asyncio
import json
from backend.mcp.mcp_client import mcp_client_manager

@pytest.mark.asyncio
async def test_mcp_list_servers():
    servers = await mcp_client_manager.list_servers()
    assert len(servers) >= 3
    server_names = [s['name'] for s in servers]
    assert 'filesystem' in server_names
    assert 'web_search' in server_names

@pytest.mark.asyncio
async def test_mcp_filesystem_tool():
    res = await mcp_client_manager.call_tool("filesystem", "list_directory", {"path": "."})
    assert "count" in res or "items" in res or "MCP" in res

@pytest.mark.asyncio
async def test_mcp_web_search_tool():
    res = await mcp_client_manager.call_tool("web_search", "fetch_job_postings", {"query": "AI Engineer"})
    parsed = json.loads(res)
    assert parsed["mcp_server"] == "web_search"
    assert "results" in parsed
