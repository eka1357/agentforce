export const SIMPLE_LINEAR_TEMPLATE = {
  id: "simple-linear-pipeline",
  name: "Simple 2-Node Linear Pipeline",
  description: "Sequential 2-agent pipeline: Topic Writer -> Lead Editor.",
  graph_json: {
    nodes: [
      {
        id: "node-agent-1",
        type: "agent",
        position: { x: 100, y: 250 },
        data: {
          label: "Topic Writer",
          type: "agent",
          config: {
            system_prompt: "You are a creative technology writer. Draft a 2-sentence summary about the future of visual AI agent orchestration platforms.",
            model_provider: "anthropic",
            model_name: "meta-llama/llama-3.3-70b-instruct:free",
            temperature: 0.7
          }
        }
      },
      {
        id: "node-agent-2",
        type: "agent",
        position: { x: 500, y: 250 },
        data: {
          label: "Lead Editor",
          type: "agent",
          config: {
            system_prompt: "You are an executive editor. Take the upstream summary and expand it into a compelling press release headline and key takeaway bullet points.",
            model_provider: "openai",
            model_name: "openai/gpt-oss-20b:free",
            temperature: 0.5
          }
        }
      }
    ],
    edges: [
      {
        id: "e1-2",
        source: "node-agent-1",
        target: "node-agent-2",
        animated: true
      }
    ]
  }
};
