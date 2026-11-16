@@ features-labels-and-examples

Supervised learning is learning from examples where the right answer is known. You show a model many inputs paired with outputs, and it learns a rule that maps one to the other. Once trained, it can apply that rule to new inputs where the answer is not yet known.

## The three pieces

- **Example**: one observation, such as one house sale, one email or one basketball game. In a table, each example is a row.
- **Features**: the input values that describe an example. For a house: floor area, number of bedrooms, neighborhood, year built. Features are the columns the model can use.
- **Label (or target)**: the value you want to predict. For a house, the sale price. For an email, "spam" or "not spam".

A training set is a collection of examples with both features and labels. The model's job is to find a function f such that f(features) ≈ label.

## Regression and classification

- **Regression** predicts a number: a price, a temperature, a point margin.
- **Classification** predicts a category: spam or not, which of ten digits, win or loss. Most classifiers can output a probability for each class, not just the single best guess.

## Representing features

Models work with numbers, so features often need to be encoded:

- **Numeric** features, such as area, can be used as they are, though some models benefit from scaling them to similar ranges.
- **Categorical** features, such as neighborhood, are often one-hot encoded: one column per category, with a 1 in the matching column and 0 elsewhere.
- **Text, images and audio** need richer representations, such as word counts or learned embeddings.
- **Missing values** need a plan: fill them with a typical value, add an "is missing" flag, or use a model that handles them natively.

## What makes a good feature

A good feature is related to the label, available at prediction time and measured consistently. The second point is the one people most often get wrong. If you predict whether a customer will cancel next month, "number of support calls last week" is fine; "account closed date" is not, because it is only known after the outcome.

## Labels are data too

Labels can be noisy or biased. Human annotators disagree, sensors fail and definitions change. A model trained on inconsistent labels learns the inconsistency. Spending time on clear labeling guidelines and checking a sample of labels often helps more than switching to a fancier model.

## How much data

There is no fixed rule. Simple relationships can be learned from hundreds of examples; complex ones like recognizing objects in photos need many thousands or more. More important than raw count is coverage: the training set should include the kinds of examples the model will see in use. A model trained only on summer data may fail in winter.

## A small example

| Area (m²) | Bedrooms | Distance to center (km) | Price (label) |
|---|---|---|---|
| 85 | 2 | 3.1 | 310,000 |
| 140 | 4 | 7.8 | 420,000 |
| 60 | 1 | 1.2 | 285,000 |

Each row is an example. The first three columns are features; the last is the label the model learns to predict.

> **Key takeaway:** Supervised learning maps features to labels using examples. Most of the work is choosing features that are available at prediction time and labels that are consistent.

@@ loss-functions

A model needs a way to measure how wrong its predictions are. That measure is the loss function. Training is the process of adjusting the model to make the loss as small as possible, so the choice of loss determines what "good" means for your model.

## Losses for regression

- **Mean squared error (MSE)**: average of (prediction − actual)². Squaring makes large errors count much more than small ones. A model trained with MSE predicts the conditional mean.
- **Mean absolute error (MAE)**: average of |prediction − actual|. Large errors count proportionally, so MAE is less sensitive to outliers. A model trained with MAE predicts the conditional median.
- **Huber loss**: behaves like MSE for small errors and like MAE for large ones, a compromise when data has occasional outliers.

## A worked comparison

Three predictions with errors of 1, 2 and 10:

| Loss | Calculation | Value |
|---|---|---|
| MAE | (1 + 2 + 10) ÷ 3 | 4.33 |
| MSE | (1 + 4 + 100) ÷ 3 | 35.0 |

Under MSE, the single error of 10 dominates. If that point is a data error, MSE will distort the model to fit it. If large errors are genuinely costly, MSE is exactly what you want.

## Losses for classification

- **Log loss (cross-entropy)**: for a predicted probability p of the true class, the loss is −log(p). Predicting 0.9 for the right answer costs 0.105; predicting 0.1 costs 2.303. Confident wrong answers are punished hard. Log loss is the standard training loss for classifiers that output probabilities, including logistic regression and neural networks.
- **Hinge loss**: used by support vector machines. It cares about whether examples are on the correct side of the boundary with a margin, not about calibrated probabilities.
- **0–1 loss**: simply counts mistakes. It matches accuracy but is not smooth, so models cannot be trained on it directly with gradients.

## Training loss versus business metric

The loss you train on and the metric you report are often different. You might train with log loss and report accuracy, or train with MSE and report the percentage of forecasts within 5% of actual. That is fine, but check that improving the loss actually improves the metric you care about.

Sometimes the costs are asymmetric. Missing a fraudulent transaction may cost far more than flagging a legitimate one. You can reflect this with class weights in the loss, or by choosing a decision threshold after training.

## Regularization terms

Many training objectives add a penalty to the loss, such as the sum of squared weights. This does not measure prediction error; it discourages overly complex models. The total objective is loss plus penalty, and a later lesson covers why that helps.

## Proper scoring rules

For probability forecasts, log loss and the Brier score are proper scoring rules: you get the best expected score by reporting your true belief. That property is why they are used to train and evaluate forecasting models.

> **Key takeaway:** The loss function defines what the model is trying to get right. MSE chases means and punishes outliers; MAE chases medians; log loss rewards honest probabilities.

@@ gradient-descent

Once you have a model with adjustable parameters and a loss function, you need a way to find the parameters that make the loss small. For most modern models, that method is gradient descent.

## The idea

Imagine the loss as a landscape where every position is a setting of the parameters and the height is the loss. You want to reach a low point. The gradient is the direction of steepest increase at your current position. Step in the opposite direction, and the loss goes down.

Each update is:

`new parameters = old parameters − learning rate × gradient`

Repeat many times and the parameters move toward a minimum.

## A one-parameter example

Fit y = w × x to a single point (x = 2, y = 6) using squared error. The loss is (2w − 6)², and its gradient with respect to w is 4 × (2w − 6).

| Step | w | Gradient | New w (learning rate 0.05) |
|---|---|---|---|
| 1 | 0.0 | −24.0 | 1.20 |
| 2 | 1.20 | −14.4 | 1.92 |
| 3 | 1.92 | −8.64 | 2.35 |

Each step moves w closer to 3, the value that fits exactly. The steps shrink as the gradient shrinks near the minimum.

## The learning rate

The learning rate controls step size.

- **Too small**: training is slow and may stop before reaching a good solution.
- **Too large**: steps overshoot the minimum, the loss bounces around or grows, and training diverges.

In the example, a learning rate of 0.25 would jump from w = 0 to w = 6, past the answer, and then oscillate between 0 and 6 forever; anything larger makes it diverge. Practitioners often use schedules that start larger and shrink over time, or warm up from a small value.

## Stochastic and mini-batch gradient descent

Computing the exact gradient requires going through the entire training set. For large datasets that is too slow per step. **Stochastic gradient descent (SGD)** estimates the gradient from a small random batch of examples, often 32 to a few thousand. Each step is noisy but cheap, and the noise can even help escape poor regions. One pass through the whole dataset is called an epoch.

## Better optimizers

Plain SGD can be slow on landscapes that are steep in one direction and flat in another. Common improvements:

- **Momentum** keeps a running average of past gradients, smoothing the path and speeding up progress along consistent directions.
- **Adam** adapts the step size for each parameter based on the history of its gradients. It is a common default for training neural networks.

## Local minima

For simple models such as linear and logistic regression, the loss landscape is convex, so gradient descent reaches the global minimum. Neural network losses are not convex. In practice, large networks still train well, and the solutions found by SGD-based optimizers generalize well enough that this is rarely the main problem.

> **Key takeaway:** Gradient descent repeatedly steps against the gradient of the loss. The learning rate is the most important setting: too small is slow, too large diverges.

@@ overfitting-and-regularization

A model that fits its training data perfectly has not necessarily learned anything useful. It may have memorized noise. This is overfitting, and avoiding it is one of the central problems in machine learning.

## What overfitting looks like

Imagine fitting points that follow a gentle curve plus random noise. A straight line misses the curve; that is **underfitting**, or high bias. A very flexible curve that passes through every point captures the noise as well as the pattern; that is **overfitting**, or high variance. It will predict new points badly.

The symptom is a gap between training and validation performance. Training error keeps falling as the model becomes more complex, while validation error falls at first and then rises.

## Why it happens

- The model has more flexibility than the data can support: many parameters, deep trees, high-degree polynomials.
- The dataset is small or noisy.
- Training runs for too long, letting the model fit fine details of the training set.
- Many features are irrelevant, giving the model chances to find accidental patterns.

## Regularization

Regularization adds a preference for simpler models. Common forms:

- **L2 regularization (ridge, weight decay)** adds a penalty proportional to the sum of squared weights. It shrinks all weights toward zero, reducing the model's sensitivity to any single feature.
- **L1 regularization (lasso)** adds a penalty proportional to the sum of absolute weights. It tends to set some weights exactly to zero, effectively selecting features.
- **Early stopping** monitors validation loss during training and stops when it starts to rise.
- **Dropout** randomly disables a fraction of units in a neural network during training, preventing the network from relying on any one pathway.
- **Tree limits** such as maximum depth or minimum examples per leaf constrain decision trees and boosted ensembles.
- **Data augmentation** creates modified copies of training examples, such as flipped images, so the model sees more variety.

The strength of regularization is a hyperparameter. Too little and the model overfits; too much and it underfits. You choose it using validation data.

## The bias–variance trade-off

Prediction error on new data can be thought of as three parts: bias (systematic error from wrong assumptions), variance (sensitivity to the particular training sample) and irreducible noise. More flexible models lower bias and raise variance. Regularization deliberately accepts a little bias to cut a lot of variance.

## More data helps

The most reliable cure for overfitting is more relevant data. With more examples, accidental patterns become less likely and the model can support more complexity. When more data is unavailable, simpler models and stronger regularization are the alternatives.

## A quick diagnostic

| Training error | Validation error | Likely problem | Try |
|---|---|---|---|
| High | High | Underfitting | More features, more flexible model, less regularization |
| Low | High | Overfitting | More data, more regularization, simpler model |
| Low | Low (similar) | Good fit | Check on a final test set |

> **Key takeaway:** Overfitting is fitting noise. Watch the gap between training and validation error, and use regularization to trade a little bias for a large reduction in variance.

@@ train-validation-and-test-splits

If you evaluate a model on the same data it learned from, the score tells you how well it memorized, not how well it will perform on new data. To get honest estimates, split your data into separate sets with separate jobs.

## The three sets

- **Training set**: used to fit the model's parameters.
- **Validation set**: used to make decisions about the model, such as choosing hyperparameters, features or when to stop training.
- **Test set**: used once, at the end, to estimate how the final model will perform on new data.

A typical split for a moderate dataset is around 70% training, 15% validation and 15% test, but the right proportions depend on how much data you have.

## Why the test set must stay untouched

Every time you look at a score and change something in response, you fit your decisions to that data. If you tune on the test set, it stops being a fair estimate. After dozens of rounds of "try something, check test score", the test score becomes optimistic, even though no model was ever trained on it directly. Keep the test set locked away until you are done.

## Cross-validation

With small datasets, a single validation set may be too small to give stable scores. **k-fold cross-validation** splits the non-test data into k folds, trains k times with each fold held out once, and averages the scores. Five or ten folds are common. It uses data more efficiently at the cost of training several models.

## Splits must match reality

A random split assumes examples are independent and that future data looks like past data. Often that is false:

- **Time series**: if you predict the future, test on later data than you train on. Random splits let the model learn from the future. A later pathway covers time-aware validation in detail.
- **Groups**: if several rows come from the same patient, user or game, keep all of them in the same split. Otherwise the model can recognize the group rather than learn the pattern.
- **Duplicates**: near-identical rows across splits inflate scores. Remove them before splitting.

## Stratification

For classification with rare classes, a random split may put very few positive examples in the validation set. Stratified splitting keeps the class proportions the same in every set.

## Preprocessing inside the split

Steps such as scaling, filling missing values or selecting features must be fit on the training data only, then applied to validation and test. If you compute the mean of a feature using all the data before splitting, a little information from the test set leaks into training.

## After testing

Once you have a test score, you can retrain the chosen model on training plus validation data, and sometimes the test data too, before deploying. The test score remains your estimate of performance.

> **Key takeaway:** Train on one set, decide on another, and estimate on a third you never tune against. Make sure the split reflects how the model will be used, especially for time and grouped data.
