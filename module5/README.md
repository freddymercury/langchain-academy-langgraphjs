# Module 5: Long-Term Memory

This module covers advanced memory concepts in LangGraph, focusing on long-term memory and its applications in agent workflows.

## Lessons

1. **Short vs. Long-Term Memory**
   - Demonstrates the difference between ephemeral (short-term) and persistent (long-term) memory in LangGraph. Shows how state is lost between runs unless a persistent store is used.
2. **LangGraph Store**
   - Introduces the LangGraph `InMemoryStore` for persistent, cross-thread memory. Shows how to store and retrieve user notes across runs.
3. **Memory Schema + Profile**
   - Shows how to define and use a custom memory schema (e.g., user profile) with persistent storage. Demonstrates saving and retrieving structured user data.
4. **Memory Schema + Collection**
   - Demonstrates using a collection schema to store and retrieve multiple items per user (e.g., a list of favorite books) with persistent memory.
5. **Build an Agent with Long-Term Memory**
   - Builds an agent that uses long-term memory to remember facts about users and answer questions using both stored facts and an LLM (OpenAI). Facts persist across runs.

## Quick Start

1. Copy your `.env` file from a previous module (done for you).
2. Install dependencies:
   ```bash
   cd module5
   npm install
   ```
3. Run any lesson file with:
   ```bash
   npx tsx src/<LessonFile>.ts
   ```

## Parity Notes

- This module matches the Python Academy Module 5 in lesson structure and content.
- All five lessons are implemented as separate, runnable TypeScript files in `src/`.
- Any JS/TS API differences (e.g., async/await, import style, or store usage) are documented in code comments.
- The `InMemoryStore` is used for demonstration, but can be replaced with other persistent backends.

---

_This module demonstrates how to build robust, stateful agents and workflows with persistent memory in LangGraph._ 