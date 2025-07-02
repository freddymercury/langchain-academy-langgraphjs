# Module 2 — State & Memory (LangGraph.js Edition)

## 0. Project Setup & Directory Layout

```bash
# create a dedicated folder for this module
mkdir -p module2/src && cd module2

# initialise npm (creates module2/package.json)
npm init -y    # or pnpm/yarn init -y

# enable ES Modules so `import ...` works under Node
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
```

> **Per‑module isolation** Each Academy module lives in its own directory (`module1`, `module2`, …) so you can experiment without breaking lessons.

---

## 1. Prerequisites

```bash
npm i -D typescript ts-node @types/node
npm i    @langchain/langgraph @langchain/openai @langchain/community langchain
npm i -D @langchain/langgraph-cli   # optional CLI & Studio
```

---

## 2. Lesson 1 • State Schemas

*What is a state schema and how do we define them in different ways?*

State schemas define the structure and types of data that your LangGraph will use. All nodes communicate through this schema. LangGraph.js provides flexibility in how you define state schemas.

### Basic State Schema

The simplest approach uses LangGraph's Annotation system:

```ts
// module2/src/stateSchema.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const State = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
  _private: Annotation<number>(), // private/internal state
});
```

### Comprehensive Examples

For a complete exploration of different state schema approaches (TypeScript interfaces, classes, validation, etc.):

```ts
// module2/src/stateSchemaExample.ts
// Comprehensive examples showing:
// 1. Basic Annotation System (recommended)
// 2. TypeScript Interface approach (TypedDict equivalent)
// 3. Class-based approach (dataclass equivalent) 
// 4. Runtime validation (Pydantic equivalent)
// 5. Advanced schemas with multiple types
```

**Run the examples:**

```bash
cd module2
npx ts-node --esm src/stateSchema.ts           # Basic example
npx ts-node --esm src/stateSchemaExample.ts    # Comprehensive examples
```

---

## 3. Lesson 2 • Multiple Schemas

*How to work with private state and input/output schemas in LangGraph.*

Multiple schemas allow you to have more control over state management by using different schemas for internal processing versus input/output, or by passing private state between nodes that doesn't appear in the final output.

### Key Concepts

- **Private State**: Internal state that passes between nodes but isn't part of the graph's input/output
- **Input/Output Filtering**: Using specific schemas to control what data enters and exits the graph
- **Schema Composition**: Working with comprehensive schemas where different nodes focus on different fields

### Examples

```ts
// module2/src/multipleSchemasExample.ts
// Comprehensive examples showing:
// 1. Private state passing between nodes
// 2. Input/output schema filtering patterns
// 3. Practical multi-schema approaches for real applications
// 4. LangGraph.js limitations and workarounds
```

**Run the examples:**

```bash
cd module2
npx ts-node --esm src/multipleSchemasExample.ts    # Multiple schemas examples
```

---

## 4. Lesson 3 • Reducers

*What is a reducer and how do they solve parallel state update conflicts?*

State reducers define how to combine state updates when multiple nodes attempt to modify the same state key simultaneously. They enable parallel execution by specifying merge strategies instead of causing conflicts.

### Basic Reducer Concepts

The simplest approach uses custom reducer functions with LangGraph's Annotation system:

```ts
// module2/src/stateReducersExample.ts
// Comprehensive examples showing:
// 1. Default overwriting behavior (and its limitations)
// 2. Parallel execution conflicts (InvalidUpdateError)
// 3. Array concatenation reducers  
// 4. Custom reducers for null safety
// 5. MessagesState and message operations
// 6. Message adding, overwriting, and removal
```

**Run the examples:**

```bash
cd module2
npx ts-node --esm src/stateReducersExample.ts    # Complete reducer examples
```

---

## 5. Lesson 4 • Trim and Filter Messages

*How to manage long-running conversations by filtering and trimming messages.*

Long-running conversations result in high token usage and latency if we are not careful, because we pass a growing list of messages to the model. LangGraph provides several ways to address this challenge.

### Key Concepts

- **Message Filtering**: Remove specific messages from state using `RemoveMessage`
- **Message Trimming**: Limit message history based on token count using `trimMessages`
- **Node-level Filtering**: Filter messages at the node level without modifying state
- **Custom Message Management**: Advanced patterns for sophisticated message handling

### Examples

```ts
// module2/src/trimFilterMessagesExample.ts
// Comprehensive examples showing:
// 1. Basic MessagesState setup and usage
// 2. Simple graph with chat model simulation
// 3. Filtering messages with RemoveMessage and add_messages reducer
// 4. Filtering messages by passing filtered list to model
// 5. Trimming messages based on token count (conceptual)
// 6. Combined example with custom message management
```

**Run the examples:**

```bash
cd module2
npx ts-node --esm src/trimFilterMessagesExample.ts    # Trim and filter messages examples
```

---

## 6. Lesson 5 • Chatbot with Summarization

*Building a chatbot that uses LLM-powered summarization to maintain conversation context while managing token costs.*

Instead of just trimming or filtering messages, this lesson shows how to use LLMs to produce a running summary of the conversation. This allows us to retain a compressed representation of the full conversation, rather than just removing it with trimming or filtering.

### Key Concepts

- **Message Summarization**: Using LLMs to create summaries of conversation history
- **Memory with Persistence**: Using MemorySaver for thread-based conversation persistence
- **Conditional Logic**: Triggering summarization based on message count thresholds
- **State Management**: Managing both messages and summary in graph state

### Examples

```ts
// module2/src/summarizationChatbotExample.ts
// Comprehensive examples showing:
// 1. Custom state schema with summary field
// 2. LLM-powered conversation summarization
// 3. Message removal after summarization
// 4. Thread-based persistent conversations
// 5. Conditional summarization triggers
```

**Run the examples:**

```bash
cd module2
npx ts-node --esm src/summarizationChatbotExample.ts    # Chatbot with summarization
```

---

## 7. Lesson 6 • Checkpoint Savers

*Using MemorySaver and SqliteSaver.*

```ts
// module2/src/checkpointSaver.ts
// Example code will go here
```

---

## 8. Lesson 7 • Rolling Window Memory

*Only keep last N messages in state.*

```ts
// module2/src/rollingWindow.ts
// Example code will go here
```

---

## 9. Lesson 8 • Persistence

*Thread-level and cross-thread persistence.*

```ts
// module2/src/persistence.ts
// Example code will go here
```

---

## 10. Lesson 9 • Long-term Memory

*Semantic search for memory.*

```ts
// module2/src/longTermMemory.ts
// Example code will go here
```

---

## 11. Lesson 10 • Human-in-the-loop (optional/advanced)

*Interrupts, editing state.*

```ts
// module2/src/humanInLoop.ts
// Example code will go here
```

---

## Key Takeaways

* State schemas and reducers enable flexible, composable memory in LangGraph.
* Checkpoint savers and persistence unlock long-term and cross-session memory.
* Human-in-the-loop patterns allow for interactive, debuggable agent workflows. 