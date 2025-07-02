import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';

const hm = new HumanMessage({ content: 'hi' });
const am = new AIMessage({ content: 'hello' });
const tm = new ToolMessage({ content: 'result', tool_call_id: '123' });

console.log('=== Full Message Objects ===');
console.log('HumanMessage:', hm);
console.log('AIMessage:', am);
console.log('ToolMessage:', tm);

console.log('\n=== Role Properties ===');
console.log('HumanMessage role:', (hm as any).role);
console.log('AIMessage role:', (am as any).role);
console.log('ToolMessage role:', (tm as any).role);

console.log('\n=== Message Types ===');
console.log('HumanMessage type:', hm.constructor.name);
console.log('AIMessage type:', am.constructor.name);
console.log('ToolMessage type:', tm.constructor.name);

console.log('\n=== _getType() method ===');
console.log('HumanMessage _getType():', hm._getType());
console.log('AIMessage _getType():', am._getType());
console.log('ToolMessage _getType():', tm._getType());