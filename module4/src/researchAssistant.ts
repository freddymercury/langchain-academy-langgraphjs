// module4/src/researchAssistant.ts
// Lesson 4: Research Assistant
// This example demonstrates building a research assistant that generates research questions, searches the web, summarizes results, and writes a final report.
// Parity: Python Academy Module 4, Lesson 4
// JS API note: Web search and scraping are mocked for demonstration. Replace with real APIs as needed.

import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';

// --- 1. Generate research questions from a user query ---
const questionGenPrompt = PromptTemplate.fromTemplate(
  `Write 3 Google search queries to form an objective opinion about: "{topic}".\nInclude specific details.\nRespond with a JSON array of strings.`
);

const model = new ChatOpenAI({ temperature: 0 });

// Helper to normalize model output to string
function getContentString(response: any): string {
  if (typeof response === 'string') return response;
  if (response && typeof response.content === 'string') return response.content;
  if (Array.isArray(response)) {
    // MessageContentComplex[]: join .text fields
    return response.map((item: any) => item.text || '').join('\n');
  }
  return String(response);
}

async function generateResearchQuestions(topic: string): Promise<string[]> {
  const response = await questionGenPrompt.pipe(model).invoke({ topic });
  const content = getContentString(response);
  // Try to parse as JSON array
  try {
    const arr = JSON.parse(content);
    if (Array.isArray(arr)) return arr;
  } catch {}
  // Fallback: split by lines
  return content.split('\n').filter(Boolean);
}

// --- 2. Web search for each question (mocked) ---
async function webSearch(query: string): Promise<string[]> {
  // Replace this with a real web search API (e.g., Tavily, SerpAPI, Bing, etc.)
  // For demo, return 2 fake URLs per query
  return [
    `https://example.com/search?q=${encodeURIComponent(query)}&result=1`,
    `https://example.com/search?q=${encodeURIComponent(query)}&result=2`,
  ];
}

// --- 3. Scrape and summarize each URL (mocked) ---
const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarize the following web page for the research question: "{question}"\n\nPage text:\n{pageText}`
);

async function scrapeAndSummarize(url: string, question: string): Promise<string> {
  // Replace this with real scraping logic
  const fakePageText = `This is mock content from ${url} for question: ${question}`;
  const response = await summaryPrompt.pipe(model).invoke({ question, pageText: fakePageText });
  const content = getContentString(response);
  return `URL: ${url}\nSummary: ${content}`;
}

// --- 4. Combine all summaries into a final report ---
const reportPrompt = PromptTemplate.fromTemplate(
  `Information:\n"""\n{context}\n"""\n\nUsing the above, write a detailed, objective research report on: "{topic}".\nInclude facts, numbers, and cite URLs as references at the end. Use markdown.`
);

async function buildResearchReport(topic: string): Promise<string> {
  // Step 1: Generate research questions
  const questions = await generateResearchQuestions(topic);
  console.log('Generated research questions:', questions);

  // Step 2: For each question, search the web
  const allSummaries: string[] = [];
  for (const question of questions) {
    const urls = await webSearch(question);
    for (const url of urls) {
      const summary = await scrapeAndSummarize(url, question);
      allSummaries.push(summary);
    }
  }

  // Step 3: Combine all summaries into a report
  const context = allSummaries.join('\n\n');
  const report = await reportPrompt.pipe(model).invoke({ context, topic });
  const content = getContentString(report);
  return content;
}

// --- Example invocation ---
(async () => {
  const topic = 'The impact of electric vehicles on urban air quality';
  const report = await buildResearchReport(topic);
  console.log('\n--- Final Research Report ---\n');
  console.log(report);
})();

// To use real web search and scraping, replace the webSearch and scrapeAndSummarize functions with actual implementations. 