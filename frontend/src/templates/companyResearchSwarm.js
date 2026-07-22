export const COMPANY_RESEARCH_TEMPLATE = {
  id: "company-research-swarm",
  name: "Company Research Agent Swarm",
  description: "Multi-agent swarm analyzing financials, recent news, competitors, and hiring trends to build an executive report.",
  graph_json: {
    nodes: [
      {
        id: "node-1",
        type: "agent",
        position: { x: 80, y: 150 },
        data: {
          label: "Financial Analyst",
          type: "agent",
          config: {
            system_prompt: "You analyze company balance sheets, revenue growth, profit margins, and key financial ratios.",
            model_provider: "anthropic",
            model_name: "claude-3-5-sonnet-20241022",
            temperature: 0.3
          }
        }
      },
      {
        id: "node-2",
        type: "agent",
        position: { x: 80, y: 320 },
        data: {
          label: "News Intelligence",
          type: "agent",
          config: {
            system_prompt: "You gather recent press releases, media coverage, product launches, and market sentiment.",
            model_provider: "openai",
            model_name: "gpt-4o",
            temperature: 0.5
          }
        }
      },
      {
        id: "node-3",
        type: "agent",
        position: { x: 80, y: 490 },
        data: {
          label: "Competitor Intelligence",
          type: "agent",
          config: {
            system_prompt: "You map out key market competitors, market share dynamics, and strategic positioning.",
            model_provider: "gemini",
            model_name: "gemini-1.5-pro",
            temperature: 0.4
          }
        }
      },
      {
        id: "node-4",
        type: "tool",
        position: { x: 80, y: 660 },
        data: {
          label: "Hiring Trends MCP Tool",
          type: "tool",
          config: {
            mcp_server: "web_search",
            tool_name: "fetch_job_postings",
            tool_args: { query: "open roles engineering product" }
          }
        }
      },
      {
        id: "node-5",
        type: "merge",
        position: { x: 480, y: 380 },
        data: {
          label: "Synthesize Data Stream",
          type: "merge",
          config: {
            merge_strategy: "combine_dict"
          }
        }
      },
      {
        id: "node-6",
        type: "agent",
        position: { x: 800, y: 380 },
        data: {
          label: "Executive Report Writer",
          type: "agent",
          config: {
            system_prompt: "You synthesize financial data, news, competitive intelligence, and hiring signals into a polished executive dossier.",
            model_provider: "anthropic",
            model_name: "claude-3-5-sonnet-20241022",
            temperature: 0.7
          }
        }
      }
    ],
    edges: [
      { id: "e1-5", source: "node-1", target: "node-5" },
      { id: "e2-5", source: "node-2", target: "node-5" },
      { id: "e3-5", source: "node-3", target: "node-5" },
      { id: "e4-5", source: "node-4", target: "node-5" },
      { id: "e5-6", source: "node-5", target: "node-6" }
    ]
  }
};
