// module4/src/parallelization.ts
// Lesson 1: Parallelization
// This example demonstrates how to run multiple LLM calls in parallel using LangGraph.js and LangChain Expression Language (LCEL).
// Parity: Python Academy Module 4, Lesson 1
// JS API note: Uses RunnableMap (RunnableParallel) from @langchain/core/runnables.

import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableMap } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';

// Create the LLM instance
const model = new ChatOpenAI({ temperature: 0 });

// Define two prompt templates
const jokePrompt = PromptTemplate.fromTemplate('Tell me a joke about {topic}');
const poemPrompt = PromptTemplate.fromTemplate('Write a 2-line poem about {topic}');

// Create two chains by piping the prompt to the model
const jokeChain = jokePrompt.pipe(model);
const poemChain = poemPrompt.pipe(model);

// Combine the chains in parallel using RunnableMap (RunnableParallel)
const parallelChain = RunnableMap.from({
  joke: jokeChain,
  poem: poemChain,
});

// Example invocation
(async () => {
  const topic = 'bears';
  const result = await parallelChain.invoke({ topic });
  // Each result is an AIMessage; extract the content property
  console.log('Joke:', result.joke.content);
  console.log('Poem:', result.poem.content);
})();

// TODO: Implement the parallelization lesson following the Python Academy example.
//       - Define the state schema
//       - Create multiple LLM nodes
//       - Run them in parallel in the graph
//       - Collect and return results 