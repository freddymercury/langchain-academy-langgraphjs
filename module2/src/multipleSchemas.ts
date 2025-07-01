// Multiple Schemas Example (JS Limitation: All nodes must share the same schema)
// In LangGraph.js, all nodes in a StateGraph must use the same root schema.
// This example uses a superset schema to demonstrate the concept.
import { StateGraph, Annotation } from '@langchain/langgraph';

// Superset schema for both user and message nodes
const State = Annotation.Root({
  user: Annotation<string>(),
  age: Annotation<number>(),
  message: Annotation<string>(),
  timestamp: Annotation<number>(),
});

// Node that uses user fields
const userNode = async (s: typeof State.State) => {
  return { user: s.user, age: (s.age ?? 0) + 1 };
};

// Node that uses message fields
const messageNode = async (s: typeof State.State) => {
  return { message: (s.message ?? '').toUpperCase(), timestamp: Date.now() };
};

const graph = new StateGraph(State)
  .addNode('userNode', userNode)
  .addNode('messageNode', messageNode)
  .addEdge('__start__', 'userNode')
  .addEdge('userNode', 'messageNode')
  .addEdge('messageNode', '__end__');

const app = graph.compile();

// Example: Start with user fields, then use message fields
(async () => {
  let state = { user: 'Alice', age: 30, message: '', timestamp: 0 };
  state = await app.invoke(state);
  // Now pass message fields (user/age will be ignored by messageNode)
  state = await app.invoke({ ...state, message: 'hello world', timestamp: 0 });
  console.log('Final state:', state);
})(); 