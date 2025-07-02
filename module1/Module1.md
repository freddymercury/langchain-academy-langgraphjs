# Module 1 — Introduction (LangGraph.js Edition)

## 0. Project Setup & Directory Layout

```bash
# create top‑level workspace
mkdir langgraph-js-academy && cd langgraph-js-academy

# create a dedicated folder for this module
mkdir -p module1/src && cd module1

# initialise npm (creates module1/package.json)
npm init -y    # or pnpm/yarn init -y

# enable ES Modules so `import ...` works under Node
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.type='module';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
```

> **Per‑module isolation**   Each Academy module lives in its own directory (`module1`, `module2`, …) so you can experiment without breaking lessons.

### Environment variables (OpenAI, etc.)

```bash
cp ../.env.example .env   # or create manually
npm i dotenv              # load vars via `import 'dotenv/config'`
```

`../.env.example` (repo root):

```
OPENAI_API_KEY="sk‑..."
TAVILY_API_KEY="tvly‑..."
```

---

## 1. Prerequisites

```bash
npm i -D typescript ts-node @types/node
npm i    @langchain/langgraph @langchain/openai @langchain/community langchain
# optional CLI & Studio
npm i -D @langchain/langgraph-cli   # local dev, or install globally
```

Create `tsconfig.json` in **module1** (matches the repo):

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Sample `package.json` (trimmed to essentials)

````json
{
  "name": "module1",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node --esm src/simpleGraph.ts",
    "build": "tsc -p .",
    "start": "node dist/simpleGraph.js"
  },
  "dependencies": {
    "@langchain/community": "^0.3.0",
    "@langchain/langgraph": "^0.1.2",
    "@langchain/openai": "^0.1.11",
    "chatgpt": "^5.2.3",
    "dotenv": "^16.4.5",
    "langchain": "^0.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.2"
  }
}
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "strict": true
  }
}
````

---

## 1.5 Building & Running Each Lesson

### Quick dev with ts-node

```bash
npx ts-node --esm src/simpleGraph.ts        
npx ts-node --esm src/simpleGraphHappySad.ts # Lesson 2
npx ts-node --esm src/chainNode.ts          
npx ts-node --esm src/chainExample.ts       # Lesson 4
npx ts-node --esm src/router.ts             # Lesson 5
npx ts-node --esm src/agent.ts              # Lesson 6
npx ts-node --esm src/agentMemory.ts        # Lesson 7
```

### Compile then run

```bash
npm run build    # (add "build": "tsc -p ." to package.json)
node dist/simpleGraph.js
```

---

## 2. Lesson 1 • Motivation

When your workflow needs branching logic, shared state, memory, or multi‑agent collaboration, a linear LangChain “chain” becomes brittle. LangGraph adds **graphs + explicit state** so everything is testable and composable.

---

## 3. Lesson 2 • Simple Graph

```ts
// module1/src/simpleGraph.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const State = Annotation.Root({
  message: Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('greeter', (s) => ({ message: `Hello, ${s.message}!` }))
  .addEdge('__start__', 'greeter')
  .addEdge('greeter', '__end__');

const app = graph.compile();
console.log(await app.invoke({ message: 'LangGraph world' }));
```

---

## 6. Lesson 5 • Router Node

```ts
// module1/src/router.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const State = Annotation.Root({
  question: Annotation<string>(),
  answer:   Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('math',   () => ({ answer: '2 + 2 = 4' }))
  .addNode('trivia', () => ({ answer: 'Paris is the capital of France.' }))
  .addConditionalEdge('__start__', (s) => (/^\d+[+\-*/]\d+$/.test(s.question) ? 'math' : 'trivia'))
  .addEdge('math',   '__end__')
  .addEdge('trivia', '__end__');

const app = graph.compile();
console.log(await app.invoke({ question: '2+2' }));      // math
console.log(await app.invoke({ question: 'Capital?' })); // trivia
```

---

## 7. Lesson 6 • Agent Node

```ts
// module1/src/agent.ts
import 'dotenv/config';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent, StateGraph, Annotation } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';

// 1️⃣  Define tools & LLM
const tools = [new TavilySearchResults({ maxResults: 3 })];
const llm   = new ChatOpenAI({ temperature: 0 });

// 2️⃣  Build a React-style agent with no long‑term memory
const agent = createReactAgent({ llm, tools });

// 3️⃣  State schema → messages array
const State = Annotation.Root({
  messages: Annotation<HumanMessage[]>(),
});

// 4️⃣  Graph wraps the agent call
const graph = new StateGraph(State)
  .addNode('agent', (s) =>
    agent.invoke({ messages: s.messages }, { configurable: { thread_id: 'demo' } }),
  )
  .addEdge('__start__', 'agent')
  .addEdge('agent', '__end__');

const app = graph.compile();
await app.invoke({
  messages: [new HumanMessage('Who won the 2008 World Series?')],
});
```

> **Environment variables**: ensure `OPENAI_API_KEY` and `TAVILY_API_KEY` are set in `.env`.

---

## 8. Lesson 7 • Agent with Memory

```ts
// module1/src/agentMemory.ts
import 'dotenv/config';
import { MemorySaver, createReactAgent } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';

const checkpoint = new MemorySaver();
const agent = createReactAgent({
  llm: new ChatOpenAI({ temperature: 0 }),
  tools: [new TavilySearchResults()],
  checkpoint,
});

const State = Annotation.Root({
  messages: Annotation<HumanMessage[]>(),
});

const graph = new StateGraph(State)
  .addNode('agent', (s) => agent.invoke(s, { configurable: { thread_id: 'memory-demo' } }))
  .addEdge('__start__', 'agent')
  .addEdge('agent', '__end__');

const app = graph.compile();
await app.invoke({ messages: [new HumanMessage('Remember that I love tacos.')] });
await app.invoke({ messages: [new HumanMessage('What food do I love?')] });
```

---

## 9. Lesson 8 • Intro to Deployment (optional)

```bash
# deploy agent.ts as a serverless endpoint
auth_token=...   # from LangGraph Cloud beta
npx @langchain/langgraph-cli deploy src/agent.ts --name academy-agent-js --token $auth_token
```

---

## Key Takeaways

* LangGraph’s graph abstraction adds explicit state and branching to LangChain workflows.
* JS/TS API mirrors Python lessons: Simple Graph → Studio → Chain → Router → Agent → Memory → Deployment.
* Use `@langchain/langgraph-cli dev` for an in‑browser Studio; `deploy` publishes serverless endpoints.
