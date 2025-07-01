// module3/src/timeTravel.ts
// Lesson 5: Time Travel
// This example demonstrates how to implement time travel (state rollback) in LangGraph.js.
// Parity: Python Academy Module 3, Lesson 5

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

// Define the state schema
const State = Annotation.Root({
  value: Annotation<number>(),
  history: Annotation<number[]>(),
});

// Node that increments the value and records history
const incrementNode = (state: { value: number; history: number[] }) => {
  const newValue = state.value + 1;
  return { value: newValue, history: [...state.history, newValue] };
};

// Node that allows time travel (rollback to previous state)
const timeTravelNode = (state: { value: number; history: number[] }) => {
  // Simulate time travel: rollback to previous value if possible
  if (state.history.length > 1) {
    const previousValue = state.history[state.history.length - 2];
    console.log(`Time travel: rolling back to value ${previousValue}`);
    return { value: previousValue, history: state.history.slice(0, -1) };
  }
  return state;
};

// Build the graph
const graph = new StateGraph(State)
  .addNode('increment', incrementNode)
  .addNode('timeTravel', timeTravelNode)
  .addEdge(START, 'increment')
  .addEdge('increment', 'timeTravel')
  .addEdge('timeTravel', END)
  .compile();

// Example invocation
(async () => {
  const result = await graph.invoke({ value: 0, history: [0] });
  console.log('Final state:', result);
})(); 