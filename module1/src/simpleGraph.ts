// module1/src/simpleGraph.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const State = Annotation.Root({
  message: Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('greeter', (state) => ({
    message: `Hello, ${state.message}!`,
  }))
  .addEdge('__start__', 'greeter')
  .addEdge('greeter', '__end__');

// compile then invoke
const app = graph.compile();
const result = await app.invoke({ message: 'LangGraph world' });
console.log(result); // { message: 'Hello, LangGraph world!' }