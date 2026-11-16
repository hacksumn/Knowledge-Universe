// Knowledge Universe catalogue: subjects ("continents") → pathways → lessons.
// All content here is original. Lesson bodies are Markdown in lessons/<pathway-id>.md;
// a lesson without a body is shown as a draft.
import { lessonBodies } from './lessons';

export type ContinentId =
  | 'machine-learning'
  | 'agents'
  | 'data-centers'
  | 'prediction-models'
  | 'sports-gambling'
  | 'llms'
  | 'ai-use-cases'
  | 'pcb-diagnostics';

export type Continent = {
  id: ContinentId;
  name: string;
  color: string;
  tagline: string;
  description: string;
};

/** A link to another pathway (id `pathway-id`) or lesson (id `pathway-id/lesson-slug`), with why they connect. */
export type RelatedRef = { id: string; kind: 'pathway' | 'lesson'; reason: string };

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  body?: string;
  /** Cross-links to pathways or lessons elsewhere in the catalogue (filled from `connections` below). */
  related: RelatedRef[];
};

export type Pathway = {
  id: string;
  continent: ContinentId;
  title: string;
  description: string;
  lessons: Lesson[];
  /** Cross-links to pathways or lessons elsewhere in the catalogue (filled from `connections` below). */
  related: RelatedRef[];
};

export const continents: Continent[] = [
  { id: 'machine-learning', name: 'Machine Learning', color: '#ff8a7a', tagline: 'Learning patterns from data.', description: 'How models learn from examples, and how to tell when they really have.' },
  { id: 'agents', name: 'Agents', color: '#58b9ff', tagline: 'From reasoning to action.', description: 'Systems that plan, call tools and work toward a goal over many steps.' },
  { id: 'data-centers', name: 'Data Centers', color: '#55d7c5', tagline: 'The physical layer of compute.', description: 'The power, cooling and networks that keep compute running.' },
  { id: 'prediction-models', name: 'Prediction Models', color: '#f17fa1', tagline: 'Turning evidence into forecasts.', description: 'Build, test and trust models that estimate what happens next.' },
  { id: 'sports-gambling', name: 'Sports Gambling', color: '#edae64', tagline: 'Where probability meets price.', description: 'How betting markets set prices, and how to think clearly about risk.' },
  { id: 'llms', name: 'LLMs', color: '#a495ff', tagline: 'The architecture of language models.', description: 'How large language models read, represent and generate text.' },
  { id: 'ai-use-cases', name: 'Possible Use Cases for AI', color: '#f5d76e', tagline: 'Where AI earns its keep.', description: 'Practical places to apply AI, and how to judge whether it helps.' },
  { id: 'pcb-diagnostics', name: 'PCB Diagnostics', color: '#bcda73', tagline: 'Trace signals. Find the fault.', description: 'A systematic way to find faults on electronic boards.' },
];

export const slug = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function pathway(continent: ContinentId, id: string, title: string, description: string, lessons: [string, string][]): Pathway {
  return { id, continent, title, description, related: [], lessons: lessons.map(([t, summary]) => { const lessonId = `${id}/${slug(t)}`; return { id: lessonId, title: t, summary, body: lessonBodies[lessonId], related: [] }; }) };
}

export const pathways: Pathway[] = [
  // ── Your two examples first ──────────────────────────────────────────────
  pathway('data-centers', 'critical-power', 'Critical Power', 'Follow electricity from the utility feed to the rack, and see where redundancy lives.', [
    ['Read a one-line diagram', 'Recognize the symbols for sources, breakers, transformers and loads, and trace a path from utility to rack.'],
    ['Utility service and switchgear', 'How medium-voltage service enters the site and how switchgear protects and isolates circuits.'],
    ['UPS topologies', 'Standby, line-interactive and double-conversion UPS designs, and what each protects against.'],
    ['Generators and transfer switches', 'How generators start, pick up load and hand back to utility through automatic transfer switches.'],
    ['PDUs and branch circuits', 'How power is distributed and metered from the PDU to individual rack circuits.'],
    ['Redundancy: N, N+1 and 2N', 'What each redundancy level means on a one-line diagram, and which failures it survives.'],
  ]),
  pathway('prediction-models', 'nba-moneylines', 'NBA Moneylines', 'Build and honestly test a model that estimates NBA win probabilities.', [
    ['Moneyline odds as probabilities', 'Convert American moneylines into implied win probabilities and remove the margin.'],
    ['Team-strength features', 'Ratings, rest, travel and injuries: features that are known before tip-off.'],
    ['Walk-forward validation', 'Train on the past, predict the next window, roll forward, and never let future games leak in.'],
    ['Calibrating win probabilities', 'Check that games you rate at 60% are won about 60% of the time, and fix it when they are not.'],
    ['Benchmarking against the closing line', 'Compare your probabilities with the closing market as a demanding baseline.'],
  ]),

  // ── Machine Learning ─────────────────────────────────────────────────────
  pathway('machine-learning', 'supervised-learning', 'Supervised Learning Foundations', 'The core loop: data, a model, a loss and an optimizer.', [
    ['Features, labels and examples', 'What a training example is, and how inputs and targets are represented.'],
    ['Loss functions', 'How a single number measures how wrong a model is, and why the choice matters.'],
    ['Gradient descent', 'Adjusting parameters step by step in the direction that reduces the loss.'],
    ['Overfitting and regularization', 'Why a model can memorize training data, and the tools that discourage it.'],
    ['Train, validation and test splits', 'Keeping separate data for fitting, tuning and the final honest estimate.'],
  ]),
  pathway('machine-learning', 'gradient-boosted-trees', 'Gradient-Boosted Trees', 'Why boosted trees are a strong default for tabular data.', [
    ['Decision trees and splits', 'How a tree partitions data with simple threshold rules.'],
    ['Bagging versus boosting', 'Averaging independent trees compared with adding trees that correct earlier errors.'],
    ['How XGBoost builds trees', 'An additive model fitted to a regularized objective, one tree at a time.'],
    ['Tuning depth, learning rate and rounds', 'The handful of settings that control most of the bias–variance trade-off.'],
    ['Feature importance and its pitfalls', 'What importance scores do and do not tell you about a feature.'],
  ]),
  pathway('machine-learning', 'probability-calibration', 'Probability Calibration', 'Making predicted probabilities mean what they say.', [
    ['What calibration means', 'Agreement between predicted probabilities and observed frequencies.'],
    ['Reliability diagrams', 'Bin predictions and plot them against outcomes to see miscalibration.'],
    ['Brier score and log loss', 'Two proper scoring rules, and how they reward honest probabilities.'],
    ['Platt scaling and isotonic regression', 'Two common ways to recalibrate a trained model on held-out data.'],
  ]),
  pathway('machine-learning', 'neural-network-basics', 'Neural Network Basics', 'From a single neuron to deep networks and learned representations.', [
    ['Neurons and activations', 'Weighted sums followed by non-linear functions.'],
    ['Backpropagation', 'Using the chain rule to compute gradients for every weight.'],
    ['Depth and width', 'How layer count and size change what a network can represent.'],
    ['Embeddings as learned features', 'Dense vectors that a network learns to represent inputs.'],
  ]),

  // ── Agents ───────────────────────────────────────────────────────────────
  pathway('agents', 'the-agent-loop', 'The Agent Loop', 'How an agent observes, decides and acts until a goal is met.', [
    ['Observe, decide, act', 'The basic cycle that turns a model into an agent.'],
    ['Tool calling', 'Structured requests that the application validates and executes on the model’s behalf.'],
    ['Planning and replanning', 'Breaking a goal into steps and revising the plan as new results arrive.'],
    ['Stopping conditions and budgets', 'Deciding when an agent is done, stuck or out of time and money.'],
  ]),
  pathway('agents', 'tools-and-mcp', 'Tools and the Model Context Protocol', 'Giving agents capabilities safely and in a standard way.', [
    ['Designing a tool schema', 'Names, parameters and descriptions that a model can use correctly.'],
    ['Validating and authorizing tool calls', 'Checking every call before it touches real systems.'],
    ['MCP clients, servers and transports', 'How the Model Context Protocol exposes tools and context to applications.'],
    ['Handling tool errors', 'Returning failures the agent can understand and recover from.'],
  ]),
  pathway('agents', 'agent-memory', 'Memory and Context', 'What an agent remembers, for how long, and how it finds it again.', [
    ['Context window versus long-term memory', 'The difference between what is in the prompt and what is stored elsewhere.'],
    ['Retrieval for agents', 'Looking up relevant notes, documents or past steps when they are needed.'],
    ['Summarizing long histories', 'Compressing earlier work without losing the facts that matter.'],
  ]),
  pathway('agents', 'evaluating-agents', 'Evaluating Agents', 'Measuring whether an agent actually does the job.', [
    ['Task success metrics', 'Defining what “done correctly” means for a multi-step task.'],
    ['Reviewing trajectories', 'Reading the sequence of actions, not just the final answer.'],
    ['Reliability across repeated runs', 'Why one success is not enough, and how to measure consistency.'],
    ['Cost and latency budgets', 'Tracking tokens, tool calls and time per completed task.'],
  ]),

  // ── Data Centers (Critical Power is above) ───────────────────────────────
  pathway('data-centers', 'cooling-systems', 'Cooling Systems', 'Moving heat away from equipment, from airflow to liquid loops.', [
    ['Heat load and airflow', 'Where the heat comes from and how air carries it away.'],
    ['Hot-aisle and cold-aisle containment', 'Separating supply and exhaust air to stop mixing.'],
    ['Chilled-water plants', 'Chillers, pumps and cooling towers working as one system.'],
    ['Direct-to-chip liquid cooling', 'Cold plates and coolant loops for high-density racks.'],
    ['PUE and what it leaves out', 'Power usage effectiveness, and the questions it does not answer.'],
  ]),
  pathway('data-centers', 'gpu-clusters', 'GPU Clusters', 'The servers, racks and networks behind training and inference.', [
    ['Anatomy of a GPU server', 'Accelerators, CPUs, memory, storage and the links between them.'],
    ['Rack power density', 'Why GPU racks draw far more power than traditional ones, and what that changes.'],
    ['Cluster interconnects', 'How the network fabric between servers shapes training performance.'],
    ['Scheduling training and inference', 'Sharing a cluster between long jobs and latency-sensitive services.'],
  ]),

  // ── Prediction Models (NBA Moneylines is above) ──────────────────────────
  pathway('prediction-models', 'time-aware-validation', 'Time-Aware Validation', 'Testing forecasts the way they will be used: forward in time.', [
    ['Data leakage', 'How future information sneaks into features or training data.'],
    ['Why random splits fail on time series', 'Shuffled splits let a model peek at the future.'],
    ['Rolling and expanding windows', 'Two ways to move the training window forward through time.'],
    ['Backtesting with realistic timing', 'Using only the data that would have been available at each decision.'],
  ]),
  pathway('prediction-models', 'bayesian-forecasting', 'Bayesian Forecasting', 'Updating beliefs as each new result comes in.', [
    ['Priors, likelihoods and posteriors', 'The three parts of Bayes’ rule and how they combine.'],
    ['Updating ratings game by game', 'Treating each result as evidence that shifts a team’s rating.'],
    ['Credible intervals', 'Describing uncertainty around a forecast, not just a single number.'],
    ['Shrinkage toward the average', 'Why small samples should be pulled toward the group mean.'],
  ]),

  // ── Sports Gambling ──────────────────────────────────────────────────────
  pathway('sports-gambling', 'odds-and-implied-probability', 'Odds and Implied Probability', 'Reading prices and turning them into probabilities.', [
    ['American, decimal and fractional odds', 'Three formats that describe the same payout.'],
    ['Implied probability', 'The break-even probability behind a price.'],
    ['The vig and no-vig prices', 'How the bookmaker’s margin is built in, and how to remove it.'],
  ]),
  pathway('sports-gambling', 'market-efficiency', 'Market Efficiency', 'How lines move, and what the closing price tells you.', [
    ['How lines move', 'Information, money and limits that shift a price before the game.'],
    ['Closing line value', 'Comparing the price you took with the final price, and what that does and does not prove.'],
    ['Liquidity and limits', 'How much can be bet at a price before it moves.'],
  ]),
  pathway('sports-gambling', 'bankroll-and-risk', 'Bankroll and Risk', 'Sizing stakes and staying in control.', [
    ['Expected value', 'The probability-weighted average result of a bet.'],
    ['Variance and drawdowns', 'Why good decisions can still lose for a long time.'],
    ['The Kelly criterion', 'A growth-optimal staking rule, and why estimation error makes full Kelly fragile.'],
    ['Setting limits and responsible play', 'Loss limits, time limits and recognizing when to stop.'],
  ]),

  // ── LLMs ─────────────────────────────────────────────────────────────────
  pathway('llms', 'transformers', 'Transformers', 'The architecture behind modern language models.', [
    ['Tokenization', 'Turning text into the units a model reads and predicts.'],
    ['Embeddings', 'Representing each token as a dense vector.'],
    ['Self-attention', 'Letting every token weigh the relevance of every other token.'],
    ['Multi-head attention', 'Running several attention patterns in parallel and combining them.'],
    ['Positional encoding', 'Giving the model a sense of word order.'],
  ]),
  pathway('llms', 'inference-and-serving', 'Inference and Serving', 'What happens when a model generates text, and what makes it fast.', [
    ['Autoregressive decoding', 'Generating one token at a time, each conditioned on the last.'],
    ['The KV cache', 'Reusing attention keys and values so earlier tokens are not recomputed.'],
    ['Quantization', 'Storing weights at lower precision to save memory and compute.'],
    ['Batching and throughput', 'Serving many requests together to keep the hardware busy.'],
  ]),
  pathway('llms', 'adapting-llms', 'Adapting LLMs', 'Getting a general model to do your specific job.', [
    ['Prompting and context', 'Instructions, examples and documents supplied at request time.'],
    ['Retrieval-augmented generation', 'Fetching relevant documents and adding them to the prompt.'],
    ['Fine-tuning', 'Updating a model’s weights on examples from your task.'],
    ['Evaluating outputs', 'Test sets, rubrics and checks that tell you whether a change helped.'],
  ]),

  // ── Possible Use Cases for AI ────────────────────────────────────────────
  pathway('ai-use-cases', 'ai-in-operations', 'AI in Operations', 'Using AI to keep physical and digital systems running.', [
    ['Predictive maintenance', 'Estimating when equipment is likely to fail so it can be serviced first.'],
    ['Anomaly detection in telemetry', 'Flagging sensor readings that do not fit normal patterns.'],
    ['Automating runbooks with agents', 'Letting an agent carry out documented procedures with human approval.'],
  ]),
  pathway('ai-use-cases', 'ai-for-analysts', 'AI for Analysts and Forecasters', 'Where AI speeds up analysis, and where it needs checking.', [
    ['Drafting queries and reports', 'Using a model to write first drafts of SQL, code and summaries.'],
    ['Model-assisted forecasting', 'Combining statistical models with AI-generated research and features.'],
    ['Checking AI-generated analysis', 'Verifying numbers, sources and assumptions before relying on them.'],
  ]),
  pathway('ai-use-cases', 'choosing-a-use-case', 'Choosing a Use Case', 'Picking problems where AI is worth the effort.', [
    ['Finding a costly, repeated task', 'Look for work that is frequent, time-consuming and checkable.'],
    ['Build, buy or prompt', 'Deciding between an off-the-shelf tool, a prompt workflow and custom development.'],
    ['Pilots and success metrics', 'Running a small trial with a measurable definition of success.'],
    ['Risks, privacy and oversight', 'Data handling, failure modes and where a human must stay in the loop.'],
  ]),

  // ── PCB Diagnostics ──────────────────────────────────────────────────────
  pathway('pcb-diagnostics', 'power-rail-faults', 'Power Rail Faults', 'Finding why a board’s supply rails are missing, low or shorted.', [
    ['Voltage rails and tolerances', 'The supply nets on a board and the ranges they must stay within.'],
    ['Power sequencing', 'The order and timing in which rails and resets must come up.'],
    ['Finding shorts', 'Locating a low-resistance path that pulls a rail down.'],
    ['Current limiting during diagnosis', 'Restricting supply current so a fault does not cause more damage.'],
  ]),
  pathway('pcb-diagnostics', 'signal-tracing', 'Signal Tracing', 'Following a signal until measurements stop matching expectations.', [
    ['Oscilloscope setup and probing', 'Bandwidth, grounding and probe choice for trustworthy measurements.'],
    ['Following a signal path', 'Working stage by stage through a circuit with the schematic.'],
    ['Logic levels and timing', 'Checking that digital signals are valid and arrive when expected.'],
    ['Fault isolation strategy', 'Using evidence and controlled tests to narrow a failure to one part.'],
  ]),
];

export const continentById = Object.fromEntries(continents.map(c => [c.id, c])) as Record<ContinentId, Continent>;

// ── Cross-links ────────────────────────────────────────────────────────────
// Each connection is listed once and applied to both ends. An end is a pathway id
// ("probability-calibration") or a lesson id ("nba-moneylines/walk-forward-validation").
export const connections: [string, string, string][] = [
  // Your example: probability calibration joins Machine Learning and Prediction Models.
  ['probability-calibration', 'nba-moneylines', 'A moneyline model is only useful if its win probabilities are calibrated.'],
  ['probability-calibration/what-calibration-means', 'nba-moneylines/calibrating-win-probabilities', 'The general idea of calibration, applied to NBA win probabilities.'],
  ['probability-calibration/brier-score-and-log-loss', 'supervised-learning/loss-functions', 'Log loss is both a training loss and a score for probability forecasts.'],
  ['probability-calibration', 'bankroll-and-risk', 'Expected value and Kelly stakes depend on honest probabilities.'],
  // Machine Learning ↔ Prediction Models
  ['supervised-learning/train-validation-and-test-splits', 'time-aware-validation/why-random-splits-fail-on-time-series', 'Standard splits need a time-aware version when you forecast the future.'],
  ['supervised-learning/overfitting-and-regularization', 'bayesian-forecasting/shrinkage-toward-the-average', 'Shrinkage and regularization both trade a little bias for less variance.'],
  ['gradient-boosted-trees', 'nba-moneylines', 'Boosted trees are a strong default model for tabular game features.'],
  // Prediction Models internal
  ['time-aware-validation/rolling-and-expanding-windows', 'nba-moneylines/walk-forward-validation', 'Walk-forward validation is built from rolling or expanding windows.'],
  ['time-aware-validation/data-leakage', 'nba-moneylines/team-strength-features', 'Every team feature must be computed only from games before tip-off.'],
  ['bayesian-forecasting/updating-ratings-game-by-game', 'nba-moneylines/team-strength-features', 'Game-by-game ratings are the core team-strength feature.'],
  // Sports Gambling ↔ Prediction Models
  ['odds-and-implied-probability', 'nba-moneylines', 'Converting moneylines into probabilities is the first step of the model.'],
  ['market-efficiency/closing-line-value', 'nba-moneylines/benchmarking-against-the-closing-line', 'The closing line is both a benchmark for models and a measure of bet timing.'],
  ['odds-and-implied-probability/implied-probability', 'bankroll-and-risk/expected-value', 'Expected value compares your probability with the price’s implied probability.'],
  ['time-aware-validation/backtesting-with-realistic-timing', 'market-efficiency/liquidity-and-limits', 'Realistic backtests use prices and stakes you could actually have bet.'],
  // Machine Learning ↔ LLMs
  ['neural-network-basics', 'transformers', 'Transformers are deep neural networks built from attention and feed-forward layers.'],
  ['neural-network-basics/embeddings-as-learned-features', 'transformers/embeddings', 'Token embeddings are learned features, trained like any other weights.'],
  // LLMs internal
  ['transformers/self-attention', 'inference-and-serving/the-kv-cache', 'The KV cache stores attention keys and values so decoding stays fast.'],
  // LLMs ↔ Data Centers
  ['inference-and-serving', 'gpu-clusters', 'Model serving runs on GPU servers and clusters.'],
  ['inference-and-serving/batching-and-throughput', 'gpu-clusters/scheduling-training-and-inference', 'Batching and scheduling decide how much useful work each GPU does.'],
  // Data Centers internal
  ['gpu-clusters/rack-power-density', 'critical-power/pdus-and-branch-circuits', 'Dense GPU racks need more and larger branch circuits.'],
  ['gpu-clusters/rack-power-density', 'cooling-systems/direct-to-chip-liquid-cooling', 'High rack densities push cooling from air to liquid.'],
  // LLMs ↔ Agents
  ['adapting-llms/prompting-and-context', 'the-agent-loop', 'An agent is a prompt-driven model running in a loop with tools.'],
  ['adapting-llms/retrieval-augmented-generation', 'agent-memory/retrieval-for-agents', 'Agents use the same retrieval techniques as RAG, but decide when to search.'],
  ['adapting-llms/evaluating-outputs', 'evaluating-agents', 'Agent evaluation extends output grading to multi-step tasks.'],
  ['evaluating-agents/cost-and-latency-budgets', 'inference-and-serving', 'Agent cost and latency come from the tokens each model call processes.'],
  // Agents ↔ Possible Use Cases for AI
  ['tools-and-mcp/validating-and-authorizing-tool-calls', 'ai-in-operations/automating-runbooks-with-agents', 'Runbook automation depends on narrow permissions and approvals.'],
  ['tools-and-mcp/validating-and-authorizing-tool-calls', 'choosing-a-use-case/risks-privacy-and-oversight', 'Tool permissions are where AI oversight is enforced in code.'],
  ['evaluating-agents', 'choosing-a-use-case/pilots-and-success-metrics', 'A pilot needs the same success metrics as an agent evaluation.'],
  // Possible Use Cases for AI ↔ Data Centers / Prediction Models
  ['ai-in-operations/predictive-maintenance', 'critical-power/generators-and-transfer-switches', 'Generators, UPS batteries and switchgear are prime predictive-maintenance targets.'],
  ['ai-in-operations/anomaly-detection-in-telemetry', 'cooling-systems', 'Cooling telemetry is a common source of early warning signs.'],
  ['ai-for-analysts/model-assisted-forecasting', 'time-aware-validation/data-leakage', 'LLM-assisted forecasts can leak outcomes the model already knows.'],
  // PCB Diagnostics ↔ Data Centers / Prediction Models
  ['power-rail-faults/current-limiting-during-diagnosis', 'critical-power/utility-service-and-switchgear', 'Both limit fault energy: current limits on the bench, protective devices in the building.'],
  ['power-rail-faults/power-sequencing', 'critical-power/generators-and-transfer-switches', 'Both bring power up in a defined order with checks at each step.'],
  ['signal-tracing/fault-isolation-strategy', 'bayesian-forecasting/priors-likelihoods-and-posteriors', 'Bayesian updating ranks fault hypotheses as measurements arrive.'],
];

const pathwayIndex = new Map(pathways.map(p => [p.id, p]));
const lessonIndex = new Map(pathways.flatMap(p => p.lessons.map(l => [l.id, l] as const)));
/** Connection ends that do not match any pathway or lesson (should always be empty; checked by tests). */
export const unresolvedConnections: string[] = [];
for (const [a, b, reason] of connections) {
  const ends = [a, b].map(id => pathwayIndex.get(id) ?? lessonIndex.get(id));
  [a, b].forEach((id, i) => { if (!ends[i]) unresolvedConnections.push(id); });
  if (!ends[0] || !ends[1] || a === b) continue;
  ends[0].related.push({ id: b, kind: b.includes('/') ? 'lesson' : 'pathway', reason });
  ends[1].related.push({ id: a, kind: a.includes('/') ? 'lesson' : 'pathway', reason });
}

/** Look up the pathway (and lesson, for lesson ids) that a related id points to. */
export function resolveRelated(id: string): { pathway: Pathway; lesson?: Lesson; continent: Continent } | undefined {
  const lesson = lessonIndex.get(id);
  const pathway = lesson ? pathwayIndex.get(id.split('/')[0]) : pathwayIndex.get(id);
  return pathway ? { pathway, lesson, continent: continentById[pathway.continent] } : undefined;
}

export const pathwaysIn = (id: ContinentId) => pathways.filter(p => p.continent === id);

export const totalLessons = pathways.reduce((n, p) => n + p.lessons.length, 0);

const searchText = (p: Pathway) =>
  [p.title, p.description, continentById[p.continent].name, ...p.lessons.flatMap(l => [l.title, l.summary])].join(' ').toLowerCase();

/** Every whitespace-separated term must appear in the pathway, its subject or one of its lessons (case-insensitive). */
export function matchesQuery(p: Pathway, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const text = searchText(p);
  return terms.every(t => text.includes(t));
}

/** The first lesson whose title or summary matches every term, used to preview why a pathway matched. */
export function matchingLesson(p: Pathway, query: string): Lesson | undefined {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return undefined;
  return p.lessons.find(l => terms.every(t => `${l.title} ${l.summary}`.toLowerCase().includes(t)));
}
