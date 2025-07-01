# LangChain Academy — **Intro to LangGraph (JS/TS)**

> *A TypeScript translation of the official LangChain Academy “Intro to LangGraph” course.*  Each lesson lives in its own **`moduleX/`** folder so you can experiment without breaking earlier examples.

---

## 📁 Project Structure

```
langchain-academy-langgraphjs/
│
├─ .env.example          # API keys template
├─ README.md             # <— you are here
├─ package.json          # root scripts & shared dev‑deps
├─ tsconfig.base.json    # shared TS config (extended by each module)
│
├─ module1/              # Module 1 — Introduction
│   ├─ src/              # Simple Graph, Chain, Router, Agent, …
│   ├─ package.json      # per‑module deps/scripts
│   └─ tsconfig.json
│
├─ module2/              # Module 2 — State & Memory
│   └─ …
│
└─ module3/              # Module 3 — Reducers & Long‑Term Memory
    └─ …
```

*Modules 4‑N coming soon as the Academy adds new lessons.*

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# clone
git clone https://github.com/freddymercury/langchain-academy-langgraphjs.git
cd langchain-academy-langgraphjs

# install root dev‑deps (TypeScript, ts‑node, etc.)
npm install
```

> **Tip:** use **pnpm** or **yarn workspaces** if you prefer — the repo is workspace‑friendly.

### 2. Create `.env`

```bash
cp .env.example .env
# add your keys
OPENAI_API_KEY="sk‑..."
TAVILY_API_KEY="tvly‑..."
```

### 3. Run a Lesson

```bash
# example: run Module 1 — Simple Graph
cd module1
npm run dev          # alias for: ts-node --esm src/simpleGraph.ts
```

Each module exposes the following **npm scripts**:

| Script          | What it does                      |
| --------------- | --------------------------------- |
| `npm run dev`   | Execute the canonical lesson file |
| `npm run build` | Compile TS → `dist/`              |
| `npm start`     | Run the compiled JS               |

---

## 🛠 Prerequisites

* **Node.js 18+** (ESM & `fetch` built‑in)
* An **OpenAI API key** for GPT calls
* (Optional) **Tavily API key** if you want to run the search‑tool lessons

*All other dependencies are installed via `npm install`.*

---

## 🧩 Modules Overview

| Module | Lesson Highlights                                                                   | Entry Script       |
| ------ | ----------------------------------------------------------------------------------- | ------------------ |
| **1**  | Simple Graph · LangGraph Studio · Chain Node · Router · Agent · Memory · Deployment | `module1/src/*.ts` |
| **2**  | State schemas · Custom reducers · Checkpoint savers · Rolling window memory         | `module2/src/*.ts` |
| **3**  | Summarisation reducer · Long‑term memory · Vector store memory                      | `module3/src/*.ts` |

> Each module’s **README section** (top of `moduleX/ts`) explains any extra setup.

---

## 🌐 LangGraph Studio

Spin up the local dev server + web UI (requires `@langchain/langgraph-cli`):

```bash
npm i -D @langchain/langgraph-cli   # once
npx @langchain/langgraph-cli dev    # from any module directory
```

Then open [http://localhost:2024](http://localhost:2024) to inspect node‑by‑node execution, state diffs, and logs.

---

## 🐳 Docker (optional)

```bash
docker build -t langgraph-academy .
docker run --env-file .env -p 3000:3000 langgraph-academy
```

The container defaults to `module1/src/simpleGraph.ts`. Override via `CMD` or a custom Dockerfile.

---

## 🤝 Contributing

Pull requests are welcome!  Please ensure:

1. Code passes `npm run build` in all modules.
2. New lessons follow the **moduleX/** folder convention.
3. Update this README with any new scripts or environment vars.

---

## 📜 License

MIT © 2025 [freddymercury](https://github.com/freddymercury)

> *“Adopt the graph.  Ship the flow.”*
