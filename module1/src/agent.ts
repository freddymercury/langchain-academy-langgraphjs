// module1/src/agent.ts
import 'dotenv/config';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { StateGraph, Annotation } from '@langchain/langgraph';
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
const result = await app.invoke({
  messages: [new HumanMessage('Who won the 2008 World Series?')],
});
console.log(result.messages[result.messages.length - 1].content);
