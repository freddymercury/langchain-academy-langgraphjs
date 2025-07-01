/**
 * Lesson: Double Texting
 *
 * This lesson demonstrates how to handle double texting (concurrent user messages) in a deployed LangGraph.js application.
 *
 * Double texting occurs when a user sends a new message before the previous run has finished. LangGraph Platform supports several strategies:
 * - reject: reject the new message
 * - enqueue: queue the new message after the first run
 * - interrupt: interrupt the first run and start the new one (shown here)
 * - rollback: interrupt and roll back to the original state
 *
 * References:
 * - https://langchain-ai.github.io/langgraph/concepts/double_texting/
 * - https://langchain-ai.github.io/langgraph/cloud/how-tos/interrupt_concurrent/
 *
 * Note: Replace the placeholders with your actual deployment URL and API key.
 *
 * Differences from Python:
 * - Use the @langchain/langgraph-sdk package in JS/TS.
 * - multitaskStrategy is camelCase in JS SDK.
 */

// To use the LangGraph JS SDK, install it with:
// npm install @langchain/langgraph-sdk

async function main() {
  // Replace with your actual deployment URL and LangSmith API key
  const deploymentUrl = "https://your-deployment-url";
  const apiKey = "your-langsmith-api-key";

  const { Client } = await import("@langchain/langgraph-sdk");
  const client = new Client({ apiUrl: deploymentUrl, apiKey });
  const assistantId = "agent"; // Assistant ID from langgraph.json

  // Create a new thread
  const thread = await client.threads.create();

  // Start the first run (will be interrupted)
  let interruptedRun = await client.runs.create(
    thread["thread_id"],
    assistantId,
    { input: { messages: [{ role: "human", content: "what's the weather in sf?" }] } }
  );

  // Wait a bit to simulate user double texting
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start the second run with multitaskStrategy: 'interrupt'
  let run = await client.runs.create(
    thread["thread_id"],
    assistantId,
    {
      input: { messages: [{ role: "human", content: "what's the weather in nyc?" }] },
      multitaskStrategy: "interrupt"
    }
  );

  // Wait for the second run to complete
  await client.runs.join(thread["thread_id"], run["run_id"]);

  // Get the final state of the thread
  const state = await client.threads.getState(thread["thread_id"]);

  // Print all messages in the thread
  console.log("--- Double Texting Example: Final Thread State ---");
  for (const m of state['values']['messages']) {
    console.log(`[${m.type}]: ${m.content}`);
  }

  // Check the status of the interrupted run
  const interruptedStatus = (await client.runs.get(thread["thread_id"], interruptedRun["run_id"]))["status"];
  console.log(`\nStatus of the first (interrupted) run: ${interruptedStatus}`);
}

main().catch((err) => {
  console.error("Error in double texting example:", err);
}); 