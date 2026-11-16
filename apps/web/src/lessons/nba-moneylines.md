@@ moneyline-odds-as-probabilities

A moneyline is a bet on which team wins the game outright, with no point spread. In the United States moneylines are quoted in American odds, and every price can be turned into a probability. That conversion is the first step in building any model that competes with the market.

## Reading American odds

- A **negative** number is the amount you must stake to win 100. At −150 you stake 150 to win 100.
- A **positive** number is the amount you win on a 100 stake. At +130 a 100 stake wins 130.

## From odds to implied probability

The implied probability is the win rate at which the bet breaks even.

- For negative odds −A: probability = A ÷ (A + 100).
- For positive odds +B: probability = 100 ÷ (B + 100).

## A worked example

Suppose a game is priced Boston −150, Miami +130.

| Team | Odds | Calculation | Implied probability |
|---|---|---|---|
| Boston | −150 | 150 ÷ 250 | 60.0% |
| Miami | +130 | 100 ÷ 230 | 43.5% |
| **Total** | | | **103.5%** |

The two probabilities add up to more than 100%. The extra 3.5 percentage points is the bookmaker's margin, also called the vig or overround. It is how the bookmaker profits regardless of who wins.

## Removing the margin

To compare the market with a model, you need a fair probability for each side. The simplest method is to divide each implied probability by the total:

- Boston: 60.0 ÷ 103.5 = **58.0%**
- Miami: 43.5 ÷ 103.5 = **42.0%**

This proportional method assumes the margin is spread evenly. In practice bookmakers often build more margin into the underdog price, a pattern linked to the favorite–longshot bias. Alternative methods, such as the power method or Shin's method, allocate more of the margin to longshots. For NBA moneylines between close teams the methods give similar answers; for heavy favorites they can differ by a percentage point or more.

## Why this matters for modeling

Your model will output a probability, for example "Boston wins 61%". To decide whether that disagrees with the market, compare it with the no-vig probability (58%), not the raw implied one (60%). To decide whether a bet has positive expected value, compare it with the price you can actually get, including the margin. At −150, Boston must win more than 60% of the time for the bet to break even.

## Converting back

You will also want to turn a model probability into a fair price:

- If p ≥ 0.5: fair odds = −100 × p ÷ (1 − p). A 61% probability gives about −156.
- If p < 0.5: fair odds = +100 × (1 − p) ÷ p. A 42% probability gives about +138.

> **Key takeaway:** Every moneyline is a probability with the bookmaker's margin added. Remove the margin to compare opinions; keep it to decide whether a bet pays.

@@ team-strength-features

A moneyline model needs inputs that describe how strong each team is and what circumstances it faces in this specific game. The most important rule is that every feature must be knowable before tip-off. A feature that quietly uses information from the game itself, or from later games, will make the model look brilliant in testing and fail in practice.

## Ratings

Ratings summarize team quality in one or two numbers.

- **Net rating**: points scored minus points allowed per 100 possessions. Adjusting for pace makes teams that play fast and slow comparable.
- **Elo-style ratings**: a single number updated after every game based on the result and the margin. They are simple, adapt over time and are easy to compute without leakage.
- **Opponent-adjusted ratings**: account for strength of schedule, so beating good teams counts for more.

Use ratings as of the morning of the game, computed only from earlier games. Early in the season, ratings rest on few games and are noisy; carrying over a regressed version of last season's rating usually helps.

## Rest and travel

Schedule effects are real but smaller than talent:

- **Back-to-backs**: teams playing their second game in two nights tend to perform worse.
- **Days of rest**: compare rest for both teams rather than using one side alone.
- **Travel**: distance, time zones crossed and long road trips.
- **Home court**: historically worth a few points per game in the NBA, though the size of the edge has varied across seasons.

## Availability

Injuries and rest decisions often matter more than anything else, because a star player can be worth several points of margin. Useful features include:

- Expected minutes lost by players ruled out.
- A player-impact estimate for missing players, so losing a starter counts more than losing a bench player.
- A flag for uncertain status at prediction time.

Be careful with timing. Injury reports change during the day. If you train on final injury status but predict using morning status, the model learns from information it will not have.

## Form and noise

Recent form features, such as the last five games, are tempting but noisy. They often add little beyond a good rating that already updates game by game. Test them, but expect small gains.

## The market as a feature

The opening line already combines a great deal of public information. Some modelers include it as a feature; others keep it out so the model forms an independent view. If you include it, your model is learning how to adjust the market, not how to replace it. Decide which question you are answering.

## Building a feature table

Create one row per game with a timestamp for when the features were computed. Check each column by asking: "Could I have known this value at that timestamp?" Store raw inputs as well as features so you can recompute them when you find a mistake.

> **Key takeaway:** Good NBA features describe team quality, schedule and player availability, all measured strictly before the game. Timing discipline matters more than clever features.

@@ walk-forward-validation

Walk-forward validation tests a forecasting model the way it will be used: trained on the past, asked to predict the next stretch of games, then moved forward in time and asked again. For sports models it is the standard way to get an honest estimate of performance.

## Why ordinary cross-validation misleads

Standard k-fold cross-validation shuffles games into random folds. That means the model can be trained on games from March and tested on games from January. Team strength changes during a season, so knowledge of March tells the model a lot about January. The result is an optimistic score you can never reproduce live.

## The procedure

1. Choose a starting training window, for example three full seasons.
2. Train the model on that window only.
3. Predict the next block of games, such as the next week or month, and record the predictions.
4. Move the window forward by one block, add the newly completed games to training and retrain.
5. Repeat until you reach the end of the data.
6. Score all the recorded predictions together.

Every prediction is made by a model that has only seen earlier games, which is exactly the situation you face in production.

## Expanding or rolling

- An **expanding window** keeps all past data and grows over time. It uses the most information but can be slow to adapt when the league changes, for example after a rule change or a shift in playing style.
- A **rolling window** keeps a fixed length, such as the last three seasons, and drops the oldest games. It adapts faster but uses less data.

Try both. The better choice depends on how stable the patterns are.

## Practical details

- **Retrain frequency.** Retraining every day is realistic but slow. Retraining weekly is usually a fine approximation.
- **Feature timing.** Features such as ratings must be recomputed as of each prediction date. Precomputing them using the whole season leaks future information.
- **Hyperparameters.** If you tune hyperparameters using the full walk-forward result and then report that same result, the score is optimistic. Hold out the final season, or use a nested walk-forward where tuning happens only inside each training window.
- **Gap.** If some features are only available with a delay, leave a gap between the end of training data and the first prediction.

## Scoring

Score probabilistic predictions with log loss or the Brier score, not accuracy. Accuracy ignores confidence: picking a 51% favorite and a 90% favorite count the same. Also score the market's no-vig probabilities over the same games. Beating that benchmark, not beating 50%, is the real test.

## Reading the results

Plot the score by season or month. A model that wins only in one season may have found noise. Look at calibration too, which the next lesson covers.

> **Key takeaway:** Walk-forward validation trains only on the past and predicts the future, step by step. It is slower than random splits, but it is the only score you can trust for a model that bets on future games.

@@ calibrating-win-probabilities

A model can rank games well and still give misleading probabilities. Calibration asks a simpler question: when the model says 60%, does that team win about 60% of the time? For betting, calibration matters as much as ranking, because stake decisions and expected value depend directly on the probability.

## Checking calibration

Use the out-of-sample predictions from walk-forward validation.

1. Group predictions into bins, for example 50–55%, 55–60% and so on. Because each game has two sides, analyze each game from one side only, such as the home team, to avoid counting it twice.
2. For each bin, compute the average predicted probability and the actual win rate.
3. Plot actual against predicted. A perfectly calibrated model lies on the diagonal.

With a few thousand games, bins are noisy. Expect some scatter and look for consistent patterns rather than single points.

## Common patterns

- **Overconfident**: favorites rated at 80% win only 72% of the time. Points fall below the diagonal at the high end and above it at the low end. This is common with flexible models such as boosted trees trained to minimize error without regard to probability quality.
- **Underconfident**: the model hugs 50% and its 60% picks actually win 65% of the time.
- **Biased**: the model consistently overrates home teams or favorites.

## Fixing it

Fit a calibration step on held-out predictions, never on the training data.

- **Platt scaling** fits a logistic regression to the model's output. It works well when miscalibration is a smooth S-shaped distortion.
- **Isotonic regression** fits a flexible, non-decreasing curve. It can fix more complex patterns but needs more data and can overfit with only a few seasons.
- **Temperature or shrinkage**: multiply the log-odds by a factor below 1 to pull overconfident probabilities toward 50%.

In a walk-forward setup, fit the calibrator inside each training window using a slice of recent games that the base model did not train on.

## Measuring improvement

Calibration should improve log loss and the Brier score on new data. If it does not, the calibrator may be overfitting. Also check that it does not destroy ranking: calibration methods that are monotonic, like Platt scaling and isotonic regression, keep the order of predictions.

## Calibration and betting

Suppose your model says 62% for a team priced at −150 (60% break-even). If the model is overconfident and the true rate for its 62% calls is 58%, every one of those bets loses money on average. Small calibration errors are the same size as typical betting edges, so they cannot be ignored.

> **Key takeaway:** A probability is only useful if it is honest. Check calibration on out-of-sample predictions and fix it with a calibrator fitted on held-out data.

@@ benchmarking-against-the-closing-line

The closing line is the final market price before the game starts. In major sports such as the NBA, closing prices reflect a great deal of information: injury news, lineup confirmations and the opinions of well-informed bettors. That makes the closing line a tough benchmark for any model.

## Why use it as a benchmark

Comparing your model with "always pick the favorite" or with 50% tells you little. The useful question is whether your probabilities contain information the market did not have. To check:

1. Convert closing moneylines to no-vig probabilities for every game in your test period.
2. Score those probabilities with the same metric as your model, such as log loss.
3. Compare the two scores over the same games.

If your model's log loss is clearly worse than the closing line's, the model is not yet ready to bet against that market. If it is close, look at where they disagree.

## Combining the two

A common and honest test is to combine both forecasts, for example by averaging their log-odds or by fitting a small logistic regression with both as inputs. If the combination beats the closing line alone on out-of-sample data, your model adds information. If the best weight on your model is near zero, it does not.

## Closing line value

Closing line value (CLV) compares the price you took with the closing price. If you bet Boston at −140 and it closed at −160, you got a better price than the final market. Bettors track CLV because results take a long time to separate skill from luck, while CLV shows up quickly.

To measure CLV in probability terms, compare the no-vig implied probability at your bet time with the no-vig closing probability. Consistently positive CLV is evidence that your process finds value before the market does.

## Limits of the benchmark

- **Not proof of profit.** Positive CLV suggests an edge but does not guarantee it. Margins, limits and timing all affect real results.
- **Timing.** A model that uses information available only near tip-off should be compared with the closing line; a model used in the morning should also be compared with the morning line.
- **Market quality.** Closing lines in less popular markets, such as small player props, are less efficient and make a weaker benchmark.
- **Sample size.** Differences in log loss between good models are tiny. Use thousands of games and look at uncertainty, for example with a bootstrap over games.

## A sensible workflow

Start by matching the closing line. Then look for specific situations where your model consistently disagrees with the market and is right, such as late injury news or schedule spots. Edges, when they exist, tend to be narrow and situational.

> **Key takeaway:** Judge an NBA model against the no-vig closing line, not against chance. If combining your model with the closing line does not beat the line alone, the model has not yet found an edge.
