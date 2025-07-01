// Trim and Filter Messages Example
import { StateGraph, Annotation } from '@langchain/langgraph';

// Reducer to keep only the last N messages
const N = 3;
const trimReducer = (prev: string[] = [], next: string[]) => {
  const combined = [...prev, ...next];
  return combined.slice(-N);
};

// Reducer to filter out messages containing 'ignore'
const filterReducer = (prev: string[] = [], next: string[]) => {
  const combined = [...prev, ...next];
  return combined.filter(msg => !msg.includes('ignore'));
};

const State = Annotation.Root({
  input: Annotation<string>(),
  trimmedMessages: Annotation<string[]>({
    reducer: trimReducer,
    default: () => [],
  }),
  filteredMessages: Annotation<string[]>({
    reducer: filterReducer,
    default: () => [],
  }),
});

const graph = new StateGraph(State)
  .addNode('addMessage', (s) => ({
    trimmedMessages: [s.input],
    filteredMessages: [s.input],
  }))
  .addEdge('__start__', 'addMessage')
  .addEdge('addMessage', '__end__');

const app = graph.compile();

// Example: Add messages, see trimming and filtering
(async () => {
  let state: typeof State.State = { trimmedMessages: [], filteredMessages: [], input: '' };
  const inputs = ['hello', 'ignore this', 'world', 'foo', 'ignore that'];
  for (const input of inputs) {
    state = await app.invoke({ ...state, input });
    console.log(`After input '${input}':`);
    console.log('  Trimmed:', state.trimmedMessages);
    console.log('  Filtered:', state.filteredMessages);
  }
})(); 