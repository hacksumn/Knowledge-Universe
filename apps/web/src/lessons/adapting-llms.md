@@ prompting-and-context

The fastest way to adapt a general language model to your task is to change what you send it. Prompting supplies instructions, examples and information at request time, without changing the model's weights. It is cheap to try, easy to revise and often enough on its own.

## Parts of a good prompt

- **Role and goal**: what the model is helping with and for whom. "You are reviewing customer refund requests for a small online store."
- **Instructions**: what to do, step by step if the task has stages.
- **Context**: the information needed to do the task, such as the policy document, the customer's message or the data table.
- **Constraints**: length, format, tone, what to avoid and what to do when unsure.
- **Examples**: a few input–output pairs showing what good looks like.
- **Output format**: exact structure if the result will be parsed by code.

## Be explicit

Models follow instructions closely, so vague prompts get generic results. Compare:

- Vague: "Summarize this."
- Explicit: "Summarize this incident report in 3 bullet points for an executive audience. Include the customer impact, the root cause and the fix. Do not include internal ticket numbers."

Explaining **why** a constraint exists often helps: "Keep it under 100 words because it will be shown on a phone notification."

## Few-shot examples

Showing two to five examples of inputs and desired outputs is one of the most reliable ways to set format and style. Choose examples that:

- Cover different kinds of input, including edge cases.
- Match the desired output exactly in structure and tone.
- Do not all share an accidental feature the model might copy, such as identical length.

## Structuring long prompts

For prompts with lots of material:

- Separate sections clearly, for example with headings or XML-style tags such as `<policy>` and `<customer_message>`.
- Put long documents before the specific question, so the request comes last.
- Ask the model to quote relevant passages before answering when accuracy against a document matters.

## Letting the model think

For multi-step problems, asking the model to work through its reasoning before giving a final answer often improves accuracy. Many current models also have built-in extended reasoning modes. If code consumes the result, ask for the final answer in a clearly marked section.

## Structured output

When a program will read the result, specify a format such as JSON with exact field names. Many APIs offer structured output modes that guarantee the response matches a schema, which is more reliable than asking nicely.

## Context engineering

As tasks get larger, the challenge shifts from wording to **what goes into the context window**. Too little information leads to guessing; too much buries the important parts and raises cost. Good practice:

- Include only what is relevant to this request.
- Put stable material (instructions, tool definitions) first, to benefit from prompt caching.
- Retrieve documents on demand instead of including everything.

## Iterate with evidence

Build a small test set of realistic inputs. Change one thing at a time, run the set and compare outputs. Prompt improvements that seem obvious sometimes make results worse on cases you did not consider.

> **Key takeaway:** Prompting adapts a model at request time with clear goals, explicit instructions, relevant context, examples and a defined output format. Test prompt changes on a set of real inputs.

@@ retrieval-augmented-generation

Language models know only what was in their training data, up to a cutoff date, and they cannot see your private documents. Retrieval-augmented generation (RAG) fetches relevant information at request time and adds it to the prompt, so answers can draw on current, specific and private sources.

## The basic pipeline

1. **Ingest.** Collect documents, split them into chunks and store them in a searchable index, usually with embeddings for semantic search and often a keyword index too.
2. **Retrieve.** When a question arrives, search the index for the most relevant chunks.
3. **Augment.** Insert those chunks into the prompt along with the question and instructions.
4. **Generate.** The model answers using the retrieved material, ideally citing its sources.

## Why RAG is useful

- **Fresh information** without retraining: update the index and answers change.
- **Private data**: internal documents, tickets and policies stay in your systems and are retrieved only as needed.
- **Grounding**: answers can be checked against cited passages, which reduces unsupported claims.
- **Access control**: retrieval can respect user permissions, returning only documents each user may see.

## Design choices that matter

**Chunking.** Chunks of a few hundred tokens with some overlap are a common starting point. Splitting along natural boundaries such as headings and paragraphs keeps chunks coherent. Adding a short description of the source to each chunk helps both retrieval and the model.

**Search.** Combine semantic and keyword search (hybrid search). Semantic search handles paraphrases; keyword search catches exact names, codes and numbers.

**Reranking.** Retrieve a broad set of candidates, then rerank them with a more precise model before choosing the top few.

**How many chunks.** Too few risks missing the answer; too many adds noise and cost. Five to twenty chunks is common, depending on chunk size and the question.

**Prompt instructions.** Tell the model to answer only from the provided material, to cite sources and to say when the documents do not contain the answer.

## A worked example

Question: "Can customers return opened electronics?"

- Retrieval finds a chunk from the returns policy: "Opened electronics may be returned within 15 days with original packaging; a 10% restocking fee applies."
- The prompt contains this chunk with its source.
- The answer: "Yes, within 15 days with original packaging, minus a 10% restocking fee (Returns Policy, section 4)."

Without retrieval, the model could only guess at a generic policy.

## Common failure modes

- **Retrieval misses**: the right passage is not retrieved, so the model answers from general knowledge or says it does not know.
- **Conflicting sources**: old and new versions of a document both appear. Store dates and prefer current versions.
- **Lost in the middle**: key facts buried among many chunks are overlooked.
- **Over-trusting retrieved text**: documents may contain errors or injected instructions.

## Evaluating RAG

Evaluate retrieval and generation separately:

- **Retrieval**: does the correct passage appear in the top results?
- **Faithfulness**: does the answer stick to what the passages say?
- **Answer quality**: is the answer correct, complete and useful?

> **Key takeaway:** RAG retrieves relevant documents at request time and puts them in the prompt, giving models current and private knowledge with citations. Retrieval quality usually limits answer quality.

@@ fine-tuning

Fine-tuning continues training a pretrained model on your own examples, changing its weights. Where prompting tells a model what to do each time, fine-tuning teaches it a behavior it will show by default. It is powerful, but it is not always the right tool.

## What fine-tuning is good at

- **Consistent format and style**: always producing a particular structure, tone or voice.
- **Narrow, repeated tasks**: classification, extraction or routing at high volume, where a smaller fine-tuned model can match a larger general one at lower cost and latency.
- **Specialized behavior**: following domain conventions that are hard to explain fully in a prompt.
- **Shorter prompts**: behavior learned in the weights no longer needs long instructions and examples in every request.

## What it is not good at

- **Adding facts that change.** Knowledge baked into weights goes stale and is hard to update or cite. Retrieval is usually better for factual knowledge.
- **Fixing a vague task.** If people cannot agree on the right output, the model cannot learn it either.
- **Small datasets of inconsistent quality.** The model will learn the inconsistencies.

## Types of fine-tuning

- **Supervised fine-tuning (SFT)**: train on input–output pairs showing the desired responses.
- **Preference tuning**: train on pairs of responses where one is preferred over the other. Methods include reinforcement learning from human feedback (RLHF) and direct preference optimization (DPO).
- **Reinforcement fine-tuning**: reward the model for outputs that pass automated checks, such as correct answers or passing tests.

## Full versus parameter-efficient tuning

Updating every weight of a large model needs a lot of memory and compute. **Parameter-efficient fine-tuning (PEFT)** updates only a small number of added parameters:

- **LoRA** (low-rank adaptation) adds small trainable matrices alongside existing weight matrices. Only these are trained, often well under 1% of the model's parameters.
- **QLoRA** combines LoRA with a 4-bit quantized base model, letting large models be fine-tuned on much smaller hardware.

LoRA adapters are small files that can be swapped in and out, so one base model can serve several specialized versions.

## The process

1. **Define the task and success metric.** What exactly should improve, and how will you measure it?
2. **Try prompting first.** Establish a baseline with a strong prompt. Fine-tune only if prompting falls short or costs too much.
3. **Collect data.** Hundreds to thousands of high-quality examples are typical for SFT. Quality matters more than quantity.
4. **Split data** into training, validation and test sets.
5. **Train**, watching validation loss for overfitting.
6. **Evaluate** on the test set and on general tasks, to check the model did not lose abilities it had before (catastrophic forgetting).
7. **Monitor** in production and retrain as needs change.

## Risks

- **Overfitting** to the training examples, producing outputs that look like them but generalize poorly.
- **Regressions** in safety or general helpfulness if training data pushes behavior in unintended directions.
- **Maintenance**: each new base model version may require fine-tuning again.

> **Key takeaway:** Fine-tuning changes model weights to make a behavior the default. Use it for consistent formats, narrow high-volume tasks and specialized style, not for facts that change, and only after a strong prompt baseline.

@@ evaluating-outputs

Language model outputs are often open-ended, so "is this good?" is not always a yes-or-no question. Yet every prompt change, model switch or fine-tune needs evidence that it helped. Systematic evaluation turns impressions into measurements.

## Start with a test set

Collect realistic inputs, ideally from actual use:

- Common requests that represent typical traffic.
- Hard cases and edge cases.
- Known past failures.
- Inputs where the right behavior is to refuse, ask for clarification or say "I don't know".

For each, define what a good output looks like: a reference answer, a list of required elements or a rubric.

## Grading methods

**Code-based checks** are fast, cheap and reliable when they apply:

- Exact match or numeric tolerance for factual answers.
- Schema validation for JSON outputs.
- Unit tests for generated code.
- Required keywords, forbidden phrases, length limits.

**Model-based grading** (LLM-as-judge) uses a model to score outputs against a rubric. It scales to open-ended tasks like summaries and explanations. To make it trustworthy:

- Write specific criteria: "Does the summary mention the root cause? (yes/no)".
- Grade one criterion at a time.
- Ask the grader for brief reasoning before a score.
- Check agreement with human judgments on a sample, and recheck when the grader or task changes.

**Human evaluation** remains the reference for quality, tone and usefulness. Use it to calibrate automated graders and for high-stakes decisions.

## Pairwise comparison

For subjective quality, comparing two outputs side by side ("which is better?") is often more reliable than scoring each on an absolute scale. Randomize which output appears first, because both humans and models can favor a position.

## Example rubric for a support reply

| Criterion | Check |
|---|---|
| Correct policy | Matches the cited policy |
| Answers the question | Addresses what the customer asked |
| Actionable | Gives a clear next step |
| Tone | Polite and concise |
| Safe | No invented commitments or personal data leaks |

## What to measure besides quality

- **Faithfulness** to provided sources, for RAG systems.
- **Refusal behavior**: refusing harmful requests, not refusing reasonable ones.
- **Latency and cost** per request.
- **Consistency** across repeated runs.

## Avoiding self-deception

- Keep a held-out set you do not tune against.
- Watch for grader biases, such as favoring longer answers or outputs from the same model family.
- Look at actual outputs, not just scores. Reading twenty examples often reveals problems that metrics hide.
- Check for regressions: a change that fixes one category may break another. Break results down by category.

## Evaluation in production

Offline tests do not catch everything. Monitor live signals such as user ratings, corrections, retries, escalations and complaints. Sample production outputs for review, and add new failures to the test set so they stay fixed.

> **Key takeaway:** Build a realistic test set, grade with code checks where possible, model graders with specific rubrics where needed and humans to calibrate both. Read real outputs, and keep evaluating after launch.
