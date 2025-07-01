/**
 * Lesson: Creating a Deployment
 *
 * This lesson demonstrates how to prepare a LangGraph.js project for deployment.
 *
 * Steps:
 * 1. Create your graph (e.g., agent.ts)
 * 2. Export the compiled graph
 * 3. Create a langgraph.json configuration file
 * 4. Ensure package.json and .env are present
 *
 * References:
 * - https://langchain-ai.github.io/langgraph/cloud/deployment/setup_javascript/
 *
 * Note: This example does not actually deploy, but shows the setup required.
 */

// Example: src/agent.ts
// import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
//
// // Define your graph logic here
// const workflow = new StateGraph(MessagesAnnotation)
//   .addNode("callModel", async (state) => {/* ... */})
//   .addEdge("__start__", "callModel");
//
// // Export the compiled graph for deployment
// export const graph = workflow.compile();

// Example: langgraph.json
// {
//   "node_version": "20",
//   "dependencies": ["."],
//   "graphs": {
//     "agent": "./src/agent.ts:graph"
//   },
//   "env": ".env"
// }

function main() {
  console.log('--- Creating a LangGraph.js Deployment ---');
  console.log('\n1. Create your graph in src/agent.ts and export it:');
  console.log('   export const graph = workflow.compile();');
  console.log('\n2. Add a langgraph.json file at the project root:');
  console.log('   {');
  console.log('     "node_version": "20",');
  console.log('     "dependencies": ["."],');
  console.log('     "graphs": { "agent": "./src/agent.ts:graph" },');
  console.log('     "env": ".env"');
  console.log('   }');
  console.log('\n3. Ensure package.json and .env are present.');
  console.log('\n4. Commit your code to GitHub for cloud deployment.');
  console.log('\n// Differences from Python:');
  console.log('// - Use package.json for dependencies, not requirements.txt');
  console.log('// - Use TypeScript/JavaScript for graph logic');
  console.log('\nSee the official docs for deployment instructions.');
}

main(); 