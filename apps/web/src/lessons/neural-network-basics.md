@@ neurons-and-activations

Neural networks are built from simple units, loosely inspired by biological neurons. Each unit does a small calculation. Stacked into layers and trained together, millions or billions of these units can model images, speech and language.

## One artificial neuron

A neuron takes several inputs x₁, x₂, … and computes:

1. A **weighted sum**: z = w₁x₁ + w₂x₂ + … + b, where the w values are weights and b is a bias.
2. An **activation**: a = f(z), where f is a non-linear function.

The weights and bias are the parameters learned during training. The output a can feed into other neurons.

## A worked example

Inputs x = (2, 1), weights w = (0.5, −1.0), bias b = 0.3:

- z = 0.5 × 2 + (−1.0) × 1 + 0.3 = 0.3
- With ReLU: a = max(0, 0.3) = 0.3
- With sigmoid: a = 1 ÷ (1 + e^−0.3) ≈ 0.574

## Why activations must be non-linear

Without a non-linear activation, each neuron computes a weighted sum, and a weighted sum of weighted sums is still just a weighted sum. However many layers you stack, the whole network would collapse into a single linear model. Non-linear activations let networks represent curved boundaries and complex interactions.

## Common activation functions

| Function | Formula | Output range | Notes |
|---|---|---|---|
| Sigmoid | 1 ÷ (1 + e^−z) | 0 to 1 | Useful for probabilities at the output; saturates for large inputs |
| Tanh | (e^z − e^−z) ÷ (e^z + e^−z) | −1 to 1 | Zero-centered; also saturates |
| ReLU | max(0, z) | 0 to ∞ | Simple and fast; standard in many hidden layers |
| GELU | z × Φ(z) | about −0.17 to ∞ | Smooth variant used in many transformer models |
| Softmax | e^zᵢ ÷ Σ e^zⱼ | 0 to 1, sums to 1 | Turns a vector of scores into class probabilities |

## Saturation and vanishing gradients

Sigmoid and tanh flatten out for large positive or negative inputs. In those regions their slope is close to zero. During training, gradients are multiplied by these slopes layer after layer, so in deep networks they can shrink toward zero, and early layers stop learning. This is the **vanishing gradient** problem. ReLU's slope is exactly 1 for positive inputs, which is a major reason deep networks became practical.

ReLU has its own issue: a neuron whose input is always negative outputs 0 and has zero gradient, so it may stop learning entirely ("dead ReLU"). Variants such as Leaky ReLU keep a small slope for negative inputs.

## Layers

Neurons are organized into layers:

- An **input layer** holds the features.
- **Hidden layers** transform the data. In a fully connected (dense) layer, every neuron receives every output of the previous layer.
- An **output layer** produces the prediction: one linear unit for regression, a sigmoid for binary classification, a softmax for multi-class.

A layer with n inputs and m neurons has n × m weights plus m biases. Computing a layer is a matrix multiplication followed by the activation, which is why neural networks run so efficiently on GPUs.

## The perceptron

The earliest neural model, the perceptron, used a step activation: output 1 if z > 0, else 0. A single perceptron can only separate classes with a straight line, so it cannot learn XOR. Adding a hidden layer with non-linear activations solves this, which is the core reason multi-layer networks are more powerful.

> **Key takeaway:** A neuron computes a weighted sum and passes it through a non-linear activation. The non-linearity is what lets layers of neurons model complex relationships.

@@ backpropagation

A neural network may have millions of weights. To train it with gradient descent, you need the gradient of the loss with respect to every one of them. Backpropagation is the algorithm that computes all of those gradients efficiently, in roughly the same time as one forward pass.

## Forward pass, backward pass

Training on a batch has two phases:

1. **Forward pass**: feed inputs through the network layer by layer, storing intermediate values, and compute the loss.
2. **Backward pass**: starting from the loss, move backward through the layers, computing how much each value and weight contributed to the loss.

Then the optimizer updates each weight using its gradient.

## The chain rule

Backpropagation is the chain rule from calculus applied systematically. If the loss L depends on an output a, which depends on z, which depends on a weight w, then:

`∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w`

Each layer only needs to know the gradient arriving from the layer above and its own local derivatives. It multiplies them and passes the result down. No layer needs to understand the whole network.

## A worked example

One neuron, input x = 2, weight w = 0.5, no bias, sigmoid activation, squared-error loss, target y = 1.

Forward:

- z = w × x = 1.0
- a = sigmoid(1.0) ≈ 0.731
- L = (a − y)² ≈ 0.072

Backward:

| Quantity | Formula | Value |
|---|---|---|
| ∂L/∂a | 2(a − y) | −0.538 |
| ∂a/∂z | a(1 − a) | 0.197 |
| ∂z/∂w | x | 2 |
| ∂L/∂w | product | ≈ −0.212 |

The gradient is negative, so increasing w lowers the loss. With a learning rate of 0.5, the update is w = 0.5 − 0.5 × (−0.212) ≈ 0.606.

## Why it is efficient

A naive approach would nudge each weight separately and re-run the network to see how the loss changes: one forward pass per weight. Backpropagation reuses intermediate results so that one backward pass gives every gradient at once. This is a form of reverse-mode automatic differentiation.

## Automatic differentiation in practice

Modern frameworks such as PyTorch, JAX and TensorFlow build a record of every operation in the forward pass, then apply backpropagation automatically. You define the model and loss; the framework computes gradients. You rarely write derivatives by hand.

## Memory cost

Backpropagation needs the intermediate values from the forward pass, so training uses much more memory than prediction. For large models this is a key constraint. Techniques such as **gradient checkpointing** trade compute for memory by storing fewer intermediate values and recomputing the rest during the backward pass.

## Gradient problems

Because gradients are products of many factors, they can shrink toward zero (vanishing) or grow very large (exploding) as they move through deep networks. Remedies include ReLU-family activations, careful weight initialization, normalization layers, residual connections that add a layer's input to its output, and gradient clipping.

> **Key takeaway:** Backpropagation applies the chain rule backward through the network to compute every weight's gradient in one pass. Frameworks do it automatically, but its memory cost and gradient behavior shape how large models are built.

@@ depth-and-width

Two of the most basic design choices for a neural network are how many layers it has (depth) and how many units each layer has (width). Both increase capacity, but they do so differently.

## What theory says

The universal approximation theorem states that a network with a single hidden layer and enough units can approximate any continuous function on a bounded input range as closely as you like. That sounds as if width alone is enough. The catch is "enough units": for many functions, a shallow network needs a huge number of units, while a deeper network can represent the same function with far fewer parameters.

## Why depth helps

Deep networks build representations in stages. In an image model, early layers detect edges, middle layers combine edges into textures and parts, and later layers combine parts into objects. Each layer reuses the features computed below it. This compositional structure matches how many real-world signals are organized, and it is far more parameter-efficient than learning every combination directly.

## Why width helps

Wider layers can represent more features at each stage and make optimization easier, because there are more paths for gradients and fewer poor local configurations. Very narrow layers can become bottlenecks that throw away information.

## The practical difficulties of depth

Before around 2015, networks deeper than a couple of dozen layers were hard to train. Gradients vanished or exploded, and adding layers sometimes made even the training error worse. Several developments changed this:

- **Residual connections** add a layer's input directly to its output: output = x + f(x). The network only has to learn the change, and gradients have a direct path backward. Residual networks with over a hundred layers train reliably.
- **Normalization layers** such as batch normalization and layer normalization keep activations in a stable range.
- **Better initialization** sets starting weights so signals neither shrink nor explode.

Modern transformers stack dozens of residual blocks, each combining attention and a feed-forward layer.

## Parameters and compute

For a dense layer of width w following another of width w, the weight count is about w². Doubling width roughly quadruples parameters per layer; doubling depth roughly doubles them. Both raise compute and memory. In practice, model families scale depth and width together.

## Scaling behavior

For many tasks, especially language modeling, performance improves predictably as model size, data and compute increase together. Research on scaling has found that for a fixed compute budget, there is a good balance between model size and the amount of training data. Training a very large model on too little data, or a small model on vast data, wastes compute.

## Choosing a size

| Situation | Guidance |
|---|---|
| Small tabular dataset | Small networks, or boosted trees instead |
| Images, audio, text | Deep architectures designed for the data type |
| Validation loss rising while training loss falls | Model too large for the data: regularize or shrink |
| Both losses high | Model too small or under-trained |

> **Key takeaway:** Depth lets networks build features from features; width gives each stage more capacity. Residual connections and normalization made very deep networks trainable, and good models balance size against available data and compute.

@@ embeddings-as-learned-features

An embedding is a dense vector of numbers that represents an item such as a word, a product, a user or an image. Instead of hand-designing features, a neural network learns these vectors during training so that items used in similar ways end up with similar vectors.

## From one-hot to dense

Suppose a vocabulary has 50,000 words. A one-hot encoding represents each word as a vector of 50,000 numbers, all zero except one. These vectors are huge, and every pair of words is equally different: "cat" is as far from "kitten" as from "carburetor".

An embedding layer instead maps each word to, say, 256 learned numbers. It is a lookup table with one row per word. The rows start random and are adjusted by backpropagation like any other weights. After training, words that appear in similar contexts have similar rows.

## What the dimensions mean

Individual embedding dimensions rarely have a clean meaning. The meaning is in the geometry: distances and directions between vectors. Similarity is usually measured with **cosine similarity**, the cosine of the angle between two vectors, ranging from −1 to 1.

Early word embedding methods showed striking patterns. The vector difference between "king" and "man" is roughly similar to the difference between "queen" and "woman", suggesting that some relationships are encoded as consistent directions. These patterns are approximate and should not be over-interpreted, but they show that embeddings capture structure.

## Where embeddings are used

- **Language models** embed every token, then refine those vectors through many layers into context-dependent representations.
- **Recommendation systems** learn embeddings for users and items so that a user's vector is close to items they are likely to like.
- **Search and retrieval** embed documents and queries into the same space and find documents whose vectors are nearest to the query's.
- **Tabular models** use embeddings for high-cardinality categorical features such as store IDs or zip codes, where one-hot encoding would be huge and sparse.
- **Images and audio** are embedded by networks whose final layers produce a compact vector summarizing the content.

## Learning embeddings

Embeddings can be learned in two main ways:

1. **As part of the task**: the embedding layer trains along with the rest of the model to minimize the task's loss. The vectors encode whatever helps that task.
2. **With a dedicated objective**: models such as contrastive learners are trained so that related pairs (an image and its caption, a query and a relevant document) have close embeddings and unrelated pairs are far apart. These general-purpose embeddings can then be reused.

## Practical considerations

- **Dimension.** More dimensions capture more detail but cost memory and compute. Typical sizes range from dozens to a few thousand.
- **Unseen items.** A new product or word has no learned row. Systems handle this with subword tokens, a shared "unknown" vector or features that compute an embedding from attributes.
- **Bias.** Embeddings learn associations present in their training data, including social stereotypes. Check for this when embeddings drive decisions about people.
- **Drift.** If usage changes, embeddings trained on old data become stale.

> **Key takeaway:** Embeddings replace sparse, hand-made features with dense vectors learned from data. Their geometry encodes similarity, which is why they underpin language models, recommendations and semantic search.
