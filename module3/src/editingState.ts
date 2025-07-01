// module3/src/editingState.ts
// Lesson 3: Editing State and Human Feedback
// This example demonstrates how to allow human feedback and state editing in LangGraph.js.
// Parity: Python Academy Module 3, Lesson 3

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

// Define the state schema
const State = Annotation.Root({
  value: Annotation<number>(),
  feedback: Annotation<string>(),
});

// Node that increments the value
const incrementNode = (state: { value: number; feedback: string }) => {
  return { value: state.value + 1, feedback: state.feedback };
};

// Node that allows human feedback (simulated here)
const feedbackNodeImpl = (state: { value: number; feedback: string }) => {
  // In a real app, you would pause and let a human edit the state
  // For this example, we simulate feedback
  const newFeedback = `Human says: value is ${state.value}`;
  console.log('Feedback node: ', newFeedback);
  return { ...state, feedback: newFeedback };
};

// Build the graph
const graph = new StateGraph(State)
  .addNode('increment', incrementNode)
  .addNode('feedbackNode', feedbackNodeImpl)
  .addEdge(START, 'increment')
  .addEdge('increment', 'feedbackNode')
  .addEdge('feedbackNode', END)
  .compile();

// Example invocation
(async () => {
  const result = await graph.invoke({ value: 0, feedback: '' });
  console.log('Final state:', result);
})(); 