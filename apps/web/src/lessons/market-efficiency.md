@@ how-lines-move

A betting line is not fixed when it is first posted. Between opening and the start of the event, prices move, sometimes a little and sometimes a lot. Understanding why lines move helps you read what the market knows and decide when to bet.

## The life of a line

1. **Opening.** A bookmaker, or a small group of market-leading bookmakers, posts an initial price based on their models and judgment. Opening limits are usually low because the price has not yet been tested.
2. **Price discovery.** Bettors, including well-informed professionals, bet into the line. Bookmakers adjust prices in response, and limits rise as confidence in the price grows.
3. **News.** Injuries, lineup announcements, weather and other information move the line as it becomes known.
4. **Closing.** Just before the event, the line reaches its final price, with the highest limits and the most information.

## What moves a line

- **Information**: a star player ruled out can move an NBA moneyline sharply within minutes.
- **Respected money**: bets from bettors the bookmaker considers sharp move the line more than the same amount from recreational bettors. Many bookmakers track customer profitability and react accordingly.
- **Volume**: large amounts of public money on one side can move prices, particularly at bookmakers that try to balance their exposure.
- **Other bookmakers**: many bookmakers copy or follow the prices of market leaders.
- **Risk management**: a bookmaker with heavy exposure on one outcome may shade the price to attract action on the other side.

## Steam and reverse line movement

Bettors use informal terms for patterns:

- **Steam**: a sudden, coordinated move across many bookmakers, often triggered by sharp bettors or syndicates acting on information.
- **Reverse line movement**: the line moves against the side receiving most public bets, suggesting the money on the other side is respected.

These patterns are often discussed, but data on bet counts is incomplete, and interpreting it is less reliable than it sounds.

## Key numbers

In some sports, outcomes cluster at certain values. In American football, many games are decided by 3 or 7 points, so moving a point spread across those numbers matters far more than moving between others. Basketball margins are more evenly spread, so key numbers matter less, though they are not absent.

## What line movement tells you

- Movement toward your position after you bet is a good sign: you took a price the market later considered too generous. That is the idea behind closing line value, covered next.
- Movement against you may mean the market has information you lack.
- Large moves without obvious news often reflect sharp money or news not yet public.

## Timing a bet

- **Betting early** can capture value before the market corrects, but limits are lower and more information is still to come.
- **Betting late** uses the most information, but prices are sharper and value is harder to find.
- **Waiting for news** can help when your model reacts to information, such as injuries, faster or better than the market.

## Tracking movement

Record prices from several bookmakers over time, not just at one moment. A history of prices lets you study how your model's opinions relate to later market moves, and it provides the data needed to evaluate closing line value.

> **Key takeaway:** Lines move with information, respected money and risk management. Movement is the market learning, and whether it moves toward or away from your price tells you a lot about your edge.

@@ closing-line-value

Closing line value (CLV) compares the price you got with the final price before the event started. In efficient markets, consistently beating the closing price is widely seen as one of the best available indicators that a bettor's process has an edge.

## Why the closing line matters

The closing line reflects the most information the market will have before the event, and it has absorbed bets from many participants, including the sharpest. In major markets, no-vig closing prices are usually well calibrated. If you regularly bet at better prices than the close, you are regularly getting better prices than a strong estimate of the true probability.

## Measuring CLV

Compare the no-vig implied probability at the time of your bet with the no-vig closing probability.

Example: you bet Team A at decimal odds of 2.20. The market closes with Team A at 2.00 and Team B at 1.87.

- Closing implied probabilities: 1 ÷ 2.00 = 50.0% and 1 ÷ 1.87 ≈ 53.5%, totaling 103.5%.
- No-vig closing probability for A: 50.0 ÷ 103.5 ≈ 48.3%.
- Your price of 2.20 implies a break-even probability of 45.5%.
- Expected value at the closing estimate: 0.483 × 2.20 − 1 ≈ +6.3% per unit staked.

You beat the close by a meaningful margin on this bet.

## Why use CLV instead of profit

Results take a long time to separate skill from luck. With typical betting edges of a few percent, it can take thousands of bets before profit clearly reflects skill rather than variance. CLV is measured on every bet as soon as the market closes, and its average stabilizes much faster. Many bettors and bookmakers use it to evaluate strategies and customers.

## Limits of CLV

- **Not a guarantee.** The closing line is not perfectly accurate. A bettor can beat the close and still lose over a sample, or occasionally beat closing lines that were themselves wrong.
- **Market quality.** In thin markets, such as minor leagues or niche props, closing lines may be less efficient, so beating them means less.
- **Margin choice.** Results depend on how you remove the vig, especially for longshots.
- **Reference prices.** Use a sharp, high-limit market as the closing benchmark. A recreational bookmaker's close may be slow and less accurate.
- **Limits.** Bettors who consistently beat the close are often restricted by bookmakers, which limits how much the edge is worth in practice.

## Using CLV to improve a model

Track CLV by bet type, timing and situation:

- If bets placed in the morning beat the close but bets placed an hour before start do not, your edge may come from reacting faster to information.
- If underdog bets show positive CLV and favorite bets do not, your model may be miscalibrated at one end.
- If CLV is near zero overall, the model may only be matching the market.

## CLV and walk-forward testing

When backtesting a model, you can estimate historical CLV by comparing simulated bet prices with recorded closing prices. This requires historical odds at both bet time and close, with timestamps.

> **Key takeaway:** CLV measures whether you got a better price than the final market. It stabilizes far faster than profit, making it a strong signal of edge in efficient markets, though not a guarantee of profit.

@@ liquidity-and-limits

A price is only useful if you can actually bet at it. Liquidity describes how much money can be wagered at a given price before it moves. Limits describe how much a bookmaker will accept from you. Both shape whether a model's edge can turn into real results.

## Liquidity in betting markets

- **Bookmakers** set prices and accept bets up to a limit. Limits are higher for major markets (top leagues, main lines) and closer to the event start, and lower for niche markets and early prices.
- **Exchanges** match bettors with each other. Liquidity is the amount of money other people are offering at each price. You can see the available amounts directly in the order book.

On an exchange, if 500 is available at decimal odds of 2.10 and you want to bet 2,000, the rest of your bet will be matched at worse prices, such as 2.08 and 2.06, unless more liquidity arrives.

## Price impact

Large bets move prices. At a bookmaker, a large bet may be accepted only in part, or the line may move immediately after. On an exchange, a large order consumes the best available prices and moves to worse ones. The **average price** you get on a large bet is worse than the best quoted price. Realistic backtests must account for this.

## Limits and restrictions

Bookmakers manage risk by limiting how much each customer can bet:

- **Market limits**: the maximum stake on a given market, often published or discoverable.
- **Account limits**: individual limits that bookmakers may reduce for customers who win consistently or who bet in patterns associated with sharp bettors.

Many bookmakers restrict or close accounts of consistently winning customers. Exchanges, which earn commission rather than taking the other side of bets, generally do not restrict winners in the same way, though they may charge higher commission to heavy winners in some cases.

## Why this matters for edge

An edge is worth edge × amount you can bet. A 5% edge on markets where you can bet 100 at a time is worth far less than a 2% edge on markets where you can bet 10,000. When evaluating a strategy, ask:

- How much can actually be bet at the prices in your backtest?
- Does the edge exist only in small, early or niche markets with low limits?
- Will the strategy remain possible if accounts are restricted?

## Liquidity and efficiency

There is a general trade-off:

| Market type | Liquidity | Efficiency | Edge potential |
|---|---|---|---|
| Major league main lines near start | High | High | Low |
| Early lines, smaller leagues | Lower | Lower | Higher |
| Niche props and specials | Low | Often low | Higher, but limits are small |

Markets where edges are easier to find are usually markets where you can bet less.

## Practical considerations

- Record the available stake, not just the price, when collecting odds data.
- Include commission and price impact in exchange backtests.
- Spread bets across several bookmakers or exchanges if limits are binding.
- Follow the law and the terms of service in your jurisdiction; methods to evade limits can violate them.

> **Key takeaway:** An edge only matters at prices you can actually get, in amounts you can actually bet. Account for liquidity, price impact and limits before estimating what a strategy is worth.
