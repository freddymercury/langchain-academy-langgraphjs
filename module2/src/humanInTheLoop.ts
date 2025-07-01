import { StateGraph, Annotation, Command, interrupt, isCommand } from '@langchain/langgraph';

const State = Annotation.Root({
  question: Annotation<string>(),
  answer: Annotation<string>(),
});

// Node that asks for human input (interrupts the graph)
const askHuman = async (s: typeof State.State) => {
  return interrupt<{ prompt: string }, { answer: string }>({
    prompt: `Please provide an answer to: ${s.question}`,
  });
};

// Node that continues after human input
const processAnswer = async (s: typeof State.State) => {
  // s.answer may be an object (from resume) or a string
  if (
    typeof s.answer === 'object' &&
    s.answer !== null &&
    'answer' in s.answer &&
    typeof (s.answer as { answer: unknown }).answer === 'string'
  ) {
    return { answer: (s.answer as { answer: string }).answer };
  }
  return { answer: s.answer };
};

const graph = new StateGraph(State)
  .addNode('askHuman', askHuman)
  .addNode('processAnswer', processAnswer)
  .addEdge('__start__', 'askHuman')
  .addEdge('askHuman', 'processAnswer')
  .addEdge('processAnswer', '__end__');

const app = graph.compile();

// Example: Run the graph, simulate human input
(async () => {
  // First run: triggers interrupt
  let state = { question: 'What is your favorite color?', answer: '' };
  let result = await app.invoke(state);
  if (isCommand(result) && (result as any).type === 'interrupt') {
    const interruptResult = result as any;
    console.log('HUMAN INPUT NEEDED:', interruptResult.value.prompt);
    // Simulate human response using Command({ resume: ... })
    result = await app.invoke(new Command({ resume: { answer: 'Blue' } }));
  }
  console.log('Final state:', result);
})(); 