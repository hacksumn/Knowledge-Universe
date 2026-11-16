@@ autoregressive-decoding

Large language models generate text one token at a time. Each new token is chosen based on everything before it, then appended to the input, and the process repeats. This is autoregressive decoding, and its step-by-step nature shapes the speed, cost and behavior of every LLM application.

## The loop

1. **Prefill.** The model processes the whole prompt in one parallel pass and produces a probability distribution over the vocabulary for the next token.
2. **Choose a token** from that distribution.
3. **Append** the token to the sequence.
4. **Decode step.** Run the model again to get the distribution for the following token.
5. **Repeat** until the model produces an end-of-sequence token or reaches a maximum length.

## Prefill versus decode

These two phases behave very differently:

- **Prefill** processes many tokens at once. It is limited mainly by raw compute and is fast per token.
- **Decode** produces one token per step for each sequence. Each step must read the model's weights from memory, so it is usually limited by memory bandwidth rather than arithmetic.

This is why users see a short delay before the first token (**time to first token**, dominated by prefill) followed by a steady stream (**inter-token latency**, dominated by decode).

## Choosing the next token

The model outputs logits, which become probabilities via softmax. How you pick from them changes the output:

| Method | How it works | Effect |
|---|---|---|
| Greedy | Always pick the most probable token | Deterministic; can be repetitive |
| Temperature | Divide logits by T before softmax | T < 1 sharpens, T > 1 flattens the distribution |
| Top-k | Sample only from the k most probable tokens | Removes the long tail |
| Top-p (nucleus) | Sample from the smallest set whose probabilities sum to p | Adapts the candidate set to the model's confidence |

Lower temperature suits factual answers and code; higher temperature gives more varied writing. Settings vary by model and task.

## A worked example of temperature

Logits for three candidate tokens: 2.0, 1.0, 0.0.

| Temperature | Probabilities |
|---|---|
| 1.0 | 0.67, 0.24, 0.09 |
| 0.5 | 0.87, 0.12, 0.02 |
| 2.0 | 0.51, 0.31, 0.19 |

Lower temperature concentrates probability on the top token; higher temperature spreads it out.

## Consequences of token-by-token generation

- **Output length drives latency.** Generating 1,000 tokens takes roughly ten times as long as 100.
- **No going back.** Once a token is generated, later tokens build on it. An early mistake can carry through the rest of the answer.
- **Stop conditions.** Applications set maximum output lengths and stop sequences to control when generation ends.
- **Streaming.** Because tokens arrive one by one, applications can display them as they are produced.

## Speeding up decoding

- **KV caching** avoids recomputing past tokens (next lesson).
- **Batching** serves many sequences in each decode step.
- **Speculative decoding** uses a small, fast draft model to propose several tokens, then the large model checks them in one pass, accepting those it agrees with. With correct acceptance rules, the output distribution matches what the large model alone would produce, while generating multiple tokens per large-model step.

> **Key takeaway:** LLMs generate one token at a time: a parallel prefill, then memory-bound decode steps. Sampling settings shape the output, and output length largely determines latency.

@@ the-kv-cache

During generation, every new token attends to all previous tokens. Without care, each step would recompute the keys and values of the entire sequence from scratch. The KV cache stores those keys and values once, so each new step only computes them for the newest token.

## Why caching works

In causal attention, a token's key and value vectors depend only on that token and earlier tokens. Once computed, they never change as new tokens are added. So:

1. During prefill, compute keys and values for every prompt token in every layer, and store them.
2. At each decode step, compute the query, key and value only for the new token.
3. Attend from the new token's query to all cached keys, mix the cached values, and append the new key and value to the cache.

This turns the per-step work for past tokens from recomputation into a memory read.

## How big the cache gets

The cache stores a key and a value vector for every token, in every layer, for every key/value head:

`cache bytes = 2 × layers × KV heads × head dimension × tokens × bytes per number`

## A worked example

A model with 32 layers, 8 key/value heads of dimension 128, using 16-bit numbers (2 bytes):

- Per token: 2 × 32 × 8 × 128 × 2 = 131,072 bytes, about 128 KiB.
- For a 32,768-token (32K) context: 4 GiB.
- For 16 such sequences served at once: 64 GiB.

With standard multi-head attention using 32 key/value heads instead of 8, every figure would be four times larger. This is why grouped-query attention is so widely used.

## The cache drives serving limits

GPU memory must hold the model weights **and** the KV cache for every active sequence. Longer contexts and more simultaneous users both consume cache memory. In practice, the cache often determines how many requests a server can handle at once.

## Managing cache memory

- **Paged attention** (as in vLLM) stores the cache in fixed-size blocks, like pages in an operating system. This avoids reserving large contiguous regions for each request and greatly reduces waste.
- **Cache quantization** stores keys and values at 8-bit or lower precision, cutting memory with modest quality impact.
- **Eviction and windowing**: some models use sliding-window attention for some layers, keeping only recent tokens in the cache.
- **Offloading** moves inactive parts of the cache to CPU memory or storage.

## Prefix caching

Many requests share the same beginning: a long system prompt, tool definitions or a document. **Prefix caching** reuses the stored KV cache for that shared prefix across requests, skipping prefill for it. This reduces time to first token and cost. Model providers expose this as **prompt caching**, typically billing cached input tokens at a substantial discount.

To benefit, keep stable content at the start of prompts and put variable content, such as the user's latest message, at the end.

## Cost of reading the cache

Each decode step reads the entire cache for that sequence. For long contexts, this memory traffic can rival or exceed reading the model weights, making long-context generation slower per token.

> **Key takeaway:** The KV cache stores past keys and values so each new token is cheap to compute. Its size grows with layers, heads, context length and users, and it often sets the limit on how many requests a GPU can serve.

@@ quantization

Model weights are normally trained and stored as 16-bit or 32-bit floating-point numbers. Quantization stores them, and sometimes the activations and KV cache, with fewer bits. Smaller numbers mean less memory, less data to move and often faster inference, at some risk to quality.

## Why it matters for LLMs

A model with 70 billion parameters needs about:

| Precision | Bytes per parameter | Weight memory |
|---|---|---|
| FP32 | 4 | ~280 GB |
| FP16 / BF16 | 2 | ~140 GB |
| INT8 / FP8 | 1 | ~70 GB |
| 4-bit | 0.5 | ~35 GB |

(These are weights only; runtime also needs memory for activations and the KV cache.)

Because text generation is usually limited by memory bandwidth, halving the bytes read per step can substantially speed up decoding. Quantization can also let a model fit on fewer or smaller GPUs.

## How quantization works

The basic idea maps a range of real values to a small set of integers:

1. Choose a **scale** (and sometimes a zero point) for a group of numbers.
2. Store each number as a rounded integer: q = round(x ÷ scale).
3. Recover an approximation when needed: x ≈ q × scale.

For example, with 8-bit signed integers and a scale of 0.01, the value 0.537 is stored as 54 and recovered as 0.54, an error of 0.003.

## Granularity

Using one scale for a whole layer is crude, because a few large values force a large scale and waste precision for everything else. Finer granularity helps:

- **Per-channel**: one scale per output channel.
- **Per-group**: one scale per small block, such as 32 or 128 weights. Common in 4-bit formats.

## Outliers

LLM activations contain occasional very large values in certain dimensions. These outliers make activations harder to quantize than weights. Methods address this in different ways: keeping outlier dimensions at higher precision, or mathematically shifting difficulty from activations into weights before quantizing.

## Approaches

- **Post-training quantization (PTQ)**: quantize a trained model, often using a small calibration dataset to choose scales. Methods such as GPTQ and AWQ choose rounding or scaling carefully to minimize the effect on outputs. Fast and widely used.
- **Quantization-aware training (QAT)**: simulate quantization during training or fine-tuning so the model learns to tolerate it. More work, better results at very low bit widths.
- **Weight-only quantization**: compress weights to 4 or 8 bits but compute in 16-bit. Mainly saves memory and bandwidth.
- **Weight and activation quantization**: also quantize activations, such as FP8 on hardware that supports it, to speed up computation.

## Quality trade-offs

8-bit quantization is often close to lossless for large models. 4-bit methods typically lose a little quality, and the loss tends to be more noticeable on smaller models, long reasoning tasks and specialized domains. Always evaluate the quantized model on your own tasks rather than relying on general benchmarks.

## Quantizing the KV cache

Storing keys and values in 8 bits or fewer cuts cache memory, allowing longer contexts or more simultaneous users. The quality impact depends on the method and should be checked, especially for long-context tasks.

> **Key takeaway:** Quantization stores numbers with fewer bits to cut memory and speed up memory-bound inference. 8-bit is often nearly free; 4-bit saves more but needs careful methods and evaluation on your own tasks.

@@ batching-and-throughput

A single request uses a GPU inefficiently during text generation. Each decode step reads all the model's weights to produce just one token. Batching processes many requests together, so one read of the weights produces one token for each of them. It is the main way to make LLM serving affordable.

## Why batching helps

In decode, the cost of reading the weights is the same whether the batch has 1 sequence or 32. With 32 sequences, the GPU does 32 times the useful arithmetic for nearly the same memory traffic. Throughput, measured in tokens per second across all users, rises dramatically.

The trade-off is that each step takes somewhat longer as batches grow, and memory for the KV cache grows with each added sequence.

## Throughput versus latency

| Goal | Metric | Favors |
|---|---|---|
| Serve many users cheaply | Total tokens per second | Large batches |
| Fast responses | Time to first token, per-token latency | Small batches, fewer queued requests |

Every serving system chooses a point on this trade-off. Interactive chat needs low latency. Offline jobs, such as summarizing a million documents, can use large batches and accept slower individual responses.

## Static batching

The simplest approach waits for a group of requests, runs them together and returns results when all finish. Its problem is that requests produce different numbers of tokens. A short answer finishes early, but its slot stays idle until the longest answer in the batch completes.

## Continuous batching

Continuous (in-flight) batching schedules at the level of individual decode steps:

- When a sequence finishes, it leaves the batch immediately.
- New requests join at the next step.

GPU slots stay busy, and short requests are not held back by long ones. Combined with paged KV cache memory, continuous batching is a standard feature of modern serving engines such as vLLM, TensorRT-LLM and SGLang.

## Handling prefill

Prefill for a long prompt is a large burst of compute that can stall decode steps for other users. Techniques include:

- **Chunked prefill**: split long prompts into chunks interleaved with decode steps.
- **Disaggregated serving**: run prefill and decode on separate GPU pools, each tuned for its workload, transferring the KV cache between them.

## Scaling beyond one GPU

- **Tensor parallelism** splits each layer across several GPUs, useful when a model does not fit on one GPU or needs lower latency.
- **Pipeline parallelism** places different layers on different GPUs.
- **Replicas** run independent copies of the model behind a load balancer to add capacity.

## Measuring a serving setup

Track these together:

- Throughput (tokens per second, requests per second).
- Time to first token at the median and 95th or 99th percentile.
- Inter-token latency.
- GPU memory use and KV cache occupancy.
- Cost per million tokens.

Load-test with realistic prompt and output lengths. Results with short synthetic prompts can be very misleading.

## Batch APIs

Hosted model providers often offer batch interfaces for requests that can wait, sometimes hours, in exchange for lower prices. They allow providers to schedule work into large, efficient batches.

> **Key takeaway:** Batching lets one read of the model weights serve many sequences, multiplying throughput. Continuous batching and paged KV memory keep GPUs busy, while latency targets set how large batches can be.
