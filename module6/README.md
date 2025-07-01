# Module 6: Deployment

This module covers deploying LangGraph applications, including concepts, creating and connecting to deployments, handling double texting, and using assistants. Each lesson is implemented in its own file in `src/`.

## Lessons

1. **Deployment Concepts** (`src/deploymentConcepts.ts`)
   - _Summary: To be completed._
2. **Creating a Deployment** (`src/creatingDeployment.ts`)
   - _Summary: To be completed._
3. **Connecting to a Deployment** (`src/connectingDeployment.ts`)
   - _Summary: To be completed._
4. **Double Texting** (`src/doubleTexting.ts`)
   - _Summary: To be completed._
5. **Assistants** (`src/assistants.ts`)
   - _Summary: To be completed._

## Quick Start

1. Copy your `.env` file with required API keys (already done if you followed setup instructions).
2. Install dependencies:
   ```sh
   cd module6
   npm install
   ```
3. Run any lesson file with:
   ```sh
   npx ts-node src/<lessonFile>.ts
   ```

## What You Need to Run All Lessons

To run all Module 6 lessons **end-to-end** (including the networked examples), you need the following:

### 1. **A Deployed LangGraph Application**
- You must have a LangGraph app deployed to the LangGraph Platform (Cloud, Self-Hosted, or Standalone Container).
- This deployment will provide you with:
  - **Deployment URL** (e.g., `https://my-app.langgraph.cloud`)
  - **Assistant ID** (usually `"agent"` if you followed the examples, or as defined in your `langgraph.json`)

### 2. **A Valid LangSmith API Key**
- This is required for authentication with the LangGraph Platform.
- You can get this from your [LangSmith account](https://smith.langchain.com/).

### 3. **Update the Example Files**
- In these files:
  - `src/connectingDeployment.ts`
  - `src/doubleTexting.ts`
  - `src/assistants.ts`
- Replace the placeholders:
  ```ts
  const deploymentUrl = "https://your-deployment-url";
  const apiKey = "your-langsmith-api-key";
  ```
  with your actual deployment URL and API key.

### 4. **(Optional) Check Your Assistant ID**
- If your assistant is not named `"agent"`, update the code to use the correct assistant ID.

### 5. **.env File**
- Ensure your `.env` file contains any required environment variables (e.g., `OPENAI_API_KEY`) for your deployed app.

### 6. **Dependencies**
- All required dependencies are already installed via `npm install` in `module6/`.

### **Summary Table**

| Requirement                | Where to get/set it                                 |
|----------------------------|----------------------------------------------------|
| Deployment URL             | LangGraph Platform deployment details              |
| LangSmith API Key          | [LangSmith account](https://smith.langchain.com/)  |
| Assistant ID               | Your `langgraph.json` or deployment details        |
| .env with API keys         | Copied from previous modules or your own setup     |

---

## Parity Notes
- This module matches the structure and content of the Python Academy's Module 6: Deployment.
- Any differences in the JS/TS API compared to Python are documented in code comments within each lesson file.

---

_This README will be updated as each lesson is implemented and tested._ 