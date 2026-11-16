@@ expected-value

Expected value (EV) is the average result you would get from a bet if you could repeat it many times. It is the single most important concept for evaluating any decision under uncertainty, from bets to business investments.

## The formula

For a bet with a probability p of winning, decimal odds d and stake s:

`EV = p × (d − 1) × s − (1 − p) × s`

Equivalently, per unit staked: `EV = p × d − 1`.

## A worked example

You estimate a team has a 45% chance of winning. The price is 2.50 and you stake 100.

- If it wins (45%): profit of 150.
- If it loses (55%): loss of 100.
- EV = 0.45 × 150 − 0.55 × 100 = 67.5 − 55 = **+12.5**.

On average, this bet returns 12.5 per 100 staked, or 12.5%. That does not mean you will win 12.5 on this bet. You will either win 150 or lose 100. EV describes the long-run average across many similar bets.

## Positive EV depends on your probability

The EV calculation uses **your** probability estimate. If your estimate is wrong, so is your EV.

| Your estimated probability | EV at odds 2.50 |
|---|---|
| 45% | +12.5% |
| 42% | +5.0% |
| 40% | 0% |
| 38% | −5.0% |

A five-point error in your probability turns a strong-looking bet into a losing one. This is why calibration, honest validation and comparison with the closing line matter so much: they check whether your probabilities deserve trust.

## The bookmaker's EV

Because of the margin, a bettor choosing randomly faces negative EV. At −110 (decimal 1.909) on a true 50/50 outcome, EV = 0.5 × 1.909 − 1 ≈ −4.5% per bet. To break even at −110, a bettor must win about 52.4% of the time.

## EV in multiple outcomes

For decisions with several possible results, EV is the probability-weighted sum of all outcomes:

`EV = Σ (probability of outcome × value of outcome)`

This applies to parlays, futures, insurance, investment decisions and many other situations.

## EV is not the whole story

A positive-EV decision can still be unwise if:

- **The risk is too large.** A bet with positive EV that could lose most of your bankroll may not be worth it. The next lessons on variance and the Kelly criterion address this.
- **Your estimate is uncertain.** EV calculated from a shaky probability deserves less confidence and smaller stakes.
- **Costs are missing.** Fees, commissions and taxes reduce real EV.

## Thinking in EV

Experienced bettors and forecasters judge decisions by EV, not by results. A good bet that loses is still a good bet; a bad bet that wins is still a bad bet. Over a large number of decisions, results converge toward EV, but in the short run luck dominates. Keeping records of estimated EV for each decision, and comparing with outcomes over time, is the way to find out whether your estimates are reliable.

> **Key takeaway:** Expected value is the long-run average result: probability times payout minus probability times loss. It is only as reliable as your probability estimate, and small errors in that estimate can erase an apparent edge.

@@ variance-and-drawdowns

Even with positive expected value, results swing widely in the short run. Variance describes how spread out results are around the average. Drawdowns are the stretches of losses that variance inevitably produces. Understanding both prevents bettors from abandoning good strategies too early, or trusting bad ones too long.

## Why results vary

Each bet has only two outcomes: win or lose. Even with a genuine edge, long losing streaks are normal.

Consider bets at decimal odds of 2.00 with a true 52% chance of winning. EV is +4% per bet. But:

- After 100 bets of 1 unit each, expected profit is +4 units, and the standard deviation of profit is about ±10 units.
- After 1,000 bets, expected profit is +40 units, with a standard deviation of about ±32 units.

After 100 bets, a skilled bettor and an unskilled one can easily have the same results. Even after 1,000 bets, there is roughly a 10% chance that this positive-EV strategy shows a loss.

## How long until skill shows

Because expected profit grows in proportion to the number of bets n, while the standard deviation grows only with √n, skill eventually dominates luck. But with small edges, "eventually" can mean thousands of bets. This is a key reason bettors track closing line value, which shows signs of edge far sooner.

## Drawdowns

A drawdown is the decline from a previous peak in bankroll to a later low point. Long drawdowns are expected even with a real edge. In simulations of 1,000 bets using the 52% example above, about three-quarters of runs include a losing streak of 8 or more bets, and about three-quarters include a drawdown of 20 units or more. The median worst drawdown is around 24 units.

Questions to ask before starting:

- What drawdown would you expect over 1,000 bets, and could you tolerate it financially and emotionally?
- How will you tell a normal drawdown from evidence that the edge has disappeared?

## Higher odds mean more variance

Bets on longshots have more variance than bets on favorites for the same EV. A bettor backing 5.00 shots with a 22% true probability (EV +10%) will see much longer losing streaks than a bettor backing 1.50 favorites. Strategy choice affects not just EV but the ride.

## Simulating your strategy

A simple and powerful tool is Monte Carlo simulation:

1. Assume a win probability and price for each bet, perhaps from your model.
2. Simulate thousands of sequences of 1,000 bets.
3. Record final profit, maximum drawdown and longest losing streak for each.
4. Look at the distribution, not just the average.

Simulations make abstract risk concrete. They also show how the picture changes if your true edge is smaller than you think.

## Managing variance

- **Size stakes appropriately**: smaller stakes relative to your bankroll mean smaller swings. The next lesson covers sizing rules.
- **Diversify**: independent bets across many events reduce variance compared with a few large bets. Correlated bets, such as several bets on the same game, do not diversify.
- **Set review points in advance**: decide when you will reassess the strategy, based on sample size and CLV rather than recent results.

> **Key takeaway:** Variance means good strategies lose for long stretches and bad ones can win for a while. Expect drawdowns, simulate them in advance and judge strategies over large samples.

@@ the-kelly-criterion

Once you have a bet with positive expected value, you still have to decide how much to stake. The Kelly criterion gives the stake that maximizes the long-run growth rate of a bankroll, assuming your probabilities are correct. It is elegant and influential, and, in practice, it is usually applied with caution.

## The formula

For a bet at decimal odds d with win probability p, let b = d − 1 (the net odds). The Kelly fraction of your bankroll to stake is:

`f* = (b × p − (1 − p)) ÷ b`

Equivalently, `f* = edge ÷ (d − 1)`, where edge = p × d − 1.

If f* is zero or negative, the bet has no edge, and Kelly says do not bet.

## A worked example

Win probability 45%, decimal odds 2.50, so b = 1.5.

- f* = (1.5 × 0.45 − 0.55) ÷ 1.5 = (0.675 − 0.55) ÷ 1.5 ≈ 0.0833.

Kelly suggests staking about 8.3% of your bankroll. With a bankroll of 10,000, that is 833.

## Why Kelly maximizes growth

Kelly maximizes the expected logarithm of wealth. Because bankrolls compound, the logarithm captures long-run growth. Staking more than Kelly increases variance so much that long-run growth falls; staking twice the Kelly fraction gives roughly zero long-run growth, and more than that leads toward ruin. Staking less than Kelly gives slower growth but much lower volatility.

## The problem: estimation error

Kelly assumes you know the true probability. You do not. If your edge estimate is too high, full Kelly overbets, and overbetting is costly.

Using the example above: if the true probability is 42% rather than 45%, the correct Kelly fraction is (1.5 × 0.42 − 0.58) ÷ 1.5 ≈ 3.3%. Staking 8.3% is about 2.5 times too much, which would make growth negative.

## Fractional Kelly

Because of estimation error, most practitioners use a fraction of the Kelly stake, such as one-quarter or one-half:

| Strategy | Growth rate (if probabilities are right) | Volatility |
|---|---|---|
| Full Kelly | Maximum | Very high |
| Half Kelly | About 75% of maximum | About half |
| Quarter Kelly | About 44% of maximum | About a quarter |

Half Kelly keeps most of the growth with far smoother results, and it is much more forgiving if your probabilities are overconfident.

## Other practical points

- **Simultaneous bets**: the simple formula assumes one bet at a time. When several bets are placed at once, especially correlated ones, total exposure must be considered together.
- **Bankroll definition**: Kelly applies to money you are prepared to risk, not your total savings.
- **Caps**: many bettors also cap any single stake, for example at 2–3% of bankroll, regardless of the formula.
- **Flat staking**: some bettors use a fixed stake per bet. It is simpler and avoids overbetting when estimates are noisy, at the cost of not adjusting to edge size.

## When not to use Kelly

If your probabilities are not well calibrated, if your edge estimates are mostly guesses, or if losing the bankroll would cause real harm, small flat stakes are safer than any Kelly-based formula.

> **Key takeaway:** Kelly stakes edge ÷ (odds − 1) of your bankroll to maximize long-run growth. Because real probabilities are uncertain, fractional Kelly with caps is far safer than full Kelly.

@@ setting-limits-and-responsible-play

Understanding probability, odds and bankroll management does not make anyone immune to the risks of gambling. Losses can grow quickly, and gambling can become harmful to finances, relationships and health. Responsible play means setting limits before you start and sticking to them.

## Treat gambling as entertainment spending

For most people, gambling has negative expected value: the margin ensures the bookmaker wins on average. A healthy approach is to treat money spent on betting like money spent on any entertainment: an amount you can afford to lose entirely without affecting essentials such as rent, bills, savings or debt payments.

## Set limits in advance

Decide your limits while calm, not in the middle of a session:

- **Deposit limits**: a maximum amount you can deposit per day, week or month.
- **Loss limits**: the most you are willing to lose in a period.
- **Time limits**: how long you will spend betting in a session or week.
- **Stake limits**: the maximum per bet.

Most licensed operators offer tools to set these limits on your account. Tightening limits usually takes effect immediately; loosening them often requires a waiting period, which is a deliberate safeguard.

## Recognize risky patterns

Warning signs that gambling is becoming a problem include:

- **Chasing losses**: betting more to win back what you lost.
- Betting with money meant for essentials, or borrowing to bet.
- Increasing stakes to get the same excitement.
- Hiding gambling from family or friends.
- Feeling restless, anxious or irritable when trying to cut back.
- Gambling to escape problems or difficult feelings.
- Neglecting work, study or relationships because of gambling.

Experiencing several of these is a strong reason to step back and seek support.

## Tools that help

- **Reality checks**: pop-up reminders showing how long you have been playing and how much you have spent.
- **Cool-off periods**: short breaks from an account, from a day to several weeks.
- **Self-exclusion**: blocking yourself from betting sites for months or years. Some jurisdictions offer national self-exclusion schemes that cover all licensed operators at once.
- **Blocking software and bank controls**: many banks let customers block gambling transactions.

## Keep records

Track every bet: date, stake, price, result and reason. Records give an honest picture of results over time, which memory rarely does. People tend to remember wins and forget losses.

## Know the rules where you live

Gambling laws vary widely by country, state and province, including the minimum age, which operators are licensed and how winnings are taxed. Use licensed operators, which are required to provide player protection tools and to follow rules on fairness and dispute handling.

## Getting help

If gambling is causing harm to you or someone you know, support is available. Many countries have free, confidential helplines and counseling services for gambling problems; in the United States, for example, the national problem gambling helpline can be reached by calling or texting 1-800-GAMBLER. Talking to a doctor or a trusted person is also a good first step.

## A note on models

A profitable-looking model can create false confidence. Backtests can be wrong, edges can disappear and variance can produce long losing runs. No strategy justifies betting money you cannot afford to lose.

> **Key takeaway:** Set deposit, loss and time limits before you bet, treat stakes as money you can afford to lose, watch for warning signs such as chasing losses and use self-exclusion and support services if gambling stops being fun.
