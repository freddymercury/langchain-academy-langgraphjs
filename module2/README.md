# Module 2 — State & Memory (LangGraph.js Edition)

> *A TypeScript/JavaScript translation of the LangChain Academy "Intro to LangGraph" — Module 2: State and Memory.*

---

## 📚 Table of Contents

1. [State Schema](#state-schema)
2. [State Reducers](#state-reducers)
3. [Multiple Schemas (JS Limitation)](#multiple-schemas-js-limitation)
4. [Trim and Filter Messages](#trim-and-filter-messages)
5. [Rolling Window Memory](#rolling-window-memory)
6. [Checkpoint Savers](#checkpoint-savers)
7. [Persistence](#persistence)
8. [Long-term Memory](#long-term-memory)
9. [Chatbot with Summarization & Memory](#chatbot-with-summarization--memory)
10. [Chatbot with Summarization & External Memory](#chatbot-with-summarization--external-memory)

---

## 🚀 Quick Start

From this directory:

```bash
npm install           # if you haven't already
npm run dev -- src/<lesson>.ts
```

---

## 📝 Lessons & Examples

### 1. State Schema
**File:** `stateSchema.ts`
- Shows how to define a custom state schema with input, output, and private fields.
- Example: Echoes input and increments a private counter.

### 2. State Reducers
**File:** `reducer.ts`
- Demonstrates reducers for accumulating state (e.g., appending messages).
- Example: Adds a message to an array each run.

### 3. Multiple Schemas (JS Limitation)
**File:** `multipleSchemas.ts`
- JS/TS can't do per-node schemas like Python, so this uses a superset schema.
- Example: One node updates user info, another node processes a message.
- **Note:** See comments for JS/Python differences.

### 4. Trim and Filter Messages
**File:** `trimFilterMessages.ts`
- Shows how to trim (keep last N) and filter (remove by content) messages in memory.
- Example: Adds messages, trims to last 3, and filters out those containing 'ignore'.

### 5. Rolling Window Memory
**File:** `rollingWindow.ts`
- Implements a reducer that only keeps the last N messages in state.
- Example: Adds messages in a loop, only last 3 are kept.

### 6. Checkpoint Savers
**File:** `checkpointSaver.ts`
- Uses `MemorySaver` to checkpoint state between runs (in-memory persistence).
- Example: Increments a counter, persists across invocations.

### 7. Persistence
**File:** `persistence.ts`
- Demonstrates thread-level and cross-thread persistence using `MemorySaver`.
- Example: Two threads increment counters independently.

### 8. Long-term Memory
**Files:** `longTermMemory.ts`, `vectorStoreMemory.ts`
- Shows how to store and semantically search memories using `InMemoryStore` and `OpenAIEmbeddings`.
- Example: Save facts for users, search for related facts.

### 9. Chatbot with Summarization & Memory
**File:** `summarizationChatbot.ts`
- Builds a chatbot that keeps conversation history, summarizes it, and responds to user input using an LLM.

### 10. Chatbot with Summarization & External Memory
**File:** `summarizationChatbotExternalMemory.ts`
- Extends the chatbot to use a vector store for external memory (semantic search).

---

## 🛠 Prerequisites
- Node.js 18+
- OpenAI API key (for LLM/embedding examples)
- Install dependencies as shown above

---

## 🧩 Key Takeaways
- State schemas and reducers enable flexible, composable memory in LangGraph.
- Checkpoint savers and persistence unlock long-term and cross-session memory.
- Summarization and vector store memory enable advanced conversational agents.

---

> *See the main project README for more details and troubleshooting tips.* 