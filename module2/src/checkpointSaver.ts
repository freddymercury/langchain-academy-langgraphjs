import 'dotenv/config';
import { MemorySaver } from '@langchain/langgraph';
import { StateGraph, Annotation } from '@langchain/langgraph';

// Define a simple state schema
const State = Annotation.Root({
  count: Annotation<number>(),
});

// Create a MemorySaver instance for checkpointing
const checkpointSaver = new MemorySaver();

const graph = new StateGraph(State)
  .addNode('increment', (s) => ({ count: (s.count ?? 0) + 1 }))
  .addEdge('__start__', 'increment')
  .addEdge('increment', '__end__');

// Compile the graph with the checkpoint saver
const app = graph.compile({ checkpointer: checkpointSaver });

// Example invocation with thread_id for persistence
const config = { configurable: { thread_id: 'demo-thread' } };

// First run
let result = await app.invoke({ count: 0 }, config);
console.log('First run:', result); // { count: 1 }

// Second run (should persist state)
result = await app.invoke({ count: result.count }, config);
console.log('Second run:', result); // { count: 2 } 