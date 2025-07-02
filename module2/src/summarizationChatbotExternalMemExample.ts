// https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239440-lesson-6-chatbot-w-summarizing-messages-and-external-memory

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, RemoveMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, Annotation, START, END } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

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

// Create SQLite database and connection
function createSqliteCheckpointer(): SqliteSaver {
  // Create state_db directory if it doesn't exist
  const stateDbDir = path.join(process.cwd(), "state_db");
  if (!fs.existsSync(stateDbDir)) {
    fs.mkdirSync(stateDbDir, { recursive: true });
  }

  // Create database connection
  const dbPath = path.join(stateDbDir, "example.db");
  console.log(`Using SQLite database at: ${dbPath}`);
  
  // For in-memory database, use ":memory:"
  // For persistent database, use file path
  const conn = new Database(dbPath, { verbose: console.log });
  
  return new SqliteSaver(conn);
}

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
async function runExternalMemoryExample() {
  console.log("=== CHATBOT WITH SUMMARIZATION & EXTERNAL MEMORY EXAMPLE ===\n");

  // Create SQLite checkpointer for external memory
  const memory = createSqliteCheckpointer();

  // Define the graph
  const workflow = new StateGraph(State)
    .addNode("conversation", callModel) 
    .addNode("summarize_conversation", summarizeConversation)
    .addEdge(START, "conversation")
    .addConditionalEdges("conversation", shouldContinue)
    .addEdge("summarize_conversation", END);

  // Compile with SQLite memory
  const graph = workflow.compile({ checkpointer: memory });

  // Create a thread
  const config = { configurable: { thread_id: "1" } };

  console.log("1. Starting conversation with external SQLite memory...");
  // Start conversation
  let inputMessage = new HumanMessage({ content: "hi! I'm Lance" });
  let output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after first interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  console.log("2. Testing persistence - simulating restart...");
  // The state should be persisted in the SQLite database
  const currentState = await graph.getState(config);
  console.log(`Persisted message count: ${currentState.values.messages.length}`);
  console.log(`Persisted summary: "${currentState.values.summary || 'None'}"`);
  console.log();

  console.log("3. Continuing conversation from persisted state...");
  inputMessage = new HumanMessage({ content: "what's my name?" });
  output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after second interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  console.log("4. Adding more content...");
  inputMessage = new HumanMessage({ content: "i like the 49ers!" });
  output = await graph.invoke({ messages: [inputMessage] }, config);
  console.log("Messages after third interaction:");
  output.messages.slice(-1).forEach(prettyPrint);
  console.log(`Current summary: "${output.summary || 'None'}"`);
  console.log();

  // Check current state
  const currentStateAfter = await graph.getState(config);
  console.log(`Current message count: ${currentStateAfter.values.messages.length}`);
  console.log(`Current summary: "${currentStateAfter.values.summary || 'None'}"`);
  console.log();

  console.log("5. Adding more messages to trigger summarization...");
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

  console.log("\n6. Testing persistence after summarization...");
  const finalState = await graph.getState(config);
  console.log(`Final message count: ${finalState.values.messages.length}`);
  console.log(`Final summary: "${finalState.values.summary || 'None'}"`);
  console.log("\nFinal messages:");
  finalState.values.messages.forEach((msg: any, i: number) => {
    console.log(`  ${i + 1}. ${msg.constructor.name}: ${msg.content?.toString().substring(0, 100)}...`);
  });

  console.log("\n7. Simulating complete restart - creating new graph instance...");
  // Create a completely new graph instance to simulate application restart
  const newMemory = createSqliteCheckpointer();
  const newWorkflow = new StateGraph(State)
    .addNode("conversation", callModel)
    .addNode("summarize_conversation", summarizeConversation)
    .addEdge(START, "conversation")
    .addConditionalEdges("conversation", shouldContinue)
    .addEdge("summarize_conversation", END);

  const newGraph = newWorkflow.compile({ checkpointer: newMemory });

  // Same thread_id should load the persisted state
  const persistedState = await newGraph.getState(config);
  console.log(`Loaded from external DB - Messages: ${persistedState.values.messages.length}`);
  console.log(`Loaded from external DB - Summary: "${persistedState.values.summary || 'None'}"`);

  console.log("\n8. Continuing conversation with loaded state...");
  inputMessage = new HumanMessage({ content: "Do you remember our conversation about the 49ers?" });
  output = await newGraph.invoke({ messages: [inputMessage] }, config);
  console.log("Response from restarted application:");
  output.messages.slice(-1).forEach(prettyPrint);

  console.log("\n9. Testing with different thread_id...");
  const newThreadConfig = { configurable: { thread_id: "2" } };
  inputMessage = new HumanMessage({ content: "Hi, this is a new conversation" });
  output = await newGraph.invoke({ messages: [inputMessage] }, newThreadConfig);
  console.log("New thread response:");
  output.messages.slice(-1).forEach(prettyPrint);

  const newThreadState = await newGraph.getState(newThreadConfig);
  console.log(`New thread - Messages: ${newThreadState.values.messages.length}`);
  console.log(`New thread - Summary: "${newThreadState.values.summary || 'None'}"`);

  console.log("\n=== EXTERNAL MEMORY PERSISTENCE DEMO COMPLETE ===");
  console.log("Key benefits demonstrated:");
  console.log("- State persists across application restarts");
  console.log("- SQLite provides durable external storage");
  console.log("- Thread isolation works correctly");
  console.log("- Summarization reduces memory while preserving context");
}

// Run the example (ESM equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
  runExternalMemoryExample().catch(console.error);
}

export { runExternalMemoryExample }; 