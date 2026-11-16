@@ read-a-one-line-diagram

A one-line diagram (also called a single-line diagram) is the map of a facility's electrical system. Real power systems are three-phase, with three or four conductors per circuit, but the diagram draws each circuit as a single line. That simplification is the point: it lets you see the whole path from the utility to the rack on one page.

## Read it top to bottom

Most one-lines are drawn with sources at the top and loads at the bottom, so power flows down the page.

1. **Utility service.** Usually shown as an incoming line with a label such as "Utility 13.8 kV" and the utility's metering.
2. **Transformers.** Drawn as two overlapping circles (or two coils). The label gives the rating in kVA or MVA and the voltages, for example "2500 kVA, 13.8 kV – 480 V".
3. **Switchgear and breakers.** Breakers appear as small squares or a pair of contacts. A breaker labeled N.O. is normally open; N.C. is normally closed.
4. **Generators.** A circle with a "G", feeding into the system through its own breaker.
5. **Automatic transfer switches (ATS).** A symbol with two inputs and one output, choosing between utility and generator.
6. **UPS.** Usually a box labeled UPS, often with a battery symbol and a bypass path drawn around it.
7. **Distribution.** Panelboards, PDUs and remote power panels, then the IT loads at the bottom.

## Trace one path

Pick a single rack and follow its feed upward. Write down every device you pass through: the PDU, the UPS output board, the UPS, the switchboard, the transformer, the ATS and so on. Then ask what happens if each one fails. If the rack has a second power supply, trace that feed too and see where the two paths join. The point where two "independent" paths meet is often the weakest point in the design.

## What else is on the page

Good one-lines carry a lot of detail in their labels:

- **Ratings.** Breaker frame and trip settings in amps, bus ratings, transformer impedance.
- **Normal states.** Which breakers are open or closed in normal operation. Tie breakers between two buses are usually drawn open.
- **Interlocks.** Notes such as "Kirk key interlock" that prevent two sources from being closed onto the same bus at once.
- **Equipment IDs.** Tags such as "UPS-A1" that match the labels on the real equipment.

## Common mistakes

Do not assume the drawing matches the building. One-lines go out of date when equipment is added or moved. Before any switching, operations teams verify the drawing against the field. Also remember that a one-line hides phase details. It will not tell you whether a load is balanced across phases, which matters for capacity planning.

> **Key takeaway:** A one-line diagram is a top-to-bottom map of sources, conversion, protection and distribution. Learn to trace a single load back to the utility and you can read almost any one-line.

@@ utility-service-and-switchgear

Every data center's power starts with the utility. Large sites usually take service at medium voltage, commonly in the range of about 4 kV to 35 kV in North America (12.47 kV and 13.8 kV are typical). Very large campuses may build their own substation and take service at transmission voltages above that. Higher voltage means lower current for the same power, so cables and losses stay manageable over long runs.

## The service entrance

Where the utility hands over to the facility there is a point of demarcation, metering, and a main protective device. Many sites request two utility feeds, ideally from different substations or at least different circuits. Two feeds help only if they really fail independently; two lines from the same substation share that substation as a single point of failure.

## What switchgear does

Switchgear is the assembly of breakers, switches, buses, protective relays and metering that controls how power moves through the site. It has three jobs:

1. **Switch.** Open and close circuits so operators can route power and take equipment out of service.
2. **Protect.** Detect faults such as short circuits and overloads and open the right breaker quickly.
3. **Isolate.** Create a visible or verifiable break so people can work on de-energized equipment safely.

Medium-voltage switchgear typically uses vacuum or SF6 breakers controlled by protective relays. Relays measure current and voltage through instrument transformers and send a trip signal when conditions exceed their settings. Low-voltage switchgear and switchboards (480 V or 415 V in many data centers) often use breakers with built-in electronic trip units.

## Selective coordination

When a fault occurs, the goal is for only the breaker closest to the fault to open. If a short circuit in one PDU trips the main breaker, the whole building goes dark for a problem that affected one row. Engineers achieve selective coordination by setting time–current curves so that downstream devices trip faster than upstream ones for the same fault. This is documented in a coordination study and should be revisited when equipment changes.

## Main-tie-main

A common arrangement is main-tie-main: two buses, each fed by its own source through a main breaker, joined by a normally open tie breaker. If one source is lost, the tie can close so the other source carries both buses, provided it has the capacity. Interlocks prevent both mains and the tie from being closed at the same time, which would parallel two sources that may not be synchronized.

## Arc flash

Switchgear stores a lot of energy. An arc flash, an electrical explosion caused by a fault through air, can cause severe burns at a distance. Equipment carries labels with the incident energy and required protective equipment, and many procedures require the gear to be de-energized before work.

> **Key takeaway:** Switchgear switches, protects and isolates. Good designs pair independent sources with coordinated protection so a fault takes out as little as possible.

@@ ups-topologies

An uninterruptible power supply (UPS) keeps critical loads running through disturbances in the incoming power, and bridges the gap until generators take over. Not all UPS designs do this the same way. The three main topologies trade efficiency against how completely they isolate the load from the utility.

## Standby (offline)

In a standby UPS, the load normally runs directly from the utility. When the UPS detects a failure, a switch transfers the load to the inverter, which draws from the batteries. Transfer takes a few milliseconds. Standby units are cheap and efficient but provide little conditioning, so they are mostly found protecting single desktops rather than data centers.

## Line-interactive

A line-interactive UPS also passes utility power through, but adds an autotransformer that can boost or trim voltage without using the batteries. That handles sags and swells while saving battery cycles. On a full outage, it still transfers to the inverter. These units are common in small server rooms and network closets.

## Double-conversion (online)

In a double-conversion UPS, the rectifier converts incoming AC to DC, which charges the batteries and feeds the inverter, and the inverter creates clean AC for the load all the time. Because the load always runs from the inverter, there is no transfer when the utility fails. The batteries simply start supplying the DC bus. The output is isolated from most utility disturbances, including frequency variation.

The cost is efficiency. Converting power twice loses energy as heat. Modern large double-conversion units are typically in the mid-90s percent efficient at good load levels. Many offer an "eco mode" that runs the load on bypass and switches to the inverter when a problem appears. That improves efficiency but reintroduces a short transfer and less isolation.

## Bypass paths

Double-conversion UPS units include a static bypass that can move the load directly to the input source in milliseconds if the inverter fails or is overloaded. A separate maintenance bypass lets technicians isolate the UPS completely for service. On a one-line diagram, follow both bypass paths. They are an important part of how the system behaves when something goes wrong.

## Energy storage

The UPS needs stored energy to ride through until generators are online:

- **Valve-regulated lead-acid (VRLA)** batteries are well understood and inexpensive, but heavy and sensitive to temperature.
- **Lithium-ion** batteries are lighter, last more cycles and tolerate warmer rooms, at higher cost and with different fire-safety requirements.
- **Flywheels** store energy in a spinning mass. They provide seconds rather than minutes of runtime, which can be enough if generators start reliably.

Runtime is a design choice. Many sites size batteries for around 5 to 10 minutes at full load, enough for generators to start and stabilize with margin.

> **Key takeaway:** Double-conversion UPS designs keep the load on the inverter at all times, giving the best isolation at some efficiency cost. Know your topology, your bypass paths and your runtime.

@@ generators-and-transfer-switches

Batteries buy minutes; generators provide hours or days. In most data centers, diesel generators are the long-duration backup for the utility, with automatic transfer switches deciding which source feeds the load.

## The transfer sequence

When the utility fails, a typical sequence runs like this:

1. **Detect.** Monitoring sees voltage or frequency outside limits. A short delay filters out momentary blips.
2. **Start.** Generators receive a start signal and crank. The UPS batteries carry the critical load meanwhile.
3. **Stabilize.** The generator reaches rated voltage and frequency. Many standards and designs target about 10 seconds from start signal to ready.
4. **Transfer.** The ATS moves the load to the generator, often in steps so the engine is not hit with the full load at once.
5. **Retransfer.** When the utility returns and stays stable for a set period, the ATS transfers back and the generator runs unloaded to cool down before stopping.

## Transfer switch types

- **Open transition (break-before-make).** The load is disconnected from one source before connecting to the other. Simple and safe, but it causes a brief interruption on retransfer. The UPS hides this from IT equipment.
- **Closed transition (make-before-break).** The two sources are briefly paralleled when synchronized, avoiding even a short interruption. Utilities usually limit how long paralleling may last.
- **Delayed transition.** The switch pauses in a neutral position to let motor loads spin down before connecting to the new source.

## Paralleled generators

Large sites often parallel several generators onto a common bus through paralleling switchgear. This allows N+1 redundancy across the fleet and lets load be shed or added as engines come online. The controls must synchronize each generator's voltage, frequency and phase before closing it onto the bus.

## Fuel and runtime

Runtime depends on on-site fuel storage. Many facilities store enough diesel for 24 to 48 hours at full load and hold fuel delivery contracts for longer events. Diesel degrades over time, so fuel polishing and testing are part of maintenance. Some sites use natural gas or bi-fuel engines for longer runtime, at the cost of depending on a gas supply.

## Testing

A generator that has not been tested is a hope, not a plan. Common practice includes:

- Regular no-load runs to exercise the engine.
- Periodic load-bank tests to confirm the generator can carry rated load.
- Integrated tests that cut the utility and confirm the whole sequence works, ideally under real load.

Diesel engines that run lightly loaded for long periods can suffer "wet stacking", where unburned fuel builds up in the exhaust. Load-bank testing helps prevent it.

> **Key takeaway:** The UPS covers the seconds; generators and transfer switches cover the hours. The handoff only works if detection, start, transfer and fuel are designed and tested together.

@@ pdus-and-branch-circuits

After switchgear and UPS, power still has to reach individual servers. That last stretch is the job of power distribution units (PDUs), panelboards and rack-level power strips.

## Floor PDUs and remote power panels

A floor-standing PDU usually contains a transformer that steps the UPS output down to the utilization voltage, plus panelboards with branch breakers. In North America, a common pattern is 480 V from the UPS stepped down to 208/120 V. Many newer designs distribute 415/240 V instead, which lets servers run at 240 V without the extra transformer stage.

Remote power panels (RPPs) are panelboards without a transformer, placed closer to the racks. They take feeds from a PDU and provide more breaker positions near the load.

## Branch circuits

Each rack is usually fed by one or more branch circuits: a breaker in the panel, a cable or whip, and a connector at the rack. Common rack feeds include 208 V three-phase circuits at 30 A or 60 A, or 415 V three-phase circuits for denser racks.

In North America, the National Electrical Code limits continuous loads to 80% of a breaker's rating unless the breaker is rated for 100% continuous use. A 30 A breaker is planned for 24 A of continuous load.

## Rack PDUs

Inside the rack, rack PDUs (power strips) distribute power to individual devices. They range from basic strips to intelligent units that meter power per outlet, report to monitoring systems and allow remote switching. Metered rack PDUs are one of the best sources of real load data in a facility.

## Calculating rack capacity

For a three-phase circuit, power is voltage × current × √3 × power factor. A 208 V, 30 A three-phase circuit planned at 80% gives roughly:

| Step | Value |
|---|---|
| Usable current at 80% | 24 A |
| 208 V × 24 A × 1.732 | ≈ 8.6 kVA |
| At a power factor near 1.0 | ≈ 8.6 kW |

A rack with two such feeds in an A/B configuration does **not** have 17 kW of usable capacity. If one feed fails, the other must carry the whole load, so the rack should stay under the capacity of a single feed.

## A and B feeds

Most servers have two power supplies. Connecting them to separate A and B feeds, ideally from different UPS systems, means a failure on one side does not take the server down. The danger is quiet overload: each side runs at 60% normally and looks fine, then one side fails and the other goes to 120% and trips.

## Phase balance

On three-phase circuits, loads should be spread across phases. Heavy imbalance wastes capacity and can overload one phase while others are lightly used. Per-phase metering on rack PDUs makes imbalance visible.

> **Key takeaway:** Plan branch circuits at 80% of breaker rating, and plan each A/B pair so that one side can carry the whole rack alone.

@@ redundancy-n-n-1-and-2n

Redundancy describes how many extra components a system has beyond what the load needs. The notation is short, but each level means something specific about which failures the facility can survive.

## The notation

- **N** is the capacity needed to carry the load. If the IT load needs four UPS modules, N = 4.
- **N+1** adds one spare component. With five modules where four are needed, any one can fail or be taken out for maintenance.
- **N+2** adds two spares, so the system can lose one component during maintenance on another.
- **2N** is two complete, independent systems, each able to carry the full load on its own.
- **2(N+1)** is two independent systems, each with its own spare.

## What each one survives

| Design | Survives one component failure | Survives a whole-path failure | Maintain without losing redundancy |
|---|---|---|---|
| N | No | No | No |
| N+1 | Yes | No | No |
| 2N | Yes | Yes | Yes |
| 2(N+1) | Yes | Yes | Yes, with margin |

The important difference is between components and paths. N+1 UPS modules on a single output bus survive a module failure, but the shared bus, switchboard and cables are still single points of failure. 2N gives two separate paths, so an A-side switchboard fault leaves the B side running.

## Distributed redundancy

Full 2N is expensive: half the equipment is idle most of the time. Distributed redundant designs, sometimes called "block redundant" or "catcher" systems, spread the spare capacity. For example, in a 4-to-make-3 design, four UPS systems each carry about 75% of their capacity, and if one fails its load is picked up by the others. These designs reach high availability with less idle equipment, but they are harder to operate because every load assignment matters.

## Concurrent maintainability and fault tolerance

Two widely used ideas describe what redundancy is for:

- **Concurrently maintainable**: any component can be taken out for planned maintenance without shutting down the IT load.
- **Fault tolerant**: the facility can withstand any single unplanned failure without affecting the IT load.

Industry tier frameworks build on these ideas, but definitions differ between standards, so always check which one a design claims to meet.

## Redundancy is not reliability by itself

Extra equipment helps only if it works when needed. Common failures that defeat redundancy include:

- Loads that have grown until the "spare" capacity is already in use.
- Both server power supplies plugged into the same side.
- Shared controls, fuel systems or cooling that sit behind both power paths.
- Human error during switching, which causes a large share of real outages.

> **Key takeaway:** N+1 protects against a failed component; 2N protects against a failed path. Check the one-line diagram to see where the paths actually join, and check the load to make sure the spare capacity is still spare.
