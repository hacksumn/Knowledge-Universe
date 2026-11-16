@@ task-success-metrics

You cannot improve an agent you cannot measure. Agent evaluation starts with a simple question that is often hard to answer: did the agent accomplish the task correctly? Defining that clearly, for a representative set of tasks, is the foundation for everything else.

## Build a task set

An evaluation set is a collection of tasks, each with:

- **An input**: the user request and any starting state, such as files, database records or a sandbox environment.
- **A success criterion**: how to decide whether the outcome is correct.
- **Metadata**: category, difficulty and source, so results can be broken down.

Draw tasks from real usage where possible. Include easy tasks, hard ones and edge cases such as ambiguous requests, missing data and tasks the agent should refuse or escalate.

## Ways to judge success

| Method | How it works | Good for |
|---|---|---|
| Outcome checks in code | Inspect the final state: tests pass, record updated, file exists with expected content | Coding, data and operations tasks |
| Exact or fuzzy match | Compare the answer with a reference | Factual questions with clear answers |
| Rubric grading by a model | A model scores the output against written criteria | Open-ended writing, explanations |
| Human review | People grade outputs | Calibrating other methods, high-stakes tasks |

Prefer checking the **outcome** over checking the exact path. Agents may find valid solutions you did not anticipate.

## Model-based grading

Using a model as a grader scales well, but it needs care:

- Write specific rubrics: "Does the answer state the refund amount? Does it cite the policy section?" rather than "Is this good?"
- Ask for a judgment per criterion, not one overall score.
- Check agreement with human grades on a sample before trusting it.
- Watch for biases, such as favoring longer answers.

## Metrics beyond pass or fail

- **Success rate**: fraction of tasks completed correctly.
- **Partial credit**: for multi-part tasks, the fraction of parts completed.
- **Safety violations**: actions that should not have happened, such as deleting data or ignoring a permission boundary. Track these separately; one serious violation can outweigh many successes.
- **Escalation quality**: whether the agent asked for help when it should have, and not when it should not.
- **Honesty**: whether the agent's final report matches what actually happened.

## Slice the results

An overall success rate hides patterns. Break results down by task category, difficulty and input type. An agent that is 90% successful overall may succeed at only 50% of tasks involving a particular tool.

## Keep the set alive

- Add new tasks from production failures.
- Retire tasks that every version solves and that no longer discriminate.
- Keep a held-out subset you do not tune against, to avoid overfitting your prompts to the evaluation.

## Sample size

With small task sets, differences between versions can be noise. With 100 tasks, a success rate of 70% has a 95% confidence interval of roughly ±9 percentage points. Use enough tasks, and repeat runs, before declaring one version better.

> **Key takeaway:** Define success as a checkable outcome for a realistic task set. Combine code checks, rubric grading and human review, track safety and honesty separately, and break results down by category.

@@ reviewing-trajectories

A trajectory is the full record of an agent run: every message, tool call, tool result and decision from start to finish. Outcome metrics tell you whether an agent succeeded. Trajectories tell you **why**, which is what you need to fix it.

## What to look for

Read trajectories with specific questions in mind:

- **Understanding.** Did the agent interpret the task correctly at the start?
- **Tool choice.** Did it use the right tools, or struggle with an unclear one?
- **Arguments.** Were tool arguments correct, or did it guess IDs and formats?
- **Reading results.** Did it notice important details in tool outputs, including errors?
- **Efficiency.** Did it take unnecessary steps, re-read the same files or repeat failed calls?
- **Verification.** Did it check its work before finishing?
- **Reporting.** Did its final message accurately describe what happened?

## Successes deserve review too

Successful runs can hide problems: an agent that passed by luck, used a risky shortcut or took twenty steps for a five-step task. Reviewing a sample of successes finds inefficiencies and near-misses before they become failures.

## Build a failure taxonomy

As you review, label each failure with a cause. A typical taxonomy:

| Category | Example |
|---|---|
| Misunderstood task | Fixed the wrong bug |
| Tool misuse | Wrong parameter format, wrong tool |
| Missed information | Ignored an error in a tool result |
| Gave up early | Stopped after one failed attempt |
| Looped | Repeated the same failing action |
| False success | Claimed tests pass without running them |
| Unsafe action | Changed something outside the task scope |

Counting failures by category shows where to invest. If a third of failures are tool misuse, improving tool descriptions will likely help more than changing the model.

## From finding to fix

Each failure category suggests typical remedies:

- **Tool misuse** → clearer descriptions, tighter schemas, better error messages.
- **Missed information** → shorter, more structured tool outputs.
- **False success** → required verification steps and stricter final-report instructions.
- **Looping** → loop detection in the harness and prompts that encourage alternatives.
- **Misunderstood task** → instructions to restate the goal or ask clarifying questions.

After each change, rerun the evaluation to confirm the fix helped and did not break something else.

## Tooling for review

Long trajectories are hard to read as raw logs. Useful tooling:

- A viewer that shows each step with collapsible tool results.
- Search across trajectories for specific tools, errors or phrases.
- Side-by-side comparison of two agent versions on the same task.
- Automated flags, using code or a model, for patterns such as repeated calls, error results or unusually long runs.

## Scaling review

You cannot read every trajectory. Sample deliberately: some random runs, all safety flags, failures from new task categories and the longest or most expensive runs. Model-based reviewers can triage large volumes, with humans checking a sample of their judgments.

## Keep privacy in mind

Trajectories can contain user data and secrets passed through tools. Store them securely, limit access and redact sensitive values where possible.

> **Key takeaway:** Read trajectories to learn why agents fail. Label failures by cause, fix the most common causes first and confirm each fix by rerunning the evaluation.

@@ reliability-across-repeated-runs

Agents are not fully deterministic. The same task can succeed on one run and fail on the next, because model outputs vary and small differences early in a run compound over many steps. A single successful demo says little about how an agent will behave across thousands of uses.

## Why variation matters more for agents

In a single-response task, one variation affects one answer. In a 30-step agent run, an early difference can send the agent down a completely different path. An agent with a 95% chance of getting each step right has only about a 21% chance of getting all 30 right, if the steps are independent. Real agents can recover from some mistakes, but the point stands: per-step reliability compounds.

## Measure with repeated runs

Run each task several times, such as 5 or 10 runs. Then report:

- **pass@1**: the average success rate of a single attempt. This reflects what a user gets on a typical try.
- **pass@k**: the chance that at least one of k attempts succeeds. It shows what the agent can do but overstates everyday reliability.
- **pass^k (all-k)**: the chance that all k attempts succeed. This measures consistency, which matters when users depend on the agent every time.

## An example

| Task | Successes in 10 runs |
|---|---|
| A | 10 |
| B | 7 |
| C | 1 |

Task A is reliable. Task B usually works but fails often enough to frustrate users. Task C shows the agent **can** solve it, so it is capable but unreliable; looking at the one success and nine failures side by side often reveals the fix.

## Sources of variation

- **Sampling randomness** in the model. Lower temperature reduces but rarely eliminates variation.
- **Environment changes** such as live data, network latency and external API behavior.
- **Ordering effects** such as tool results arriving in different orders.
- **Model and prompt versions** changing between runs.

For evaluation, control what you can: fixed sandbox snapshots, mocked external services and recorded versions of everything.

## Improving consistency

- **Reduce ambiguity.** Clearer instructions and tool descriptions leave fewer valid-seeming paths.
- **Add verification.** Agents that check their work recover from more mistakes, raising consistency even if per-step accuracy is unchanged.
- **Use workflows where paths are known.** Fixed steps vary less than open-ended exploration.
- **Constrain outputs.** Structured outputs and schemas remove formatting variation.
- **Handle errors well.** Many inconsistent failures trace back to a tool error the agent sometimes handles and sometimes does not.

## Reliability in production

Track success and failure signals over time in production: task completion, user corrections, retries and escalations. Watch for regressions after model, prompt or tool changes. A canary release, where a new version serves a small share of traffic first, catches reliability drops before they reach everyone.

> **Key takeaway:** Run each task many times. Report pass@1 for typical experience and all-k consistency for dependability, and remember that per-step reliability compounds over long runs.

@@ cost-and-latency-budgets

An agent that solves a task correctly but takes ten minutes and costs several dollars may still be unusable. Cost and latency are part of an agent's quality, and they need to be measured and budgeted like success rate.

## Where cost comes from

- **Input tokens.** Every model call sends the whole context: instructions, tool definitions and history. In long runs, input tokens usually dominate cost, because the growing history is re-sent on each step.
- **Output tokens.** The model's responses and reasoning. Output tokens are typically priced higher than input tokens.
- **Tool costs.** Paid APIs, search queries, compute for code execution, database load.
- **Retries.** Failed steps that are repeated.

## A rough cost model

If each step sends an average of 20,000 input tokens and produces 500 output tokens, then a 30-step run uses about 600,000 input tokens and 15,000 output tokens. Multiply by the model's per-token prices and add tool costs. This back-of-the-envelope calculation often reveals that trimming context is the biggest lever.

## Reducing cost

- **Prompt caching.** Many APIs can cache a stable prefix of the prompt, such as instructions and tool definitions, and charge much less for cached tokens on later calls. Keep stable content at the start of the prompt to benefit.
- **Context management.** Clear old tool results, summarize history and return concise tool outputs.
- **Model routing.** Use a smaller, cheaper model for simple steps, such as classification or extraction, and a stronger model for planning and hard reasoning.
- **Fewer steps.** Better tools that combine operations, and clearer instructions, reduce the number of loop iterations.
- **Batch processing.** For tasks that do not need immediate results, batch APIs often offer lower prices.

## Where latency comes from

- **Model time.** Time to first token plus generation time; longer outputs and larger models take longer.
- **Number of sequential steps.** Each loop iteration waits for the previous one.
- **Tool time.** Slow APIs, large file reads, long-running commands.

## Reducing latency

- **Parallel tool calls** for independent operations.
- **Streaming** responses so users see progress immediately.
- **Smaller models** for steps where they are good enough.
- **Fewer, larger steps** instead of many tiny ones.
- **Caching** repeated tool results within a session.

## Setting budgets

Treat cost and time as metrics on your evaluation set:

| Metric | Measure |
|---|---|
| Cost per successful task | Total cost ÷ number of successes |
| Median and 95th percentile latency | Typical and worst-case wait |
| Steps per task | Efficiency of the loop |

**Cost per successful task** is more honest than cost per run, because failures cost money too. A cheaper agent that fails twice as often may be more expensive overall.

## Trade-offs

Higher quality often costs more: stronger models, more verification steps, more retrieval. Decide what the task is worth. A code fix that saves an engineer an hour justifies more spend than a casual question. Put the budget in the harness as hard limits, and review runs that approach them.

> **Key takeaway:** Measure cost per successful task and latency percentiles alongside success rate. Caching, context management, model routing and parallel tool calls are the main levers.
