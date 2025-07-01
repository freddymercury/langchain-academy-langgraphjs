# Module 4 — Building Your Assistant

Welcome to Module 4 of the LangGraph JS Academy! This module covers advanced graph patterns and assistant design, matching the Python Academy's Module 4 in both content and quality.

## Lessons

Each lesson/example is in its own file in `src/`:

- **Parallelization**: Demonstrates running multiple LLM chains in parallel using RunnableMap (RunnableParallel). Example: generating a joke and a poem at the same time.
- **Sub-graphs**: Shows how to compose a parent graph and a subgraph with shared state keys. The subgraph modifies a value, and the parent graph invokes the subgraph as a node.
- **Map-reduce**: Implements a map-reduce workflow: map step summarizes each document, reduce step combines summaries. Uses Send for parallel map.
- **Research Assistant**: Builds a research assistant that (1) generates research questions, (2) searches the web (mocked), (3) summarizes results, and (4) writes a final report. All steps are modular and can be replaced with real APIs.

## Quick Start

1. Ensure you have copied the `.env` file from module3 (already done).
2. Install dependencies:
   ```sh
   cd module4
   npm install
   ```
3. Run any lesson with:
   ```sh
   npx tsx src/<lesson>.ts
   ```
   For example, to run the Research Assistant:
   ```sh
   npx tsx src/researchAssistant.ts
   ```

## Lesson Summaries

- **Parallelization**: Runs two LLM chains in parallel and collects their results. Demonstrates parallel graph execution.
- **Sub-graphs**: Shows how to use a compiled subgraph as a node in a parent graph, with shared state.
- **Map-reduce**: Summarizes multiple documents in parallel (map), then combines summaries (reduce) for a final output.
- **Research Assistant**: Full research workflow: generates search queries, (mock) web search, (mock) scraping, summarization, and final report generation. Modular for real-world extension.

## Parity Notes

- All lessons are implemented in idiomatic JS/TS and match the Python Academy Module 4 in structure and logic.
- Where the JS API differs from Python, comments are included in the code.
- Web search and scraping in the Research Assistant are mocked for demonstration; replace with real APIs as needed.

---

_This README will be updated as each lesson is implemented._ 