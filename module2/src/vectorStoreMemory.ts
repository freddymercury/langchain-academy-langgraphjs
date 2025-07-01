import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import { OpenAIEmbeddings } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Set up OpenAI embeddings
const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-small' });

// Create a vector-enabled in-memory store
const store = new InMemoryStore({
  index: {
    embeddings,
    dims: 1536, // text-embedding-3-small output dims
    fields: ['data'], // which field to embed
  },
});

const State = Annotation.Root({
  userId: Annotation<string>(),
  data: Annotation<string>(),
  query: Annotation<string>(),
  result: Annotation<string>(),
});

const graph = new StateGraph(State)
  // Node to store a memory
  .addNode('storeMemory', async (s, config) => {
    if (s.data) {
      await config.store.put(['memories', s.userId], uuidv4(), { data: s.data });
    }
    return {};
  })
  // Node to search memories
  .addNode('searchMemory', async (s, config) => {
    const results = await config.store.search(['memories', s.userId], { query: s.query, limit: 3 });
    const memories = results.map((item: any) => item.value.data).join('; ');
    return { result: memories };
  })
  .addEdge('__start__', 'storeMemory')
  .addEdge('storeMemory', 'searchMemory')
  .addEdge('searchMemory', '__end__');

const app = graph.compile({ store });

// Example: Store and semantically search memories
(async () => {
  const userId = 'alice';
  // Store some memories
  await app.invoke({ userId, data: 'I love pizza.', query: '', result: '' });
  await app.invoke({ userId, data: 'My favorite color is blue.', query: '', result: '' });
  await app.invoke({ userId, data: 'I have a cat named Whiskers.', query: '', result: '' });
  // Search for a memory
  const state = await app.invoke({ userId, data: '', query: 'pet', result: '' });
  console.log('Top semantic search result:', state.result);
})(); 