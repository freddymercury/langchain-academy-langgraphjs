// module1/src/chainNode.ts
import { StateGraph, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import 'dotenv/config';

const prompt = new PromptTemplate({
  template: 'Translate to pirate‑speak: {input}',
  inputVariables: ['input'],
});
const llm = new ChatOpenAI({ temperature: 0 });
const chain = prompt.pipe(llm);

const State = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('pirateify', async (s) => ({ output: await chain.invoke({ input: s.input }) }))
  .addEdge('__start__', 'pirateify')
  .addEdge('pirateify', '__end__');

const app = graph.compile();
console.log(await app.invoke({ input: 'Hello, friend' }).then((r) => r.output));