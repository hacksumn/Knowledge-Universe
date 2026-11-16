@@ finding-a-costly-repeated-task

The most successful AI projects rarely start with "how can we use AI?" They start with a specific task that costs real time or money, happens often and has an outcome you can check. Finding that task is the most important step.

## What makes a good candidate

- **Frequent**: the task happens many times a day or week. Small savings per task multiply.
- **Time-consuming**: each instance takes meaningful effort, such as minutes to hours.
- **Language- or pattern-heavy**: reading, writing, summarizing, classifying, extracting or searching.
- **Checkable**: someone can tell whether the output is right, ideally quickly.
- **Tolerant of occasional errors**, or easy to review before anything important happens.
- **Data available**: the information needed to do the task can be provided to the system.

## Examples

| Task | Why it fits |
|---|---|
| Triaging support tickets into categories | High volume, clear categories, easy to check |
| Drafting replies to common customer questions | Frequent; a human can review before sending |
| Extracting fields from invoices or contracts | Repetitive; outputs can be validated against rules |
| Summarizing incident reports or meeting notes | Saves reading time; errors are visible to readers |
| Searching internal documentation | Frequent; answers can cite sources |
| Writing first drafts of routine code or queries | Tests and reviewers catch errors |

## Warning signs

- **Rare tasks**: building automation for something done twice a year rarely pays off.
- **No ground truth**: if experts disagree on the right answer, the system cannot be measured or improved.
- **High stakes with no review**: fully automated decisions about credit, health, employment or safety need far more care, and often regulation applies.
- **Missing data**: the information needed sits in people's heads or in systems the AI cannot access.
- **The real bottleneck is elsewhere**: speeding up drafting does not help if approvals take two weeks.

## How to find candidates

1. **Shadow the work.** Watch people do their jobs for a day and note repeated tasks.
2. **Ask about frustrations.** "What do you do every day that feels like copy-and-paste?"
3. **Look at volume data.** Ticket systems, email queues and request logs show where time goes.
4. **Map processes.** Draw the steps of a workflow and estimate the time spent on each.

## Estimate the value

A simple estimate:

`annual value ≈ tasks per year × minutes saved per task × cost per minute`

Example: 20,000 support tickets per year, 3 minutes saved per ticket on triage, at 1 per minute of fully loaded staff cost:

20,000 × 3 × 1 = 60,000 per year.

Subtract costs: development, model usage, review time and maintenance. Also count benefits that are harder to price, such as faster responses or fewer errors.

## Start narrow

A narrow task done well beats a broad task done poorly. "Classify incoming tickets into 12 categories" is a better first project than "automate customer support". Success with a narrow task builds trust, data and skills for the next one.

## Involve the people who do the work

The people who do a task know its exceptions, pitfalls and quality standards. Involving them early produces better requirements, better evaluation and a tool they will actually use.

> **Key takeaway:** Look for frequent, time-consuming, checkable tasks with available data. Estimate value with volume × time saved × cost, start narrow and involve the people who do the work.

@@ build-buy-or-prompt

Once you have a promising use case, you need to decide how to implement it. The options range from using an existing tool as it is, to writing prompts and workflows on a general model, to building a custom system. The right choice depends on how specific the task is and how much control you need.

## The options

**Buy (off-the-shelf product).** Many tasks already have dedicated AI products: meeting transcription, code assistants, support platforms with AI features, document processing services.

- Fastest to start; vendor handles updates and infrastructure.
- Limited customization; you depend on the vendor's roadmap, pricing and data handling.

**Prompt (general assistant or simple workflow).** Use a general-purpose AI assistant or API with well-designed prompts, templates and perhaps simple automation.

- Low cost, quick to iterate, no special infrastructure.
- Works well for individual productivity and moderate-volume tasks.
- Less consistent at scale; harder to integrate deeply with systems.

**Build (custom application).** Develop an application on top of model APIs, with retrieval over your data, tool integrations, evaluation and monitoring. Fine-tuning is sometimes part of this.

- Maximum control and integration; can be tuned to your exact process.
- Requires engineering, evaluation and ongoing maintenance.

## A comparison

| Factor | Buy | Prompt | Build |
|---|---|---|---|
| Time to first result | Days | Hours to days | Weeks to months |
| Upfront cost | Subscription | Low | Engineering time |
| Customization | Low | Medium | High |
| Integration with your systems | Vendor-dependent | Limited | Full |
| Maintenance burden | Vendor | Low | Yours |

## Questions to guide the decision

1. **Is the task common across industries?** If yes, a product likely exists and has had more refinement than you can afford. Lean toward buying.
2. **Is it core to how you compete?** If the task is a differentiator, building may be worth it.
3. **What volume and consistency do you need?** Occasional use suits prompting; high volume with strict consistency suits a built system.
4. **What data does it need, and where does it live?** Deep access to internal systems often requires building or a product with the right integrations.
5. **What are the data protection requirements?** Check where data goes, how it is stored and whether it is used for training, for any vendor or API.
6. **Who will maintain it?** A custom system without an owner will decay.

## Start simple, then graduate

A common path:

1. Prove value by prompting a general model on real examples.
2. If the task works and volume grows, turn the best prompts into a simple workflow or internal tool.
3. If needs outgrow that, build a proper application with evaluation and monitoring, or adopt a product that now fits.

Each stage produces evidence and test cases for the next.

## Avoid premature building

Teams often start building infrastructure, such as vector databases, agents and fine-tuning pipelines, before showing that a simple prompt cannot do the job. Build complexity only when a simpler approach has been tried and measured.

> **Key takeaway:** Buy for common tasks, prompt to prove value quickly and build when the task is core, high-volume and needs deep integration. Start with the simplest option and graduate based on evidence.

@@ pilots-and-success-metrics

A pilot is a limited, real-world trial of an AI solution. It answers whether the solution works for real users, on real tasks, well enough to justify wider rollout. A good pilot is designed like an experiment, with success criteria defined before it starts.

## Define success up front

Agree, before the pilot, on:

- **The primary metric**: the one number that matters most, such as minutes per ticket, first-response time or error rate.
- **The target**: what result would justify expanding, such as a 25% reduction in handling time with no increase in errors.
- **Guardrail metrics**: things that must not get worse, such as customer satisfaction, accuracy or compliance.
- **The decision rule**: what happens if you hit, miss or partly hit the target.

Defining these afterward invites cherry-picking.

## Establish a baseline

Measure the current process before introducing AI. Without a baseline, you cannot show improvement. Use the same measurement method before and during the pilot.

## Design the comparison

The best comparison is a controlled one:

- **A/B split**: randomly assign tasks or users to use the AI tool or the current process.
- **Before and after**: compare the same team before and after. Easier but vulnerable to other changes happening at the same time, such as seasonal volume.
- **Side-by-side review**: for quality, have reviewers compare AI-assisted and unassisted outputs without knowing which is which.

## Scope

- **Users**: a small group that represents typical users, not only enthusiasts.
- **Duration**: long enough to get past novelty and capture normal variation, often several weeks.
- **Tasks**: real work, including messy cases.

## Example metrics by use case

| Use case | Primary metric | Guardrail metrics |
|---|---|---|
| Support reply drafting | Handling time per ticket | Customer satisfaction, escalation rate |
| Invoice extraction | Fields correct without edits | Payment errors, processing time |
| Internal search assistant | Time to find an answer | Answer accuracy, citation quality |
| Code assistant | Time to complete tasks | Defect rate, review time |

## Collect qualitative feedback

Numbers show what changed; users explain why. Short regular check-ins and a simple way to flag bad outputs reveal problems, workarounds and opportunities. Collected failures become test cases for improvement.

## Watch the hidden costs

- Time spent reviewing and correcting AI outputs.
- Model and infrastructure costs at full scale, not just pilot scale.
- Training and support for users.
- Errors that slip through and cost time later.

A tool that saves 5 minutes on drafting but adds 4 minutes of checking saves only 1.

## Decide and document

At the end, compare results with the targets and decision rule. Options include expanding, iterating with another pilot, narrowing scope or stopping. Stopping a pilot that did not meet its goals is a success of the process, not a failure. Document what was learned either way.

> **Key takeaway:** Define the primary metric, target, guardrails and decision rule before the pilot. Measure a baseline, compare fairly, count review time and hidden costs, and decide based on the agreed criteria.

@@ risks-privacy-and-oversight

Every AI deployment carries risks: wrong outputs, data exposure, misuse, unfair outcomes and over-reliance. Identifying those risks early and building in appropriate oversight is what separates a responsible deployment from a liability.

## Accuracy risks

AI systems can produce confident, fluent and wrong outputs. The impact depends on what happens next:

- **Low impact**: a slightly off draft that a person edits.
- **High impact**: an incorrect answer given directly to a customer, a wrong figure in a financial report or a faulty command executed on production systems.

Match the level of review to the impact. Where errors are costly, require human review, cite sources and use automated checks.

## Privacy and data protection

- **Know what data flows where.** Map which data is sent to which model or vendor, and whether it is stored, logged or used to train models.
- **Minimize.** Send only the data a task needs. Remove or mask personal information when possible.
- **Use approved tools.** Use services with contractual and technical protections appropriate to the data's sensitivity.
- **Follow the law.** Regulations such as data protection laws and sector rules (health, finance) may restrict processing, require consent or impose transparency duties. Involve legal and privacy teams early.
- **Control access.** AI tools connected to internal systems should respect existing permissions, so users cannot see data through the AI that they could not see otherwise.

## Security risks

- **Prompt injection**: malicious text in documents, emails or web pages can attempt to redirect an AI system. Limit what actions the system can take after reading untrusted content.
- **Excessive permissions**: AI agents with broad access can cause broad damage. Grant least privilege.
- **Data leakage**: outputs might reveal confidential information from context or retrieved documents.

## Fairness and harm

AI systems can reflect biases in their training data or design. For decisions affecting people, such as hiring, lending, insurance or access to services, test outcomes across groups, document limitations and keep meaningful human review. Some jurisdictions regulate automated decision-making in these areas specifically.

## Human oversight

Oversight works when it is real, not a rubber stamp:

- **Clear responsibility**: a named person or team owns each AI system and its outcomes.
- **Review where it matters**: humans approve high-impact outputs and actions.
- **Ability to override**: users can correct or reject outputs easily.
- **Watch for automation bias**: people tend to accept system outputs uncritically over time. Rotate reviewers, audit samples and measure how often reviewers change outputs.

## Transparency

- Tell users when they are interacting with AI or reading AI-generated content where that matters.
- Document what each system does, its known limitations and how to report problems.

## A simple risk review

| Question | Example answer |
|---|---|
| What could go wrong? | Wrong refund amount quoted to a customer |
| How likely, how severe? | Occasional; moderate cost and trust impact |
| How would we notice? | Weekly audit of a sample; customer complaints |
| What controls reduce it? | Retrieval of the refund policy, human approval above a set amount |
| Who owns it? | Support operations lead |

## Monitor after launch

Risks change as usage grows, models update and people find new ways to use a tool. Monitor errors, incidents and feedback, and revisit the risk review regularly.

> **Key takeaway:** Match oversight to impact, control what data goes where, grant least privilege, test for unfair outcomes and give every AI system a named owner who monitors it after launch.
