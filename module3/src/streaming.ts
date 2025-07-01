// module3/src/streaming.ts
// Lesson 1: Streaming
// This example demonstrates how to stream LLM tokens and state updates in LangGraph.js.
// Parity: Python Academy Module 3, Lesson 1

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import 'dotenv/config';

// Define the state schema
const State = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
});

// Create a prompt and LLM
const prompt = new PromptTemplate({
  template: 'Repeat this back to me: {input}',
  inputVariables: ['input'],
});
const llm = new ChatOpenAI({ temperature: 0, streaming: true });
const chain = prompt.pipe(llm);

// Define the streaming node
const streamingNode = async (state: { input: string }) => {
  // The chain returns an async iterator when streaming is enabled
  const stream = await chain.stream({ input: state.input });
  let output = '';
  for await (const chunk of stream) {
    // Each chunk is an AIMessageChunk; extract the text property
    if (typeof chunk === 'string') {
      output += chunk;
    } else if (chunk && typeof chunk === 'object' && 'content' in chunk) {
      output += chunk.content;
    }
  }
  return { output };
};

// Build the graph
const graph = new StateGraph(State)
  .addNode('stream', streamingNode)
  .addEdge(START, 'stream')
  .addEdge('stream', END)
  .compile();

// Example invocation
(async () => {
  const result = await graph.invoke({ input: 'Hello, streaming world!' });
  console.log('Final output:', result.output);
})(); 