import { StateGraph, Annotation } from '@langchain/langgraph';

// Define a reducer that keeps only the last N messages
const N = 3;
const rollingReducer = (prev: string[] = [], next: string[]) => {
  const combined = [...prev, ...next];
  return combined.slice(-N);
};

const State = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: rollingReducer,
    default: () => [],
  }),
});

const graph = new StateGraph(State)
  .addNode('addMessage', (s) => ({ messages: [`msg${(s.messages?.length ?? 0) + 1}`] }))
  .addEdge('__start__', 'addMessage')
  .addEdge('addMessage', '__end__');

const app = graph.compile();

// Example: Add messages repeatedly, only last N are kept
let state: typeof State.State = { messages: [] };
for (let i = 0; i < 5; i++) {
  state = await app.invoke(state);
  console.log(`After step ${i + 1}:`, state.messages);
}
// Output: Only last 3 messages are kept 