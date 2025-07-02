import 'dotenv/config';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Note: role property is undefined in LangChain JS - roles are determined by message class type
// Use message._getType() to get the actual role string ('human', 'ai', 'tool')

// 1. Define the state schema (messages array with default reducer)
const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// 2. Define the tools using DynamicStructuredTool
const add = new DynamicStructuredTool({
  name: 'add',
  description: 'Adds a and b.',
  schema: z.object({
    a: z.number().describe('First int'),
    b: z.number().describe('Second int'),
  }),
  func: async ({ a, b }: { a: number; b: number }) => a + b,
});

const multiply = new DynamicStructuredTool({
  name: 'multiply',
  description: 'Multiplies a and b.',
  schema: z.object({
    a: z.number().describe('First int'),
    b: z.number().describe('Second int'),
  }),
  func: async ({ a, b }: { a: number; b: number }) => a * b,
});

const divide = new DynamicStructuredTool({
  name: 'divide',
  description: 'Divides a and b.',
  schema: z.object({
    a: z.number().describe('First int'),
    b: z.number().describe('Second int'),
  }),
  func: async ({ a, b }: { a: number; b: number }) => a / b,
});

const tools = [add, multiply, divide];

// 3. Set up the LLM and bind the tools
const llm = new ChatOpenAI({ model: 'gpt-4o', openAIApiKey: process.env.OPENAI_API_KEY });
const llmWithTools = llm.bindTools(tools);

// 4. System message (use HumanMessage for user, AIMessage for assistant, ToolMessage for tool)
const systemMessage = new AIMessage({
  content: 'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
});

// 5. Node that calls the LLM with tools
async function assistant(state: { messages: BaseMessage[] }) {
  console.log('ASSISTANT NODE - history before:', state.messages.map(m => ({ role: m._getType(), type: m.constructor.name, content: (m as any).content, tool_calls: (m as any).tool_calls })));
  const response = await llmWithTools.invoke(state.messages);
  console.log('ASSISTANT NODE - response:', { role: response._getType(), type: response.constructor.name, content: (response as any).content, tool_calls: (response as any).tool_calls });
  
  // Return only the new response - the reducer will handle concatenation
  return { messages: [response] };
}

// 6. Build the graph
const builder = new StateGraph(State)
  .addNode('assistant', assistant)
  .addNode('tools', new ToolNode(tools))
  .addEdge(START, 'assistant')
  .addConditionalEdges('assistant', toolsCondition)
  .addEdge('tools', 'assistant');

const graph = builder.compile();

// 7. Example usage
async function main() {
  // Initialize with system message and user input
  const messages = [
    systemMessage,
    new HumanMessage({ content: 'What is 2 + 3?' })
  ];
  const result = await graph.invoke({ messages });
  console.log('FINAL RESULT:', result.messages.map(m => ({
    role: m._getType(),
    type: m.constructor.name,
    content: (m as any).content,
    tool_calls: (m as any).tool_calls
  })));
  for (const m of result.messages) {
    if (typeof (m as any).prettyPrint === 'function') {
      (m as any).prettyPrint();
    } else {
      console.log(m);
    }
  }
}

main().catch(console.error); 