// Chatbot with Summarizing Messages and Memory
import { StateGraph, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo', temperature: 0 });

const State = Annotation.Root({
  input: Annotation<string>(),
  messages: Annotation<string[]>({
    reducer: (prev = [], next) => [...prev, ...next],
    default: () => [],
  }),
  summary: Annotation<string>(),
  response: Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('addMessage', (s) => ({ messages: [s.input] }))
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
  .addEdge('__start__', 'addMessage')
  .addEdge('addMessage', 'summarize')
  .addEdge('summarize', 'respond')
  .addEdge('respond', '__end__');

const app = graph.compile();

// Example: Simulate a conversation
(async () => {
  let state: typeof State.State = { input: '', messages: [], summary: '', response: '' };
  const inputs = [
    'Hello, how are you?',
    'What is the weather today?',
    'Tell me a joke.',
  ];
  for (const input of inputs) {
    state = await app.invoke({ ...state, input });
    console.log('User:', input);
    console.log('Bot:', state.response);
    console.log('Summary:', state.summary);
  }
})(); 