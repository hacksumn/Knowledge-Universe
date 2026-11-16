@@ voltage-rails-and-tolerances

A circuit board rarely runs on a single voltage. Different components need different supplies, so the board generates several voltage rails from its input power. Knowing what each rail should measure, and how much variation is acceptable, is the first step in diagnosing a board that will not work.

## What a rail is

A rail is a power net held at a defined voltage, such as 12 V, 5 V, 3.3 V, 1.8 V or 1.0 V. A typical board might:

- Accept 12 V or 19 V at its input connector.
- Use switching regulators (buck converters) to step down to 5 V and 3.3 V.
- Use further regulators to create low core voltages, such as 1.0 V for a processor or 1.2 V for memory.

The schematic names each rail, such as `+3V3`, `VCC_CORE` or `PP1V8_S0`.

## Tolerances

Each rail has an acceptable range, usually given as a percentage of nominal. Logic and processors often require something like ±5%, and some core rails are tighter, ±3% or less.

| Rail | Tolerance | Acceptable range |
|---|---|---|
| 5.0 V | ±5% | 4.75–5.25 V |
| 3.3 V | ±5% | 3.135–3.465 V |
| 1.8 V | ±3% | 1.746–1.854 V |
| 1.0 V | ±3% | 0.970–1.030 V |

Check component datasheets for exact limits. Some processor core rails are deliberately adjusted by the processor itself, so their voltage varies with load and operating state.

## Measuring a rail

1. **Find test points.** Use the schematic and board view to find the rail on an accessible point: a test pad, a capacitor terminal or an inductor output.
2. **Reference ground properly.** Put the meter's black lead on a solid ground point near the measurement.
3. **Measure with the board in the expected state.** Many rails are only enabled in certain power states, such as running versus standby.
4. **Compare with nominal and tolerance.**

A digital multimeter shows the average DC voltage. It will not show ripple, noise or brief drops. For those, use an oscilloscope (covered in the signal tracing pathway).

## What readings tell you

| Reading | Possible meanings |
|---|---|
| Correct | Rail is fine; look elsewhere |
| 0 V | Regulator not enabled, no input, regulator failed, or rail shorted to ground |
| Low | Excessive load, short circuit pulling it down, failing regulator, feedback problem |
| High | Regulator feedback fault, failed regulator, or another rail leaking into it |
| Fluctuating | Unstable regulator, intermittent load, or a protection circuit cycling on and off |

## Ripple and noise

Switching regulators produce some ripple at their switching frequency. Datasheets often specify limits, such as tens of millivolts peak-to-peak. Excess ripple, often caused by failed output capacitors, can make digital circuits behave erratically even when the average voltage looks correct.

## Resistance to ground

With the board **unpowered** and capacitors discharged, measuring resistance from each rail to ground helps find shorts. Compare with a known-good board if possible, because normal values vary widely: a large processor rail may legitimately measure only a few ohms or less, while a small logic rail may measure kilohms.

## Keep notes

Record every rail: expected voltage, measured voltage, power state and resistance to ground. A table of measurements makes patterns obvious and prevents repeating work.

> **Key takeaway:** Every board has multiple rails, each with a nominal voltage and tolerance. Measure each rail in the correct power state, compare with spec and with a known-good board, and use resistance to ground to spot shorts.

@@ power-sequencing

Complex chips often need their supply rails to come up in a specific order, with specific timing. If the order is wrong, or a rail fails to come up, the board may refuse to start, start partially or even damage components. Understanding the power sequence turns "the board is dead" into a specific, traceable question.

## Why sequencing matters

- **Internal structures**: some chips can be damaged if an I/O rail is powered before the core rail, or vice versa, because current flows through unintended paths.
- **Reset and initialization**: processors need stable power before they come out of reset.
- **Dependencies**: some regulators are enabled by the "power good" signal of another rail.

## The typical chain

A common pattern:

1. Input power arrives, and an always-on rail powers a small controller (such as an embedded controller or power management IC).
2. The controller asserts an **enable (EN)** signal for the first regulator.
3. That regulator ramps up its rail and asserts its **power good (PG or PGOOD)** signal when the voltage is within tolerance.
4. Power good from one rail enables the next regulator.
5. When all required rails are good, the system releases **reset**, and the processor starts.

The schematic, and often a power sequencing diagram in the design documentation, shows this chain.

## Signals to know

| Signal | Meaning |
|---|---|
| EN / ON | Command to a regulator to turn on |
| PG / PGOOD | Output from a regulator saying its rail is in tolerance |
| RESET / RST# | Holds a chip in reset until power is stable (# often means active low) |
| PWR_OK | Overall power-good indication |
| SLP_S3# and similar | Power state signals in PC-style platforms |

Active-low signals, often marked with #, `_N` or a bar over the name, are asserted when low. Misreading polarity is a common diagnostic mistake.

## Diagnosing a sequencing failure

Work along the chain in order:

1. Is the input voltage present?
2. Is the always-on rail present?
3. Is the first enable signal asserted?
4. Did the first rail come up? Is its power good asserted?
5. Continue to each next step.

The first step where the expected result is missing is where the problem lies. For example:

- **Enable present, rail at 0 V**: the regulator, its input or its output (possibly shorted) is the problem.
- **Rail correct, power good not asserted**: the power good signal may be faulty, its pull-up resistor missing, or the regulator thinks the rail is out of range.
- **Enable never asserted**: look upstream at the controller or the previous power good.

## Timing

Rails must not just come up; they must come up within time windows. Datasheets specify ramp rates and delays between rails. A multimeter cannot see timing, so use a multi-channel oscilloscope: trigger on the first enable and capture several rails and power good signals together. The resulting picture shows the sequence, ramp times and any rail that rises late or collapses.

## Protection behavior

Regulators often shut down on overcurrent, overvoltage or overtemperature. If one rail detects a fault and turns off, its power good drops, and the sequence may restart repeatedly. On a scope this looks like rails rising and falling in a cycle, a strong hint of a short or excessive load downstream.

> **Key takeaway:** Power comes up as a chain of enable, rail and power good signals. Follow the chain in order; the first missing step locates the fault. Use an oscilloscope to see timing and repeated restart cycles.

@@ finding-shorts

A short circuit is an unintended low-resistance path, most often between a supply rail and ground. Shorts pull rails down, trigger protection, heat components and stop boards from starting. Finding which of hundreds of components connected to a rail is shorted is a classic diagnostic challenge.

## Confirming a short

With the board unpowered and capacitors discharged:

1. Measure resistance from the suspect rail to ground.
2. Compare with the same rail on a known-good board, or with typical values for that rail.

A reading of a fraction of an ohm where a good board shows hundreds of ohms is a clear short. Note that large processor and memory rails can legitimately read very low resistance, so comparison matters.

Also check whether the short is **on the rail** or **in the regulator**: sometimes a failed regulator output stage shorts its output to ground.

## Common culprits

- **Ceramic capacitors**: multilayer ceramic capacitors (MLCCs) can crack from mechanical stress or fail internally and short.
- **Semiconductors**: failed MOSFETs, protection diodes or ICs, often after an overvoltage event.
- **Physical damage**: solder bridges, debris, liquid damage and corrosion, or a damaged connector.

## Technique 1: thermal detection

Apply a **current-limited** supply to the shorted rail at a low voltage, no higher than the rail's normal voltage and often lower. The shorted component dissipates power and warms up.

- **Thermal camera**: shows the hot spot directly.
- **Freeze spray or isopropyl alcohol**: apply a light coat over the area; it evaporates first where the board is warmest.
- **Fingertip**: carefully, at low power, can sometimes detect a warm part.

Raise current gradually. Start with a low current limit and increase it until a hot spot appears, without exceeding safe limits for the board.

## Technique 2: voltage drop along the rail

When current flows through a short, copper traces and planes have tiny resistance, so voltage drops slightly along the path toward the short. Using a meter with millivolt resolution and a constant current injected into the rail, measure voltage at different points on the rail relative to ground. The point with the **lowest** voltage is closest to the short.

## Technique 3: isolation

Divide the rail into sections by removing components or links:

- Lift one end of a series resistor, ferrite bead or jumper that feeds part of the rail.
- Re-measure resistance on each side.
- Continue dividing on the side that is still shorted.

This works like a binary search but involves rework, so it is best when other methods do not find the culprit.

## Technique 4: visual inspection

Under magnification, look for burned or discolored components, cracked capacitors, bulging packages, corrosion and solder bridges. Liquid-damaged boards often show residue near the fault.

## Safety

- Always use a current-limited supply; never apply full power to a shorted rail.
- Do not exceed the rail's rated voltage.
- Hot components can burn skin.
- After replacing a component, re-measure resistance before powering the board normally.

## After the fix

A short often has a cause: an overvoltage event, a failing regulator, mechanical stress. Check upstream components, such as the regulator that feeds the rail, before declaring the board repaired.

> **Key takeaway:** Confirm the short by comparing resistance with a good board, then locate it with current-limited heating, millivolt voltage-drop measurements, isolation and inspection. Look for the cause, not just the shorted part.

@@ current-limiting-during-diagnosis

When you power a faulty board, the fault may draw much more current than normal. Without limits, that current can burn traces, destroy components and turn a simple repair into an impossible one. Current limiting restricts how much current can flow, protecting the board and the person working on it.

## The bench power supply

A laboratory bench supply lets you set two limits:

- **Voltage limit**: the maximum voltage the supply will output.
- **Current limit**: the maximum current it will deliver.

The supply operates in one of two modes:

- **Constant voltage (CV)**: the load draws less than the current limit, so the supply holds the set voltage. This is normal operation.
- **Constant current (CC)**: the load tries to draw more than the limit, so the supply lowers its voltage to keep current at the limit. On many supplies, a CC indicator lights up.

If a supply enters CC mode as soon as you connect a board, something is drawing too much current.

## A worked example

A board normally draws about 0.4 A at 12 V when idling. You set the supply to 12 V with a 0.5 A limit.

- If the board draws 0.38 A and stays in CV mode, it behaves normally at idle.
- If the supply immediately switches to CC at 0.5 A with the voltage collapsing to 1.2 V, the board has a fault drawing excessive current. The power being dissipated is only 1.2 V × 0.5 A = 0.6 W, low enough to avoid further damage while you investigate.

Without the limit, a short could draw many amps at full voltage, dissipating tens of watts in a tiny component.

## Choosing limits

1. **Know normal current.** Use documentation, measurements from a good board or the power supply's rating as a guide.
2. **Start low.** Set the current limit somewhat above normal idle current, not at the maximum the board could ever draw.
3. **Raise gradually.** If the board needs more current to start, raise the limit in steps while watching for heat and behavior.

## Reading the current draw

The current a board draws over time is a diagnostic signal:

| Behavior | Possible meaning |
|---|---|
| Near zero | No power path: blown fuse, open input protection, dead controller |
| Small and steady | Standby rails only; the power-on sequence is not starting |
| Jumps then falls to a small value | Sequence starts but stops; a later rail or check fails |
| Cycles up and down repeatedly | Protection is shutting down and restarting, often due to a downstream short |
| Hits the limit immediately | Short or heavy fault on the input side or an always-on rail |

Experienced technicians learn the normal current pattern for boards they repair often, and can recognize many faults from it alone.

## Injecting power into a single rail

To locate a short on a specific rail, disconnect the rail's regulator or work on an unpowered board, then connect the bench supply directly to that rail and ground:

- Set voltage at or below the rail's normal voltage.
- Set a low current limit and increase slowly.
- Use thermal methods to find the hot spot.

Never inject more than the rail's rated voltage; components on that rail may be damaged.

## Other protective tools

- **Series resistors or lamps** limit current when no adjustable supply is available.
- **Fuses** protect against sustained faults but react too slowly to protect sensitive parts.
- **Isolation transformers** protect technicians when working on mains-powered equipment, which carries additional hazards and requires training.

> **Key takeaway:** Power faulty boards from a current-limited supply set just above normal draw. Constant-current mode signals excess load, and the current pattern over time tells you a lot about where the fault is.
