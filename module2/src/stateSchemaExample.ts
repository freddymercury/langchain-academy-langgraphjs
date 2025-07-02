// @https://academy.langchain.com/courses/take/intro-to-langgraph/lessons/58239426-lesson-1-state-schema

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

console.log('=== State Schema Examples ===\n');

// =============================================================================
// 1. Basic Annotation System (Recommended LangGraph.js approach)
// =============================================================================

console.log('1. Basic Annotation System:');

// Define a state schema using LangGraph's Annotation system
const BasicState = Annotation.Root({
  name: Annotation<string>(),
  mood: Annotation<'happy' | 'sad'>(),
});

// Node functions
const node1 = (state: typeof BasicState.State) => {
  console.log('---Node 1---');
  return { name: state.name + ' is ... ' };
};

const node2 = (state: typeof BasicState.State) => {
  console.log('---Node 2---');
  return { mood: 'happy' as const };
};

const node3 = (state: typeof BasicState.State) => {
  console.log('---Node 3---');
  return { mood: 'sad' as const };
};

// Conditional logic function
const decideMood = (state: typeof BasicState.State): 'node_2' | 'node_3' => {
  // 50/50 split between nodes 2 and 3
  return Math.random() < 0.5 ? 'node_2' : 'node_3';
};

// Build the graph
const basicGraph = new StateGraph(BasicState)
  .addNode('node_1', node1)
  .addNode('node_2', node2)
  .addNode('node_3', node3)
  .addEdge(START, 'node_1')
  .addConditionalEdges('node_1', decideMood)
  .addEdge('node_2', END)
  .addEdge('node_3', END)
  .compile();

// Run the basic example
const basicResult = await basicGraph.invoke({ name: 'Lance', mood: 'sad' });
console.log('Result:', basicResult);
console.log();

// =============================================================================
// 2. TypeScript Interface Approach (TypedDict equivalent)
// =============================================================================

console.log('2. TypeScript Interface Approach:');

// Define state using TypeScript interface (similar to Python's TypedDict)
interface InterfaceState {
  name: string;
  mood: 'happy' | 'sad';
}

// Convert interface to Annotation for LangGraph
const InterfaceAnnotationState = Annotation.Root({
  name: Annotation<string>(),
  mood: Annotation<'happy' | 'sad'>(),
});

// Node functions that work with the interface-based state
const interfaceNode1 = (state: InterfaceState) => {
  console.log('---Interface Node 1---');
  return { name: state.name + ' feels ... ' };
};

const interfaceNode2 = (state: InterfaceState) => {
  console.log('---Interface Node 2---');
  return { mood: 'happy' as const };
};

const interfaceNode3 = (state: InterfaceState) => {
  console.log('---Interface Node 3---');
  return { mood: 'sad' as const };
};

const interfaceDecideMood = (state: InterfaceState): 'interface_node_2' | 'interface_node_3' => {
  return Math.random() < 0.5 ? 'interface_node_2' : 'interface_node_3';
};

// Build interface-based graph
const interfaceGraph = new StateGraph(InterfaceAnnotationState)
  .addNode('interface_node_1', interfaceNode1)
  .addNode('interface_node_2', interfaceNode2)
  .addNode('interface_node_3', interfaceNode3)
  .addEdge(START, 'interface_node_1')
  .addConditionalEdges('interface_node_1', interfaceDecideMood)
  .addEdge('interface_node_2', END)
  .addEdge('interface_node_3', END)
  .compile();

const interfaceResult = await interfaceGraph.invoke({ name: 'Alice', mood: 'happy' });
console.log('Interface Result:', interfaceResult);
console.log();

// =============================================================================
// 3. Class-based Approach (Dataclass equivalent)
// =============================================================================

console.log('3. Class-based Approach:');

// Define state using a TypeScript class (similar to Python's dataclass)
class ClassState {
  constructor(
    public name: string,
    public mood: 'happy' | 'sad'
  ) {}
}

// Convert class to Annotation for LangGraph
const ClassAnnotationState = Annotation.Root({
  name: Annotation<string>(),
  mood: Annotation<'happy' | 'sad'>(),
});

// Node functions that work with class-based state
const classNode1 = (state: ClassState) => {
  console.log('---Class Node 1---');
  return { name: state.name + ' appears ... ' };
};

const classNode2 = (state: ClassState) => {
  console.log('---Class Node 2---');
  return { mood: 'happy' as const };
};

const classNode3 = (state: ClassState) => {
  console.log('---Class Node 3---');
  return { mood: 'sad' as const };
};

const classDecideMood = (state: ClassState): 'class_node_2' | 'class_node_3' => {
  return Math.random() < 0.5 ? 'class_node_2' : 'class_node_3';
};

// Build class-based graph
const classGraph = new StateGraph(ClassAnnotationState)
  .addNode('class_node_1', classNode1)
  .addNode('class_node_2', classNode2)
  .addNode('class_node_3', classNode3)
  .addEdge(START, 'class_node_1')
  .addConditionalEdges('class_node_1', classDecideMood)
  .addEdge('class_node_2', END)
  .addEdge('class_node_3', END)
  .compile();

const classResult = await classGraph.invoke({ name: 'Bob', mood: 'sad' });
console.log('Class Result:', classResult);
console.log();

// =============================================================================
// 4. Runtime Validation Approach (Pydantic equivalent)
// =============================================================================

console.log('4. Runtime Validation Approach:');

// Custom validation function (Pydantic equivalent)
function validateMood(mood: string): mood is 'happy' | 'sad' {
  return mood === 'happy' || mood === 'sad';
}

class ValidatedState {
  private _name: string;
  private _mood: 'happy' | 'sad';

  constructor(name: string, mood: string) {
    this._name = name;
    
    if (!validateMood(mood)) {
      throw new Error(`Invalid mood: ${mood}. Must be either "happy" or "sad"`);
    }
    this._mood = mood;
  }

  get name(): string {
    return this._name;
  }

  get mood(): 'happy' | 'sad' {
    return this._mood;
  }

  setName(name: string): void {
    this._name = name;
  }

  setMood(mood: string): void {
    if (!validateMood(mood)) {
      throw new Error(`Invalid mood: ${mood}. Must be either "happy" or "sad"`);
    }
    this._mood = mood;
  }
}

// Test validation
try {
  const invalidState = new ValidatedState('John', 'angry');
} catch (error) {
  console.log('Validation Error:', (error as Error).message);
}

// Valid state
const validState = new ValidatedState('John', 'happy');
console.log('Valid state created:', { name: validState.name, mood: validState.mood });

// Convert to Annotation for LangGraph
const ValidatedAnnotationState = Annotation.Root({
  name: Annotation<string>(),
  mood: Annotation<'happy' | 'sad'>(),
});

// Node functions with validation
const validatedNode1 = (state: { name: string; mood: 'happy' | 'sad' }) => {
  console.log('---Validated Node 1---');
  return { name: state.name + ' seems ... ' };
};

const validatedNode2 = (state: { name: string; mood: 'happy' | 'sad' }) => {
  console.log('---Validated Node 2---');
  const newMood = 'happy' as const;
  if (!validateMood(newMood)) {
    throw new Error(`Invalid mood: ${newMood}`);
  }
  return { mood: newMood };
};

const validatedNode3 = (state: { name: string; mood: 'happy' | 'sad' }) => {
  console.log('---Validated Node 3---');
  const newMood = 'sad' as const;
  if (!validateMood(newMood)) {
    throw new Error(`Invalid mood: ${newMood}`);
  }
  return { mood: newMood };
};

const validatedDecideMood = (
  state: { name: string; mood: 'happy' | 'sad' }
): 'validated_node_2' | 'validated_node_3' => {
  return Math.random() < 0.5 ? 'validated_node_2' : 'validated_node_3';
};

// Build validated graph
const validatedGraph = new StateGraph(ValidatedAnnotationState)
  .addNode('validated_node_1', validatedNode1)
  .addNode('validated_node_2', validatedNode2)
  .addNode('validated_node_3', validatedNode3)
  .addEdge(START, 'validated_node_1')
  .addConditionalEdges('validated_node_1', validatedDecideMood)
  .addEdge('validated_node_2', END)
  .addEdge('validated_node_3', END)
  .compile();

const validatedResult = await validatedGraph.invoke({ name: 'Charlie', mood: 'happy' });
console.log('Validated Result:', validatedResult);
console.log();

// =============================================================================
// 5. Advanced State Schema with Multiple Types
// =============================================================================

console.log('5. Advanced State Schema:');

// More complex state schema with various types
const AdvancedState = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
  count: Annotation<number>(),
  items: Annotation<string[]>(),
  metadata: Annotation<Record<string, any>>(),
  timestamp: Annotation<Date>(),
  _private: Annotation<number>(), // private/internal state
});

const advancedGraph = new StateGraph(AdvancedState)
  .addNode('process', (state) => {
    console.log('---Advanced Processing---');
    return {
      output: `Processed: ${state.input}`,
      count: (state.count || 0) + 1,
      items: [...(state.items || []), state.input],
      metadata: { 
        ...state.metadata, 
        lastProcessed: state.input,
        processingTime: new Date().toISOString()
      },
      timestamp: new Date(),
      _private: (state._private || 0) + 1,
    };
  })
  .addEdge(START, 'process')
  .addEdge('process', END)
  .compile();

const advancedResult = await advancedGraph.invoke({
  input: 'Hello Advanced World!',
  count: 0,
  items: [],
  metadata: { version: '1.0' },
  timestamp: new Date(),
  _private: 0,
});

console.log('Advanced Result:', advancedResult);

console.log('\n=== State Schema Examples Complete ==='); 