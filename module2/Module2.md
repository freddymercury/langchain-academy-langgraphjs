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

## 3. Lesson 2 • Reducers

*What is a reducer?*

```ts
// module2/src/reducer.ts
// Example code will go here
```

---

## 4. Lesson 3 • Checkpoint Savers

*Using MemorySaver and SqliteSaver.*

```ts
// module2/src/checkpointSaver.ts
// Example code will go here
```

---

## 5. Lesson 4 • Rolling Window Memory

*Only keep last N messages in state.*

```ts
// module2/src/rollingWindow.ts
// Example code will go here
```

---

## 6. Lesson 5 • Persistence

*Thread-level and cross-thread persistence.*

```ts
// module2/src/persistence.ts
// Example code will go here
```

---

## 7. Lesson 6 • Long-term Memory

*Semantic search for memory.*

```ts
// module2/src/longTermMemory.ts
// Example code will go here
```

---

## 8. Lesson 7 • Human-in-the-loop (optional/advanced)

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