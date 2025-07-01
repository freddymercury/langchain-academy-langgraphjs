// LangGraph Store Example
// This lesson demonstrates how to use the LangGraph InMemoryStore for persistent, cross-thread memory.
// The InMemoryStore can be replaced with other store backends for real-world use.

import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import dotenv from 'dotenv';
dotenv.config();

// Define a state schema for storing user notes
const State = Annotation.Root({
  userId: Annotation<string>(),
  note: Annotation<string>(),
  allNotes: Annotation<string>(),
});

// Create a persistent in-memory store
const store = new InMemoryStore();

// Node to save a note for a user
const saveNote = async (s: typeof State.State) => {
  await store.put(['notes', s.userId], Date.now().toString(), { note: s.note });
  return {};
};

// Node to retrieve all notes for a user
const getNotes = async (s: typeof State.State) => {
  const notes = await store.search(['notes', s.userId]);
  return { allNotes: notes.map(item => item.value.note).join('; ') };
};

const graph = new StateGraph(State)
  .addNode('saveNote', saveNote)
  .addNode('getNotes', getNotes)
  .addEdge('__start__', 'saveNote')
  .addEdge('saveNote', 'getNotes')
  .addEdge('getNotes', '__end__');

const app = graph.compile();

// Example: Save and retrieve notes for two users
(async () => {
  console.log('--- LangGraph Store Example ---');
  let result = await app.invoke({ userId: 'alice', note: 'Buy milk', allNotes: '' });
  console.log('Alice notes:', result.allNotes);
  result = await app.invoke({ userId: 'alice', note: 'Call Bob', allNotes: '' });
  console.log('Alice notes:', result.allNotes);
  result = await app.invoke({ userId: 'bob', note: 'Finish report', allNotes: '' });
  console.log('Bob notes:', result.allNotes);
  // Retrieve all notes for Alice
  result = await app.invoke({ userId: 'alice', note: '', allNotes: '' });
  console.log('Alice all notes:', result.allNotes);
})(); 