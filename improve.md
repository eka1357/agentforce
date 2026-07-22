# AgentForge Strategic Analysis & Roadmap

This document outlines a high-level technical evaluation of the AgentForge platform, identifying current strengths, architectural limitations, and a prioritized roadmap for future enhancements.

---

## 1. Current State Assessment

### What is Working Exceptionally Well:
*   **Visual-First Execution:** The UI/UX is premium. The live WebSocket trace streaming, glowing edge animations, and the Antigravity-style expandable side drawer provide a significantly better developer experience than CLI-only agent frameworks.
*   **Model Agnosticism:** The `ModelAdapter` design relying on OpenRouter is a massive win. Users can mix-and-match Llama, GPT, and Gemini in a single pipeline without touching the backend code.
*   **Real MCP Tool Integration:** The architecture successfully bridges LLM reasoning with actual system capabilities (files, web search) via the Model Context Protocol, paving the way for true agentic action.
*   **Async Orchestration:** The `GraphExecutor` effectively handles parallel fan-out and fan-in (merge) operations without blocking the event loop.

---

## 2. Core Issues & Limitations (What Needs Fixing)

*   **No Support for Cyclic Graphs (Loops):**
    *   *Issue:* The current `executor.py` assumes a strict Directed Acyclic Graph (DAG). If a user connects a node back to a previous node (e.g., `Writer -> Critic -> Writer`), the executor will likely deadlock or fail to resolve dependencies. True autonomous agents require iterative loops.
*   **Ephemeral Run History:**
    *   *Issue:* While workflow definitions (the nodes and edges) are saved to SQLite, the actual *execution runs* (the outputs, trace logs, success/fail state) only exist in memory during the active session. Restarting the backend wipes all past outputs.
*   **Brittle Conditional Logic:**
    *   *Issue:* The `ConditionNode` relies on simple Python string matching (`output.contains(...)`). This is fragile. LLMs are non-deterministic; they might output "The operation was a SUCCESS" or "SUCCESSFUL".
*   **Lack of Error Recovery / Resumption:**
    *   *Issue:* If a node fails (e.g., rate limit, bad tool call), the entire downstream pipeline aborts. There is no mechanism to pause the graph, fix a prompt on the fly, and resume execution from the point of failure.

---

## 3. High-Priority Improvements (What to Add)

### Architectural & Backend
1.  **Iterative Execution Engine (State Machine):**
    *   Refactor `executor.py` from a simple topological DAG walker into a state machine runner. This allows cycles, enabling patterns like "Self-Reflection" where an agent iteratively refines its output until a condition is met.
2.  **Database Persistence for Run Logs:**
    *   Create SQLAlchemy models for `Run`, `RunStep`, and `RunLog`. Save every execution's traces and final outputs to the database.
3.  **Local LLM Integration (Ollama):**
    *   Add an `OllamaAdapter` to `ModelAdapterFactory`. Many enterprise users want to run orchestration on local, private data without sending prompts to OpenRouter.

### Orchestration Capabilities
4.  **Human-in-the-Loop (HITL) Node:**
    *   Introduce an "Approval Node". When execution hits this node, it pauses, sends a specific WebSocket event to the UI, and waits for a user to click "Approve", "Reject", or provide manual text edits before continuing down the graph.
5.  **Structured JSON Passing & Schema Validation:**
    *   Currently, nodes pass mostly raw Markdown text. Implement a way to force Agent nodes to output strict JSON (using structured outputs APIs) and allow downstream nodes to map specific JSON keys into their prompts.

### Frontend / UI Experience
6.  **Run History Dashboard:**
    *   A dedicated view (or slide-out panel) to browse past executions, view their success rates, and replay their trace logs.
7.  **Composite / Group Nodes:**
    *   As workflows get complex (20+ nodes), the canvas will get messy. Allow users to group a set of nodes into a single collapsible "Macro Node" (e.g., hiding the 4 nodes of the Research Swarm inside one box).

---

## 4. What to Remove / Deprecate

*   **Remove Hardcoded "Mock" Fallbacks:** Early in development, the `mcp_client.py` or adapters might have relied on mock data if APIs failed. Ensure all mock paths are removed in favor of strict, clean error reporting to the user (which we recently improved).
*   **Deprecate `concat_text` in Merge Node:** Simply concatenating text blindly from multiple agents often breaks markdown formatting. The `combine_dict` strategy (which formats distinct headers for each stream) is far superior and should be the sole default standard.
