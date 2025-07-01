// Build an Agent with Long-Term Memory Example
// This lesson demonstrates building an agent that uses long-term memory (via LangGraph store) to answer questions and remember facts across runs.
// The agent uses OpenAI for LLM (if available) and stores/retrieves facts for each user.
// JS/TS API differences from Python are noted in comments.

import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

// Set up the LLM (OpenAI)
const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo', temperature: 0 });

// Define a state schema for the agent
const AgentState = Annotation.Root({
  userId: Annotation<string>(),
  input: Annotation<string>(),
  response: Annotation<string>(),
  facts: Annotation<string>(),
});

const store = new InMemoryStore();

// Node to save a fact for a user
const saveFact = async (s: typeof AgentState.State) => {
  if (s.input.startsWith('Remember:')) {
    const fact = s.input.replace('Remember:', '').trim();
    await store.put(['facts', s.userId], Date.now().toString(), { fact });
    return { response: 'I will remember that.' };
  }
  return {};
};

// Node to retrieve all facts for a user
const retrieveFacts = async (s: typeof AgentState.State) => {
  const facts = await store.search(['facts', s.userId]);
  return { facts: facts.map(item => item.value.fact).join('; ') };
};

// Node to generate a response using LLM and facts
const respond = async (s: typeof AgentState.State) => {
  let prompt = '';
  if (s.facts) {
    prompt += `Known facts: ${s.facts}\n`;
  }
  prompt += `User: ${s.input}\nAssistant:`;
  const result = await llm.invoke([{ role: 'system', content: prompt }]);
  return { response: result.content };
};

const graph = new StateGraph(AgentState)
  .addNode('saveFact', saveFact)
  .addNode('retrieveFacts', retrieveFacts)
  .addNode('respond', respond)
  .addEdge('__start__', 'saveFact')
  .addEdge('saveFact', 'retrieveFacts')
  .addEdge('retrieveFacts', 'respond')
  .addEdge('respond', '__end__');

const app = graph.compile();

// Example: Interact with the agent, storing and recalling facts
(async () => {
  console.log('--- Agent with Long-Term Memory Example ---');
  let state = { userId: 'alice', input: 'Remember: My favorite color is blue.', response: '', facts: '' };
  state = await app.invoke(state);
  console.log('User:', state.input);
  console.log('Agent:', state.response);

  state = await app.invoke({ ...state, input: 'What is my favorite color?' });
  console.log('User:', state.input);
  console.log('Agent:', state.response);

  state = await app.invoke({ ...state, input: 'Remember: I have a cat named Whiskers.' });
  console.log('User:', state.input);
  console.log('Agent:', state.response);

  state = await app.invoke({ ...state, input: 'Tell me something you know about me.' });
  console.log('User:', state.input);
  console.log('Agent:', state.response);
})(); 