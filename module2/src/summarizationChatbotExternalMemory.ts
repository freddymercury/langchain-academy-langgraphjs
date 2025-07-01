// Chatbot with Summarizing Messages and External Memory
import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo', temperature: 0 });
const embeddings = new OpenAIEmbeddings();
const store = new InMemoryStore();

const State = Annotation.Root({
  input: Annotation<string>(),
  messages: Annotation<string[]>({
    reducer: (prev = [], next) => [...prev, ...next],
    default: () => [],
  }),
  summary: Annotation<string>(),
  response: Annotation<string>(),
});

// Node to save message to vector store
const saveToMemory = async (s: typeof State.State) => {
  const id = uuidv4();
  await store.put(['chat', 'history'], id, { text: s.input });
  return { messages: [s.input] };
};

// Node to retrieve similar messages from vector store
const retrieveMemory = async (s: typeof State.State) => {
  const results = await store.search(['chat', 'history'], {
    query: s.input,
    embedding: await embeddings.embedQuery(s.input),
    limit: 3,
  });
  const retrieved = results.map(r => r.value.text);
  return { messages: retrieved };
};

const graph = new StateGraph(State)
  .addNode('saveToMemory', saveToMemory)
  .addNode('retrieveMemory', retrieveMemory)
  .addNode('summarize', async (s) => {
    const prompt = [
      { role: 'system', content: 'Summarize the following conversation in 1-2 sentences.' },
      { role: 'user', content: s.messages.join('\n') },
    ];
    const response = await llm.invoke(prompt);
    return { summary: response.content };
  })
  .addNode('respond', async (s) => {
    const prompt = [
      { role: 'system', content: 'You are a helpful assistant. Here is the conversation summary:' },
      { role: 'user', content: s.summary },
      { role: 'user', content: s.input },
    ];
    const response = await llm.invoke(prompt);
    return { response: response.content };
  })
  .addEdge('__start__', 'saveToMemory')
  .addEdge('saveToMemory', 'retrieveMemory')
  .addEdge('retrieveMemory', 'summarize')
  .addEdge('summarize', 'respond')
  .addEdge('respond', '__end__');

const app = graph.compile();

// Example: Simulate a conversation with external memory
(async () => {
  let state: typeof State.State = { input: '', messages: [], summary: '', response: '' };
  const inputs = [
    'What is the capital of France?',
    'Remind me what I asked before.',
    'Tell me something related to France.',
  ];
  for (const input of inputs) {
    state = await app.invoke({ ...state, input });
    console.log('User:', input);
    console.log('Bot:', state.response);
    console.log('Summary:', state.summary);
  }
})(); 