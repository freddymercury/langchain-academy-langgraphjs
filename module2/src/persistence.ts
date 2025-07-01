import 'dotenv/config';
import { MemorySaver } from '@langchain/langgraph';
import { StateGraph, Annotation } from '@langchain/langgraph';

// Define a simple state schema
const State = Annotation.Root({
  value: Annotation<number>(),
});

// Create a MemorySaver instance for checkpointing
const checkpointSaver = new MemorySaver();

const graph = new StateGraph(State)
  .addNode('increment', (s) => ({ value: (s.value ?? 0) + 1 }))
  .addEdge('__start__', 'increment')
  .addEdge('increment', '__end__');

// Compile the graph with the checkpoint saver
const app = graph.compile({ checkpointer: checkpointSaver });

// Example: Run with two different thread_ids to show thread-level persistence
const configA = { configurable: { thread_id: 'thread-A' } };
const configB = { configurable: { thread_id: 'thread-B' } };

// Run for thread-A
let stateA = await app.invoke({ value: 0 }, configA);
console.log('Thread A, step 1:', stateA);
stateA = await app.invoke({ value: stateA.value }, configA);
console.log('Thread A, step 2:', stateA);

// Run for thread-B (independent state)
let stateB = await app.invoke({ value: 100 }, configB);
console.log('Thread B, step 1:', stateB);
stateB = await app.invoke({ value: stateB.value }, configB);
console.log('Thread B, step 2:', stateB); 