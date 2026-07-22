# AgentForge — Project Requirements

## 1. Purpose

AgentForge is a visual platform for building, running, and inspecting multi-agent LLM workflows. Users construct agent pipelines on a canvas, attach tools via MCP, and watch execution happen live — without writing orchestration code by hand.

**Primary goal:** demonstrate production-grade agent infrastructure skills (not just agent demos) as a portfolio flagship project.

---

## 2. Functional Requirements

### 2.1 Canvas / Workflow Builder
- FR1: User can add nodes to a canvas: `Agent`, `Tool`, `Condition`, `Merge`
- FR2: User can connect nodes with directional edges to define execution order
- FR3: User can configure each `Agent` node: system prompt, model provider (Claude/GPT/Gemini), temperature, attached tools
- FR4: User can configure each `Tool` node: select an MCP server + specific tool exposed by that server
- FR5: User can save a workflow (name, graph structure, node configs) and reload it later
- FR6: User can duplicate, delete, and rearrange nodes without breaking existing edges
- FR7: User can load a prebuilt template (e.g. "Company Research Agent Swarm") as a starting point

### 2.2 Execution Engine
- FR8: System executes the graph respecting dependencies — a node runs only after all its inputs are ready
- FR9: Independent branches execute concurrently, not sequentially
- FR10: Conditional edges evaluate the upstream node's output against a rule to select the next branch
- FR11: `Merge` nodes combine multiple upstream outputs into a single input for the next node
- FR12: Execution can be started, and a running execution can be cancelled mid-flight
- FR13: Each node's model calls and tool calls are logged with timestamps and full input/output for later inspection

### 2.3 Live Execution Trace
- FR14: While a workflow runs, the UI shows real-time status per node (`idle`, `running`, `done`, `error`)
- FR15: Agent reasoning/output streams token-by-token into the UI as it's generated
- FR16: Tool calls display their inputs and results inline in the trace as they happen
- FR17: If a node errors, the canvas visibly flags that node and shows the error detail on click

### 2.4 MCP Integration
- FR18: User can register an MCP server (name + connection URL/command) in a settings panel
- FR19: Once registered, an MCP server's available tools appear as selectable options on `Tool` nodes
- FR20: Tool node execution actually invokes the MCP server and returns real results into the graph

### 2.5 Multi-Provider Support
- FR21: Any `Agent` node can be configured to use Claude, OpenAI, or Gemini independently of other nodes in the same workflow
- FR22: Switching a node's provider does not require changing the workflow's structure or other nodes' configuration

### 2.6 Run History
- FR23: Every completed (or failed) run is stored with its full trace and is viewable later
- FR24: User can re-run a past workflow with the same or edited inputs

---

## 3. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Execution trace events must reach the UI within ~500ms of occurring (WebSocket push, not polling) |
| Scalability | Support workflows with up to ~20 nodes without redesign; beyond that is a stretch goal, not v1 |
| Reliability | A single node failure must not crash the whole run — the executor isolates and reports it |
| Portability | Runs locally with SQLite by default; must support switching to Postgres via `DATABASE_URL` with no code change |
| Security | API keys never touch the frontend; all provider calls happen server-side |
| Extensibility | Adding a new node type must not require changes to unrelated node types (see AGENTS.md execution model) |
| Observability | Every LLM/tool call is logged with enough detail to debug a failed run after the fact |

---

## 4. Technical Requirements / Dependencies

### Backend (`backend/requirements.txt`)
```
flask
flask-sock          # WebSocket support
flask-cors
sqlalchemy
anthropic
openai
google-generativeai
mcp                 # MCP client SDK
python-dotenv
pydantic
pytest
pytest-asyncio
```

### Frontend (`frontend/package.json` — key deps)
```
react
reactflow
tailwindcss
zustand             # lightweight state management for canvas + execution state
socket.io-client    # or native WebSocket client
vite
vitest
```

### Infrastructure
- Local dev: SQLite, no external services besides LLM provider APIs and MCP servers
- Production (optional/stretch): Postgres, containerized backend (Docker), static frontend build served separately

---

## 5. Data Model (minimum viable)

**Workflow**
- `id`, `name`, `graph_json` (nodes + edges + configs), `created_at`, `updated_at`

**Run**
- `id`, `workflow_id`, `status` (`running`/`completed`/`failed`), `started_at`, `finished_at`

**RunEvent**
- `id`, `run_id`, `node_id`, `type` (`start`/`token`/`tool_call`/`tool_result`/`end`/`error`), `payload_json`, `timestamp`

---

## 6. Out of Scope for v1

- Multi-user accounts / authentication
- Team collaboration on the same workflow in real time
- Mobile/responsive canvas layout
- Third-party public template marketplace
- Billing/usage metering across providers

---

## 7. Acceptance Criteria for v1 "Done"

- [ ] A user can build a 3+ node workflow entirely via the canvas UI with no code
- [ ] Running it shows live, token-streamed output per node with correct execution order
- [ ] At least one MCP-backed tool node executes successfully with a real MCP server
- [ ] Switching one node's model provider (e.g. Claude → GPT) works with no other changes
- [ ] The "Company Research Agent Swarm" template runs end-to-end and produces a merged report
- [ ] A deliberately broken node (bad prompt/invalid tool) fails visibly without crashing the run