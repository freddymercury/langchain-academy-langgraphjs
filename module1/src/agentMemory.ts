// module1/src/agentMemory.ts
import 'dotenv/config';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';

const checkpointSaver = new MemorySaver();
const agent = createReactAgent({
  llm: new ChatOpenAI({ temperature: 0 }),
  tools: [new TavilySearchResults()],
  checkpointSaver,
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
const result = await app.invoke({ messages: [new HumanMessage('What food do I love?')] });
console.log(result.messages[result.messages.length - 1].content);