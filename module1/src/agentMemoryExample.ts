//https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239417-lesson-7-agent-with-memory
// module1/src/agentMemoryExample.ts
import 'dotenv/config';
import { MemorySaver } from '@langchain/langgraph';
import { StateGraph, MessagesAnnotation, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { toolsCondition } from '@langchain/langgraph/prebuilt';

// Define math tools
const addTool = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a + b;
  },
  {
    name: 'add',
    description: 'Adds a and b.',
    schema: z.object({
      a: z.number().describe('first number'),
      b: z.number().describe('second number'),
    }),
  }
);

const multiplyTool = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a * b;
  },
  {
    name: 'multiply',
    description: 'Multiply a and b.',
    schema: z.object({
      a: z.number().describe('first number'),
      b: z.number().describe('second number'),
    }),
  }
);

const divideTool = tool(
  async ({ a, b }: { a: number; b: number }) => {
    return a / b;
  },
  {
    name: 'divide',
    description: 'Divide a and b.',
    schema: z.object({
      a: z.number().describe('first number'),
      b: z.number().describe('second number'),
    }),
  }
);

const tools = [addTool, multiplyTool, divideTool];

// Initialize LLM with tools
const llm = new ChatOpenAI({ 
  model: 'gpt-4o',
  temperature: 0 
});
const llmWithTools = llm.bindTools(tools);

// System message
const systemMessage = new SystemMessage(
  'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
);

// Assistant node
const assistant = async (state: typeof MessagesAnnotation.State) => {
  const messages = [systemMessage, ...state.messages];
  const response = await llmWithTools.invoke(messages);
  return { messages: [response] };
};

// Create the graph
const builder = new StateGraph(MessagesAnnotation)
  .addNode('assistant', assistant)
  .addNode('tools', new ToolNode(tools))
  .addEdge(START, 'assistant')
  .addConditionalEdges('assistant', toolsCondition)
  .addEdge('tools', 'assistant');

// Compile graph without memory first
const reactGraph = builder.compile();

// Example 1: Agent without memory
console.log('=== Agent WITHOUT Memory ===');

// First conversation
console.log('\n--- First conversation ---');
let messages = [new HumanMessage('Add 3 and 4.')];
let result = await reactGraph.invoke({ messages });
console.log('Result:', result.messages[result.messages.length - 1].content);

// Second conversation (loses context)
console.log('\n--- Second conversation (no memory) ---');
messages = [new HumanMessage('Multiply that by 2.')];
result = await reactGraph.invoke({ messages });
console.log('Result:', result.messages[result.messages.length - 1].content);

console.log('\n🔍 Notice: The agent asks "what should I multiply by 2?" because it has no memory of the previous conversation.\n');

// Example 2: Agent with memory
console.log('=== Agent WITH Memory ===');

// Create memory checkpointer
const memory = new MemorySaver();
const reactGraphMemory = builder.compile({ checkpointer: memory });

// Configuration with thread_id for memory
const config = { configurable: { thread_id: '1' } };

// First conversation with memory
console.log('\n--- First conversation with memory ---');
messages = [new HumanMessage('Add 3 and 4.')];
result = await reactGraphMemory.invoke({ messages }, config);
console.log('Result:', result.messages[result.messages.length - 1].content);

// Second conversation with memory (retains context)
console.log('\n--- Second conversation with memory ---');
messages = [new HumanMessage('Multiply that by 2.')];
result = await reactGraphMemory.invoke({ messages }, config);
console.log('Result:', result.messages[result.messages.length - 1].content);

console.log('\n🎉 Success! The agent remembers that "that" refers to 7 from the previous conversation.');

// Example 3: Multiple threads
console.log('\n=== Multiple Memory Threads ===');

// Different thread - fresh conversation
const config2 = { configurable: { thread_id: '2' } };

console.log('\n--- Thread 2: New conversation ---');
messages = [new HumanMessage('What is 10 divided by 2?')];
result = await reactGraphMemory.invoke({ messages }, config2);
console.log('Thread 2 Result:', result.messages[result.messages.length - 1].content);

// Back to original thread - memory intact
console.log('\n--- Back to Thread 1: Memory intact ---');
messages = [new HumanMessage('What was the result of our multiplication?')];
result = await reactGraphMemory.invoke({ messages }, config);
console.log('Thread 1 Result:', result.messages[result.messages.length - 1].content);

console.log('\n✨ Each thread maintains its own conversation history!'); 