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
            system_prompt: "You are a Senior Financial Analyst. Analyze revenue trajectory, gross margins, EBITDA growth, cash flow health, and valuation multiples. Output a concise financial briefing.",
            model_provider: "anthropic",
            model_name: "meta-llama/llama-3.3-70b-instruct:free",
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
            system_prompt: "You are a Media & News Intelligence Lead. Summarize recent press headlines, product launches, brand perception, and regulatory sentiment.",
            model_provider: "openai",
            model_name: "openai/gpt-oss-20b:free",
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
            system_prompt: "You are a Competitive Intelligence Officer. Map out key market rivals, market share shifts, defensible moats, and strategic counter-moves.",
            model_provider: "gemini",
            model_name: "google/gemini-2.0-flash-exp:free",
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
            tool_args: { query: "AI Agent Orchestration hiring trends engineering roles" }
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
            system_prompt: "You are a Principal Strategic Analyst preparing an Executive Board Dossier. You will receive 4 intelligence streams: Financials, News, Competitors, and Hiring MCP Tool.\n\nYOUR TASK: Do NOT paste raw chunks. Synthesize all streams into a single, seamless, polished Markdown Executive Brief with these clear sections:\n# Executive Dossier: Strategic & Market Intelligence\n## 1. Executive Summary & Core Verdict\n## 2. Financial Performance & Revenue Trajectory\n## 3. Market Sentiment & Media Highlights\n## 4. Competitive Positioning & Threat Analysis\n## 5. Talent Acquisition & Engineering Signals\n## 6. Strategic Recommendations & Action Items",
            model_provider: "openai",
            model_name: "openai/gpt-oss-20b:free",
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
