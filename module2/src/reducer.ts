import { StateGraph, Annotation } from '@langchain/langgraph';

// Define a state schema with a messages array and a reducer
const State = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: (prev: string[] = [], next: string[]) => [...prev, ...next],
    default: () => [],
  }),
});

const graph = new StateGraph(State)
  .addNode('addMessage', (s) => ({ messages: ['Hello from reducer!'] }))
  .addEdge('__start__', 'addMessage')
  .addEdge('addMessage', '__end__');

const app = graph.compile();

// Example invocation
const result = await app.invoke({ messages: ['Initial message'] });
console.log(result); // { messages: ['Initial message', 'Hello from reducer!'] } 