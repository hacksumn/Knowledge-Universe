@@ predictive-maintenance

Equipment fails. Fixing it after failure is expensive and disruptive; replacing parts on a fixed schedule wastes parts that still had life in them. Predictive maintenance uses data to estimate when a specific piece of equipment is likely to fail, so it can be serviced just in time.

## Three maintenance strategies

| Strategy | When work happens | Downside |
|---|---|---|
| Reactive | After failure | Unplanned downtime, collateral damage |
| Preventive (scheduled) | At fixed intervals | Replaces healthy parts; can still miss early failures |
| Predictive (condition-based) | When data shows rising risk | Needs sensors, data and models |

## Data sources

- **Sensors**: vibration, temperature, pressure, current draw, acoustic signals, oil quality.
- **Operating data**: run hours, load, start–stop cycles, ambient conditions.
- **Maintenance records**: past failures, repairs, parts replaced and technician notes.
- **Equipment metadata**: model, age, installation details.

In data centers, examples include UPS battery impedance and temperature, generator start times, chiller compressor vibration and fan current trends.

## Modeling approaches

- **Thresholds and rules**: alert when a reading crosses a limit. Simple and transparent, a good starting point.
- **Trend analysis**: detect gradual drift, such as rising bearing temperature, before it reaches a limit.
- **Anomaly detection**: flag unusual patterns without needing labeled failures (next lesson).
- **Failure classification**: predict whether a failure will occur within a window, such as the next 30 days, using supervised learning on labeled history.
- **Remaining useful life (RUL)**: estimate time until failure, often with survival analysis or regression.

## The data problem

Failures are rare, which is good for operations and hard for modeling. A fleet might record only a handful of failures of each type. Approaches include:

- Pooling data across similar equipment.
- Using physics-based or degradation models alongside data.
- Starting with anomaly detection, which needs no failure labels.
- Improving maintenance records so future failures are labeled consistently.

## Turning predictions into action

A prediction is only useful if it changes what people do:

1. **Alert with context**: which asset, what signal, how confident and suggested checks.
2. **Prioritize**: rank assets by risk and consequence of failure.
3. **Schedule**: plan work for maintenance windows, ordering parts in advance.
4. **Close the loop**: record what technicians found, confirming or rejecting the prediction. This feedback becomes training data.

## Measuring success

- Reduction in unplanned downtime.
- Maintenance cost per asset.
- Precision of alerts: how many led to finding a real issue.
- Lead time: how far in advance problems were detected.

Too many false alarms quickly lead technicians to ignore alerts, so precision matters as much as catching failures.

## Where AI adds value

Large language models can help by reading unstructured technician notes and manuals, summarizing an asset's history before a work order, and drafting maintenance reports. The core failure prediction usually comes from sensor data and statistical or machine learning models.

> **Key takeaway:** Predictive maintenance uses sensor and maintenance data to service equipment before it fails. Start with simple trends and thresholds, handle the rarity of failures carefully and connect every alert to an action and a recorded outcome.

@@ anomaly-detection-in-telemetry

Modern systems produce streams of telemetry: metrics, logs and events from servers, networks, applications and physical equipment. Anomaly detection finds the unusual readings in those streams that may signal a fault, an attack or a change worth investigating.

## What counts as an anomaly

- **Point anomalies**: a single reading far outside the normal range, such as a sudden spike in error rate.
- **Contextual anomalies**: a reading that is normal in general but unusual for its context, such as high traffic at 3 a.m. or low cooling load on a hot afternoon.
- **Collective anomalies**: a pattern across several readings or metrics, such as a slow, steady rise in memory use or temperature that never crosses a fixed limit.

## Methods from simple to complex

**Static thresholds.** "Alert if CPU > 90%." Easy to understand but blind to context and prone to false alarms.

**Statistical baselines.** Compare each reading with a rolling mean and standard deviation, and flag readings more than, say, 3 standard deviations away. A **z-score** of (value − mean) ÷ standard deviation expresses this. Median-based versions are more robust to existing outliers.

**Seasonal baselines.** Many metrics follow daily and weekly cycles. Compare a reading with what is normal for that hour and day, or decompose the series into trend, seasonal and residual parts, then look for anomalies in the residual.

**Forecast-based detection.** Predict the next value with a time series model and flag large prediction errors.

**Multivariate models.** Methods such as isolation forests, autoencoders or models of relationships between metrics detect combinations that are unusual even if each metric looks normal alone.

## A worked example

A fan's current draw averages 2.0 A with a standard deviation of 0.1 A over the last week. Today it reads 2.45 A.

z = (2.45 − 2.0) ÷ 0.1 = 4.5

A z-score of 4.5 is far outside normal variation. Combined with rising temperature on the same unit, it might suggest a failing bearing or a blocked filter.

## The false-alarm problem

With thousands of metrics, even a tiny false alarm rate produces many alerts. If 10,000 metrics are each checked every minute with a 1-in-10,000 false alarm rate, that is still about one false alarm per minute. Ways to manage this:

- Require anomalies to persist for several readings.
- Combine signals: alert when related metrics agree.
- Prioritize by impact, such as customer-facing services.
- Tune sensitivity per metric, with feedback from responders.

## From detection to diagnosis

Detection says something is unusual; responders need to know why. Useful additions:

- Show related metrics and recent changes, such as deployments or configuration edits, alongside the anomaly.
- Group related alerts into one incident.
- Use language models to summarize logs around the anomaly and suggest likely causes, with links to the evidence.

## Keep humans in the loop

Anomaly detectors drift as systems change. Collect feedback on alerts (useful, noise, real incident) and use it to retune. Review missed incidents to find signals that should have been monitored.

> **Key takeaway:** Anomaly detection compares telemetry with what is normal for its context, from simple z-scores to multivariate models. Controlling false alarms and adding diagnostic context matter as much as the detection method.

@@ automating-runbooks-with-agents

A runbook is a documented procedure for handling a known operational situation: restarting a stuck service, rotating a credential, failing over a database, investigating a full disk. AI agents can carry out many runbook steps, freeing people for judgment calls, provided the automation is designed with clear limits.

## Why runbooks suit agents

- **Defined steps**: runbooks already describe what to check and do.
- **Tool access**: steps map to commands, API calls and queries an agent can execute through tools.
- **Variation**: real incidents rarely match the runbook exactly. An agent can read outputs, adapt steps and explain what it found, where a rigid script would fail.

## Levels of automation

| Level | Agent does | Human does |
|---|---|---|
| Assist | Gathers diagnostics, summarizes, suggests next steps | Decides and acts |
| Propose | Prepares specific actions with expected effects | Approves each action |
| Act with guardrails | Executes low-risk steps automatically | Approves high-risk steps, reviews afterwards |
| Autonomous | Handles the full procedure | Reviews reports |

Start at **Assist**. Move up only for specific runbooks with a strong track record.

## A worked example: disk nearly full

Runbook: "When a server's disk passes 90%, identify large files, clear safe caches and logs, and escalate if usage remains above 85%."

1. The agent receives the alert and checks current disk usage (read-only).
2. It lists the largest directories and recent growth (read-only).
3. It finds old rotated log files and a build cache, both listed in the runbook as safe to delete.
4. It deletes them, a low-risk action pre-approved for these specific paths.
5. It rechecks usage: down to 72%.
6. It posts a summary to the incident channel: what it found, what it deleted, current usage and the likely root cause (a log rotation setting was changed last week).

Had usage stayed above 85%, or had the large files been outside the approved paths, it would have stopped and escalated.

## Guardrails

- **Least privilege**: give the agent only the permissions each runbook needs.
- **Allow-lists**: specify exactly which commands and targets are permitted.
- **Approvals**: require human approval for destructive, irreversible or customer-affecting actions.
- **Dry runs**: show what a command would do before running it, where supported.
- **Rate and scope limits**: limit how many servers or changes an automated run can touch.
- **Audit logs**: record every action, its output and who approved it.

## Write runbooks for agents and people

Runbooks that work well with agents are also better for humans:

- Clear trigger conditions.
- Explicit checks before and after each action.
- Stated safe and unsafe actions.
- Escalation criteria.
- Expected outputs, so deviations are obvious.

## Measuring value

Track time to mitigation, the share of incidents handled without escalation, the number of human interventions, and any automation-caused incidents. A single serious mistake by an automated system can outweigh many saved hours, so review incidents carefully and keep humans in charge of high-impact decisions.

> **Key takeaway:** Agents can run well-defined runbooks, adapting to real outputs and reporting clearly. Start with assistance, grant narrow permissions, require approval for risky steps and expand autonomy only with evidence.
