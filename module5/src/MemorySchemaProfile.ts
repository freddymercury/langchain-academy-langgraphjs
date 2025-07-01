// Memory Schema + Profile Example
// This lesson demonstrates how to use a custom memory schema (e.g., user profile) with LangGraph and persistent storage.
// The profile is stored and retrieved using the InMemoryStore, but any backend can be used.

import { StateGraph, Annotation, InMemoryStore } from '@langchain/langgraph';
import dotenv from 'dotenv';
dotenv.config();

// Define a state schema for a user profile
const ProfileState = Annotation.Root({
  userId: Annotation<string>(),
  name: Annotation<string>(),
  age: Annotation<number>(),
  city: Annotation<string>(),
  profile: Annotation<string>(),
});

const store = new InMemoryStore();

// Node to save a user profile
const saveProfile = async (s: typeof ProfileState.State) => {
  await store.put(['profiles'], s.userId, {
    name: s.name,
    age: s.age,
    city: s.city,
  });
  return {};
};

// Node to retrieve a user profile
const getProfile = async (s: typeof ProfileState.State) => {
  const result = await store.get(['profiles'], s.userId);
  if (result) {
    return { profile: `${result.value.name}, Age: ${result.value.age}, City: ${result.value.city}` };
  }
  return { profile: 'Profile not found.' };
};

const graph = new StateGraph(ProfileState)
  .addNode('saveProfile', saveProfile)
  .addNode('getProfile', getProfile)
  .addEdge('__start__', 'saveProfile')
  .addEdge('saveProfile', 'getProfile')
  .addEdge('getProfile', '__end__');

const app = graph.compile();

// Example: Save and retrieve user profiles
(async () => {
  console.log('--- Memory Schema + Profile Example ---');
  let result = await app.invoke({ userId: 'alice', name: 'Alice', age: 30, city: 'Paris', profile: '' });
  console.log('Alice profile:', result.profile);
  result = await app.invoke({ userId: 'bob', name: 'Bob', age: 25, city: 'Berlin', profile: '' });
  console.log('Bob profile:', result.profile);
  // Retrieve Alice's profile
  result = await app.invoke({ userId: 'alice', name: '', age: 0, city: '', profile: '' });
  console.log('Alice profile (retrieved):', result.profile);
  // Try to retrieve a non-existent profile
  result = await app.invoke({ userId: 'carol', name: '', age: 0, city: '', profile: '' });
  console.log('Carol profile (should not exist):', result.profile);
})(); 