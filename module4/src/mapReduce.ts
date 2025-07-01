// module4/src/mapReduce.ts
// Lesson 3: Map-reduce
// This example demonstrates a map-reduce workflow using LangGraph.js: the map step summarizes each document, and the reduce step combines the summaries.
// Parity: Python Academy Module 4, Lesson 3
// JS API note: Uses 'new Send' for parallel map, and StringOutputParser for output parsing.

import { StateGraph, START, END, Annotation, Send } from '@langchain/langgraph';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import 'dotenv/config';

// --- Model and prompts ---
const model = new ChatOpenAI({ temperature: 0 });

const mapPrompt = PromptTemplate.fromTemplate('Write a concise summary of the following: {content}');
const reducePrompt = PromptTemplate.fromTemplate(`The following is a set of summaries:\n{summaries}\nTake these and distill it into a final, consolidated summary of the main themes.`);

const mapChain = mapPrompt.pipe(model);
const reduceChain = reducePrompt.pipe(model);

// --- State schema ---
const State = Annotation.Root({
  contents: Annotation<string[]>(),
  summaries: Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  final_summary: Annotation<string>(),
});

type StateType = typeof State.State;

type MapState = { content: string };

// --- Map node: summarize a single document ---
async function generateSummary(state: MapState): Promise<{ summaries: string[] }> {
  const summaryMsg = await mapChain.invoke({ content: state.content });
  // AIMessage result, extract .content
  return { summaries: [summaryMsg.content] };
}

// --- Conditional edge: fan out to map step for each document ---
function mapDocuments(state: StateType): Send[] {
  // In JS, use 'new Send' for each parallel branch in map-reduce.
  return state.contents.map((content) => new Send('generate_summary', { content }));
}

// --- Reduce node: combine summaries into a final summary ---
async function generateFinalSummary(state: StateType): Promise<{ final_summary: string }> {
  const finalMsg = await reduceChain.invoke({ summaries: state.summaries.join('\n') });
  return { final_summary: finalMsg.content };
}

// --- Build the graph ---
const graph = new StateGraph(State)
  .addNode('generate_summary', generateSummary)
  .addNode('generate_final_summary', generateFinalSummary)
  .addConditionalEdges(START, mapDocuments, ['generate_summary'])
  .addEdge('generate_summary', 'generate_final_summary')
  .addEdge('generate_final_summary', END)
  .compile();

// --- Example invocation ---
(async () => {
  const docs = [
    'Apples are red.',
    'Blueberries are blue.',
    'Bananas are yellow.'
  ];
  const result = await graph.invoke({ contents: docs });
  console.log('Final summary:', result.final_summary);
})(); 