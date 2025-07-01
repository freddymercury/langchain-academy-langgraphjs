// Short vs. Long-Term Memory Example
// This lesson demonstrates the difference between short-term (ephemeral) and long-term (persistent) memory in LangGraph.
//
// Short-term memory: State is only available within a single run/thread.
// Long-term memory: State persists across runs/threads (e.g., using a store or checkpointer).

import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import dotenv from 'dotenv';
dotenv.config();

// --- Short-Term Memory Example ---
const ShortTermState = Annotation.Root({
  message: Annotation<string>(),
  count: Annotation<number>(),
});

const shortTermGraph = new StateGraph(ShortTermState)
  .addNode('increment', (s) => ({ count: (s.count ?? 0) + 1 }))
  .addEdge('__start__', 'increment')
  .addEdge('increment', '__end__');

const shortTermApp = shortTermGraph.compile();

// --- Long-Term Memory Example ---
const LongTermState = Annotation.Root({
  userId: Annotation<string>(),
  fact: Annotation<string>(),
});

const store = new InMemoryStore();

const saveFact = async (s: typeof LongTermState.State) => {
  // Save fact for user in persistent store
  await store.put(['facts', s.userId], Date.now().toString(), { fact: s.fact });
  return {};
};

const getFacts = async (s: typeof LongTermState.State) => {
  // Retrieve all facts for user from persistent store
  const facts = await store.search(['facts', s.userId]);
  return { fact: facts.map(item => item.value.fact).join('; ') };
};

const longTermGraph = new StateGraph(LongTermState)
  .addNode('saveFact', saveFact)
  .addNode('getFacts', getFacts)
  .addEdge('__start__', 'saveFact')
  .addEdge('saveFact', 'getFacts')
  .addEdge('getFacts', '__end__');

const longTermApp = longTermGraph.compile();

// --- Example Invocations ---
(async () => {
  console.log('--- Short-Term Memory ---');
  let state = { message: 'Hello', count: 0 };
  state = await shortTermApp.invoke(state);
  console.log('After 1st run:', state);
  state = await shortTermApp.invoke(state);
  console.log('After 2nd run (no memory of previous run):', state);

  console.log('\n--- Long-Term Memory ---');
  let result = await longTermApp.invoke({ userId: 'alice', fact: 'Loves cats' });
  console.log('Alice facts:', result.fact);
  result = await longTermApp.invoke({ userId: 'alice', fact: 'Plays guitar' });
  console.log('Alice facts:', result.fact);
  result = await longTermApp.invoke({ userId: 'bob', fact: 'Enjoys hiking' });
  console.log('Bob facts:', result.fact);
  // Retrieve all facts for Alice
  result = await longTermApp.invoke({ userId: 'alice', fact: '' });
  console.log('Alice all facts:', result.fact);
})(); 