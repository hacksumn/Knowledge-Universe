@@ anatomy-of-a-gpu-server

A GPU server is built around accelerators. CPUs, memory, storage and networking all exist mainly to keep the GPUs supplied with data and connected to each other. Understanding the parts explains why these servers are so power-hungry and why their design differs from a traditional server.

## The main components

- **GPUs (accelerators).** Training-class servers commonly hold 8 GPUs. Each GPU has thousands of cores optimized for the matrix arithmetic at the heart of neural networks, plus its own high-bandwidth memory (HBM) stacked next to the processor.
- **GPU-to-GPU interconnect.** A high-speed link inside the server, such as NVLink connected through NVSwitch chips in many NVIDIA systems, lets GPUs exchange data much faster than through the regular system bus.
- **CPUs.** Usually two server CPUs that run the operating system, prepare data and manage the GPUs.
- **System memory.** Large amounts of DRAM for data loading and staging.
- **PCIe switches.** Connect GPUs, network cards and storage to the CPUs.
- **Network interface cards (NICs).** Often one high-speed NIC per GPU for the cluster network, plus separate NICs for storage and management.
- **Local storage.** NVMe drives for caching datasets and checkpoints.
- **Power supplies and cooling.** Multiple redundant power supplies, and either powerful fans or liquid cold plates.

## Why memory bandwidth matters

GPU compute has grown faster than the ability to feed it data. High-bandwidth memory provides terabytes per second of bandwidth per GPU, but many workloads, especially generating text from large language models, are still limited by how fast weights and data can be read from memory rather than by raw arithmetic. GPU memory capacity also limits how large a model, or how large a batch, fits on each device.

## Three levels of communication

| Level | Typical link | Relative speed |
|---|---|---|
| Inside a GPU | HBM to cores | Fastest |
| Between GPUs in a server | NVLink or similar | Very fast |
| Between servers | InfiniBand or Ethernet (RDMA) | Fast, but slower than in-server links |

Distributed training is designed around this hierarchy: the most communication-heavy work is kept inside a server, and less frequent exchanges cross the network.

## Power and heat

A modern 8-GPU training server can draw on the order of 10 kW or more, several times a typical CPU server. Most of that power goes to the GPUs. The heat is concentrated in a few chips, which is why air-cooled GPU servers need large, fast fans, and why the newest high-power accelerators increasingly use direct-to-chip liquid cooling.

## Training versus inference servers

- **Training servers** maximize GPU-to-GPU and server-to-server bandwidth, because training splits a model and its data across many GPUs that must synchronize constantly.
- **Inference servers** may use fewer or smaller GPUs per server and simpler networking. They prioritize memory capacity, cost per request and latency.

## Rack-scale systems

Some newer designs treat an entire rack as one system, linking dozens of GPUs with a shared high-speed fabric across multiple trays. These racks can draw well over 100 kW and require liquid cooling and specialized power delivery.

## Reliability

With many components per server and thousands of servers per cluster, failures are routine: a GPU with memory errors, a failed NIC, a bad cable. Large training jobs save checkpoints regularly so they can restart from recent progress after a failure.

> **Key takeaway:** A GPU server exists to feed and connect its accelerators. Memory bandwidth, the GPU-to-GPU interconnect and network bandwidth shape performance, and concentrated power drives its cooling needs.

@@ rack-power-density

Rack power density is the amount of power a single rack draws, usually measured in kilowatts. It has become one of the most important numbers in data center design, because accelerator-based computing has pushed it far beyond what older facilities were built for.

## How density has changed

Traditional enterprise racks have commonly drawn something in the range of 5 to 10 kW. Racks filled with GPU training servers routinely need several times that, and rack-scale accelerator systems can exceed 100 kW. A facility designed around an average of 8 kW per rack cannot simply host 40 kW racks in the same footprint.

## A worked example

A rack holds four 8-GPU servers. Each server draws about 10 kW at full load.

| Item | Power |
|---|---|
| 4 servers × 10 kW | 40 kW |
| Top-of-rack switches and management | ~1 kW |
| **Rack total** | **~41 kW** |

In a hall built for 10 kW racks, this one rack consumes the power and cooling budget of four ordinary racks.

## Power delivery challenges

- **More circuits or bigger circuits.** A 41 kW rack needs multiple high-capacity feeds. At 415 V three-phase, a 60 A circuit derated to 48 A delivers about 415 × 48 × 1.732 ≈ 34.5 kW. Two such feeds on A and B sides cannot carry the full 41 kW on one side alone, so even more capacity, or a higher-voltage design, is needed to preserve redundancy.
- **Higher voltages.** Distributing at higher voltages lowers current, reducing cable size and losses.
- **Busway instead of cable whips.** Overhead busway with plug-in tap boxes makes it easier to deliver large amounts of power flexibly.
- **Upstream capacity.** Every rack upgrade affects PDUs, UPS systems, switchgear and the utility service.

## Cooling challenges

With air cooling, heat removal requires airflow proportional to power. A 40 kW rack needs roughly four times the airflow of a 10 kW rack, which creates very hot exhaust, high fan noise and difficult containment. Rear-door heat exchangers can extend air cooling, but at the highest densities direct-to-chip liquid cooling becomes the practical choice.

## Structural and space issues

- **Weight.** Dense racks with liquid cooling hardware can weigh well over a tonne, exceeding the rating of some raised floors.
- **Cable volume.** High-bandwidth clusters use many network cables per rack.
- **Stranded space.** In older halls, power or cooling may run out long before floor space does, leaving empty positions.

## Planning for density

Designers usually plan in zones: some areas for high-density accelerator racks with liquid cooling, others for conventional racks. Key questions:

1. What density per rack, and for how many racks?
2. Is liquid cooling infrastructure (facility water, CDUs) available or planned?
3. Does each rack's A/B design survive the loss of one feed at full load?
4. How much headroom exists upstream in UPS, switchgear and utility capacity?

## Measure, do not assume

Nameplate ratings on servers are typically higher than real draw. Metered data from rack PDUs gives actual loads, though GPU training jobs can run near full power for weeks. Plan from measured peak loads with sensible margin.

> **Key takeaway:** GPU racks can draw several times, or even ten times, the power of traditional racks. That changes power distribution, cooling, floor loading and redundancy, so density must be planned zone by zone.

@@ cluster-interconnects

Training a large model uses hundreds or thousands of GPUs working as one machine. They must constantly exchange data, such as gradients during training. The network connecting them, the cluster interconnect, often determines how efficiently the GPUs are used.

## Why the network matters

In data-parallel training, each GPU computes gradients on its share of the data, then all GPUs combine (all-reduce) those gradients before the next step. If the network is slow, GPUs sit idle waiting. Model-parallel methods, which split a model's layers or tensors across GPUs, communicate even more often. A cluster with fast GPUs and a slow network wastes most of its compute.

## Scale-up and scale-out

- **Scale-up** links GPUs within a server or rack with very high bandwidth, such as NVLink domains. The most communication-intensive parallelism, such as splitting individual layers across GPUs, stays inside this domain.
- **Scale-out** connects servers across the cluster through network switches. Data parallelism and pipeline parallelism typically use this layer.

## Technologies

- **InfiniBand** is a high-performance network widely used in AI and supercomputing. It offers low latency, remote direct memory access (RDMA) and features such as in-network reductions.
- **Ethernet with RDMA (RoCE)** brings RDMA to Ethernet. With careful configuration of congestion control and lossless behavior, it is used in many large AI clusters, and industry efforts are extending Ethernet specifically for AI workloads.

Link speeds of 400 Gb/s and 800 Gb/s per port are common in new clusters, often with one network port per GPU.

## Topology

The arrangement of switches matters as much as link speed.

- **Fat-tree (Clos) topologies** use layers of switches (leaf, spine and sometimes a third tier) so that any GPU can reach any other with full bandwidth. A non-blocking design provides the same total bandwidth at every layer.
- **Rail-optimized designs** connect GPU number 1 in every server to the same set of leaf switches, GPU number 2 to another set and so on. Collective operations that pair GPUs with the same index then travel through fewer switch hops.
- **Oversubscription** means upper layers have less bandwidth than lower ones. It saves cost but can slow training traffic that crosses the cluster.

## Collective communication

Libraries such as NCCL implement collective operations (all-reduce, all-gather, reduce-scatter) and choose algorithms like rings or trees based on the topology. Training frameworks overlap communication with computation, sending gradients for one layer while computing the next, to hide network time.

## Separate networks

Large clusters usually run several networks:

- The **compute fabric** for GPU-to-GPU traffic.
- A **storage network** for reading datasets and writing checkpoints.
- A **management network** for monitoring and control.

Keeping them separate prevents storage bursts from disrupting training traffic.

## Reliability and operations

Thousands of optical links mean frequent failures from transceivers and cables. A single bad link can slow an entire synchronized training job. Operators monitor link errors closely, test new cables before use and replace degraded links quickly.

> **Key takeaway:** Large training jobs are only as fast as their slowest communication. Fast scale-up links inside servers, a well-designed scale-out fabric and topology-aware collective libraries keep GPUs busy.

@@ scheduling-training-and-inference

A GPU cluster is expensive, so how its time is shared matters. Training and inference workloads have very different needs, and the scheduler has to balance them to keep utilization high without hurting users.

## Two kinds of workload

| | Training | Inference |
|---|---|---|
| Duration | Hours to months | Milliseconds to seconds per request |
| Resource shape | Many GPUs at once, tightly connected | Few GPUs per model replica |
| Priority | Throughput: finish the job | Latency: respond quickly |
| Load pattern | Steady while running | Varies with user traffic, often daily cycles |
| Tolerance for interruption | Can restart from checkpoints | Requests must be served now |

## Batch schedulers for training

Training jobs are typically run by batch schedulers such as Slurm, or Kubernetes with batch extensions. Key features:

- **Gang scheduling.** A distributed job needs all its GPUs at once. Starting half the job and waiting for the rest wastes the half that started.
- **Topology awareness.** Placing a job's GPUs in the same server, rack or network segment reduces communication time.
- **Queues and priorities.** Teams submit jobs to queues with quotas and priorities.
- **Preemption.** Higher-priority jobs can interrupt lower-priority ones, which resume from their last checkpoint.

## Serving systems for inference

Inference runs as long-lived services. Serving systems handle:

- **Autoscaling.** Adding or removing model replicas as traffic changes.
- **Batching.** Grouping requests to use the GPU efficiently. Continuous batching adds and removes requests as each one finishes, rather than waiting for a whole batch.
- **Routing.** Sending requests to replicas with available capacity, or with cached context for that user or prompt.
- **Model loading.** Large models take time to load into GPU memory, so replicas are kept warm and scaling is planned ahead of demand.

## Sharing a cluster

Running both workloads on one cluster raises utilization:

- **Fill gaps.** When inference traffic drops, for example overnight, idle GPUs can run preemptible training or batch jobs.
- **Reserve headroom.** Keep enough capacity for inference peaks, and preempt background work when traffic rises.
- **Isolate.** Prevent training traffic from disrupting inference latency on shared networks or storage.

## Partitioning GPUs

A single GPU can be too large for a small model. Options include:

- **Hardware partitioning** (such as Multi-Instance GPU on some NVIDIA GPUs), which splits one GPU into isolated slices with their own memory.
- **Time-slicing**, where several workloads take turns on one GPU, with less isolation.

## Measuring utilization

"GPU utilization" can be misleading. A GPU can report 100% busy while doing little useful arithmetic, for example when it is waiting on memory. Better metrics include:

- **Model FLOPs utilization (MFU)**: useful arithmetic performed as a share of the hardware's peak.
- **Goodput**: useful work completed, after subtracting time lost to failures, restarts and waiting.
- **Queue wait time**: how long jobs wait to start.

## Failure handling

At cluster scale, hardware fails often. Schedulers should detect unhealthy nodes, drain them, and restart affected jobs from checkpoints automatically. The frequency of checkpoints is a trade-off: more frequent saves lose less progress per failure but spend more time writing.

> **Key takeaway:** Training needs gangs of well-connected GPUs for long periods; inference needs fast, elastic replicas. Good scheduling packs both onto shared hardware, protects latency and measures useful work, not just busy GPUs.
