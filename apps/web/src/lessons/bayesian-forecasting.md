@@ priors-likelihoods-and-posteriors

Bayesian inference is a method for updating beliefs as evidence arrives. You start with what you believe before seeing the data, combine it with how likely the data is under different possibilities, and end with an updated belief. Forecasting is a natural fit, because new evidence arrives constantly.

## Bayes' rule

`posterior ∝ likelihood × prior`

- **Prior**: your belief about an unknown quantity before seeing the new data. For example, a basketball player's true free-throw percentage.
- **Likelihood**: how probable the observed data is for each possible value of the unknown. If the true rate is 80%, how likely is it that the player made 7 of 10?
- **Posterior**: your updated belief after combining the two.

The symbol ∝ means "proportional to". The full formula divides by the total probability of the data, which makes the posterior sum (or integrate) to 1.

## A discrete example

A machine is either working normally or faulty. Normally, 2% of its parts are defective; when faulty, 20% are. Based on maintenance history, there is a 5% chance it is faulty today (the prior). You inspect one part and find it defective.

| Hypothesis | Prior | Likelihood of a defect | Prior × likelihood | Posterior |
|---|---|---|---|---|
| Normal | 0.95 | 0.02 | 0.019 | 0.019 ÷ 0.029 ≈ 0.655 |
| Faulty | 0.05 | 0.20 | 0.010 | 0.010 ÷ 0.029 ≈ 0.345 |
| **Total** | | | **0.029** | **1.0** |

One defective part raises the probability of a fault from 5% to about 34%. A second defect would raise it further.

## A continuous example: the beta-binomial model

For a success rate, such as a free-throw percentage, a convenient prior is the **beta distribution**, Beta(α, β). Its mean is α ÷ (α + β). You can think of α and β as prior successes and failures.

Suppose league-wide experience suggests a prior of Beta(15, 5): a mean of 75%, worth about 20 shots of evidence. The player then makes 7 of 10 attempts.

- Posterior = Beta(15 + 7, 5 + 3) = Beta(22, 8).
- Posterior mean = 22 ÷ 30 ≈ 73.3%.

The raw rate is 70%, but with only 10 shots the estimate stays close to the prior. After 200 attempts, the data would dominate.

## Choosing priors

- **Informative priors** use real knowledge, such as league averages or past seasons. They are valuable when data is limited.
- **Weakly informative priors** rule out implausible values without imposing much.
- **Flat priors** treat all values as equally likely, which can behave poorly with small samples.

Priors should be chosen before looking at the data you are analyzing, and their influence should be checked by trying alternatives.

## Why it suits forecasting

- **Natural updating**: today's posterior becomes tomorrow's prior.
- **Uncertainty included**: the result is a distribution, not just one number.
- **Small samples handled gracefully**: estimates are pulled toward sensible values when data is thin.

## Computation

Some models, like the beta-binomial, have exact solutions. Most realistic models do not, and are fitted with approximation methods such as Markov chain Monte Carlo (MCMC) or variational inference, available in tools like Stan and PyMC.

> **Key takeaway:** Bayesian inference multiplies a prior by a likelihood to produce a posterior. It updates naturally as evidence arrives and keeps uncertainty in view, which makes it well suited to forecasting.

@@ updating-ratings-game-by-game

Team strength changes over a season: injuries, trades, form and development all shift it. A rating system that updates after every game tracks those changes. Bayesian ideas explain how much each result should move the rating.

## The basic idea

Before each game you have a belief about each team's strength. After the game, you update that belief based on how the result compared with expectations:

- A team that wins a game it was expected to win moves up a little.
- A team that wins a game it was expected to lose moves up a lot.
- A team that loses as expected moves down only slightly.

## Elo as a simple updater

The Elo rating system captures this with one formula. If team A has rating Rₐ and team B has rating R_b, team A's expected result is:

`Eₐ = 1 ÷ (1 + 10^((R_b − Rₐ) ÷ 400))`

After the game, with result Sₐ (1 for a win, 0 for a loss):

`new Rₐ = Rₐ + K × (Sₐ − Eₐ)`

K controls how fast ratings move.

## A worked example

Team A is rated 1600, team B 1500, and K = 20.

- Eₐ = 1 ÷ (1 + 10^(−100/400)) = 1 ÷ (1 + 0.562) ≈ 0.64.
- If A wins: Rₐ = 1600 + 20 × (1 − 0.64) ≈ 1607.2.
- If A loses: Rₐ = 1600 + 20 × (0 − 0.64) ≈ 1587.2.

An upset loss moves the rating almost twice as much as an expected win. In basketball, adding a home-court adjustment to the rating difference and scaling updates by margin of victory usually improves accuracy.

## The Bayesian view

Elo uses a fixed K. A Bayesian rating system instead keeps both a **mean** and an **uncertainty** for each team's strength:

- When uncertainty is high, such as at the start of a season or after a major trade, each game moves the rating a lot.
- As games accumulate, uncertainty shrinks and updates become smaller.
- Between games, uncertainty grows slightly to allow for genuine change over time.

This behaves like an Elo system with a K that adapts automatically. Systems such as Glicko and TrueSkill, and state-space models fitted with Kalman filters, follow this approach.

## Season-to-season carryover

A team's rating at the end of one season is informative but not definitive for the next. A common approach is to regress ratings toward the league average between seasons, for example keeping two-thirds or three-quarters of the difference from average, then increasing uncertainty. How much to regress can be tuned with walk-forward validation.

## Tuning the update speed

- **Too fast** (large K or high uncertainty): ratings overreact to noise, such as a single blowout.
- **Too slow**: ratings lag behind real changes, such as a star returning from injury.

Choose settings by minimizing out-of-sample log loss of the predicted win probabilities in walk-forward validation.

## Adding information

Results are only one signal. Ratings can also be adjusted for player availability, rest and travel, either inside the rating model or as separate features in a prediction model that uses ratings as inputs.

> **Key takeaway:** Update ratings by how surprising each result was. A Bayesian approach tracks uncertainty too, so ratings move quickly when little is known and settle as evidence accumulates.

@@ credible-intervals

A forecast of a single number hides how uncertain it is. A credible interval describes the range of plausible values according to the model. Communicating that range is often as important as the central estimate.

## What a credible interval means

In Bayesian analysis, a 90% credible interval is a range that contains the unknown quantity with 90% probability, according to the posterior distribution. If a player's posterior free-throw rate has a 90% credible interval of 68% to 79%, the model assigns a 90% probability that the true rate lies in that range.

## Credible versus confidence intervals

The two are often confused:

- A **credible interval** (Bayesian) is a direct probability statement about the unknown quantity, given the model, prior and data.
- A **confidence interval** (frequentist) describes a procedure: if you repeated the experiment many times, 90% of the intervals constructed this way would contain the true value. It does not strictly say there is a 90% probability that this particular interval contains it.

With lots of data and weak priors, the two intervals are often numerically similar. With small samples or strong priors, they can differ.

## Two common types

- **Equal-tailed interval**: cut 5% from each tail of the posterior for a 90% interval. Simple and the most common.
- **Highest density interval (HDI)**: the narrowest range containing 90% of the probability. For skewed distributions, it can be noticeably narrower than the equal-tailed interval.

## A worked example

Using the earlier free-throw example, the posterior was Beta(22, 8), with mean about 73.3%. Its 90% equal-tailed credible interval is roughly 59% to 85%. After 200 attempts with a similar success rate, the interval would narrow to a few percentage points on either side. The interval shrinks roughly with the square root of the amount of data: four times as much data gives about half the width.

## Predictive intervals

There are two different uncertainties to communicate:

- **Parameter uncertainty**: how unsure you are about a quantity such as a team's true strength.
- **Predictive uncertainty**: how unsure you are about a future observation, such as the point margin of the next game.

A predictive interval includes both the parameter uncertainty and the natural randomness of individual outcomes. It is always wider. Even if a team's average margin were known exactly, any single game could vary by many points.

## Checking intervals

Credible intervals are only as good as the model. Check their **coverage** on held-out data: across many forecasts, about 90% of outcomes should fall inside the 90% predictive intervals. If only 70% do, the model is overconfident.

## Communicating uncertainty

- Show intervals alongside point forecasts, not buried in an appendix.
- Choose an interval width that matches the decision; 50% and 90% intervals together are often more informative than one 95% interval.
- Use plain language: "We expect between 40 and 55 wins, most likely around 47."

> **Key takeaway:** Credible intervals state where the unknown probably lies, given the model. Distinguish parameter from predictive uncertainty, and check that intervals cover outcomes at their stated rate.

@@ shrinkage-toward-the-average

Small samples produce extreme results. A player who shoots 9 of 10 on three-pointers in their first games is very unlikely to be a 90% shooter. Shrinkage pulls extreme estimates from small samples toward a group average, giving better predictions than the raw numbers.

## Why raw averages mislead

Imagine 300 players, all with a true three-point rate near 35%, each taking 20 shots. By chance alone, a few will shoot 55% or more and a few under 15%. If you predict next season's rates using these raw numbers, the extreme players will almost all move back toward 35%. This is **regression to the mean**, and ignoring it leads to systematic overreaction.

## How shrinkage works

A shrinkage estimate is a weighted average of the individual's raw rate and the group average:

`estimate = w × individual rate + (1 − w) × group average`

The weight w depends on how much data the individual has relative to how much variation exists between individuals:

- Few observations → w is small → the estimate stays near the group average.
- Many observations → w approaches 1 → the estimate reflects the individual's own data.

## A worked example

Using a beta prior worth 50 attempts at a league average of 35% (Beta(17.5, 32.5)):

| Player | Made / attempted | Raw rate | Shrunk estimate |
|---|---|---|---|
| A | 9 / 10 | 90.0% | (17.5 + 9) ÷ 60 ≈ 44.2% |
| B | 90 / 200 | 45.0% | (17.5 + 90) ÷ 250 = 43.0% |
| C | 2 / 10 | 20.0% | (17.5 + 2) ÷ 60 = 32.5% |

Player A's raw 90% shrinks a long way because 10 attempts carry little information. Player B's 45% over 200 attempts barely moves.

## Hierarchical models

Shrinkage arises naturally in **hierarchical** (multilevel) Bayesian models. Each individual's parameter comes from a group-level distribution, and the model estimates the group distribution from the data at the same time. The amount of shrinkage is then learned, not chosen by hand:

- If individuals truly differ a lot, the model shrinks less.
- If differences are mostly noise, it shrinks more.

Groups can be nested: players within teams, teams within leagues, so estimates borrow strength at several levels.

## Where shrinkage helps

- **Sports**: early-season player and team statistics.
- **Business**: conversion rates for new products or small stores.
- **Medicine**: outcomes at hospitals with few patients.
- **Ratings**: new users or items in recommendation systems.

## Choosing the group

Shrink toward a relevant average. A rookie center's rebounding rate should shrink toward other centers, not all players. A good group average already captures known differences, so shrinkage only has to handle the noise.

## The James–Stein result

A classic statistics result, Stein's paradox, showed that when estimating three or more means at once, shrinking each toward a common value gives lower total squared error than using the raw averages, regardless of the true values. Shrinkage is not just a Bayesian preference; it is a demonstrably better way to estimate many quantities together.

> **Key takeaway:** Extreme results from small samples are mostly noise. Shrink estimates toward a sensible group average, by more when data is thin and by less when it is plentiful, ideally with a hierarchical model that learns how much.
