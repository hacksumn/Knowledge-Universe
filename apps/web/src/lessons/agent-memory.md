@@ context-window-versus-long-term-memory

Language models do not remember anything between calls. Everything a model knows about the current task must be in its context window: the text sent with each request. "Memory" in an agent system is therefore something the application builds, by deciding what to put in that window and what to store elsewhere.

## The context window

The context window is the maximum amount of text, measured in tokens, that a model can process in one request. It includes:

- System instructions.
- Tool definitions.
- The conversation so far, including tool calls and results.
- Any documents or data added for the task.
- The model's own output.

Modern models have large windows, often hundreds of thousands of tokens or more. But a large window is not free. Each request costs more and takes longer as the context grows, and models can pay less attention to details buried in the middle of very long contexts.

## Short-term (working) memory

Working memory is what the agent needs right now: the current goal, the plan, recent tool results and decisions. It lives in the context window. For short tasks, keeping the full conversation in context is simple and effective.

## Long-term memory

Long-term memory is information stored outside the model and brought back when relevant. Common forms:

- **Files and notes.** The agent writes notes, such as a progress log or a to-do list, and reads them in later sessions.
- **Databases.** Structured facts like user preferences or account settings.
- **Vector stores.** Text chunks with embeddings, searched by similarity to find related past content.
- **Summaries.** Condensed records of earlier sessions.

## Kinds of things worth remembering

| Type | Example | Typical storage |
|---|---|---|
| Facts about the user | Preferred language, time zone | Key-value or profile store |
| Facts about the project | Build commands, coding conventions | Files in the project |
| Episodes | What happened in last week's session | Summaries, logs |
| Skills or procedures | How to deploy this service | Instruction documents |

## Writing memory

Memory is only useful if the right things are saved. Approaches include:

- **Explicit saves**: the agent has a tool such as `save_note` and is instructed when to use it.
- **End-of-session summaries**: after a task, the system writes a summary of decisions and open items.
- **User-curated memory**: the user tells the agent what to remember, or edits a memory file directly.

## Reading memory

At the start of a task, or when needed, the agent retrieves relevant memory and adds it to context. This can be automatic (always load the project notes) or on demand (search past notes with a tool).

## Risks

- **Stale memory.** Stored facts can become wrong. Record dates and sources, and prefer re-checking over trusting old notes.
- **Privacy.** Memory may contain personal or sensitive data. Users should be able to see, edit and delete it.
- **Poisoning.** If an agent saves text from untrusted sources, injected instructions can persist across sessions. Store facts, not instructions from outside content.

> **Key takeaway:** The context window is the model's only working memory. Long-term memory is application-managed storage that gets written deliberately and retrieved back into context when it helps.

@@ retrieval-for-agents

Retrieval is how an agent finds information it does not have in context: documentation, code, past conversations, knowledge bases. Instead of loading everything up front, the agent searches for what it needs, when it needs it.

## Two styles of retrieval

**Pre-loaded retrieval.** Before the model runs, the application searches for relevant content based on the user's request and adds the top results to the prompt. This is the classic retrieval-augmented generation (RAG) pattern. It is simple and fast, but the search happens once, based only on the initial question.

**Agentic retrieval.** The agent has search tools and decides what to look for, often in several rounds. It can refine queries, follow references and stop when it has enough. This handles complex questions better, at the cost of more steps.

## Search methods

- **Keyword search** (for example BM25) matches exact terms. It excels at names, error codes and identifiers.
- **Semantic search** compares embeddings to find text with similar meaning, even if the words differ. It handles paraphrases well.
- **Hybrid search** combines both and often outperforms either alone.
- **Structured queries** use SQL or APIs for data that lives in tables.
- **File tools** such as listing directories, pattern matching and reading files let coding agents explore a codebase the way a developer would.

## Preparing content

For semantic search, documents are split into chunks, embedded and stored in an index. Choices that matter:

- **Chunk size.** Too small loses context; too large dilutes relevance. A few hundred tokens with some overlap is a common starting point.
- **Metadata.** Store source, date, author and section headings with each chunk so the agent can filter and cite.
- **Context in chunks.** Prepending a short description of where the chunk comes from ("From the 2026 refund policy, section 3") improves both retrieval and the model's understanding.

## Reranking

A first-stage search returns many candidates quickly. A **reranker**, often a model that scores each candidate against the query, reorders them so the best few go into context. Reranking improves precision when the initial search is noisy.

## Making retrieval tools agent-friendly

- Return short snippets with source identifiers, and let the agent fetch full documents when needed.
- Report how many results matched and whether results were truncated.
- Include dates so the agent can prefer recent information.
- Make it easy to search again with different terms.

## Evaluating retrieval

Retrieval quality limits answer quality. Measure it separately:

1. Build a set of questions with known relevant documents.
2. Check whether those documents appear in the top results (recall at k).
3. Check whether answers cite and use them correctly.

If the right document is not retrieved, no amount of prompt tuning will fix the answer.

## Common problems

- Queries that are too literal or too broad.
- Outdated documents outranking current ones.
- Many near-duplicate chunks crowding out diverse sources.
- Retrieved text containing instructions that the agent mistakes for commands.

> **Key takeaway:** Retrieval brings the right information into context on demand. Combine keyword and semantic search, keep sources and dates attached, and measure retrieval quality separately from answer quality.

@@ summarizing-long-histories

Long agent sessions accumulate a lot of text: tool calls, file contents, search results, failed attempts. Eventually the context window fills, or becomes so long that cost rises and the model loses track of important details. Summarization compresses the history so the agent can keep working.

## When to summarize

Common triggers:

- The context reaches a set fraction of the window, such as 70–80%.
- A sub-task finishes and its details are no longer needed.
- A session ends and its key points should carry into the next one.

## What a good summary keeps

A summary for an agent is a handoff note to its future self. It should preserve:

- **The goal** and any constraints from the user.
- **Decisions made** and the reasons for them.
- **Current state**: what is done, what is in progress, what is left.
- **Key facts discovered**: file locations, IDs, configuration values, error messages.
- **Failed approaches**, so they are not retried.
- **Open questions** for the user.

It can drop:

- Raw tool outputs once their important facts are captured.
- Intermediate reasoning that led to settled decisions.
- Duplicate or superseded information.

## An example

Instead of 40,000 tokens of logs, a summary might read:

"Goal: fix failing `test_refunds`. Found cause in `billing/refund.py`, line 88: currency rounding uses floats. Changed to `Decimal`; `test_refunds` now passes. Two related tests in `test_invoices.py` still fail with a timezone error, not yet investigated. User asked not to change the public API."

## Techniques

- **Rolling summary.** Keep recent turns verbatim and replace older turns with a summary that is updated as the session grows.
- **Tool result clearing.** Remove the bulky contents of old tool results while keeping the record that the call happened. If the agent needs the content again, it can re-run the tool.
- **Structured notes.** Have the agent maintain a progress file or to-do list throughout the task, so state lives outside the conversation and survives any compression.
- **Sub-agents.** Delegate a self-contained task to a separate agent with a fresh context. It returns only a concise result, keeping the main context clean.

## Risks of summarization

- **Lost details.** A summary may drop something that later turns out to matter, such as an exact error message. Keep identifiers and exact values rather than paraphrasing them.
- **Drift.** Repeated summarizing of summaries can distort facts. Anchor summaries to stored notes and files where possible.
- **False confidence.** A summary might state that something is done when it was only attempted. Record verification status explicitly.

## Testing compression

Evaluate summarization by running long tasks with and without compression and comparing success rates. Also check specific recall: after compressing, ask the agent about facts from early in the session and see whether it still knows them.

> **Key takeaway:** Summaries are handoff notes. Keep goals, decisions, state, exact key facts and failed approaches; drop raw outputs; and prefer external notes that survive compression.
