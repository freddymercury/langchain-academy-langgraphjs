// module4/src/subGraphs.ts
// Lesson 2: Sub-graphs
// This example demonstrates how to compose a parent graph and a subgraph using LangGraph.js, with shared state keys.
// Parity: Python Academy Module 4, Lesson 2
// JS API note: Subgraphs are compiled StateGraphs used as nodes in a parent StateGraph.

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

// Define the shared state schema
const State = Annotation.Root({
  foo: Annotation<string>(),
});

// --- Subgraph ---
const subgraphBuilder = new StateGraph(State);

// Subgraph node: appends 'bar' to foo
subgraphBuilder.addNode('subgraph_node_1', async (state: { foo: string }) => {
  return { foo: state.foo + 'bar' };
});

subgraphBuilder.addEdge(START, 'subgraph_node_1');
subgraphBuilder.addEdge('subgraph_node_1', END);
const subgraph = subgraphBuilder.compile();

// --- Parent graph ---
const parentBuilder = new StateGraph(State);

// Parent node: prepends 'hi! ' to foo
parentBuilder.addNode('parent_node_1', async (state: { foo: string }) => {
  return { foo: 'hi! ' + state.foo };
});

// Add the subgraph as a node in the parent graph
parentBuilder.addNode('subgraph', subgraph);

parentBuilder.addEdge(START, 'parent_node_1');
parentBuilder.addEdge('parent_node_1', 'subgraph');
parentBuilder.addEdge('subgraph', END);

const parentGraph = parentBuilder.compile();

// Example invocation
(async () => {
  const result = await parentGraph.invoke({ foo: 'foo' });
  console.log('Final output:', result.foo); // Should print 'hi! foobar'
})(); 