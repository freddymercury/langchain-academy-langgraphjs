// State Reducers - LangGraph.js Academy Module 2 Lesson 2
// Based on: https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239428-lesson-2-state-reducers

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';
import { AIMessage, HumanMessage, RemoveMessage, BaseMessage } from '@langchain/core/messages';
import { InvalidUpdateError } from '@langchain/langgraph';

// Define MessagesState manually since it may not be exported
const MessagesState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
});

console.log('=== State Reducers Examples ===\n');

// =============================================================================
// 1. Default Overwriting State
// =============================================================================

console.log('1. Default Overwriting State');
console.log('===============================');

// Basic state schema using Annotation
const BasicState = Annotation.Root({
  foo: Annotation<number>(),
});

function node1Basic(state: typeof BasicState.State) {
  console.log('---Node 1---');
  return { foo: state.foo + 1 };
}

// Build graph
const basicBuilder = new StateGraph(BasicState)
  .addNode('node_1', node1Basic)
  .addEdge(START, 'node_1')
  .addEdge('node_1', END);

const basicGraph = basicBuilder.compile();

// Test basic overwriting
console.log('Input: { foo: 1 }');
const basicResult = await basicGraph.invoke({ foo: 1 });
console.log('Output:', basicResult);
console.log('=> By default, LangGraph overwrites the state value\n');

// =============================================================================
// 2. Branching Problem (Demonstrates InvalidUpdateError)
// =============================================================================

console.log('2. Branching Problem');
console.log('====================');

function node1Branch(state: typeof BasicState.State) {
  console.log('---Node 1---');
  return { foo: state.foo + 1 };
}

function node2Branch(state: typeof BasicState.State) {
  console.log('---Node 2---');
  return { foo: state.foo + 1 };
}

function node3Branch(state: typeof BasicState.State) {
  console.log('---Node 3---');
  return { foo: state.foo + 1 };
}

// Build branching graph
const branchBuilder = new StateGraph(BasicState)
  .addNode('node_1', node1Branch)
  .addNode('node_2', node2Branch)
  .addNode('node_3', node3Branch)
  .addEdge(START, 'node_1')
  .addEdge('node_1', 'node_2')
  .addEdge('node_1', 'node_3')
  .addEdge('node_2', END)
  .addEdge('node_3', END);

const branchGraph = branchBuilder.compile();

// Test branching problem
try {
  console.log('Input: { foo: 1 }');
  await branchGraph.invoke({ foo: 1 });
} catch (error: any) {
  console.log('InvalidUpdateError occurred:', error.message);
  console.log('=> Nodes 2 and 3 run in parallel and both try to overwrite the same state key!');
}
console.log();

// =============================================================================
// 3. Reducers - Using Built-in Array Concatenation
// =============================================================================

console.log('3. Reducers - Array Concatenation');
console.log('==================================');

// Custom reducer function for array concatenation
function addArrays(left: number[], right: number[]): number[] {
  return [...(left || []), ...(right || [])];
}

// State schema with reducer
const ArrayState = Annotation.Root({
  foo: Annotation<number[]>({
    reducer: addArrays,
    default: () => [],
  }),
});

function node1Array(state: typeof ArrayState.State) {
  console.log('---Node 1---');
  // Get the last value and increment it
  const lastValue = state.foo.length > 0 ? state.foo[state.foo.length - 1] : 0;
  return { foo: [lastValue + 1] };
}

// Build graph with array reducer
const arrayBuilder = new StateGraph(ArrayState)
  .addNode('node_1', node1Array)
  .addEdge(START, 'node_1')
  .addEdge('node_1', END);

const arrayGraph = arrayBuilder.compile();

// Test array concatenation
console.log('Input: { foo: [1] }');
const arrayResult = await arrayGraph.invoke({ foo: [1] });
console.log('Output:', arrayResult);
console.log('=> The reducer appends new values instead of overwriting\n');

// =============================================================================
// 4. Parallel Execution with Reducers
// =============================================================================

console.log('4. Parallel Execution with Reducers');
console.log('====================================');

function node1Parallel(state: typeof ArrayState.State) {
  console.log('---Node 1---');
  const lastValue = state.foo.length > 0 ? state.foo[state.foo.length - 1] : 0;
  return { foo: [lastValue + 1] };
}

function node2Parallel(state: typeof ArrayState.State) {
  console.log('---Node 2---');
  const lastValue = state.foo.length > 0 ? state.foo[state.foo.length - 1] : 0;
  return { foo: [lastValue + 1] };
}

function node3Parallel(state: typeof ArrayState.State) {
  console.log('---Node 3---');
  const lastValue = state.foo.length > 0 ? state.foo[state.foo.length - 1] : 0;
  return { foo: [lastValue + 1] };
}

// Build parallel graph with reducer
const parallelBuilder = new StateGraph(ArrayState)
  .addNode('node_1', node1Parallel)
  .addNode('node_2', node2Parallel)
  .addNode('node_3', node3Parallel)
  .addEdge(START, 'node_1')
  .addEdge('node_1', 'node_2')
  .addEdge('node_1', 'node_3')
  .addEdge('node_2', END)
  .addEdge('node_3', END);

const parallelGraph = parallelBuilder.compile();

// Test parallel execution
console.log('Input: { foo: [1] }');
const parallelResult = await parallelGraph.invoke({ foo: [1] });
console.log('Output:', parallelResult);
console.log('=> Nodes 2 and 3 run concurrently, both updates are preserved via reducer\n');

// =============================================================================
// 5. Custom Reducers - Handling null/undefined values
// =============================================================================

console.log('5. Custom Reducers - Null Safety');
console.log('=================================');

// Custom reducer that safely handles null/undefined values
function safeReduceList(left: number[] | null | undefined, right: number[] | null | undefined): number[] {
  const leftArray = left || [];
  const rightArray = right || [];
  return [...leftArray, ...rightArray];
}

const SafeArrayState = Annotation.Root({
  foo: Annotation<number[]>({
    reducer: safeReduceList,
    default: () => [],
  }),
});

function nodeSafe(state: typeof SafeArrayState.State) {
  console.log('---Node Safe---');
  return { foo: [2] };
}

const safeBuilder = new StateGraph(SafeArrayState)
  .addNode('node_1', nodeSafe)
  .addEdge(START, 'node_1')
  .addEdge('node_1', END);

const safeGraph = safeBuilder.compile();

// Test with null input
console.log('Input: { foo: undefined }');
const safeResult = await safeGraph.invoke({ foo: undefined });
console.log('Output:', safeResult);
console.log('=> Custom reducer safely handles null/undefined values\n');

// =============================================================================
// 6. Messages and MessagesState
// =============================================================================

console.log('6. Messages and MessagesState');
console.log('=============================');

// Demonstrate MessagesState usage
const ExtendedMessagesState = Annotation.Root({
  ...MessagesState.spec,
  customKey: Annotation<string>(),
});

function chatNode(state: typeof MessagesState.State) {
  console.log('---Chat Node---');
  return {
    messages: [new AIMessage({ content: 'Hello! How can I help you today?' })],
  };
}

const chatBuilder = new StateGraph(MessagesState)
  .addNode('chat', chatNode)
  .addEdge(START, 'chat')
  .addEdge('chat', END);

const chatGraph = chatBuilder.compile();

// Test messages
console.log('Input: { messages: [] }');
const chatResult = await chatGraph.invoke({ messages: [] });
console.log('Output messages:', chatResult.messages.map((m: BaseMessage) => ({ type: m._getType(), content: m.content })));
console.log();

// =============================================================================
// 7. Message Operations - Adding, Overwriting, and Removing
// =============================================================================

console.log('7. Message Operations');
console.log('=====================');

// Demonstrate message operations
const messages = [
  new AIMessage({ content: "Hello! How can I assist you?", id: "1" }),
  new HumanMessage({ content: "I'm looking for information on marine biology.", id: "2" }),
];

console.log('Initial messages:');
messages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg._getType()}: ${msg.content} (id: ${msg.id})`));

// Add a new message
const newMessage = new AIMessage({ content: "Sure, I can help with that. What specifically are you interested in?", id: "3" });
const updatedMessages = [...messages, newMessage];

console.log('\nAfter adding new message:');
updatedMessages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg._getType()}: ${msg.content} (id: ${msg.id})`));

// Demonstrate message overwriting (same ID)
const overwriteMessage = new HumanMessage({ content: "I'm looking for information on whales, specifically", id: "2" });
const overwrittenMessages = messages.map(msg => msg.id === "2" ? overwriteMessage : msg);

console.log('\nAfter overwriting message with id "2":');
overwrittenMessages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg._getType()}: ${msg.content} (id: ${msg.id})`));

// Demonstrate message removal
const messagesToRemove = [new RemoveMessage({ id: "1" })];
console.log('\nRemoving message with id "1":');
const finalMessages = updatedMessages.filter(msg => !messagesToRemove.some(rm => rm.id === msg.id));
finalMessages.forEach((msg, i) => console.log(`  ${i + 1}. ${msg._getType()}: ${msg.content} (id: ${msg.id})`));

console.log('\n=== State Reducers Examples Complete ===');

// =============================================================================
// Summary
// =============================================================================

console.log('\nKey Takeaways:');
console.log('==============');
console.log('1. By default, LangGraph overwrites state values');
console.log('2. Parallel node execution can cause InvalidUpdateError without reducers');
console.log('3. Reducers specify how to combine state updates from multiple nodes');
console.log('4. Custom reducers can handle edge cases like null/undefined values');
console.log('5. MessagesState provides built-in message handling with add_messages reducer');
console.log('6. Messages can be added, overwritten (same ID), or removed using RemoveMessage'); 