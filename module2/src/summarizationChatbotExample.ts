// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239436-lesson-5-chatbot-w-summarizing-messages-and-memory

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, RemoveMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, Annotation, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

// Environment setup
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// Initialize the model
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

// Define state schema with MessagesAnnotation plus custom summary field
const State = Annotation.Root({
  ...MessagesAnnotation.spec,
  summary: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
});

// Define the logic to call the model
async function callModel(state: typeof State.State) {
  console.log("---CALL MODEL---");
  
  // Get summary if it exists
  const summary = state.summary || "";

  // If there is summary, then we add it
  let messages;
  if (summary) {
    // Add summary to system message
    const systemMessage = new SystemMessage({
      content: `Summary of conversation earlier: ${summary}`
    });

    // Append summary to any newer messages
    messages = [systemMessage, ...state.messages];
  } else {
    messages = state.messages;
  }

  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Define node to produce a summary
async function summarizeConversation(state: typeof State.State) {
  console.log("---SUMMARIZE CONVERSATION---");
  
  // First, we get any existing summary
  const summary = state.summary || "";

  // Create our summarization prompt
  let summaryMessage: string;
  if (summary) {
    // A summary already exists
    summaryMessage = 
      `This is summary of the conversation to date: ${summary}\n\n` +
      "Extend the summary by taking into account the new messages above:";
  } else {
    summaryMessage = "Create a summary of the conversation above:";
  }

  // Add prompt to our history
  const messages = [...state.messages, new HumanMessage({ content: summaryMessage })];
  const response = await model.invoke(messages);

  // Delete all but the 2 most recent messages
  const deleteMessages = state.messages
    .slice(0, -2)
    .filter(m => m.id) // Only include messages with valid IDs
    .map(m => new RemoveMessage({ id: m.id! })); // Use non-null assertion since we filtered
  
  return { 
    summary: String(response.content || ""), 
    messages: deleteMessages 
  };
}

// Determine whether to end or summarize the conversation
function shouldContinue(state: typeof State.State) {
  console.log("---SHOULD CONTINUE---");
  
  const messages = state.messages;
  
  // If there are more than six messages, then we summarize the conversation
  if (messages.length > 6) {
    return "summarize_conversation";
  }
  
  // Otherwise we can just end
  return END;
}

// Define the graph
const workflow = new StateGraph(State)
  .addNode("conversation", callModel)
  .addNode("summarize_conversation", summarizeConversation)
  .addEdge(START, "conversation")
  .addConditionalEdges("conversation", shouldContinue)
  .addEdge("summarize_conversation", END);

// Compile with memory
const memory = new MemorySaver();
const graph = workflow.compile({ checkpointer: memory });

// Helper function to print messages nicely
function prettyPrint(message: any) {
  if (message instanceof AIMessage) {
    console.log(`AI: ${message.content}`);
  } else if (message instanceof HumanMessage) {
    console.log(`Human: ${message.content}`);
  } else {
    console.log(`${message.constructor.name}: ${message.content}`);
  }
}

// Main execution function
async function runChatbotExample() {
  console.log("=== CHATBOT WITH SUMMARIZATION EXAMPLE ===\n");

  // Create a thread
  const config = { configurable: { thread_id: "1" } };

  console.log("1. Starting conversation...");
  // Start conversation
  let inputMessage = new HumanMessage({ content: "hi! I'm Lance" });
  let output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after first interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  console.log("2. Asking about name...");
  inputMessage = new HumanMessage({ content: "what's my name?" });
  output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after second interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  console.log("3. Sharing interest...");
  inputMessage = new HumanMessage({ content: "i like the 49ers!" });
  output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after third interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  // Check current state
  const currentState = await graph.getState(config);
  console.log(`Current message count: ${currentState.values.messages.length}`);
  console.log(`Current summary: "${currentState.values.summary || 'None'}"`);
  console.log();

  console.log("4. Adding more messages to trigger summarization...");
  const additionalMessages = [
    "Tell me more about the 49ers",
    "Who is their quarterback?", 
    "What about their defense?",
    "Do you think they'll win the Super Bowl?"
  ];

  for (const [i, content] of additionalMessages.entries()) {
    console.log(`   ${i + 4}. ${content}`);
    inputMessage = new HumanMessage({ content });
    output = await graph.invoke({ messages: [inputMessage] }, config);
    
    const state = await graph.getState(config);
    console.log(`   Messages: ${state.values.messages.length}, Summary: "${state.values.summary || 'None'}"`);
    
    if (state.values.summary) {
      console.log("   *** SUMMARIZATION TRIGGERED! ***");
      console.log(`   Latest response:`);
      output.messages.slice(-1).forEach(m => console.log(`   ${m.content}`));
      break;
    }
  }

  console.log("\n5. Final state check:");
  const finalState = await graph.getState(config);
  console.log(`Final message count: ${finalState.values.messages.length}`);
  console.log(`Final summary: "${finalState.values.summary || 'None'}"`);
  console.log("\nFinal messages:");
  finalState.values.messages.forEach((msg: any, i: number) => {
    console.log(`  ${i + 1}. ${msg.constructor.name}: ${msg.content?.toString().substring(0, 100)}...`);
  });

  console.log("\n6. Continuing conversation with summarized memory...");
  inputMessage = new HumanMessage({ content: "i like Nick Bosa, isn't he the highest paid defensive player?" });
  output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Response after summarization:");
  output.messages.slice(-1).forEach(prettyPrint);
  
  const endState = await graph.getState(config);
  console.log(`\nEnd summary: "${endState.values.summary || 'None'}"`);
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runChatbotExample().catch(console.error);
}

export { runChatbotExample, graph, State }; 