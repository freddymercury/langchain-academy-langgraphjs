/**
 * Lesson: Deployment Concepts
 *
 * This lesson introduces the key concepts for deploying LangGraph.js applications.
 *
 * ## Key Concepts
 * - Project structure for deployment
 * - Required configuration files (langgraph.json, package.json, .env)
 * - Defining graphs for deployment
 * - Deployment options (Cloud SaaS, Self-Hosted, Standalone Container)
 *
 * References:
 * - LangGraph.js Deployment Docs: https://langchain-ai.github.io/langgraph/cloud/deployment/setup_javascript/
 * - LangGraph Application Structure: https://langchain-ai.github.io/langgraph/concepts/application_structure/
 */

function main() {
  console.log('--- LangGraph.js Deployment Concepts ---');
  console.log('\n1. Project Structure:');
  console.log('  - src/: All project code (graphs, nodes, utils)');
  console.log('  - package.json: Project dependencies');
  console.log('  - .env: Environment variables (e.g., OPENAI_API_KEY)');
  console.log('  - langgraph.json: LangGraph deployment configuration');
  console.log('\n2. Configuration Files:');
  console.log('  - langgraph.json specifies dependencies, graphs, and env variables for deployment.');
  console.log('  - Example:');
  console.log('    {');
  console.log('      "node_version": "20",');
  console.log('      "dependencies": ["."],');
  console.log('      "graphs": { "agent": "./src/agent.ts:graph" },');
  console.log('      "env": ".env"');
  console.log('    }');
  console.log('\n3. Defining Graphs:');
  console.log('  - Export a compiled graph from your TypeScript file (e.g., export const graph = workflow.compile();)');
  console.log('  - Reference the exported graph in langgraph.json');
  console.log('\n4. Deployment Options:');
  console.log('  - Cloud SaaS: Fully managed by LangChain');
  console.log('  - Self-Hosted: Deploy in your own cloud (Kubernetes, ECS, etc.)');
  console.log('  - Standalone Container: Deploy as a Docker container anywhere');
  console.log('\nSee the official docs for more details and step-by-step guides.');
}

main(); 