import { StateGraph, Annotation } from '@langchain/langgraph';
import { v4 as uuidv4 } from 'uuid';

// Import InMemoryStore from the correct path
import { InMemoryStore } from '@langchain/langgraph';

// Define a state schema
const State = Annotation.Root({
  userId: Annotation<string>(),
  fact: Annotation<string>(),
});

// Create an in-memory store for cross-thread persistence
const store = new InMemoryStore();

// Node to save a fact for a user
const saveFact = async (s: typeof State.State, config: any) => {
  await store.put(['facts', s.userId], uuidv4(), { fact: s.fact });
  return {};
};

// Node to retrieve all facts for a user
const getFacts = async (s: typeof State.State, config: any) => {
  const facts = await store.search(['facts', s.userId]);
  return { fact: facts.map(item => item.value.fact).join('; ') };
};

const graph = new StateGraph(State)
  .addNode('saveFact', saveFact)
  .addNode('getFacts', getFacts)
  .addEdge('__start__', 'saveFact')
  .addEdge('saveFact', 'getFacts')
  .addEdge('getFacts', '__end__');

const app = graph.compile();

// Example: Save and retrieve facts for two users
let result = await app.invoke({ userId: 'alice', fact: 'Loves cats' });
console.log('Alice facts:', result.fact);
result = await app.invoke({ userId: 'alice', fact: 'Plays guitar' });
console.log('Alice facts:', result.fact);
result = await app.invoke({ userId: 'bob', fact: 'Enjoys hiking' });
console.log('Bob facts:', result.fact); 