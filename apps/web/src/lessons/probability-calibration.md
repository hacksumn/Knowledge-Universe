@@ what-calibration-means

A forecaster who says "70% chance of rain" is calibrated if, across all the days they say 70%, it rains on about 70% of them. Calibration is about whether predicted probabilities match observed frequencies. It is a separate property from whether the forecaster is good at telling rainy days from dry days.

## Calibration versus discrimination

Two qualities make a probability forecast useful:

- **Discrimination (or resolution)**: the ability to give higher probabilities to events that happen and lower ones to events that do not. Measured by metrics such as AUC.
- **Calibration (or reliability)**: whether the numbers mean what they say.

A model can be strong at one and weak at the other. A weather forecaster who always predicts the long-run average, say 30% rain, is perfectly calibrated over time but has no discrimination: it cannot tell you which days will be wet. A model that ranks risks perfectly but outputs 0.9 when the true rate is 0.6 has excellent discrimination and poor calibration.

## Why calibration matters

Many decisions use the probability directly, not just the ranking:

- **Expected value**: a bet, a loan or an insurance price depends on the actual probability of the outcome.
- **Thresholds**: "treat if risk is above 20%" only works if 20% means 20%.
- **Combining models**: averaging or comparing forecasts assumes they are on the same scale.
- **Communicating risk**: users trust probabilities they can act on.

If you only need to rank items, such as choosing the top 100 leads to call, calibration matters less.

## Which models tend to be miscalibrated

- **Logistic regression** trained with log loss is often reasonably well calibrated, provided the model is appropriate for the data.
- **Boosted trees** can be overconfident or underconfident depending on settings and objective.
- **Random forests** tend to avoid extreme probabilities, because averaging many trees pulls predictions toward the middle.
- **Naive Bayes** is often badly overconfident because it assumes features are independent.
- **Neural networks** can become overconfident, especially large ones trained for many epochs.
- **Models trained on resampled data**, such as oversampled rare classes, produce probabilities matched to the resampled rates, not the real ones.

## Calibration can drift

A model calibrated last year may not be calibrated now. If the base rate changes, such as a fraud rate rising from 1% to 2%, the model's probabilities will be systematically too low even if its ranking is unchanged. Monitoring calibration in production is as important as monitoring accuracy.

## Calibration in subgroups

A model can be calibrated overall but miscalibrated within groups, such as overestimating risk for one region and underestimating it for another. The errors cancel in the overall average. Checking calibration by important segments catches this.

## A simple check

Take a set of predictions the model did not train on. Group them by predicted probability, and compare the average prediction with the actual outcome rate in each group. If the two numbers are close across groups, the model is calibrated. The next lesson turns this check into a picture.

> **Key takeaway:** Calibration means a predicted 70% happens about 70% of the time. It is separate from discrimination, matters whenever you act on the probability itself, and needs to be checked on new data and within subgroups.

@@ reliability-diagrams

A reliability diagram, also called a calibration plot, shows at a glance whether a model's probabilities match reality. It plots predicted probability on the horizontal axis and observed frequency on the vertical axis. A perfectly calibrated model lies on the diagonal.

## Building one

1. Take predictions on held-out data, along with the actual outcomes (1 or 0).
2. Sort predictions into bins, for example ten bins of width 0.1: 0–0.1, 0.1–0.2 and so on.
3. For each bin, compute the mean predicted probability and the fraction of positive outcomes.
4. Plot one point per bin: x = mean prediction, y = observed frequency.
5. Draw the diagonal line y = x for reference.

It also helps to show a histogram of how many predictions fall in each bin, because bins with few predictions are unreliable.

## An example

| Bin | Count | Mean prediction | Observed rate |
|---|---|---|---|
| 0.0–0.2 | 400 | 0.11 | 0.15 |
| 0.2–0.4 | 300 | 0.30 | 0.33 |
| 0.4–0.6 | 200 | 0.50 | 0.49 |
| 0.6–0.8 | 70 | 0.70 | 0.62 |
| 0.8–1.0 | 30 | 0.88 | 0.74 |

The middle bins are close to the diagonal. At the extremes the observed rates are pulled toward the middle: predictions of 0.88 happen only 74% of the time, and predictions of 0.11 happen 15% of the time. This model is **overconfident** at the extremes.

## Reading the shapes

- **Points below the diagonal at the high end and above it at the low end** (an S-shape flatter than the diagonal): overconfident. Predictions are too extreme.
- **Points above the diagonal at the high end and below it at the low end** (steeper than the diagonal): underconfident. Predictions are too timid.
- **All points above the diagonal**: the model underestimates the probability everywhere, often because the base rate has risen.
- **All points below the diagonal**: the model overestimates everywhere.

## Binning choices

Equal-width bins can leave some bins nearly empty. **Equal-frequency (quantile) bins** put the same number of predictions in each bin, giving more stable estimates. With small samples, use fewer bins, and consider adding confidence intervals for each point; a binomial interval shows how much scatter to expect from chance alone.

## Summary numbers

The **expected calibration error (ECE)** is the weighted average of the gap between mean prediction and observed rate across bins. It is convenient but depends on the binning, so report the scheme you used. A single number also hides the direction of errors, so keep the plot.

## Multi-class models

For models with more than two classes, a common approach is to plot reliability for the top predicted class (confidence versus accuracy), or to plot each class one-versus-rest.

> **Key takeaway:** A reliability diagram bins predictions and compares average prediction with observed frequency. Distance from the diagonal shows miscalibration; the shape shows whether the model is overconfident, underconfident or biased.

@@ brier-score-and-log-loss

To compare probability forecasts, you need a score that rewards both calibration and discrimination. The two most widely used are the Brier score and log loss. Both are **proper scoring rules**: a forecaster gets the best expected score by reporting their honest belief, so neither can be gamed by shading probabilities.

## The Brier score

For binary outcomes, the Brier score is the mean squared difference between the predicted probability p and the outcome y (1 or 0):

`Brier = average of (p − y)²`

Lower is better. A perfect forecaster scores 0. Always predicting 0.5 scores 0.25. Always predicting the base rate b scores b × (1 − b).

## Log loss

Log loss, also called cross-entropy, is the average negative log of the probability given to what actually happened:

`Log loss = − average of [y × ln(p) + (1 − y) × ln(1 − p)]`

Lower is better. Always predicting 0.5 scores ln 2 ≈ 0.693.

## Comparing them on single predictions

| Prediction for an event that happened | Brier contribution | Log loss contribution |
|---|---|---|
| 0.9 | 0.01 | 0.105 |
| 0.7 | 0.09 | 0.357 |
| 0.5 | 0.25 | 0.693 |
| 0.1 | 0.81 | 2.303 |
| 0.01 | 0.98 | 4.605 |

The Brier score is bounded between 0 and 1 per prediction. Log loss is unbounded: predicting 0.01 for something that happens costs 4.6, and predicting 0 costs infinity. Log loss therefore punishes confident mistakes far more severely.

## Which to use

- **Log loss** is the natural choice for training, because it is smooth and corresponds to maximum likelihood. It is the right score when rare, confident errors are genuinely costly, as in betting, where a 1% probability for a 10% event can be disastrous.
- **Brier score** is easier to interpret and less dominated by a few extreme mistakes. It is common in weather forecasting and medical risk models.

In practice, report both and check that they agree on which model is better.

## Decomposing the Brier score

The Brier score can be split into three parts:

- **Reliability**: how far predictions are from observed frequencies (calibration error). Lower is better.
- **Resolution**: how much the observed frequencies vary across forecast groups (discrimination). Higher is better.
- **Uncertainty**: the base rate's inherent variance, b × (1 − b), which the forecaster cannot change.

Brier = reliability − resolution + uncertainty. This shows how a forecast can improve: get more calibrated, or separate cases better.

## Skill scores

Raw scores depend on the base rate, so it helps to compare with a reference forecast. The **Brier skill score** is 1 − (model Brier ÷ reference Brier), where the reference is often the base rate. A positive skill score means the model beats the reference.

> **Key takeaway:** Brier score and log loss both reward honest probabilities. Log loss punishes confident mistakes much more; the Brier score is bounded and decomposes neatly into calibration and discrimination.

@@ platt-scaling-and-isotonic-regression

When a model's probabilities are miscalibrated, you can often fix them without retraining the model. A calibration step learns a mapping from the model's raw scores to better probabilities, using data the model did not train on. The two most common methods are Platt scaling and isotonic regression.

## The setup

1. Train the base model on the training set.
2. Predict on a separate calibration set (or use out-of-fold predictions from cross-validation).
3. Fit the calibrator to map those predictions to the actual outcomes.
4. At prediction time, pass the base model's output through the calibrator.

Using the training set to fit the calibrator does not work: the model's training predictions are typically more confident and more accurate than its predictions on new data.

## Platt scaling

Platt scaling fits a logistic regression with one input, the model's score s:

`calibrated p = 1 ÷ (1 + exp(−(a × s + b)))`

Only two parameters, a and b, are learned. If the score is itself a probability, it is common to use its log-odds as s. Platt scaling corrects a smooth, S-shaped distortion, such as consistent overconfidence, and needs relatively little data. Its limitation is its rigid shape: if miscalibration is irregular, it cannot follow it.

## Isotonic regression

Isotonic regression fits a step function that is **non-decreasing**: higher model scores never map to lower probabilities. It is fitted with the pool-adjacent-violators algorithm, which merges neighboring groups whenever their observed rates would break the ordering.

Because it can take almost any monotone shape, isotonic regression can correct complex miscalibration. The cost is that it needs more data and can overfit, producing jagged steps when the calibration set is small. A rough rule is to prefer Platt scaling below about a thousand calibration examples and consider isotonic regression above that, but check on held-out data either way.

## Both preserve ranking

Both methods are monotonic, so the order of predictions does not change (isotonic regression may create ties). Ranking metrics such as AUC stay the same or nearly the same; probability metrics such as log loss and Brier score should improve.

## Other options

- **Temperature scaling**: divide a neural network's logits by a single learned temperature before the softmax. It is effectively Platt scaling without the intercept and is popular for deep networks.
- **Beta calibration**: a three-parameter family that handles some shapes Platt scaling cannot.
- **Histogram binning**: replace each prediction with the observed rate in its bin. Simple but coarse.

## Checking the result

Plot the reliability diagram before and after calibration on a **third** set of data, or with nested cross-validation. Compare log loss and Brier score. If the calibrated model is not better on new data, the calibrator has overfit or the base model was already well calibrated.

## When the base rate changes

If the deployment population has a different base rate from the training population, recalibrate on recent data from deployment. Calibrators are cheap to refit, which makes them a practical tool for keeping probabilities honest over time.

> **Key takeaway:** Fit a calibrator on held-out predictions. Platt scaling is simple and data-efficient; isotonic regression is flexible but needs more data. Always confirm the improvement on data neither step has seen.
