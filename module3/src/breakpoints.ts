// module3/src/breakpoints.ts
// Lesson 2: Breakpoints
// This example demonstrates how to use breakpoints to pause and inspect state in LangGraph.js.
// Parity: Python Academy Module 3, Lesson 2

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

// Define the state schema
const State = Annotation.Root({
  value: Annotation<number>(),
  step: Annotation<number>(),
});

// Node that increments the value
const incrementNode = (state: { value: number; step: number }) => {
  return { value: state.value + 1, step: state.step + 1 };
};

// Node that acts as a breakpoint (pauses execution)
const breakpointNode = (state: { value: number; step: number }) => {
  // In a real app, you could pause here and let a human inspect or edit state
  // For this example, we just log and pass through
  console.log(`Breakpoint reached at step ${state.step}, value: ${state.value}`);
  return state;
};

// Build the graph
const graph = new StateGraph(State)
  .addNode('increment', incrementNode)
  .addNode('breakpoint', breakpointNode)
  .addEdge(START, 'increment')
  .addEdge('increment', 'breakpoint')
  .addEdge('breakpoint', END)
  .compile();

// Example invocation
(async () => {
  const result = await graph.invoke({ value: 0, step: 0 });
  console.log('Final state:', result);
})(); 