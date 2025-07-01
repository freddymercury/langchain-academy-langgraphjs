import { StateGraph, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.slice(0,4) + '...' + process.env.OPENAI_API_KEY.slice(-4) : undefined);

// LLM for summarization
const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo', temperature: 0 });

const State = Annotation.Root({
  input: Annotation<string>(),
  summary: Annotation<string>(),
  messages: Annotation<string[]>({
    reducer: (prev = [], next) => [...prev, ...next],
    default: () => [],
  }),
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
  .addEdge('__start__', 'addMessage')
  .addEdge('addMessage', 'summarize')
  .addEdge('summarize', '__end__');

const app = graph.compile();

// Example: Add messages and summarize
(async () => {
  let state: typeof State.State = { input: 'Hello, how are you?', messages: [], summary: '' };
  state = await app.invoke(state);
  state = await app.invoke({ ...state, input: 'I am fine, thank you! What about you?' });
  state = await app.invoke({ ...state, input: 'I am doing well, working on a project.' });
  console.log('Summary:', state.summary);
})(); 