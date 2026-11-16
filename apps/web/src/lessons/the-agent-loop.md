@@ observe-decide-act

A language model on its own answers one prompt with one response. An agent wraps a model in a loop so it can take actions, see the results and decide what to do next, repeating until a goal is reached. That loop is the core of every agent system.

## The basic cycle

1. **Observe.** Gather the current state: the user's goal, the conversation so far, results of previous actions, and any relevant files or data.
2. **Decide.** Ask the model what to do next, given that state and a list of available tools. The model replies with either a tool call (an action) or a final answer.
3. **Act.** The application executes the requested tool call, such as running a search, reading a file or calling an API.
4. **Record.** Add the action and its result to the state.
5. **Repeat** until the model gives a final answer or a stopping condition is reached.

## A small example

Goal: "What was our highest-revenue product last quarter, and how did it do the quarter before?"

| Step | Model decides | Tool result |
|---|---|---|
| 1 | Call `run_sql` for revenue by product, last quarter | Product A: 1.2M (top) |
| 2 | Call `run_sql` for Product A, previous quarter | 0.9M |
| 3 | Final answer | "Product A, 1.2M, up about 33% from 0.9M." |

The model never touched the database directly. It asked for actions; the application ran them and returned results.

## Who does what

This division of labor matters:

- **The model** chooses actions and writes text. It cannot execute anything itself.
- **The application (often called the harness or orchestrator)** owns the loop: it calls the model, validates and runs tools, enforces permissions, tracks state and decides when to stop.

Keeping execution in the application is what makes agents controllable. Every action passes through code you wrote.

## Workflows versus agents

Not every multi-step system needs a fully autonomous loop.

- In a **workflow**, the steps are defined in code: first classify the request, then retrieve documents, then draft a reply. The model fills in each step, but the path is fixed.
- In an **agent**, the model chooses the path at run time, deciding which tools to call and in what order.

Workflows are more predictable and easier to test. Agents are more flexible for open-ended tasks where the steps cannot be known in advance. Many production systems are mostly workflow with agentic steps where flexibility is needed. Start with the simplest design that works.

## What makes the loop work well

- **Clear goals.** The model needs to know what "done" looks like.
- **Good tools.** Tools with clear names, descriptions and parameters are used correctly more often.
- **Informative results.** Tool outputs should say what happened, including errors, in a form the model can read.
- **Manageable context.** Each loop iteration adds text. Long tasks need strategies for keeping the context focused.
- **Limits.** Maximum steps, time and cost stop runaway loops.

## Failure modes

Common problems include repeating the same failing action, declaring success without checking, wandering away from the goal and taking actions with unintended side effects. Most fixes are in the harness: better tool feedback, explicit verification steps, step limits and human approval for risky actions.

> **Key takeaway:** An agent is a loop: observe, let the model decide, execute the action in your application, record the result and repeat. The model chooses; the application executes and stays in control.

@@ tool-calling

Tool calling lets a model request an action in a structured format that an application can execute. Instead of describing what it would like to do in prose, the model emits a tool name and arguments that match a schema. The application validates the request, runs it and returns the result to the model.

## How it works

1. **Define tools.** The application sends the model a list of tools, each with a name, a description and a JSON Schema for its input.
2. **The model decides.** Given the conversation, the model may respond with one or more tool calls, such as `get_weather` with `{"city": "Chicago"}`.
3. **The application executes.** Code validates the arguments, checks permissions and calls the real function or API.
4. **Return the result.** The tool output is added to the conversation as a tool result message linked to the original call.
5. **The model continues,** either calling more tools or writing a final answer.

## A tool definition

A weather tool might be defined as:

- **name**: `get_weather`
- **description**: "Get the current weather for a city. Use when the user asks about present conditions, not forecasts."
- **input schema**: an object with a required string `city` and an optional `units` that must be "metric" or "imperial".

The description tells the model **when** to use the tool, not just what it does. That guidance has a large effect on whether the model chooses correctly.

## Why structure matters

Free-text requests are hard to parse reliably. A schema means:

- Arguments can be checked automatically: required fields present, types correct, values within allowed sets.
- The application can route the call to the right function without guessing.
- Logs show exactly what was requested and executed.

Many APIs also offer a strict mode that constrains the model's output to match the schema exactly.

## Parallel and sequential calls

Models can often request several independent tool calls in one turn, such as looking up the weather in three cities. The application can run them in parallel and return all results together. When one call depends on another's result, they happen in sequence across turns.

## Controlling tool use

Applications can usually influence whether the model must use a tool:

- **Auto**: the model decides whether to call a tool.
- **Required or any**: the model must call some tool.
- **Specific tool**: the model must call one named tool, useful for structured extraction.
- **None**: tools are visible but not callable.

## Errors are results too

If a tool fails, return a clear error as the tool result: "City 'Chicgo' not found. Did you mean 'Chicago'?" The model can then correct itself. Silently failing, or returning an empty result, leads the model to guess.

## Safety

The model's tool call is a **request**, not a command. Treat arguments as untrusted input. Validate them, enforce permissions in code, and require human confirmation for actions that are destructive, costly or irreversible. A later lesson covers this in detail.

## Tool results can carry instructions

Tool results often contain text from outside sources: web pages, emails, documents. That text may include instructions written to manipulate the model, a risk known as **prompt injection**. Design tools and permissions assuming tool output may be adversarial.

> **Key takeaway:** Tool calling turns a model's intent into structured, checkable requests. Write clear descriptions, validate every call in code and return errors the model can learn from.

@@ planning-and-replanning

Simple tasks can be solved by reacting one step at a time. Longer tasks benefit from a plan: a sequence of steps toward the goal. But plans meet reality. Tools fail, data looks different than expected and new information changes what makes sense. Good agents plan, act and revise.

## Approaches to planning

- **Reactive (step by step).** The model decides only the next action each turn, using everything observed so far. This is flexible and works well for short tasks. The common "reason, then act" pattern interleaves short reasoning with tool calls.
- **Plan then execute.** The model first writes a full plan, then works through it. Plans make long tasks more coherent and let a person review the approach before anything happens.
- **Hierarchical.** A high-level plan is broken into sub-tasks, each handled with its own smaller loop, possibly by separate sub-agents.

## A plan as a working document

A useful plan is short, concrete and checkable:

1. Find the failing test and read its error.
2. Locate the function under test.
3. Reproduce the failure locally.
4. Fix the function.
5. Re-run the test and related tests.

Each step has a clear done condition. Many agent harnesses keep the plan as a to-do list in the context, marking steps complete as they finish. This helps the model keep track of progress across many turns.

## When to replan

Replanning should be triggered by evidence:

- A step fails in a way that the plan did not anticipate.
- A tool result contradicts an assumption, such as the bug being in a different module.
- The goal turns out to be ambiguous and needs clarification.
- A cheaper or safer route becomes available.

Without explicit replanning, agents tend to push ahead with an outdated plan or retry the same failed action repeatedly.

## Verification

Planning is only half of the loop; checking is the other half. Build verification into the plan:

- Run the tests after changing code.
- Re-read a file after editing it.
- Compare a computed number against an independent source.

Agents that verify their own work catch many mistakes before a human ever sees them. Agents that skip verification often report success for work that is incomplete.

## Asking for help

Sometimes the right next step is to ask the user. Good triggers include missing information that cannot be found, decisions that depend on preferences, and actions with significant risk. A well-designed agent asks a specific question rather than guessing or stopping silently.

## Planning costs

Planning uses tokens and time. For a two-step task, a detailed plan is overhead. For a fifty-step task, it is essential. Match the depth of planning to the length and risk of the task.

## Common pitfalls

- Plans that are too vague to check ("improve the code").
- Plans that are too rigid, followed even after evidence says they are wrong.
- Losing the plan as context grows, so the agent forgets what is left.

> **Key takeaway:** Plan in short, checkable steps, verify as you go and replan when evidence contradicts your assumptions. Match planning depth to the task's length and risk.

@@ stopping-conditions-and-budgets

An agent loop needs a reliable way to end. Without one, agents can loop indefinitely, spend more than a task is worth or stop too early with work half done. Stopping conditions and budgets turn an open-ended loop into a bounded process.

## Normal completion

The best ending is the model deciding the task is done and giving a final answer instead of another tool call. To make that decision reliable:

- **Define done.** State the success criteria in the task: "All tests pass and the change is committed."
- **Verify before declaring success.** Require a check, such as running tests, before the final answer.
- **Report honestly.** Ask the agent to state what it completed, what it could not do and why.

## Hard limits

Hard limits are enforced by the harness, regardless of what the model wants:

| Limit | Purpose |
|---|---|
| Maximum turns or steps | Prevents infinite loops |
| Maximum tokens or spend | Caps cost per task |
| Wall-clock timeout | Bounds time for users and schedules |
| Maximum tool calls per type | Stops repeated expensive actions, such as many paid API calls |

When a limit is hit, the harness should stop cleanly: save state, summarize progress and tell the user the task was stopped by a limit rather than finished.

## Detecting stuck loops

Agents sometimes repeat themselves: calling the same tool with the same arguments, or alternating between two failed approaches. Harnesses can detect this by tracking recent actions and stopping or intervening when patterns repeat. A useful intervention is to tell the model what it has tried and ask it to choose a different approach or ask for help.

## Budgets as design inputs

Budgets are not just safety nets; they shape behavior. If the model knows it has a limited number of steps or a cost target, it can choose cheaper strategies, such as searching narrowly before reading many files. Some systems show the remaining budget in the context as the task progresses.

## Choosing the numbers

Set limits from data, not guesses:

1. Run the agent on a representative set of tasks.
2. Record steps, tokens, time and cost per successful task.
3. Set limits well above typical successful runs, for example near the 95th or 99th percentile, so normal tasks are not cut off.
4. Review tasks that hit limits; they often reveal bugs or unclear instructions.

## Escalation

Stopping is not always failure. Good stopping points include:

- **Need for approval** before a risky action.
- **Missing information** only the user can provide.
- **Repeated failure** after a set number of attempts.

In each case the agent should hand back a clear summary: what it did, what it found and what it needs.

## Partial results

When a task stops early, partial work is valuable if it is clearly labeled. A summary like "Fixed 3 of 5 failing tests; the other 2 fail because the test database is unavailable" is far more useful than a vague "done" or an abrupt halt.

> **Key takeaway:** Define what done means, require verification before success, and enforce turn, cost and time limits in the harness. When an agent stops early, it should say why and hand back what it accomplished.
