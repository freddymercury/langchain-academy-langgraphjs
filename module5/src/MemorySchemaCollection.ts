// Memory Schema + Collection Example
// This lesson demonstrates how to use a collection schema (e.g., storing multiple items per user) with LangGraph and persistent storage.
// We'll store and retrieve a collection of favorite books for each user.

import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import dotenv from 'dotenv';
dotenv.config();

// Define a state schema for a user's book collection
const CollectionState = Annotation.Root({
  userId: Annotation<string>(),
  book: Annotation<string>(),
  allBooks: Annotation<string>(),
});

const store = new InMemoryStore();

// Node to add a book to a user's collection
const addBook = async (s: typeof CollectionState.State) => {
  if (s.book) {
    await store.put(['books', s.userId], Date.now().toString(), { book: s.book });
  }
  return {};
};

// Node to retrieve all books for a user
const getBooks = async (s: typeof CollectionState.State) => {
  const books = await store.search(['books', s.userId]);
  return { allBooks: books.map(item => item.value.book).join('; ') };
};

const graph = new StateGraph(CollectionState)
  .addNode('addBook', addBook)
  .addNode('getBooks', getBooks)
  .addEdge('__start__', 'addBook')
  .addEdge('addBook', 'getBooks')
  .addEdge('getBooks', '__end__');

const app = graph.compile();

// Example: Add and retrieve books for two users
(async () => {
  console.log('--- Memory Schema + Collection Example ---');
  let result = await app.invoke({ userId: 'alice', book: '1984', allBooks: '' });
  console.log('Alice books:', result.allBooks);
  result = await app.invoke({ userId: 'alice', book: 'Brave New World', allBooks: '' });
  console.log('Alice books:', result.allBooks);
  result = await app.invoke({ userId: 'bob', book: 'The Hobbit', allBooks: '' });
  console.log('Bob books:', result.allBooks);
  // Retrieve all books for Alice
  result = await app.invoke({ userId: 'alice', book: '', allBooks: '' });
  console.log('Alice all books:', result.allBooks);
})(); 