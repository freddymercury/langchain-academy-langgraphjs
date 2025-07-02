// LangGraphJS Chain Example: Messages, Chat Model, Tool, State, Reducer, Graph
// Run with: tsx chainExample.ts (after installing dependencies)
// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58238466-lesson-4-chain
import 'dotenv/config';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// 1. Define the state schema (messages array)
const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>(),
});

// 2. Set up the chat model (ensure OPENAI_API_KEY is set in your environment)
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// 3. Define a tool (multiply)
const multiply = new DynamicStructuredTool({
  name: 'multiply',
  description: 'Multiply two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  func: async ({ a, b }: { a: number; b: number }) => a * b,
});

const tools = [multiply];
const toolNode = new ToolNode(tools);

// 4. Bind the tool to the LLM
const llmWithTools = llm.bindTools(tools);

// 5. Define the node function for the graph
const toolCallingLLM = async (state: { messages: BaseMessage[] }) => {
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
};

// 6. Build the graph
const builder = new StateGraph(State)
  .addNode('tool_calling_llm', toolCallingLLM)
  .addEdge(START, 'tool_calling_llm')
  .addEdge('tool_calling_llm', END);
const graph = builder.compile();

// 7. Run the graph with a simple message (no tool call expected)
(async () => {
  console.log('--- LLM only ---');
  const result1 = await graph.invoke({ messages: [new HumanMessage({ content: 'Hello!' })] });
  for (const m of result1.messages) {
    console.log(m);
  }

  // 8. Run the graph with a message that should trigger the tool
  console.log('\n--- LLM with tool call ---');
  const result2 = await graph.invoke({ messages: [new HumanMessage({ content: 'Multiply 2 and 3' })] });
  for (const m of result2.messages) {
    console.log(m);
  }
})(); 