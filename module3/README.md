# Module 3: UX and Human-in-the-Loop

This module demonstrates advanced UX and human-in-the-loop patterns in LangGraph.js, following the LangChain Academy Python curriculum at 1:1 feature parity. Each lesson is implemented in its own file in `module3/src/`.

## Lessons

1. **Streaming** (`streaming.ts`)
   - Demonstrates how to stream LLM tokens and state updates.
   - Shows how to use streaming in LangGraph.js with a simple echo prompt.
2. **Breakpoints** (`breakpoints.ts`)
   - Shows how to pause execution and inspect state at breakpoints.
   - Simulates pausing for human inspection or debugging.
3. **Editing State and Human Feedback** (`editingState.ts`)
   - Demonstrates how to allow human feedback and state editing.
   - Simulates a human editing state during execution.
4. **Dynamic Breakpoints** (`dynamicBreakpoints.ts`)
   - Shows how to implement breakpoints that trigger based on dynamic conditions.
   - Example: pause only if a value is even.
5. **Time Travel** (`timeTravel.ts`)
   - Demonstrates state rollback (time travel) by reverting to a previous state in the graph.

## Quick Start

1. Install dependencies (from the root or `module3/`):
   ```sh
   npm install
   # or
   yarn install
   ```
2. Set up your environment variables (e.g., `OPENAI_API_KEY` for streaming lesson).
3. Run any lesson file:
   ```sh
   ts-node module3/src/streaming.ts
   ts-node module3/src/breakpoints.ts
   ts-node module3/src/editingState.ts
   ts-node module3/src/dynamicBreakpoints.ts
   ts-node module3/src/timeTravel.ts
   ```

## Parity Notes
- All lessons are implemented to match the Python Academy Module 3 in structure and behavior.
- Any differences in the JS/TS API are noted in comments within each file.
- Example invocations are included in each lesson file for easy testing.

---

For more details, see the code and comments in each lesson file in `module3/src/`.

# Module 3 Hand-off: UX and Human-in-the-Loop

You are continuing the TypeScript/JavaScript translation of the LangChain Academy "Intro to LangGraph" curriculum. Modules 1 and 2 are complete and at 1:1 parity with the Python Academy, following idiomatic JS/TS patterns and the per-module folder structure.

## Your Task: Implement Module 3 — UX and Human-in-the-Loop

### Standards
- Each lesson/example should be in its own file in `module3/src/`.
- Match the lesson structure, naming, and code patterns from the Python Academy as closely as possible.
- Ensure all code is runnable, well-commented, and includes example invocations.
- Add a module-level README (`MREADME.md`) summarizing each lesson, quick start, and parity notes.

### Module 3 Lessons (from the Academy)
1. Streaming
2. Breakpoints
3. Editing State and Human Feedback
4. Dynamic Breakpoints
5. Time Travel

### For each lesson
- Provide a runnable, idiomatic JS/TS example.
- If the JS API differs from Python, document the difference in comments.
- Test each example and fix any linter/runtime errors.
- When finished, check for 1:1 parity with the Academy's Module 3, and update the module README accordingly.

---

**Reference:**  
- See `module1/` and `module2/` for structure, naming, and code style.  
- Each lesson = one file in `module3/src/`.  
- Add `MREADME.md` to `module3/` with lesson summaries, quick start, and parity notes.

---

**Goal:**  
By the end, Module 3 should be fully implemented, tested, and documented, matching the Python Academy's Module 3 in both content and quality, using idiomatic JS/TS. 