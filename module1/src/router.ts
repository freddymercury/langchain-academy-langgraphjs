// module1/src/router.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const State = Annotation.Root({
  question: Annotation<string>(),
  answer:   Annotation<string>(),
});

const graph = new StateGraph(State)
  .addNode('math',   () => ({ answer: '2 + 2 = 4' }))
  .addNode('trivia', () => ({ answer: 'Paris is the capital of France.' }))
  .addConditionalEdges(
    '__start__',
    (s: { question: string }) => (/^\d+[+\-*/]\d+$/.test(s.question) ? 'math' : 'trivia'),
    ['math', 'trivia']
  )
  .addEdge('math',   '__end__')
  .addEdge('trivia', '__end__');

const app = graph.compile();

console.log(await app.invoke({ question: '2+2' }));      // math
console.log(await app.invoke({ question: 'Capital?' })); // trivia