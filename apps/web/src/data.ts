export const domains = [
 { id:'ai', name:'AI & LLMs', color:'#a495ff', icon:'✧', subtitle:'The architecture of intelligence', topics:[
 ['Transformers','Neural architecture that uses attention to model relationships across a sequence. Unlike recurrent networks, it can process tokens in parallel.'],
 ['Self-Attention','A mechanism that weights other tokens according to their relevance to the current token, building a context-sensitive representation.'],
 ['Tokenization','Converts text into the discrete units that a language model reads and predicts. Token boundaries affect context length and cost.'],
 ['Embeddings','Dense numerical vectors that represent semantic or structural properties of text and other data.'],
 ['Retrieval-Augmented Generation','Retrieves relevant documents and supplies them as context before a language model generates an answer.'],
 ['Fine-Tuning','Updates pretrained model weights on examples to adapt behavior to a task or domain.'],
 ['Quantization','Represents weights or activations at lower numerical precision to reduce memory and compute requirements.'],
 ['GPU Inference','Runs a trained neural network on parallel GPU hardware to produce predictions. Memory bandwidth often constrains token generation.'],
 ['KV Cache','Reuses attention keys and values from previous tokens so autoregressive decoding avoids recomputing them.'],
 ['Positional Encoding','Supplies sequence-order information that attention alone does not encode.'],
 ['Multi-Head Attention','Computes attention in several learned representation subspaces before combining the results.']
 ]},
 { id:'agents', name:'AI Agents', color:'#58b9ff', icon:'⌘', subtitle:'From reasoning to action', topics:[
 ['AI Agents','Systems that use model outputs to choose actions, interact with tools, and pursue a goal over multiple steps.'],
 ['Model Context Protocol','A protocol for exposing tools and context to AI applications through standardized client-server interfaces.'],
 ['Tool Calling','Structured requests from a model for an application to execute a tool. The application must validate and authorize execution.'],
 ['Planning','Decomposing a goal into actions and revising those actions when new evidence arrives.'],
 ['Agent Memory','Stores information across steps or sessions. Retrieval and retention policies determine what the agent can reuse.'],
 ['Multi-Agent Systems','Multiple agents coordinate work through shared state, messages, or a supervisory process.'],
 ['Orchestration','Controls execution order, tool access, retries, and state transitions in an agent workflow.'],
 ['Agent Evaluation','Measures task success, tool correctness, reliability, and cost under representative scenarios.'],
 ['Computer Use','Interacting with software through visual interfaces and input events.'],
 ['Decision Policies','Rules or learned strategies that choose the next action based on the current state.']
 ]},
 { id:'infra', name:'Data Centers', color:'#55d7c5', icon:'▥', subtitle:'The physical layer of compute', topics:[
 ['Data Centers','Facilities that combine compute, networking, power distribution, and cooling to support digital workloads.'],
 ['UPS Systems','Provide short-term power continuity during supply interruptions and generator transitions.'],
 ['Switchgear','Switches, protects, and isolates electrical circuits in a power distribution system.'],
 ['Generators','Provide sustained backup power after utility loss, subject to startup and transfer requirements.'],
 ['Power Distribution Units','Distribute and often meter electrical power to racks and equipment.'],
 ['Cooling Systems','Remove equipment heat using airflow, chilled water, or liquid-cooling loops.'],
 ['BMS & DCIM','Monitor building equipment and data-center infrastructure to support operations and capacity management.'],
 ['Network Fabric','Connects servers with switches and links whose topology and bandwidth shape workload performance.'],
 ['Reliability Engineering','Studies failure modes, redundancy, maintainability, and availability.'],
 ['GPU Clusters','Interconnected accelerator servers that run training and inference workloads at scale.']
 ]},
 { id:'betting', name:'Sports Betting', color:'#edae64', icon:'◇', subtitle:'Probability meets market prices', topics:[
 ['Betting Markets','Markets in which prices express offered payouts for uncertain outcomes. Prices include margin and market constraints.'],
 ['Implied Probability','The break-even probability represented by a price; for decimal odds d, it is 1/d before removing margin.'],
 ['No-Vig Pricing','Removes a chosen allocation of bookmaker margin to estimate a normalized probability distribution.'],
 ['Market Efficiency','The extent to which offered prices reflect available information. Efficiency varies across markets and time.'],
 ['Closing Line Value','Compares an earlier betting price to a closing benchmark. It is a process indicator, not proof of profit.'],
 ['Bankroll Management','Sets stake sizes and exposure limits to control the risk of losses across uncertain outcomes.'],
 ['Expected Value','Probability-weighted average net return. Positive estimated EV depends on accurate probabilities and obtainable prices.'],
 ['Kelly Criterion','A log-growth-optimal staking rule under known probabilities. Estimation error can make full Kelly fragile.'],
 ['Market Liquidity','The amount that can be traded at a price without materially moving that price.'],
 ['Odds Formats','Decimal, fractional, and American representations of the same payout structure.']
 ]},
 { id:'models', name:'Prediction Models', color:'#f17fa1', icon:'⌁', subtitle:'Turn evidence into forecasts', topics:[
 ['Prediction Models','Statistical or machine-learning systems that estimate outcomes using information available at prediction time.'],
 ['Bayesian Inference','Updates prior beliefs with a likelihood to obtain a posterior distribution. Useful for forecasting and fault diagnosis.'],
 ['XGBoost','An efficient gradient-boosted tree framework that builds an additive model by optimizing a regularized objective.'],
 ['Feature Engineering','Transforms raw observations into useful model inputs while respecting information availability.'],
 ['Backtesting','Evaluates a strategy or model on historical data using realistic timing and execution assumptions.'],
 ['Calibration','Agreement between predicted probabilities and observed outcome frequencies across repeated predictions.'],
 ['Data Leakage','Information from the future or evaluation set entering training or feature construction, inflating apparent performance.'],
 ['Cross-Validation','Repeated train-validation splits used to estimate generalization. Temporal data requires time-aware splits.'],
 ['Uncertainty Estimation','Quantifies ambiguity in predictions from sampling variation, model assumptions, or incomplete observations.'],
 ['Log Loss','A proper scoring rule for probabilistic predictions that strongly penalizes confident incorrect predictions.']
 ]},
 { id:'pcb', name:'PCB Diagnostics', color:'#bcda73', icon:'⌗', subtitle:'Trace signals. Find the fault.', topics:[
 ['PCB Diagnostics','A systematic process for localizing electronic faults through inspection, measurements, and hypotheses.'],
 ['Voltage Rails','Power nets that supply circuits at defined nominal voltages and tolerances.'],
 ['MOSFETs','Field-effect transistors used for switching and amplification; gate drive and parasitic effects influence operation.'],
 ['Power Sequencing','The required order and timing for enabling supply rails and reset signals.'],
 ['Oscilloscopes','Measure signals over time. Probe setup, bandwidth, and grounding affect measurement validity.'],
 ['Short Circuits','Unintended low-resistance paths that may draw excess current or pull a supply rail down.'],
 ['Logic ICs','Integrated circuits that implement digital functions and require valid power, input levels, and timing.'],
 ['Signal Tracing','Follows a signal through a circuit to identify where expected behavior diverges from measurements.'],
 ['Fault Isolation','Uses evidence and controlled tests to narrow a failure to a component or subsystem.'],
 ['Current Limiting','Restricts supply current during diagnosis to reduce energy delivered into a fault.']
 ]}
];
export type Concept = {id:string;title:string;summary:string;domain:string;index:number;x:number;y:number;z:number;fx?:number;fy?:number;fz?:number;pinned?:boolean};
export type Edge = {source:string|Concept;target:string|Concept;type:'part_of'|'related_to'|'used_by';evidence:'Curated demo';reason:string};
export const endpoint = (v:string|Concept) => typeof v === 'string' ? v : v.id;
export function makeGraph() {
 const nodes:Concept[]=[]; const links:Edge[]=[];
 domains.forEach((domain,d)=>{
  const angle=d/6*Math.PI*2; const cx=Math.cos(angle)*175, cy=Math.sin(angle)*115;
  domain.topics.forEach(([title,summary],i)=>{
   const a=i*2.399963; const r=i===0?0:40+Math.sqrt(i)*14;
   nodes.push({id:`${domain.id}-${i}`,title,summary,domain:domain.id,index:i,x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,z:Math.sin(i*1.8+d)*65});
   if(i) links.push({source:`${domain.id}-${i}`,target:`${domain.id}-0`,type:'part_of',evidence:'Curated demo',reason:`${title} is a topic within ${domain.name}.`});
   if(i>1) links.push({source:`${domain.id}-${i-1}`,target:`${domain.id}-${i}`,type:'related_to',evidence:'Curated demo',reason:`These concepts are neighboring study topics in ${domain.name}; this demo link is a learning suggestion, not a prerequisite claim.`});
  });
 });
 const cross:[string,string,string][]=[['ai-7','infra-9','GPU inference runs on accelerator infrastructure; interconnect, power, and cooling constrain deployment.'],['models-1','pcb-8','Bayesian updating can rank fault hypotheses as diagnostic measurements arrive.'],['models-5','betting-6','Calibrated probabilities are necessary for reliable expected-value estimates.'],['agents-2','ai-0','Language models can produce structured tool calls inside an agent system.'],['agents-9','models-1','A decision policy can use Bayesian beliefs to choose its next information-gathering action.'],['infra-8','pcb-8','Reliability analysis and electronic fault isolation both reason about failure modes.'],['models-4','betting-4','Historical strategy evaluation can compare prices to closing benchmarks.'],['ai-4','agents-4','Retrieval systems can supply relevant external memory to an agent.']];
 cross.forEach(([source,target,reason])=>links.push({source,target,type:'related_to',evidence:'Curated demo',reason}));
 return {nodes,links};
}
export function searchConcepts(nodes:Concept[],query:string) {const q=query.trim().toLowerCase(); return q?nodes.filter(n=>(n.title+' '+n.summary).toLowerCase().includes(q)):[];}
export function neighbors(id:string,links:Edge[]) {return new Set(links.filter(l=>endpoint(l.source)===id||endpoint(l.target)===id).flatMap(l=>[endpoint(l.source),endpoint(l.target)]));}
