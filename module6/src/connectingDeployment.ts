/**
 * Lesson: Connecting to a Deployment
 *
 * This lesson demonstrates how to connect to a deployed LangGraph.js application using the LangGraph JS SDK.
 *
 * References:
 * - https://langchain-ai.github.io/langgraph/cloud/quick_start/
 *
 * Note: Replace the placeholders with your actual deployment URL and API key.
 *
 * Differences from Python:
 * - Use the @langchain/langgraph-sdk package in JS/TS.
 * - The API is similar to the Python SDK, but uses JS async/await and object destructuring.
 */

// To use the LangGraph JS SDK, install it with:
// npm install @langchain/langgraph-sdk

async function main() {
  // Replace with your actual deployment URL and LangSmith API key
  const deploymentUrl = "https://your-deployment-url";
  const apiKey = "your-langsmith-api-key";

  // Dynamic import for ESM compatibility
  const { Client } = await import("@langchain/langgraph-sdk");

  // Create a client instance
  const client = new Client({ apiUrl: deploymentUrl, apiKey });

  // Example: Send a message to the deployed agent ("agent" is the assistant ID from langgraph.json)
  const streamResponse = client.runs.stream(
    null, // Threadless run
    "agent", // Assistant ID
    {
      input: {
        messages: [
          { role: "user", content: "What is LangGraph?" }
        ]
      },
      streamMode: "messages",
    }
  );

  console.log("--- Connecting to a LangGraph Deployment ---");
  for await (const chunk of streamResponse) {
    console.log(`Receiving new event of type: ${chunk.event}...`);
    console.log(JSON.stringify(chunk.data));
    console.log("\n");
  }
}

main().catch((err) => {
  console.error("Error connecting to deployment:", err);
}); 