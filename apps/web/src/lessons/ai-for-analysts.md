@@ drafting-queries-and-reports

Analysts spend much of their time on mechanical work: writing queries, cleaning data, formatting charts and drafting summaries. AI models can produce first drafts of all of these quickly. Used well, they free analysts to spend more time on questions, judgment and checking.

## Drafting SQL

Language models are good at turning a clear question into a query, especially when given context:

- **Schema**: table names, columns, types and how tables join.
- **Definitions**: what "active customer" or "revenue" means in your organization.
- **Dialect**: Snowflake, BigQuery, PostgreSQL and others differ in date functions and syntax.
- **Examples**: a few existing queries that follow team conventions.

Without schema and definitions, a model will invent plausible-looking column names and calculations.

## A worked example

Request: "Monthly revenue by region for 2026, excluding refunds."

A good draft joins orders to customers for region, filters to 2026, excludes refunded orders, groups by month and region, and sums the order amount. Before running it, an analyst should check:

- Is "revenue" the right column (gross, net of discounts, net of tax)?
- How are partial refunds represented?
- Is the date the order date or the payment date?
- Does the join to customers create duplicate rows?

The model saves typing; the analyst supplies the business knowledge.

## Writing code for analysis

Models can draft Python or R for cleaning, transforming and visualizing data. They are especially useful for:

- Remembering library syntax for less familiar tasks.
- Writing repetitive transformation code.
- Producing a first version of a chart with labels and formatting.
- Explaining unfamiliar code someone else wrote.

Agents that can **run** code are even more useful, because they can inspect results, catch errors and iterate, rather than producing code blindly.

## Drafting reports

Given results, a model can draft an executive summary, describe trends, and suggest structure for a report. Good practice:

- Provide the actual numbers and charts, not just the question.
- Specify the audience and length.
- Ask the model to separate observations ("revenue fell 8%") from interpretations ("likely due to the price change") and to flag uncertainty.
- Check every number in the draft against the source.

## Where drafts go wrong

| Problem | Example | Defense |
|---|---|---|
| Invented schema | Querying a column that does not exist | Provide schema; run and test queries |
| Wrong definitions | Counting all users as "active" | Provide metric definitions |
| Silent logic errors | A join that double-counts orders | Check row counts and totals against known figures |
| Overstated conclusions | Calling a correlation a cause | Ask for caveats; review interpretations |
| Mismatched numbers | Summary says 12% when the table says 10% | Verify every figure |

## A productive workflow

1. Write the question precisely, including definitions and time ranges.
2. Ask the model for a draft query or analysis plan.
3. Review the logic before running.
4. Run it and sanity-check results against known numbers.
5. Ask the model to draft the write-up from the verified results.
6. Edit for accuracy and emphasis.

## Data privacy

Before pasting data into an AI tool, check your organization's policies. Prefer tools approved for the data's sensitivity, share schemas and aggregated results rather than raw personal data where possible, and never share credentials.

> **Key takeaway:** AI can draft queries, code and reports quickly when given schema, definitions and examples. The analyst's job shifts to specifying questions precisely and verifying logic and numbers.

@@ model-assisted-forecasting

Forecasting combines data, models and judgment. AI can help at each stage: gathering and structuring information, suggesting features, building baseline models and explaining results. It works best as an assistant to a disciplined forecasting process, not a replacement for one.

## Where AI helps

**Turning text into features.** Much useful information is unstructured: news, earnings call transcripts, injury reports, maintenance notes, customer reviews. Language models can extract structured signals, such as "key player listed as questionable", "supplier delay mentioned" or sentiment scores, that become inputs to a statistical model.

**Research and context.** Models with search tools can gather background on an event or market quickly, summarizing what is known and what is uncertain. Every claim needs a source and a check.

**Building baselines.** Coding assistants can write a baseline forecasting pipeline: data loading, feature engineering, a gradient-boosted or time series model, and walk-forward validation. A good baseline in hours rather than days leaves more time for improvement.

**Scenario generation.** Models can help enumerate scenarios and their drivers ("what could cause demand to drop sharply next quarter?"), which supports stress testing.

**Explaining forecasts.** Given model outputs and feature contributions, a language model can draft plain-language explanations for stakeholders.

## Where caution is needed

**Direct numerical forecasts from a language model.** Asking a model "what is the probability Team A wins?" can produce a confident number without the data, validation or calibration that a statistical model provides. Research on LLM forecasting is active and results vary; such outputs should be treated as one input to check, not as a replacement for a validated model.

**Leakage through model knowledge.** A model trained on data up to a certain date may "know" outcomes that occurred before its cutoff. Backtesting an LLM-assisted forecast on events it already knows about gives meaningless results. Test on events after the model's training cutoff.

**Unverified extracted features.** If an LLM extracts features from text, check a sample by hand. Systematic extraction errors become systematic forecast errors.

## A workflow that combines strengths

1. **Statistical core.** A validated model trained on structured data, evaluated with walk-forward validation.
2. **LLM-extracted features.** Signals from text added as features, with timestamps so they are only used when available.
3. **Evaluation.** Compare forecasts with and without the new features on out-of-sample data, using log loss or error metrics.
4. **Human review.** Analysts review large changes and unusual situations the model has not seen.
5. **Tracking.** Record forecasts, inputs and outcomes for later calibration checks.

## Combining forecasts

Averaging forecasts from different methods, such as a statistical model, a market price and an expert judgment, often beats any single source. Weighted combinations can be learned from past performance. A language model's estimate can be one of those sources, if its track record supports it.

> **Key takeaway:** Use AI to extract signals from text, speed up pipeline building and explain results, but keep a validated statistical model at the core. Test on events after the model's training cutoff to avoid leakage.

@@ checking-ai-generated-analysis

AI-generated analysis can look polished and authoritative while containing errors: a wrong join, a misread column, an invented statistic or a conclusion the data does not support. Checking it is not optional. A structured review catches most problems quickly.

## Check the question

Before checking the answer, check that the analysis addressed the right question:

- Are the definitions correct (which customers, which revenue, which dates)?
- Is the time period right?
- Were the right filters applied, and were any important exclusions missed?

Many errors are not computational; they answer a slightly different question than the one asked.

## Check the data

- **Row counts**: do the numbers of rows before and after joins and filters make sense? Unexpected increases after a join often mean duplication.
- **Totals**: do totals match a known reference, such as last month's published revenue?
- **Ranges**: are values plausible? Negative ages, prices of zero and dates in the future are warning signs.
- **Missing values**: how were they handled, and could that bias results?

## Check the computation

- Re-run key numbers independently, using a different method or tool if possible.
- Spot-check a few individual records by hand.
- Look at the code or query, not just the output. Ask the model to explain each step.
- Confirm units and scales: thousands versus millions, percentages versus percentage points.

## Check every number in the text

AI-written summaries can contain numbers that differ from the tables they describe, or invented figures that appear in no table at all. Trace each number in the narrative back to its source.

## Check the reasoning

| Claim type | Question to ask |
|---|---|
| Causal ("X caused Y") | Was this an experiment, or could something else explain both? |
| Trend ("rising steadily") | Is the change larger than normal variation? |
| Comparison ("A beat B") | Are the groups comparable in size and composition? |
| Generalization ("customers prefer…") | Is the sample representative? |
| Prediction ("will grow 10%") | What model, what validation, what uncertainty? |

Ask the model directly: "What are the weaknesses and alternative explanations for this conclusion?" Models are often good at critiquing analysis when asked.

## Check the sources

If the analysis used research or web search:

- Open the cited sources and confirm they say what is claimed.
- Check dates; old information may be presented as current.
- Be wary of claims with no source or with sources that cannot be found.

## Make checking easier

- Ask for analysis in reproducible form: code, queries and intermediate results, not just conclusions.
- Require the model to list assumptions explicitly.
- Keep a checklist for recurring analysis types.
- For important decisions, have a second person review.

## Calibrate your trust

Track how often AI-generated analyses needed corrections, and what kinds. Over time this tells you where the tool is reliable for your work and where it needs close review.

> **Key takeaway:** Check that the analysis answered the right question, then verify data, computations, every quoted number, causal claims and sources. Reproducible code and explicit assumptions make checking fast.
