@@ decision-trees-and-splits

A decision tree predicts by asking a sequence of yes-or-no questions about the features. Each question splits the data into two groups, and each final group, called a leaf, gives a prediction. Trees are easy to read, handle mixed feature types and form the building block of the strongest methods for tabular data.

## How a tree predicts

A small tree for predicting whether a customer cancels a subscription might look like this:

1. Is "months as customer" less than 6?
   - Yes → Is "support tickets last month" at least 3? Yes: 70% cancel. No: 25% cancel.
   - No → Is "monthly price" above 50? Yes: 15% cancel. No: 5% cancel.

To predict for a new customer, start at the top and follow the answers until you reach a leaf.

## How a tree is built

Trees are grown greedily, one split at a time:

1. For every feature and every possible threshold, imagine splitting the data.
2. Measure how much the split improves purity: how much more similar the labels are within each side.
3. Choose the best split, then repeat the process separately on each side.
4. Stop when a limit is reached, such as maximum depth or minimum examples per leaf.

For classification, purity is often measured with **Gini impurity** or **entropy**. For regression, the usual measure is the reduction in squared error. Leaf predictions are the average label (regression) or the class proportions (classification) of the training examples that land there.

## A worked split

Suppose 10 customers, 4 of whom cancelled. Gini impurity is 1 − (0.4² + 0.6²) = 0.48. A split puts 5 customers on the left with 4 cancellations, and 5 on the right with none.

| Group | Cancel rate | Gini |
|---|---|---|
| Left (5) | 0.8 | 1 − (0.64 + 0.04) = 0.32 |
| Right (5) | 0.0 | 0 |
| Weighted average | | 0.16 |

The split cuts impurity from 0.48 to 0.16, a large improvement, so it would be a strong candidate.

## Strengths

- No need to scale features; only the order of values matters for a threshold.
- Naturally captures interactions: a split on one feature followed by a split on another.
- Handles non-linear relationships with step-like approximations.
- Easy to explain when the tree is small.

## Weaknesses

- **Overfitting.** A deep tree can isolate individual training examples in their own leaves, memorizing noise.
- **Instability.** Small changes in the data can change the top split and therefore the whole tree.
- **Coarse predictions.** A tree produces a limited number of distinct outputs, one per leaf, and cannot extrapolate beyond the range of the training labels.

## Controlling complexity

Common limits include maximum depth, minimum examples per leaf, minimum improvement required to split and pruning after growth. These settings trade fit against generalization.

Single trees are rarely the most accurate model. Their real strength appears when many trees are combined, either by averaging them (bagging and random forests) or by adding them in sequence (boosting). The next lessons cover both.

> **Key takeaway:** A decision tree chooses splits that make groups purer, one question at a time. Single trees are readable but unstable; ensembles of trees fix that.

@@ bagging-versus-boosting

Single decision trees are unstable and prone to overfitting. Ensembles combine many trees to get a better model. The two main strategies, bagging and boosting, combine trees in very different ways.

## Bagging

Bagging stands for bootstrap aggregating.

1. Draw a bootstrap sample: pick training examples at random **with replacement**, so some appear several times and others not at all. On average, each sample contains about 63% of the distinct original examples.
2. Train a deep, flexible tree on that sample.
3. Repeat many times, often hundreds.
4. Average the trees' predictions (or take a majority vote for classification).

Each tree overfits in its own way. Averaging cancels much of that noise, reducing variance without increasing bias much.

**Random forests** add one more source of variety: at each split, a tree may only consider a random subset of the features. This stops every tree from splitting on the same dominant feature, making the trees less correlated and the average more effective.

## Boosting

Boosting builds trees in sequence, each one correcting the errors of the ensemble so far.

1. Start with a simple prediction, such as the average label.
2. Compute the errors (more precisely, the gradient of the loss) for every training example.
3. Fit a small tree to predict those errors.
4. Add that tree's predictions, scaled down by a learning rate, to the ensemble.
5. Repeat for hundreds or thousands of rounds.

The trees in boosting are usually shallow, perhaps 3 to 8 levels deep. Each one is a weak learner that adds a small correction. Together they form a highly accurate model. This approach is called **gradient boosting** because each tree follows the gradient of the loss function, like a step of gradient descent in function space.

## Comparing them

| | Bagging / random forest | Gradient boosting |
|---|---|---|
| Trees built | Independently, in parallel | Sequentially |
| Tree depth | Deep | Shallow |
| Main effect | Reduces variance | Reduces bias, step by step |
| Sensitivity to settings | Low; works well with defaults | Higher; learning rate and rounds matter |
| Overfitting risk with more trees | Low | Rises without early stopping |
| Typical accuracy on tabular data | Strong | Often the strongest |

## When to choose which

Random forests are a robust baseline: few settings, hard to break, and they give a useful out-of-bag error estimate from the examples each tree did not see. Gradient boosting usually wins when you have time to tune it and use early stopping on a validation set. Many competition and industry results on structured, tabular data come from gradient-boosted trees, using libraries such as XGBoost, LightGBM and CatBoost.

## A useful intuition

Bagging asks many independent experts and averages their opinions. Boosting builds one expert gradually, each lesson focused on the mistakes from the last.

> **Key takeaway:** Bagging averages many deep, independent trees to cut variance. Boosting adds many shallow trees in sequence to cut bias. Boosting is usually more accurate but needs more care.

@@ how-xgboost-builds-trees

XGBoost is a widely used gradient boosting library. It follows the general boosting recipe but adds a regularized objective and engineering choices that make it fast and accurate. Understanding how it builds each tree explains most of its settings.

## The objective

At each round, XGBoost adds a new tree to the ensemble. It chooses that tree to minimize:

`total loss on training data + regularization penalty on the tree`

The penalty grows with the number of leaves (controlled by `gamma`) and with the size of the leaf values (controlled by `lambda` for L2 and `alpha` for L1). This discourages trees that make large, specific corrections.

## Using first and second derivatives

For each training example, XGBoost computes two numbers from the current predictions:

- **Gradient (g)**: the slope of the loss, showing which direction the prediction should move.
- **Hessian (h)**: the curvature of the loss, showing how confidently to move.

Using both is like taking a Newton step rather than a plain gradient step. It works for any loss with usable second derivatives, which is why XGBoost supports regression, classification, ranking and custom objectives through the same machinery.

## Scoring a split

With g and h summed over the examples in each group, XGBoost computes the best value for a leaf as −G ÷ (H + λ), where G and H are the sums. The improvement from splitting a node into left and right children is:

`gain = ½ × [G_L² ÷ (H_L + λ) + G_R² ÷ (H_R + λ) − (G_L + G_R)² ÷ (H_L + H_R + λ)] − γ`

If the gain is not positive, the split is not worth making. That is how `gamma` acts as a built-in pruning threshold, and how `lambda` shrinks leaf values toward zero.

## Growing the tree

1. Start with all examples in one node.
2. For each feature, sort values (or use precomputed histogram bins) and scan thresholds, computing the gain of each split.
3. Take the best split if its gain exceeds zero.
4. Repeat on the children until `max_depth` is reached or no split helps.
5. Assign leaf values, then multiply them by the learning rate `eta` before adding the tree to the ensemble.

## Missing values

XGBoost learns a default direction for missing values at each split. During training it tries sending missing examples left and right and keeps whichever gives more gain. You do not have to fill missing values first.

## Speed

XGBoost uses several engineering tricks: histogram-based split finding that groups feature values into bins, parallel computation across features, cache-aware data layout and optional GPU training. These make it practical on millions of rows.

## Randomness

Two settings add bagging-like variety to boosting:

- `subsample`: each tree sees a random fraction of rows.
- `colsample_bytree`: each tree sees a random fraction of features.

Values around 0.7 to 0.9 often reduce overfitting.

> **Key takeaway:** XGBoost grows each tree to minimize a loss plus a penalty, using gradients and curvature to score splits. `gamma`, `lambda`, `eta` and sampling settings are all ways to keep each correction small and general.

@@ tuning-depth-learning-rate-and-rounds

Gradient-boosted trees have many settings, but a handful control most of the result. Tuning them in a sensible order saves time and avoids overfitting to the validation set.

## Learning rate and number of rounds

These two settings work together.

- The **learning rate** (`eta` in XGBoost) scales each tree's contribution. Lower values make each correction smaller.
- The **number of rounds** (trees) sets how many corrections are made.

A lower learning rate needs more rounds but usually generalizes better. Halving the learning rate roughly doubles the rounds needed. Common practice is to pick a learning rate such as 0.05 or 0.1, set a large maximum number of rounds, and use **early stopping**: train while monitoring a validation set and stop when the validation score has not improved for, say, 50 rounds. Early stopping chooses the number of rounds for you.

## Tree depth

`max_depth` controls how complex each tree can be. A depth-d tree can capture interactions among up to d features.

- Shallow trees (depth 2–4) are weak learners that add simple corrections. They need more rounds but overfit less.
- Deeper trees (depth 6–10) capture complex interactions quickly but overfit more easily, especially with small datasets.

Depth 4 to 6 is a common starting range. LightGBM grows trees leaf-wise and uses `num_leaves` as the main complexity setting instead.

## Leaf and split constraints

- `min_child_weight` (XGBoost) or `min_data_in_leaf` (LightGBM) prevents leaves built from very few examples. Raising it makes the model more conservative.
- `gamma` requires each split to improve the objective by a minimum amount.
- `lambda` and `alpha` shrink leaf values.

## Sampling

`subsample` and `colsample_bytree` train each tree on a random fraction of rows and columns. Values between 0.6 and 0.9 add helpful randomness.

## A tuning order

1. Fix a moderate learning rate (0.1) and use early stopping.
2. Tune `max_depth` and `min_child_weight` together.
3. Tune `subsample` and `colsample_bytree`.
4. Tune regularization (`lambda`, `alpha`, `gamma`) if overfitting remains.
5. Lower the learning rate (for example to 0.02–0.05), let early stopping pick more rounds, and confirm the validation score improves.

Random search over these ranges usually beats an exhaustive grid for the same time budget. Bayesian optimization tools can be more efficient still.

## Avoid fooling yourself

- Use the right validation scheme. For time-dependent data, early stopping and tuning must use a later period than training.
- Do not report the validation score you tuned on as your final estimate. Keep a separate test set.
- Expect diminishing returns. Good features and correct validation usually matter more than squeezing the last 0.1% from hyperparameters.

## Reading learning curves

Plot training and validation loss against rounds. If validation loss stops improving early while training loss keeps falling, the model is overfitting: reduce depth, increase sampling randomness or add regularization.

> **Key takeaway:** Pick a learning rate, let early stopping choose the rounds, then tune depth and leaf size. Lower the learning rate at the end for a final gain.

@@ feature-importance-and-its-pitfalls

After training a boosted-tree model, it is natural to ask which features matter most. Tree libraries provide importance scores, but those scores are easy to misread. Knowing what each method measures helps you avoid wrong conclusions.

## Built-in importance types

XGBoost reports several types:

- **Weight (split count)**: how many times a feature is used in a split. Features with many distinct values tend to be used often, even when each split adds little.
- **Gain**: the average or total improvement in the objective from splits on the feature. Usually more meaningful than split count.
- **Cover**: how many training examples pass through splits on the feature.

The three can rank features very differently for the same model. Always say which type you are reporting.

## Permutation importance

Permutation importance measures how much a model's score drops when one feature's values are randomly shuffled on a validation set. Shuffling breaks the link between that feature and the label. A large drop means the model relies on the feature for predictions on new data.

It has two advantages: it uses held-out data, and it measures effect on the metric you care about. Its weakness is correlated features. If two features carry the same information, shuffling one leaves the other intact, so both can look unimportant.

## SHAP values

SHAP (SHapley Additive exPlanations) values split each individual prediction into contributions from each feature, based on ideas from cooperative game theory. For tree models, they can be computed exactly and quickly. Averaging the absolute SHAP values across examples gives a global importance ranking, and plotting them shows the direction and shape of each feature's effect.

## Pitfalls

- **Importance is not causation.** A feature can be important because it correlates with the real cause. "Number of support tickets" predicting cancellations does not mean tickets cause cancellations.
- **Correlated features share credit unpredictably.** The model may lean on one of two near-duplicates almost at random. Small changes in data can swap their rankings.
- **High-cardinality bias.** Split-based measures favor features with many unique values, such as IDs or timestamps, which can also signal leakage.
- **Training-set importance can reflect overfitting.** A feature the model used to memorize noise may look important on training data but contribute nothing on validation data.
- **Leakage shows up as importance.** If one feature dominates by a huge margin, check whether it contains information from after the outcome.

## Using importance well

1. Compare at least two methods, such as gain and permutation importance on validation data.
2. Group correlated features and assess them together.
3. Use importance to find bugs and leakage, and to guide feature work.
4. Confirm conclusions by retraining without the feature and measuring the change on validation data.

> **Key takeaway:** Importance scores describe how a model uses features, not how the world works. Prefer validation-based methods, watch for correlated features and treat a suspiciously dominant feature as a possible leak.
