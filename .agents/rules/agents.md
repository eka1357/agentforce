---
trigger: always_on
---

# AGENTS.md — AgentForge

This file gives AI coding agents (Claude Code, Cursor, etc.) the context needed to work on this repo effectively. Read this before making changes.

## Project Overview

AgentForge is a visual multi-agent orchestration platform. Users build agent pipelines on a drag-and-drop canvas (Researcher → Writer → Critic → Tool-caller, etc.), wire in MCP tools per node, and execute the graph with live streaming of each agent's reasoning and tool calls.

**Core value prop:** most agent frameworks are code-only. AgentForge makes agent orchestration visual, inspectable, and swappable (any node can use Claude, GPT, or Gemini) without locking users into one vendor.

## Tech Stack

- **Frontend:** React (Vite), React Flow (canvas/graph UI), Tailwind CSS, WebSocket client for live execution streaming
- **Backend:** Python, Flask, `asyncio` for concurrent agent execution
- **Orchestration:** custom graph executor (sequential, parallel, conditional edges) — not LangGraph, so we fully own execution semantics and can stream intermediate state
- **LLM APIs:** Anthropic Claude, OpenAI, Google Gemini — abstracted behind a single `ModelAdapter` interface so any node can swap providers
- **Tool integration:** MCP (Model Context Protocol) servers, connected per-node
- **Storage:** SQLite for local dev (workflow definitions, run history); Postgres for prod
- **Streaming:** WebSockets for live execution trace (agent thoughts, tool calls, outputs) pushed to the canvas in real time

## Repository Structure

```
agentforge/
├── frontend/
│   ├── src/
│   │   ├── canvas/          # React Flow graph editor, node types, edge logic
│   │   ├── nodes/           # Node components (AgentNode, ToolNode, ConditionNode)
│   │   ├── execution/       # Live trace viewer, WebSocket client
│   │   ├── templates/       # Prebuilt workflow templates (e.g. Company Research Swarm)
│   │   └── api/             # REST/WS client for backend
│   └── package.json
├── backend/
│   ├── orchestrator/
│   │   ├── graph.py         # Graph model: nodes, edges, execution order
│   │   ├── executor.py      # Runs the graph, handles sequential/parallel/conditional flow
│   │   └── stream.py        # WebSocket broadcast of execution events
│   ├── agents/
│   │   ├── base_agent.py    # Base agent class: prompt, tools, model config
│   │   └── model_adapter.py # Unified interface across Claude/OpenAI/Gemini
│   ├── mcp/
│   │   └── mcp_client.py    # MCP server connection + tool invocation
│   ├── api/                 # Flask routes: workflows CRUD, run trigger, run history
│   ├── models/               # SQLAlchemy models
│   └── app.py
├── tests/
└── AGENTS.md
```

## Setup & Commands

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt --break-system-packages
python app.py                     # runs on :5000

# Frontend
cd frontend
npm install
npm run dev                       # runs on :5173

# Tests
cd backend && pytest
cd frontend && npm test
```

Environment variables (`.env`, never commit):
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
DATABASE_URL=
```

## Coding Conventions

- **Python:** type hints everywhere, `black` formatting, functions do one thing. Async by default for anything touching an LLM API or MCP server — never block the event loop on a network call.
- **React:** functional components only, hooks over classes, colocate a node's UI + logic + types in one folder under `nodes/`.
- **No silent failures.** Every agent/tool call that fails must emit a structured error event over the WebSocket stream, not just log to console — the canvas needs to visibly show which node failed and why.
- **Model-agnostic core.** Never hardcode a provider inside `orchestrator/`. All provider-specific logic lives behind `ModelAdapter`. If you catch yourself importing an Anthropic/OpenAI SDK outside `agents/model_adapter.py`, stop and refactor.
- **MCP tools are first-class.** Treat MCP tool calls the same way as native agent steps in the execution trace — same event schema, same UI treatment.

## Execution Model (read before touching `orchestrator/`)

A workflow is a DAG. Each node is one of: `agent`, `tool`, `condition`, `merge`.

- Execution starts at nodes with no incoming edges.
- `executor.py` walks the graph, firing independent branches concurrently via `asyncio.gather`.
- Every step emits an event: `{node_id, type: "start"|"token"|"tool_call"|"tool_result"|"end"|"error", payload}` broadcast over WebSocket immediately — the frontend renders these live, not after the run completes.
- Conditional edges evaluate a small expression against the upstream node's output to decide which branch to take next.

When adding a new node type, you must: (1) define its schema in `graph.py`, (2) handle it in `executor.py`, (3) add a corresponding React component in `frontend/src/nodes/`, (4) emit trace events consistent with the schema above.

## What "done" looks like for a feature

- Works end-to-end from canvas click → backend execution → live trace visible in UI
- No provider lock-in introduced
- Errors surface visibly on the canvas, not just in server logs
- Has at least one test in `tests/` if it touches `orchestrator/` or `agents/`

## Current Milestone Priorities

1. Canvas MVP: drag/drop nodes, connect edges, save/load workflow JSON
2. Backend executor: run a linear 3-node pipeline end-to-end with streaming
3. MCP adapter: connect one real MCP server (filesystem or web search) and call it from a tool node
4. Flagship template: "Company Research Agent Swarm" (financials / news / competitors / hiring → merge into report)
5. Multi-provider swap: same workflow runnable with Claude, GPT, or Gemini per node

## Non-goals (don't build these unless explicitly asked)

- User auth / multi-tenant accounts (single-user local tool for now)
- A plugin marketplace for third-party node types
- Mobile-responsive canvas (desktop-only for v1)