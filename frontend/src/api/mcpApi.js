export const fetchMCPServers = async () => {
  try {
    const res = await fetch('/api/mcp/servers');
    if (!res.ok) throw new Error('Failed to fetch MCP servers');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const checkMCPHealth = async (serverName) => {
  try {
    const res = await fetch(`/api/mcp/health/${serverName}`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  } catch (err) {
    return { status: 'error' };
  }
};
