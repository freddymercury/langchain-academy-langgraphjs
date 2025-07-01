// module3/src/dynamicBreakpoints.ts
// Lesson 4: Dynamic Breakpoints
// This example demonstrates how to use dynamic breakpoints in LangGraph.js.
// Parity: Python Academy Module 3, Lesson 4

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

// Node that acts as a dynamic breakpoint
const dynamicBreakpointNode = (state: { value: number; step: number }) => {
  // Simulate a dynamic breakpoint: pause if value is even
  if (state.value % 2 === 0) {
    console.log(`Dynamic breakpoint at step ${state.step}, value: ${state.value}`);
  }
  return state;
};

// Build the graph
const graph = new StateGraph(State)
  .addNode('increment', incrementNode)
  .addNode('dynamicBreakpoint', dynamicBreakpointNode)
  .addEdge(START, 'increment')
  .addEdge('increment', 'dynamicBreakpoint')
  .addEdge('dynamicBreakpoint', END)
  .compile();

// Example invocation
(async () => {
  const result = await graph.invoke({ value: 2, step: 0 });
  console.log('Final state:', result);
})(); 