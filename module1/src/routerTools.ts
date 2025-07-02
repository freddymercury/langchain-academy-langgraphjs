// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58238466-lesson-4-chain
import 'dotenv/config';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// 1. Define the state schema (messages array)
const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>(),
});

// 2. Define the multiply tool using DynamicStructuredTool
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

// 3. Set up the LLM and bind the tool
const llm = new ChatOpenAI({ model: 'gpt-4o', openAIApiKey: process.env.OPENAI_API_KEY });
const llmWithTools = llm.bindTools(tools);

// 4. Node that calls the LLM with tools
async function toolCallingLLM(state: { messages: BaseMessage[] }) {
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
}

// 5. Build the graph
const builder = new StateGraph(State)
  .addNode('tool_calling_llm', toolCallingLLM)
  .addNode('tools', new ToolNode(tools))
  .addEdge(START, 'tool_calling_llm')
  .addConditionalEdges('tool_calling_llm', toolsCondition)
  .addEdge('tools', END);

const graph = builder.compile();

envCheck();
async function main() {
  const messages = [new HumanMessage({ content: 'Hello, what is 2 multiplied by 2?' })];
  const result = await graph.invoke({ messages });
  for (const m of result.messages) {
    if (typeof (m as any).prettyPrint === 'function') {
      (m as any).prettyPrint();
    } else {
      console.log(m);
    }
  }
}

function envCheck() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Please set your OPENAI_API_KEY environment variable.');
    process.exit(1);
  }
}

main().catch(console.error); 