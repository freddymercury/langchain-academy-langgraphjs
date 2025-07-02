// @https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239435-lesson-4-trim-and-filter-messages

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, RemoveMessage, trimMessages, BaseMessage } from '@langchain/core/messages';

// Define MessagesState manually since it may not be exported
const MessagesState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
});

console.log('=== Filtering and Trimming Messages Examples ===\n');

// Initialize OpenAI Chat Model (will work with API key, gracefully handle without)
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.3,
});

// =============================================================================
// 1. Messages as State - Basic Setup
// =============================================================================

console.log('1. Basic Messages Setup:');

// Create initial messages
const messages = [
  new AIMessage({ content: "So you said you were researching ocean mammals?", name: "Bot" }),
  new HumanMessage({ content: "Yes, I know about whales. But what others should I learn about?", name: "Lance" })
];

// Display messages
messages.forEach((m: BaseMessage) => {
  console.log(`${m._getType()}: ${m.content} (name: ${m.name || 'undefined'})`);
});
console.log();

// =============================================================================
// 2. Simple Graph with Chat Model using MessagesState
// =============================================================================

console.log('2. Simple Graph with Chat Model:');

// Node function that simulates the chat model
const chatModelNode = async (state: typeof MessagesState.State) => {
  console.log('---Chat Model Node---');
  console.log(`Processing ${state.messages.length} messages`);
  
  // Simulate LLM response instead of calling API
  const response = new AIMessage({ 
    content: "I'd recommend learning about dolphins, seals, and narwhals! They're all fascinating marine mammals.",
    name: "Bot" 
  });
  
  return { messages: [response] };
};

// Build simple graph
const simpleGraph = new StateGraph(MessagesState)
  .addNode('chat_model', chatModelNode)
  .addEdge(START, 'chat_model')
  .addEdge('chat_model', END)
  .compile();

// Test simple graph
const simpleResult = await simpleGraph.invoke({ messages });
console.log('Simple Graph Result:');
simpleResult.messages.forEach((m: BaseMessage, i: number) => {
  const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
  console.log(`${i + 1}. ${m._getType()}: ${content} ${m.name ? `(name: ${m.name})` : ''}`);
});
console.log();

// =============================================================================
// 3. Filtering Messages with RemoveMessage and add_messages Reducer
// =============================================================================

console.log('3. Filtering Messages with RemoveMessage:');

// Node that filters messages - keeps only last 2 messages
const filterMessagesNode = (state: typeof MessagesState.State) => {
  console.log('---Filter Messages Node---');
  console.log(`Input: ${state.messages.length} messages`);
  
  // Delete all but the 2 most recent messages
  const deleteMessages = state.messages.slice(0, -2).map(m => 
    new RemoveMessage({ id: m.id || `temp-${Math.random()}` })
  );
  
  console.log(`Will remove ${deleteMessages.length} messages, keeping last 2`);
  return { messages: deleteMessages };
};

// Updated chat model node
const chatModelNodeWithFilter = (state: typeof MessagesState.State) => {
  console.log('---Chat Model Node (with filtering)---');
  console.log(`Processing ${state.messages.length} messages after filtering`);
  
  // Simulate LLM response
  return { 
    messages: [new AIMessage({ 
      content: "Based on your recent question, I'd recommend learning about dolphins, seals, and narwhals!", 
      name: "Bot" 
    })] 
  };
};

// Build graph with filtering
const filterGraph = new StateGraph(MessagesState)
  .addNode('filter', filterMessagesNode)
  .addNode('chat_model', chatModelNodeWithFilter)
  .addEdge(START, 'filter')
  .addEdge('filter', 'chat_model')
  .addEdge('chat_model', END)
  .compile();

// Test with expanded message list (with IDs for removal)
const messagesWithIds = [
  new AIMessage({ content: "Hi.", name: "Bot", id: "1" }),
  new HumanMessage({ content: "Hi.", name: "Lance", id: "2" }),
  new AIMessage({ content: "So you said you were researching ocean mammals?", name: "Bot", id: "3" }),
  new HumanMessage({ content: "Yes, I know about whales. But what others should I learn about?", name: "Lance", id: "4" })
];

const filterResult = await filterGraph.invoke({ messages: messagesWithIds });
console.log('Filter Graph Result:');
filterResult.messages.forEach((m: BaseMessage, i: number) => {
  const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
  console.log(`${i + 1}. ${m._getType()}: ${content} ${m.name ? `(name: ${m.name})` : ''} ${m.id ? `(id: ${m.id})` : ''}`);
});
console.log();

// =============================================================================
// 4. Filtering Messages - Passing Filtered List to Model
// =============================================================================

console.log('4. Filtering Messages by Passing Filtered List:');

// Node that only uses the last message for LLM call
const chatModelNodeFiltered = (state: typeof MessagesState.State) => {
  console.log('---Chat Model Node (filtered input)---');
  const lastMessage = state.messages.slice(-1); // Only use last message
  console.log(`Full state has ${state.messages.length} messages, using ${lastMessage.length} for LLM`);
  
  // Show what we're processing
  if (lastMessage.length > 0) {
    const content = typeof lastMessage[0].content === 'string' ? lastMessage[0].content : JSON.stringify(lastMessage[0].content);
    console.log(`Processing: "${content}"`);
  }
  
  // Simulate LLM response
  const response = new AIMessage({ 
    content: "Narwhals are fascinating! They're known as the 'unicorns of the sea' because of their long tusk.",
    name: "Bot" 
  });
  
  return { messages: [response] };
};

// Build filtered input graph
const filteredInputGraph = new StateGraph(MessagesState)
  .addNode('chat_model', chatModelNodeFiltered)
  .addEdge(START, 'chat_model')
  .addEdge('chat_model', END)
  .compile();

// Expand our message list for testing
const expandedMessages = [
  ...messagesWithIds,
  new AIMessage({ content: "I'd recommend learning about dolphins, seals, and narwhals!", name: "Bot" }),
  new HumanMessage({ content: "Tell me more about Narwhals!", name: "Lance" })
];

const filteredInputResult = await filteredInputGraph.invoke({ messages: expandedMessages });
console.log('Filtered Input Graph Result:');
console.log(`Original messages: ${expandedMessages.length}`);
console.log(`Result messages: ${filteredInputResult.messages.length}`);
filteredInputResult.messages.forEach((m: BaseMessage, i: number) => {
  const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
  console.log(`${i + 1}. ${m._getType()}: ${content} ${m.name ? `(name: ${m.name})` : ''}`);
});
console.log();

// =============================================================================
// 5. Trimming Messages Based on Token Count (Conceptual)
// =============================================================================

console.log('5. Trimming Messages Based on Token Count:');

// Node that simulates trimming messages based on token count
const chatModelNodeTrimmed = (state: typeof MessagesState.State) => {
  console.log('---Chat Model Node (trimmed)---');
  
  // Simulate trimming by keeping only recent messages
  // In real usage, you would use: await trimMessages(state.messages, { maxTokens: 100, ... })
  const maxMessages = 3; // Simulate token-based trimming with message count
  const trimmedMessages = state.messages.slice(-maxMessages);
  
  console.log(`Original messages: ${state.messages.length}, Simulated trimmed messages: ${trimmedMessages.length}`);
  
  // Show what we're processing
  console.log('Messages being processed:');
  trimmedMessages.forEach((m: BaseMessage, i: number) => {
    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    console.log(`  ${i + 1}. ${content.substring(0, 50)}...`);
  });
  
  // Simulate LLM response
  const response = new AIMessage({ 
    content: "Orcas live in all oceans but prefer cooler waters. They're often found in the Pacific Northwest!",
    name: "Bot" 
  });
  
  return { messages: [response] };
};

// Build trimmed graph
const trimmedGraph = new StateGraph(MessagesState)
  .addNode('chat_model', chatModelNodeTrimmed)
  .addEdge(START, 'chat_model')
  .addEdge('chat_model', END)
  .compile();

// Add more messages for testing trimming
const longMessageList = [
  ...expandedMessages,
  new AIMessage({ content: "Narwhals are fascinating! They're known as the 'unicorns of the sea' because of their long tusk.", name: "Bot" }),
  new HumanMessage({ content: "Tell me where Orcas live!", name: "Lance" })
];

console.log('Testing message trimming simulation:');
console.log(`Long message list has ${longMessageList.length} messages`);

const trimmedResult = await trimmedGraph.invoke({ messages: longMessageList });
console.log('\nTrimmed Graph Result:');
trimmedResult.messages.forEach((m: BaseMessage, i: number) => {
  const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
  console.log(`${i + 1}. ${m._getType()}: ${content} ${m.name ? `(name: ${m.name})` : ''}`);
});
console.log();

// =============================================================================
// 6. Combined Example - Custom Message Management
// =============================================================================

console.log('6. Combined Example - Custom Message Management:');

// Custom state that tracks original messages separately
const CustomMessageState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
  originalMessages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
    default: () => [],
  }),
  processedCount: Annotation<number>({
    reducer: (x: number, y: number) => x + y,
    default: () => 0,
  }),
});

const customMessageNode = (state: typeof CustomMessageState.State) => {
  console.log('---Custom Message Management---');
  
  // Store original messages
  const originalMessages = [...state.messages];
  
  // Apply custom filtering: keep system messages and last 2 user messages
  const filteredMessages = state.messages.filter((m: BaseMessage, index: number) => {
    const isSystemMessage = m._getType() === 'system';
    const isRecentUserMessage = index >= state.messages.length - 2;
    return isSystemMessage || isRecentUserMessage;
  });
  
  console.log(`Original: ${originalMessages.length}, Filtered: ${filteredMessages.length} messages`);
  
  // Simulate processing
  const response = new AIMessage({ 
    content: "Based on your recent messages, I can help you learn more about marine mammals!",
    name: "Bot" 
  });
  
  return { 
    messages: [response],
    originalMessages: originalMessages,
    processedCount: 1
  };
};

const customGraph = new StateGraph(CustomMessageState)
  .addNode('custom_process', customMessageNode)
  .addEdge(START, 'custom_process')
  .addEdge('custom_process', END)
  .compile();

const customResult = await customGraph.invoke({ 
  messages: longMessageList,
  originalMessages: [],
  processedCount: 0
});

console.log('Custom Management Result:');
console.log(`Processed Count: ${customResult.processedCount}`);
console.log(`Original Messages Stored: ${customResult.originalMessages.length}`);
console.log(`Current Messages: ${customResult.messages.length}`);
customResult.messages.forEach((m: BaseMessage, i: number) => {
  const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
  console.log(`${i + 1}. ${m._getType()}: ${content} ${m.name ? `(name: ${m.name})` : ''}`);
});

console.log('\n=== Key Takeaways ===');
console.log('1. MessagesState provides built-in message handling with add_messages reducer');
console.log('2. RemoveMessage can be used to delete specific messages from state');
console.log('3. Message filtering can be done at the node level without modifying state');
console.log('4. trimMessages() helps manage token limits by keeping recent messages');
console.log('5. Custom state extensions allow sophisticated message management');
console.log('6. For production use, add proper error handling and API key management');

console.log('\n=== Filtering and Trimming Messages Examples Complete ==='); 