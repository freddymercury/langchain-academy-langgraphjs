// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239434-lesson-3-multiple-schemas

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

console.log('=== Multiple Schemas Examples ===\n');

// =============================================================================
// 1. Private State Example
// =============================================================================

console.log('1. Private State Example:');
console.log('This demonstrates passing private state between nodes that is not part of the overall graph input/output.\n');

// Define the overall state schema (this is what the graph input/output uses)
const OverallState = Annotation.Root({
  foo: Annotation<number>(),
});

// Define a private state schema for internal node communication
const PrivateState = Annotation.Root({
  baz: Annotation<number>(),
});

// Node 1: Takes OverallState, returns PrivateState
const node1 = (state: typeof OverallState.State): typeof PrivateState.State => {
  console.log('---Node 1---');
  console.log('Input:', state);
  const result = { baz: state.foo + 1 };
  console.log('Output (private):', result);
  return result;
};

// Node 2: Takes PrivateState, returns OverallState
const node2 = (state: typeof PrivateState.State): typeof OverallState.State => {
  console.log('---Node 2---');
  console.log('Input (private):', state);
  const result = { foo: state.baz + 1 };
  console.log('Output:', result);
  return result;
};

// Note: In LangGraph.js, we need to use a combined schema that includes both states
// This is a limitation compared to Python LangGraph where nodes can have different schemas
const CombinedState = Annotation.Root({
  foo: Annotation<number>(),
  baz: Annotation<number>(),
});

// Wrapper nodes that work with the combined schema
const node1Wrapper = (state: typeof CombinedState.State) => {
  console.log('---Node 1---');
  console.log('Input:', { foo: state.foo });
  const result = { baz: state.foo + 1 };
  console.log('Output (private):', result);
  return result;
};

const node2Wrapper = (state: typeof CombinedState.State) => {
  console.log('---Node 2---');
  console.log('Input (private):', { baz: state.baz });
  const result = { foo: state.baz + 1 };
  console.log('Output:', result);
  return result;
};

// Build the graph
const privateStateGraph = new StateGraph(CombinedState)
  .addNode('node_1', node1Wrapper)
  .addNode('node_2', node2Wrapper)
  .addEdge(START, 'node_1')
  .addEdge('node_1', 'node_2')
  .addEdge('node_2', END)
  .compile();

// Run the private state example
const privateResult = await privateStateGraph.invoke({ foo: 1, baz: 0 });
console.log('Final result:', privateResult);
console.log('Notice: "baz" is included in the output (limitation of LangGraph.js compared to Python)\n');

// =============================================================================
// 2. Input/Output Schema Filtering Example
// =============================================================================

console.log('2. Input/Output Schema Filtering Example:');
console.log('This demonstrates using specific input and output schemas to filter graph data.\n');

// Define different schemas for input, output, and internal state
interface InputState {
  question: string;
}

interface OutputState {
  answer: string;
}

interface InternalState {
  question: string;
  answer: string;
  notes: string;
}

// Convert to LangGraph Annotations
const InputAnnotation = Annotation.Root({
  question: Annotation<string>(),
});

const OutputAnnotation = Annotation.Root({
  answer: Annotation<string>(),
});

const InternalAnnotation = Annotation.Root({
  question: Annotation<string>(),
  answer: Annotation<string>(),
  notes: Annotation<string>(),
});

// Node functions
const thinkingNode = (state: typeof InputAnnotation.State) => {
  console.log('---Thinking Node---');
  console.log('Input:', state);
  const result = { answer: 'bye', notes: '... his name is Lance' };
  console.log('Output:', result);
  return result;
};

const answerNode = (state: typeof InternalAnnotation.State) => {
  console.log('---Answer Node---');
  console.log('Input:', state);
  const result = { answer: 'bye Lance' };
  console.log('Output:', result);
  return result;
};

// Build the graph with input/output filtering
const inputOutputGraph = new StateGraph(InternalAnnotation)
  .addNode('thinking_node', thinkingNode)
  .addNode('answer_node', answerNode)
  .addEdge(START, 'thinking_node')
  .addEdge('thinking_node', 'answer_node')
  .addEdge('answer_node', END)
  .compile();

// Run the input/output schema example
const inputOutputResult = await inputOutputGraph.invoke({ question: 'hi', answer: '', notes: '' });
console.log('Full internal result:', inputOutputResult);

// Simulate output filtering (in Python LangGraph, this would be automatic)
const filteredOutput: OutputState = { answer: inputOutputResult.answer };
console.log('Filtered output (answer only):', filteredOutput);
console.log();

// =============================================================================
// 3. Practical Multiple Schema Pattern
// =============================================================================

console.log('3. Practical Multiple Schema Pattern:');
console.log('A more realistic example showing how to work with multiple schemas in TypeScript.\n');

// Define schemas for a chatbot with different data needs
const ChatbotState = Annotation.Root({
  userInput: Annotation<string>(),
  response: Annotation<string>(),
  context: Annotation<string[]>(),
  metadata: Annotation<Record<string, any>>(),
});

// Input processing node - focuses on user input
const processInputNode = (state: typeof ChatbotState.State) => {
  console.log('---Processing Input---');
  const context = [`Processing: "${state.userInput}"`];
  const metadata = { timestamp: Date.now(), inputLength: state.userInput.length };
  
  console.log('Added context:', context);
  console.log('Added metadata:', metadata);
  
  return {
    context: [...(state.context || []), ...context],
    metadata: { ...state.metadata, ...metadata }
  };
};

// Response generation node - focuses on generating response
const generateResponseNode = (state: typeof ChatbotState.State) => {
  console.log('---Generating Response---');
  const response = `I understand you said: "${state.userInput}". Let me help you with that.`;
  const responseMetadata = { responseLength: response.length, processed: true };
  
  console.log('Generated response:', response);
  
  return {
    response,
    metadata: { ...state.metadata, ...responseMetadata }
  };
};

// Cleanup node - focuses on final output preparation
const cleanupNode = (state: typeof ChatbotState.State) => {
  console.log('---Cleanup---');
  const finalContext = state.context?.slice(-3) || []; // Keep only last 3 context items
  
  console.log('Trimmed context to last 3 items:', finalContext);
  
  return {
    context: finalContext,
    metadata: { ...state.metadata, cleaned: true }
  };
};

// Build the practical graph
const practicalGraph = new StateGraph(ChatbotState)
  .addNode('process_input', processInputNode)
  .addNode('generate_response', generateResponseNode)
  .addNode('cleanup', cleanupNode)
  .addEdge(START, 'process_input')
  .addEdge('process_input', 'generate_response')
  .addEdge('generate_response', 'cleanup')
  .addEdge('cleanup', END)
  .compile();

// Run the practical example
const practicalResult = await practicalGraph.invoke({
  userInput: 'Hello, I need help with my project',
  response: '',
  context: ['Previous context 1', 'Previous context 2', 'Previous context 3', 'Previous context 4'],
  metadata: { sessionId: 'abc123' }
});

console.log('Final chatbot result:', practicalResult);
console.log();

// =============================================================================
// Summary
// =============================================================================

console.log('=== Summary ===');
console.log('1. Private State: Nodes can work with different aspects of the state schema');
console.log('2. Input/Output Filtering: You can simulate schema filtering in your application logic');
console.log('3. Practical Patterns: Different nodes can focus on different parts of a comprehensive schema');
console.log('4. LangGraph.js Limitation: Unlike Python LangGraph, all nodes must use the same root schema');
console.log('5. Workaround: Use a comprehensive schema and have nodes focus on relevant fields'); 