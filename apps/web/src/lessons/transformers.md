@@ tokenization

Language models do not read letters or words directly. They read tokens: chunks of text drawn from a fixed vocabulary. Tokenization is the step that converts raw text into a sequence of token IDs, and back again. It affects cost, context length and some surprising model behaviors.

## What a token is

A token is often a common word, part of a word or a piece of punctuation. In English, a common rule of thumb is that one token is about four characters, or about three-quarters of a word, though this varies by tokenizer and text.

For example, a tokenizer might split:

- "The cat sat." → "The", " cat", " sat", "."
- "Tokenization" → "Token", "ization"
- "unbelievably" → "un", "believ", "ably"

Notice that spaces are often attached to the start of tokens. Exact splits differ between models.

## Why not whole words or single characters

- **Whole-word vocabularies** would need millions of entries to cover names, typos, technical terms and other languages, and still fail on new words.
- **Character-level models** handle anything but produce very long sequences, which makes models slower and attention more expensive.
- **Subword tokens** are a middle ground: common words are single tokens, while rare words are built from smaller pieces. Any text can be represented, and sequences stay reasonably short.

## Byte-pair encoding

A widely used method for building a subword vocabulary is **byte-pair encoding (BPE)**:

1. Start with a vocabulary of individual bytes or characters.
2. Count every adjacent pair of symbols in a large training corpus.
3. Merge the most frequent pair into a new symbol and add it to the vocabulary.
4. Repeat until the vocabulary reaches a target size, often tens of thousands to a few hundred thousand tokens.

Frequent words end up as single tokens; rare words are split. Byte-level BPE starts from raw bytes, so any input, including emoji and unusual characters, can be encoded without an "unknown" token. Related methods include WordPiece and the unigram language model used in SentencePiece.

## Why tokenization matters

- **Cost and limits.** Model pricing and context windows are measured in tokens, not words.
- **Languages.** Tokenizers trained mostly on English often split other languages, especially those with non-Latin scripts, into more tokens per word. The same content can cost more and use more context.
- **Numbers.** Numbers may be split into irregular chunks, which can make arithmetic and digit-level tasks harder.
- **Spelling and counting.** Because the model sees tokens rather than letters, tasks such as counting the letters in a word can be surprisingly error-prone.
- **Code.** Whitespace and indentation handling affects how efficiently code is tokenized.

## Special tokens

Tokenizers also define special tokens that never appear in ordinary text, marking things like the start of a sequence, the end of a sequence, padding, or boundaries between system, user and assistant messages in chat models.

## Practical tips

- Use the model provider's token counting tools to estimate cost and context use rather than counting words.
- Expect token counts to differ between model families, even for identical text.
- When a task depends on individual characters, consider giving the model tools, such as code execution, rather than relying on it to see letters directly.

> **Key takeaway:** Tokenizers turn text into subword units from a fixed vocabulary, usually built with methods like byte-pair encoding. Tokens determine cost and context length, and explain quirks with spelling, numbers and non-English text.

@@ embeddings

After tokenization, each token is just an integer ID. The first layer of a transformer turns each ID into an embedding: a vector of numbers that the rest of the network can work with. These vectors are where a model's representation of meaning begins.

## The embedding matrix

The model has an embedding matrix with one row per token in the vocabulary. If the vocabulary has 100,000 tokens and the model dimension is 4,096, the matrix has 100,000 rows of 4,096 numbers, about 410 million parameters.

Looking up a token's embedding simply selects its row. The values are learned during training along with all other weights.

## Static embeddings become contextual

The input embedding for "bank" is the same whether the sentence is about rivers or money. That is a **static** embedding. As the vector passes through the transformer's layers, attention mixes in information from surrounding tokens. By the later layers, the vector for "bank" in "river bank" is quite different from the one in "bank account". These are **contextual** representations, and they are what make transformers so effective.

## The residual stream

A useful mental model is the **residual stream**. Each token's vector flows up through the network. Every layer reads from the stream, computes something (attention or a feed-forward transformation) and adds its result back. The vector at each position accumulates information layer by layer.

## Geometry and meaning

As with other learned embeddings, similarity is captured by geometry. Tokens used in similar contexts end up with similar vectors. Research into model internals has found that many concepts appear as directions in this space, and that features can sometimes be identified and even adjusted, though representations are complex and many features overlap.

## Output embeddings

At the end of the network, the final vector for each position is converted back into scores over the vocabulary, often by multiplying with an output matrix. Many models **tie** the input and output embedding matrices, using the same weights for both, which saves parameters.

The scores (logits) pass through a softmax to become probabilities for the next token.

## Embeddings for search

Separately from a generator's internal embeddings, **embedding models** are trained to produce one vector for a whole sentence or document. These are used for semantic search and retrieval, where the goal is that related texts have nearby vectors. They are often trained with contrastive objectives on pairs of related texts.

## Practical considerations

- **Dimension.** Larger models use larger embedding dimensions, giving each token a richer representation.
- **Vocabulary size.** A larger vocabulary shortens sequences but enlarges the embedding and output matrices.
- **Rare tokens.** Tokens seen rarely during training have poorly trained embeddings, which can lead to odd behavior when they appear.

> **Key takeaway:** The embedding layer turns token IDs into vectors. Transformer layers then refine them into contextual representations, where the same token takes on different meanings depending on its surroundings.

@@ self-attention

Self-attention is the mechanism at the heart of the transformer. It lets every token in a sequence gather information from every other relevant token, so the model can work out what each word refers to and how the parts of a sentence relate.

## The intuition

In "The animal didn't cross the street because it was too tired", the word "it" should draw information from "animal", not "street". Self-attention lets the representation of "it" look at all the other tokens, decide which are relevant and take a weighted mix of their information.

## Queries, keys and values

For each token, the model computes three vectors by multiplying its current representation by three learned matrices:

- **Query (Q)**: what this token is looking for.
- **Key (K)**: what this token offers to others.
- **Value (V)**: the information this token passes along if attended to.

## The computation

1. **Score.** For each pair of tokens, take the dot product of one token's query with the other's key. Higher scores mean higher relevance.
2. **Scale.** Divide scores by √d, where d is the key dimension. Without scaling, large dot products push the softmax into regions with tiny gradients.
3. **Normalize.** Apply softmax across each row of scores so the weights for each token sum to 1.
4. **Mix.** Each token's output is the weighted sum of all tokens' value vectors.

In matrix form:

`Attention(Q, K, V) = softmax(Q Kᵀ ÷ √d) V`

## A small example

Suppose the query for "it" produces scaled scores of 2.0 against "animal", 0.5 against "street" and 0.0 against "tired". After softmax:

| Token | Score | Weight |
|---|---|---|
| animal | 2.0 | ≈ 0.74 |
| street | 0.5 | ≈ 0.16 |
| tired | 0.0 | ≈ 0.10 |

The output for "it" is mostly the value vector of "animal", with smaller contributions from the others.

## Causal masking

Language models that generate text left to right use **causal** (masked) self-attention. Each token may only attend to itself and earlier tokens. Scores for future positions are set to negative infinity before the softmax, giving them zero weight. This ensures the model cannot cheat by looking at the token it is supposed to predict.

## Why attention works well

- **Direct connections.** Any token can draw on any earlier token in a single step, regardless of distance. Recurrent networks had to pass information step by step, which made long-range dependencies hard to learn.
- **Parallel training.** All positions are computed at once with matrix operations, which suits GPUs well.
- **Learned relevance.** What counts as relevant is learned from data, not hand-coded.

## The cost

Attention compares every token with every other token, so compute and memory for the scores grow with the **square** of the sequence length. Doubling the context length roughly quadruples the attention cost. Optimized implementations such as FlashAttention reduce memory use and speed up computation without changing the result, and many research efforts aim to reduce the quadratic cost further.

> **Key takeaway:** Self-attention lets each token compute relevance scores against other tokens using queries and keys, then take a weighted mix of their values. It connects distant words directly but costs grow with the square of sequence length.

@@ multi-head-attention

A single attention operation computes one set of relevance weights for each token. But language has many kinds of relationships at once: grammar, reference, meaning, position. Multi-head attention runs several attention operations in parallel, so the model can track different relationships simultaneously.

## How it works

1. **Split.** Instead of one large set of query, key and value projections, the model uses h smaller sets, called heads. If the model dimension is 4,096 and there are 32 heads, each head works in a 128-dimensional space.
2. **Attend.** Each head computes its own attention weights and outputs independently.
3. **Concatenate.** The outputs of all heads are joined into one vector.
4. **Project.** A final learned matrix mixes the concatenated outputs back to the model dimension.

The total computation is similar to a single large attention operation, but the model gains several independent ways of deciding what to attend to.

## What heads learn

Studies of trained models have found heads with recognizable roles, for example:

- Heads that attend to the previous token.
- Heads that connect pronouns to the nouns they refer to.
- Heads that track syntactic relations, such as verbs and their subjects.
- **Induction heads**, which find an earlier occurrence of the current token and attend to whatever came after it, helping the model continue repeated patterns and learn from examples in the prompt.

Many heads have no simple interpretation, and some can be removed with little effect, while others are essential.

## Inside a transformer block

Multi-head attention is one half of each transformer block. A typical block:

1. Normalizes the input (layer normalization or a variant such as RMSNorm).
2. Applies multi-head self-attention and adds the result back to the input (a residual connection).
3. Normalizes again.
4. Applies a feed-forward network to each position independently and adds the result back.

Attention moves information **between** positions. The feed-forward network transforms information **within** each position and holds a large share of the model's parameters. Large language models stack dozens of these blocks.

## Memory-saving variants

During text generation, the keys and values for every head must be stored for all previous tokens (the KV cache). With many heads and long contexts, this becomes a large memory cost. Variants reduce it:

| Variant | Key/value heads | Effect |
|---|---|---|
| Multi-head attention (MHA) | One per query head | Full flexibility, largest cache |
| Multi-query attention (MQA) | One shared by all heads | Smallest cache, some quality loss |
| Grouped-query attention (GQA) | One per group of query heads | A balance; widely used in recent models |

With 32 query heads and 8 key/value groups, GQA cuts KV cache size by a factor of 4 compared with standard multi-head attention.

## Why multiple heads help

With one head, the softmax forces each token to distribute a single budget of attention. A token might need to attend strongly to both its grammatical subject and a word it refers back to. Multiple heads let it do both, each in its own subspace, and the output projection combines the results.

> **Key takeaway:** Multi-head attention runs several smaller attention operations in parallel so a model can track different relationships at once. Variants like grouped-query attention share keys and values across heads to save memory during generation.

@@ positional-encoding

Self-attention on its own has no sense of order. If you shuffled the tokens in a sentence, plain attention would compute the same set of relationships, just in a different arrangement. Positional encoding gives the model information about where each token sits in the sequence.

## Why order matters

"The dog bit the man" and "The man bit the dog" contain the same tokens. Only their order distinguishes them. Without positional information, a transformer could not tell them apart.

## Absolute position embeddings

The simplest approach adds a position vector to each token's embedding:

- **Sinusoidal encodings**, used in the original transformer, compute position vectors from sine and cosine functions at different frequencies. Each position gets a unique pattern, and relative offsets correspond to consistent transformations.
- **Learned position embeddings** treat each position as a learnable vector, like token embeddings. They work well up to the maximum length seen in training but cannot represent positions beyond it.

## Relative and rotary methods

Many tasks depend more on how far apart tokens are than on their absolute positions. Modern models therefore often encode **relative** position.

**Rotary position embedding (RoPE)** is widely used in recent large language models. Instead of adding a vector, it rotates pairs of dimensions in the query and key vectors by an angle proportional to the token's position. When two tokens' rotated query and key are compared with a dot product, the result depends on the difference between their positions. Different dimension pairs rotate at different frequencies, letting the model represent both short and long distances.

**ALiBi** (attention with linear biases) takes another approach: it adds a penalty to attention scores that grows linearly with distance, so tokens naturally attend more to nearby tokens.

## Context length extension

Models are trained up to a certain context length. Using them on longer sequences can fail because they encounter position values they never saw. Several techniques extend context length:

- **Position interpolation**: compress positions so a longer sequence maps into the trained range.
- **Frequency adjustments to RoPE**, such as NTK-aware scaling and YaRN, which rescale rotation frequencies to extend range while preserving short-range precision.
- **Continued training** on longer sequences, usually combined with the above.

## Comparing approaches

| Method | Type | Extends beyond training length? |
|---|---|---|
| Sinusoidal | Absolute, fixed | Somewhat, in principle |
| Learned | Absolute, trained | No |
| RoPE | Relative via rotation | With scaling techniques |
| ALiBi | Relative bias | Reasonably well |

## Causal models and implicit position

Interestingly, research has found that decoder-only models with causal masking can infer some positional information even without explicit encodings, because each position sees a different number of earlier tokens. In practice, explicit positional methods still perform better and are standard.

## Long context is more than position

Even with good positional encoding, models may use information in the middle of very long contexts less reliably than information near the beginning or end. Long-context performance depends on training data, attention efficiency and evaluation, not just the position scheme.

> **Key takeaway:** Positional encoding tells a transformer where tokens are. Modern models favor relative methods like rotary embeddings, which can be scaled to extend context length beyond what the model was trained on.
