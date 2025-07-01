/**
 * Lesson: Assistants
 *
 * This lesson explains the concept of assistants in LangGraph Server/Platform, how they relate to deployed graphs, and how to interact with them using the JS SDK.
 *
 * Assistants are agentic applications (graphs) deployed to LangGraph Server/Platform. Each assistant is a graph paired with specific configuration settings. You can have multiple assistants per graph, each with unique settings.
 *
 * References:
 * - https://langchain-ai.github.io/langgraph/concepts/langgraph_server/
 * - https://langchain-ai.github.io/langgraph/cloud/quick_start/
 *
 * Differences from Python:
 * - Use the @langchain/langgraph-sdk package in JS/TS.
 * - Assistant IDs are referenced by name (from langgraph.json) or listed via the SDK.
 */

// To use the LangGraph JS SDK, install it with:
// npm install @langchain/langgraph-sdk

async function main() {
  // Replace with your actual deployment URL and LangSmith API key
  const deploymentUrl = "https://your-deployment-url";
  const apiKey = "your-langsmith-api-key";

  const { Client } = await import("@langchain/langgraph-sdk");
  const client = new Client({ apiUrl: deploymentUrl, apiKey });

  // As of the current SDK, there may not be a 'list' method for assistants.
  // If not, use the assistant ID from langgraph.json (e.g., 'agent').
  // const assistants = await client.assistants.list(); // <-- May not exist
  // console.log("--- Available Assistants (Graphs) ---");
  // for (const assistant of assistants) {
  //   console.log(`ID: ${assistant.assistant_id}, Name: ${assistant.name}`);
  // }

  const assistantId = "agent"; // Use the assistant ID from langgraph.json

  // Create a new thread
  const thread = await client.threads.create();

  // Send a message to the assistant
  const run = await client.runs.create(
    thread["thread_id"],
    assistantId,
    { input: { messages: [{ role: "human", content: "Hello, assistant!" }] } }
  );

  // Wait for the run to complete
  await client.runs.join(thread["thread_id"], run["run_id"]);

  // Get the final state of the thread
  const state = await client.threads.getState(thread["thread_id"]);

  // Print all messages in the thread
  console.log("--- Assistant Conversation ---");
  for (const m of state['values']['messages']) {
    console.log(`[${m.type}]: ${m.content}`);
  }
}

main().catch((err) => {
  console.error("Error in assistants example:", err);
}); 