export const MCP_TOOL_PIPELINE_TEMPLATE = {
  id: "mcp-tool-pipeline",
  name: "Agent + MCP Tool Pipeline",
  description: "3-node pipeline: Query Writer -> MCP Tool Invocation -> Agent Summarizer.",
  graph_json: {
    nodes: [
      {
        id: "node-1",
        type: "agent",
        position: { x: 80, y: 250 },
        data: {
          label: "Query Prompt Writer",
          type: "agent",
          config: {
            system_prompt: "Write a short 1-line query specifying the search topic for open engineering roles in 2026.",
            model_provider: "anthropic",
            model_name: "meta-llama/llama-3.3-70b-instruct:free",
            temperature: 0.5
          }
        }
      },
      {
        id: "node-2",
        type: "tool",
        position: { x: 440, y: 250 },
        data: {
          label: "MCP Hiring Tool",
          type: "tool",
          config: {
            mcp_server: "web_search",
            tool_name: "fetch_job_postings",
            tool_args: { query: "Senior Agentic AI Engineer open roles" }
          }
        }
      },
      {
        id: "node-3",
        type: "agent",
        position: { x: 800, y: 250 },
        data: {
          label: "Executive Summarizer",
          type: "agent",
          config: {
            system_prompt: "You are an executive recruiter. Synthesize the incoming MCP tool results into a bulleted 2-sentence executive summary.",
            model_provider: "openai",
            model_name: "openai/gpt-oss-20b:free",
            temperature: 0.5
          }
        }
      }
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2", animated: true },
      { id: "e2-3", source: "node-2", target: "node-3", animated: true }
    ]
  }
};
