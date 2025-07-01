import { StateGraph, Annotation } from '@langchain/langgraph';

// Define a state schema with input, output, and a private key
const State = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
  _private: Annotation<number>(), // private/internal state
});

const graph = new StateGraph(State)
  .addNode('process', (s) => ({
    output: `Echo: ${s.input}`,
    _private: (s._private ?? 0) + 1, // increment private counter
  }))
  .addEdge('__start__', 'process')
  .addEdge('process', '__end__');

const app = graph.compile();

// Example invocation
const result = await app.invoke({ input: 'Hello, state!', _private: 0 });
console.log(result); // { input: 'Hello, state!', output: 'Echo: Hello, state!', _private: 1 } 