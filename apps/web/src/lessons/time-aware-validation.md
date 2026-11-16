@@ data-leakage

Data leakage happens when information that would not be available at prediction time finds its way into training or evaluation. Leakage makes a model look far better in testing than it will ever be in practice. It is one of the most common and most damaging mistakes in predictive modeling.

## Two kinds of leakage

**Target leakage**: a feature contains information about the outcome that would not be known when the prediction is made.

- Predicting hospital readmission using "number of follow-up appointments", which is only recorded after discharge.
- Predicting whether a loan defaults using "account in collections", which happens because of the default.
- Predicting a game result using a team's season-long average that includes the game itself.

**Train–test contamination**: information from the evaluation data influences training.

- Scaling features using the mean and standard deviation of the full dataset before splitting.
- Selecting features based on their correlation with the target across all data.
- Duplicate or near-duplicate rows appearing in both training and test sets.
- Tuning hyperparameters on the test set.

## Leakage in time series

Time adds its own traps:

- **Future data in features.** Rolling averages, ratings or aggregates computed over windows that extend past the prediction time.
- **Revised data.** Many datasets are updated after the fact: corrected statistics, revised economic figures, final injury reports. Training on final values when only preliminary values were available at the time is leakage.
- **Survivorship.** Building a dataset from entities that exist today, such as companies still listed, excludes those that failed, biasing results.
- **Random splits.** Shuffling time-ordered data lets the model train on the future.

## Warning signs

- Performance that is much better than published benchmarks or domain experience suggests is possible.
- One feature that dominates importance by a huge margin.
- A large drop in performance when moving from offline testing to live predictions.
- Results that are suspiciously stable across very different periods.

## Preventing leakage

1. **Timestamp everything.** For each feature, record when its value became known, not just the period it describes.
2. **Build features "as of" a cutoff.** Compute each row's features using only data available before its prediction time.
3. **Split first, then preprocess.** Fit scalers, encoders and feature selection on training data only, ideally within a pipeline that is refitted at each validation step.
4. **Use time-aware splits** for anything that will be used to predict the future.
5. **Deduplicate** across splits, and keep groups (the same customer, patient or team-season) together.
6. **Ask the question for every feature**: "Could I have known this value at the moment I need to make the prediction?"

## Point-in-time data

The strongest defense is a point-in-time dataset: a store of values as they were known at each moment, including revisions. Such datasets are more work to build, but they let you replay history exactly as it unfolded.

> **Key takeaway:** Leakage is the model seeing what it could not know. Timestamp data, build features as of a cutoff, preprocess inside the split and treat surprisingly good results as a warning, not a win.

@@ why-random-splits-fail-on-time-series

Random train–test splits are the default in many machine learning tutorials. For data ordered in time, they are usually wrong. A forecasting model is always used to predict a future it has not seen, and validation must mimic that.

## The core problem

In a random split, test examples are scattered through the whole time range. Each test example has training examples from just before and just after it. The model can effectively interpolate between known neighbors rather than extrapolate into the unknown. Real forecasting never offers data from the future.

## Autocorrelation

Time series values tend to be correlated with nearby values. Today's temperature is close to yesterday's; a team's strength this week resembles last week's. If the training set includes the day after a test day, the model gets a near-copy of the answer. Scores look excellent and mean little.

## A concrete illustration

Imagine predicting daily electricity demand. With a random split, a model can learn that the test day of 14 March looks like 13 and 15 March, both in training. With a time-ordered split, the model trained through February must predict all of March, including a cold snap it has not seen. The second setup is harder and honest. It is common for random-split errors to look dramatically lower than time-ordered errors on the same data.

## Changing patterns

Time series also change over time, a problem known as **non-stationarity** or **concept drift**:

- Customer behavior shifts with seasons, prices and competitors.
- Sports leagues change rules and playing styles.
- Markets adapt to information.

Random splits mix old and new regimes, hiding the fact that a model trained on the past may degrade on the future. Time-ordered validation shows how performance holds up, or decays, over time.

## What to do instead

- **Holdout by time.** Train on data up to a cutoff, test on data after it. The simplest honest check.
- **Walk-forward (rolling-origin) validation.** Repeat the holdout at several cutoffs, moving forward each time, and average the results. This gives more test periods and shows variation over time.
- **Gaps.** Leave a buffer between training and test periods when features use lagged windows or when outcomes take time to be known.
- **Grouped splits.** Keep related observations together, such as all games from the same round or all transactions from the same customer, if they would otherwise leak information.

## When random splits are acceptable

Random splits can be fine when:

- The task is not forecasting, and observations are genuinely independent of time.
- You are predicting across entities at the same time, and time effects are controlled.

Even then, check for hidden time structure, such as data collected in batches.

## Comparing approaches

| Validation method | Uses future data in training? | Realistic for forecasting? |
|---|---|---|
| Random k-fold | Yes | No |
| Single time holdout | No | Yes, one test period |
| Walk-forward | No | Yes, many test periods |

> **Key takeaway:** Random splits let a time series model peek at the future through neighboring data. Validate forward in time, with gaps where needed, so test scores reflect how the model will actually be used.

@@ rolling-and-expanding-windows

Walk-forward validation trains on the past and tests on the next period, then moves forward. A key design choice is how much past data to train on at each step. The two standard options are expanding windows and rolling (sliding) windows.

## Expanding window

The training set starts at the beginning of the data and grows with each step.

| Step | Train on | Test on |
|---|---|---|
| 1 | 2019–2021 | 2022 |
| 2 | 2019–2022 | 2023 |
| 3 | 2019–2023 | 2024 |

**Advantages**: uses all available history, which helps when data is scarce or patterns are stable. Estimates of rare events improve as more data accumulates.

**Disadvantages**: old data keeps influencing the model even if the world has changed. Training time grows with each step.

## Rolling window

The training set has a fixed length and slides forward, dropping the oldest data.

| Step | Train on | Test on |
|---|---|---|
| 1 | 2019–2021 | 2022 |
| 2 | 2020–2022 | 2023 |
| 3 | 2021–2023 | 2024 |

**Advantages**: adapts to change, because the model only reflects recent behavior. Training time stays constant.

**Disadvantages**: discards potentially useful history. Short windows produce noisier models.

## Choosing between them

- **Stable process, limited data**: expanding windows usually win.
- **Changing process, plenty of data**: rolling windows usually win.
- **Unsure**: test both, and several window lengths, in walk-forward validation. Choose the one with the best average out-of-sample score and acceptable stability across periods.

## A middle path: weighting

Instead of a hard cutoff, you can keep all data but give recent observations more weight. Exponential decay weights, where an observation's weight halves every fixed period (its half-life), are a common choice. This keeps the benefits of long history while emphasizing recent behavior. The half-life becomes a parameter to tune.

## Step size and test length

- **Step size**: how far the window moves each time. Smaller steps give more test periods and mimic frequent retraining, but cost more compute.
- **Test length**: should match how long a model will be used before retraining in practice. If you retrain monthly, test on one month at a time.

## The minimum training size

The first window needs enough data to fit the model reliably. If early windows are too small, the first few test periods will look poor because of insufficient data rather than model weakness. Report results with the starting window size clearly stated.

## Reporting results

Report the score for each test period, not just the average. A table or plot over time shows:

- Whether performance is stable or degrading.
- Whether particular periods, such as a disrupted season, behave differently.
- How much variation to expect in live use.

## Tuning inside the window

If you tune hyperparameters, do it within each training window, for example with an inner time-ordered split. Tuning once on the whole walk-forward result and reporting that result is optimistic.

> **Key takeaway:** Expanding windows use all history; rolling windows adapt to change. Test both, consider recency weighting, match test length to your retraining schedule and report results period by period.

@@ backtesting-with-realistic-timing

A backtest replays a forecasting or decision strategy on historical data to estimate how it would have performed. A good backtest answers one question honestly: if I had run this exact process at the time, what would have happened? Getting the timing right is the hardest part.

## Model backtests versus strategy backtests

- A **model backtest** checks forecast accuracy over time: log loss, error or calibration.
- A **strategy backtest** goes further and simulates decisions made from the forecasts, such as bets, trades or inventory orders, including their costs and constraints.

A model can have good accuracy and still lose money if decisions are timed badly or costs are ignored.

## Timing rules

For every simulated decision, ask:

1. **When was the decision made?** Record a timestamp for each decision.
2. **What information was available then?** Features must use only data published before that timestamp, including the actual publication delay. Data about yesterday may not arrive until this afternoon.
3. **What action was possible then?** The price, inventory or option available at that moment, not the best price of the day or the closing value.
4. **When was the outcome known?** Results feed into the next decisions only after they become known.

## Common timing mistakes

- **Look-ahead bias.** Using data that was published after the decision time, such as end-of-day values for a morning decision.
- **Using revised data.** Training and testing on final, corrected values when only preliminary values existed at the time.
- **Optimistic execution.** Assuming you got the best available price, or that your order did not move the market.
- **Survivorship bias.** Testing only on entities that still exist today.
- **Ignoring latency.** Assuming decisions happen instantly after information arrives.

## Costs and constraints

Realistic strategy backtests include:

- Transaction costs and fees, including the bookmaker's margin in betting.
- Limits on position size or stake.
- Liquidity: how much can be traded or bet at a given price.
- Capital constraints: you cannot place new bets with money tied up in unsettled ones.

## Overfitting the backtest

If you try many strategies and keep the best backtest, you are likely selecting luck. The more variations tested, the more likely an impressive result is noise. Defenses:

- Decide the evaluation process before looking at results.
- Keep a final holdout period that you test only once.
- Track how many variations you tried.
- Prefer simple strategies with plausible explanations.
- Check robustness: small changes to parameters should not destroy performance.

## Paper trading

After a backtest, run the strategy live without real money, or with small stakes, for a period. This "paper trading" stage tests the data pipeline, timing and execution under real conditions, and often reveals problems a backtest missed.

## A backtest checklist

- Every feature timestamped and available before decision time.
- Prices and actions available at decision time used for execution.
- Costs, limits and liquidity included.
- Model retrained on the same schedule you would use live.
- Number of strategy variants recorded.
- Final holdout untouched until the end.

> **Key takeaway:** A backtest should replay history exactly as it unfolded: decisions using only data available at the time, executed at prices that were actually available, with real costs. Treat a backtest that looks too good as a sign of a timing error.
