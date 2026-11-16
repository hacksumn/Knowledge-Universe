@@ american-decimal-and-fractional-odds

Betting odds describe how much a winning bet pays. The same price can be written in three common formats depending on the region and the bookmaker. They look different, but they carry identical information, and it is useful to move between them fluently.

## Decimal odds

Common in Europe, Australia and on betting exchanges. Decimal odds show the **total return per 1 unit staked**, including the stake.

- Odds of 2.50 on a 10 stake return 25: 15 profit plus the 10 stake.
- Odds below 2.00 indicate a favorite; above 2.00 an underdog.
- Profit = stake × (decimal odds − 1).

## Fractional odds

Traditional in the UK and Ireland, especially in horse racing. Fractional odds show **profit relative to stake**.

- 3/2 ("three to two") means a profit of 3 for every 2 staked. A 10 stake profits 15 and returns 25.
- 1/2 ("two to one on") means a profit of 1 for every 2 staked; this is a favorite.
- Evens (1/1) doubles your money.

## American (moneyline) odds

Standard in the United States. They are anchored on a stake or profit of 100.

- **Positive** odds, such as +150, show the profit on a 100 stake. A 100 stake profits 150.
- **Negative** odds, such as −200, show the stake needed to profit 100. A 200 stake profits 100.
- +100 and −100 both mean even money.

## Conversion formulas

| From | To decimal |
|---|---|
| Fractional a/b | 1 + a ÷ b |
| American +A | 1 + A ÷ 100 |
| American −A | 1 + 100 ÷ A |

| From decimal d | To |
|---|---|
| Fractional | (d − 1), expressed as a fraction |
| American (d ≥ 2.00) | +(d − 1) × 100 |
| American (d < 2.00) | −100 ÷ (d − 1) |

## The same price, three ways

| Decimal | Fractional | American | Profit on 100 |
|---|---|---|---|
| 1.50 | 1/2 | −200 | 50 |
| 1.91 | 10/11 | −110 | 91 |
| 2.00 | 1/1 (evens) | +100 | 100 |
| 2.50 | 3/2 | +150 | 150 |
| 4.00 | 3/1 | +300 | 300 |

Note that −110 converts to about 1.909 in decimal terms. Small rounding differences between formats are common and can matter when calculating margins.

## Why decimal odds are easiest to work with

Decimal odds make calculations simple:

- Return = stake × odds.
- Implied probability = 1 ÷ odds, before removing the margin.
- Comparing prices is direct: higher decimal odds always pay more.

American odds have a discontinuity between −100 and +100, and fractional odds are awkward to compare (is 11/8 better than 7/5?). Many analysts convert everything to decimal before doing any math.

## Exchange odds

On betting exchanges, people bet against each other rather than against a bookmaker. Exchanges usually quote decimal odds and charge a commission on net winnings instead of building a margin into the price. Remember to include that commission when comparing exchange prices with bookmaker prices.

## Practical tips

- Always know which format a price is in before calculating anything.
- Keep a consistent internal format, ideally decimal, in models and spreadsheets.
- Round only at the end, because converting back and forth can introduce small errors.

> **Key takeaway:** Decimal, fractional and American odds are three ways of writing the same payout. Convert to decimal for calculations: return equals stake times odds, and 1 ÷ odds gives the implied probability.

@@ implied-probability

Every price implies a probability: the chance of winning at which the bet would break even. Turning prices into probabilities lets you compare a market's view with your own estimates and judge whether a bet is worth making.

## The formula

For decimal odds d:

`implied probability = 1 ÷ d`

At odds of 2.50, implied probability = 1 ÷ 2.50 = 40%. If you win exactly 40% of such bets, you break even over the long run: you lose the stake 60% of the time and gain 1.5 times the stake 40% of the time.

For American odds:

- +A: implied probability = 100 ÷ (A + 100). +150 → 100 ÷ 250 = 40%.
- −A: implied probability = A ÷ (A + 100). −200 → 200 ÷ 300 ≈ 66.7%.

## A break-even check

At decimal odds of 2.50 with a win probability of exactly 40%, the expected profit per 1 staked is:

`0.40 × 1.50 − 0.60 × 1 = 0.60 − 0.60 = 0`

If the true probability is higher than 40%, the bet has positive expected value; if lower, negative.

## Implied probabilities do not sum to 100%

For a two-way market, the implied probabilities usually add up to more than 100%.

| Side | Decimal odds | Implied probability |
|---|---|---|
| Team A | 1.909 (−110) | 52.4% |
| Team B | 1.909 (−110) | 52.4% |
| **Total** | | **104.8%** |

The extra 4.8% is the bookmaker's margin, or **overround**. The next lesson covers how to remove it to get fair probabilities.

## What implied probability is and is not

Implied probability is a **price**, not a fact. It reflects:

- The bookmaker's estimate of the true probability.
- The margin added for profit.
- Adjustments to balance the bookmaker's exposure or limit risk from sharp bettors.

In large, liquid markets, no-vig implied probabilities are often well calibrated: outcomes priced at 60% tend to happen close to 60% of the time. In smaller or less efficient markets, they can be less reliable.

## Comparing with your estimate

The central question for any bet is whether your probability exceeds the break-even probability:

- Your estimate: 45%. Implied probability at the offered price: 40%. The price is favorable, if your estimate is right.
- Your estimate: 38%. The price is unfavorable.

The phrase "if your estimate is right" is crucial. Small errors in your estimate can easily outweigh the apparent edge, which is why calibration matters so much.

## Edge as a percentage

A common measure of edge is:

`edge = your probability × decimal odds − 1`

With 45% at odds of 2.50: 0.45 × 2.50 − 1 = 0.125, or a 12.5% expected return per unit staked. Realistic edges in efficient markets are usually much smaller, often a few percent at best.

## Implied probability for multi-outcome markets

For markets with many outcomes, such as a league winner, sum the implied probabilities of all outcomes. The total over 100% is the overround, and it is often much larger than in two-way markets.

> **Key takeaway:** Implied probability is 1 ÷ decimal odds: the break-even win rate for a price. It includes the bookmaker's margin, so raw implied probabilities overstate the market's true view.

@@ the-vig-and-no-vig-prices

Bookmakers make money by building a margin into their prices. That margin is called the vig (short for vigorish), the juice or the overround. Understanding it lets you measure how expensive a market is and extract the market's fair probabilities.

## How the margin works

Imagine a coin flip with a true 50/50 chance. Fair odds would be 2.00 on each side. A bookmaker might instead offer 1.91 (−110) on each side.

If one bettor stakes 110 on heads and another stakes 110 on tails:

- The bookmaker collects 220.
- The winner receives 110 stake + 100 profit = 210.
- The bookmaker keeps 10, regardless of the result.

That 10 out of 220 staked is a hold of about 4.5%.

## Measuring the overround

Add up the implied probabilities of all outcomes:

`overround = Σ (1 ÷ decimal odds) − 1`

At −110 / −110 (1.909 / 1.909): 0.5238 + 0.5238 − 1 ≈ 4.8%.

The **hold** (the bookmaker's expected share of total stakes, assuming balanced action) is 1 − 1 ÷ (sum of implied probabilities): 1 − 1 ÷ 1.0476 ≈ 4.5%. Overround and hold are related but not identical, so check which one a source reports.

## Removing the margin: proportional method

The simplest no-vig method divides each implied probability by the total.

Example: Team A at 1.60, Team B at 2.40.

| Side | Implied | No-vig probability | Fair decimal odds |
|---|---|---|---|
| A | 62.5% | 62.5 ÷ 104.2 ≈ 60.0% | 1.67 |
| B | 41.7% | 41.7 ÷ 104.2 ≈ 40.0% | 2.50 |
| Total | 104.2% | 100% | |

## Other methods

The proportional method assumes the margin is spread evenly. Evidence from many markets suggests bookmakers often build more margin into longshots, a pattern linked to the **favorite–longshot bias**. Alternatives include:

- **Additive method**: subtract an equal share of the overround from each implied probability.
- **Power method**: find an exponent k such that the implied probabilities each raised to the power k sum to 1. This takes more margin from longshots.
- **Shin's method**: models the bookmaker's response to a fraction of well-informed bettors and also assigns more margin to longshots.

For evenly matched two-way markets, all methods give nearly the same answer. For heavy favorites, multi-outcome markets or large margins, the choice can shift probabilities by a percentage point or more.

## Comparing markets

Lower margins mean better value for bettors. Margins vary by:

- **Sport and market**: main markets on popular events usually have lower margins than niche markets or player props.
- **Bookmaker**: some run lower margins and limit winning customers; others charge higher margins.
- **Timing**: margins can change between opening and closing.

## Using no-vig probabilities

- **As a benchmark**: compare your model's probabilities with no-vig probabilities from a sharp, liquid market.
- **As a consensus**: averaging no-vig probabilities across several bookmakers can give a strong estimate of the true probability.
- **For value**: a bet is worth considering only if your probability beats the **break-even** probability of the actual price, which includes the vig.

> **Key takeaway:** The vig is the bookmaker's built-in margin, visible as implied probabilities summing above 100%. Remove it to estimate fair probabilities, but remember you must beat the price with the vig included to profit.
