// Typescript version of the simple graph example
// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58238187-lesson-2-simple-graph

import { StateGraph, Annotation } from '@langchain/langgraph';

// Define the state
const State = Annotation.Root({
  graph_state: Annotation<string>(),
});

// Node functions
function node_1(state: { graph_state: string }) {
  console.log("---Node 1---");
  return { graph_state: state.graph_state + " I am" };
}

function node_2(state: { graph_state: string }) {
  console.log("---Node 2---");
  return { graph_state: state.graph_state + " happy!" };
}

function node_3(state: { graph_state: string }) {
  console.log("---Node 3---");
  return { graph_state: state.graph_state + " sad!" };
}

// Conditional edge function
function decide_mood(state: { graph_state: string }) {
  return Math.random() < 0.5 ? "node_2" : "node_3";
}

// Build the graph
const graph = new StateGraph(State)
  .addNode("node_1", node_1)
  .addNode("node_2", node_2)
  .addNode("node_3", node_3)
  .addEdge("__start__", "node_1")
  .addConditionalEdges("node_1", decide_mood)
  .addEdge("node_2", "__end__")
  .addEdge("node_3", "__end__");

// Compile and invoke
const app = graph.compile();
const result = await app.invoke({ graph_state: "LangGraph world" });
console.log(result);