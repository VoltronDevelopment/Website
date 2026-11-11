import { it,expect } from 'vitest';import {openAIAnswer} from '@/lib/vectra/graph';import type {Turn} from '@/lib/vectra/types';
it.skipIf(process.env.VERA_LONG_CHECK!=='1')('retains early project facts in a 60-turn conversation on both models',async()=>{
 process.loadEnvFile('.env.local');
 const history:Turn[]=Array.from({length:60},(_,i)=>({id:crypto.randomUUID(),question:i===0?'My project is blue-mango-72: 240 steel brackets with a matte black powder coating.':`Unrelated small-talk turn ${i}.`,reply:{text:'Understood.',sources:[],enquiry:false}}));
 for(const preference of ['mini','luna'] as const){const result=await openAIAnswer({question:'Recall my project code, quantity, material and finish. One sentence.',history,evidence:[],preference});const text=String(result.text).toLowerCase();for(const word of ['blue-mango-72','240','steel','matte','black'])expect(text).toContain(word);}
},90000);
