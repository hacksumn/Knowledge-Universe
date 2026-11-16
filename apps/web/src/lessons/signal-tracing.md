@@ oscilloscope-setup-and-probing

A multimeter shows a single average number. An oscilloscope shows how a voltage changes over time: edges, ripple, glitches, timing and noise. For diagnosing digital and power circuits, it is the most important instrument after the meter, and a poor setup can produce convincing but wrong measurements.

## Basic controls

- **Vertical scale (volts per division)**: how many volts each grid division represents.
- **Horizontal scale (time per division)**: how much time each division represents.
- **Trigger**: the condition that tells the scope when to capture, such as a rising edge crossing 1.5 V. A stable trigger turns a jittering display into a steady waveform.
- **Coupling**: DC coupling shows the full signal, including its DC level; AC coupling removes the DC level, useful for looking at small ripple on a large rail.
- **Acquisition mode**: normal, peak detect (catches narrow glitches), averaging (reduces random noise for repetitive signals) and single-shot (captures one event).

## Bandwidth and sample rate

A scope's bandwidth must be well above the frequencies in the signal. Fast digital edges contain high-frequency content: a common rule of thumb is that a signal with rise time tᵣ has significant content up to about 0.35 ÷ tᵣ. A 1 ns edge needs roughly 350 MHz of system bandwidth, and preferably more for accurate edge measurements. The sample rate should be several times the bandwidth.

## Probes

The probe is part of the measurement:

- **10× passive probes** are the general-purpose standard. They load the circuit less than 1× probes and have higher bandwidth. The scope must be set to match the probe's attenuation.
- **Compensation**: adjust the probe's trimmer using the scope's calibration square-wave output until the square wave has flat tops, with no overshoot or rounding.
- **Active and differential probes** measure fast or floating signals with less loading.
- **Current probes** measure current without breaking the circuit.

## Grounding

The long ground lead with an alligator clip forms a loop that picks up noise and adds inductance, causing ringing on fast edges that is not really there. For fast signals and ripple measurements, use the short ground spring that fits on the probe tip, touching ground right next to the measurement point.

## A common hazard

On most bench oscilloscopes, the probe ground clip is connected to mains earth through the power cord. Clipping the ground lead onto a point that is not at earth potential, such as some nodes on mains-powered equipment, creates a short through the scope. Use differential probes or proper isolation for such measurements, and never defeat the scope's safety ground.

## Measuring ripple on a rail

1. Use a 10× probe with a short ground spring.
2. Select AC coupling and a sensitive vertical scale, such as 10–20 mV per division.
3. Enable the scope's bandwidth limit (often 20 MHz) if measuring according to a specification that requires it.
4. Probe across an output capacitor of the regulator.
5. Measure peak-to-peak ripple and compare with the datasheet or design limits.

## Measuring digital signals

- Set the trigger on the signal edge of interest.
- Check high and low voltage levels, rise and fall times, overshoot and ringing.
- Use multiple channels to compare timing between signals, such as a clock and data line.

## Sanity checks

Before trusting an unusual measurement, check the probe setting, the ground connection, coupling mode and bandwidth limit. Measure a known-good signal to confirm the setup.

> **Key takeaway:** Set the scale, trigger and coupling deliberately, compensate 10× probes, use short ground connections for fast signals and ripple, and remember that the probe ground is usually tied to earth.

@@ following-a-signal-path

Signal tracing is the method of following a signal through a circuit, stage by stage, to find where it stops behaving as expected. It turns a whole-board fault into a question about one stage.

## The core idea

Every circuit has a path: an input, a series of stages and an output. If the output is wrong but the input is right, the fault lies somewhere along the path. Measure at points along the way until you find the first point where the signal is wrong. The fault is between that point and the last good one.

## Preparation

- **Get the schematic** and, if available, a board view that shows where each net and component is on the physical board.
- **Identify the path** for the signal you care about: from source (a connector, an oscillator, a sensor or a processor pin) to destination.
- **Know what to expect** at each point: voltage level, frequency, waveform shape, timing relative to other signals.
- **Have a known-good reference**, if possible: a working board or documented measurements.

## Work in order

You can trace from the input forward or from the output backward:

- **Forward**: start where the signal is known to be good and move toward the output.
- **Backward**: start at the failing output and move toward the source.

When a path is long, **split it in half**: measure at the middle. If the signal is good there, the fault is in the second half; if bad, in the first. Repeat. This finds the faulty stage in far fewer measurements than checking every point.

## A worked example

A board's display stays blank. The display needs a clock signal from a timing controller.

1. **Display connector**: no clock present. The output is bad.
2. **Timing controller output pin**: clock present, correct frequency and level. The source is good.
3. **Between them**: the clock passes through a series resistor and a level shifter.
4. **Input of the level shifter**: clock present.
5. **Output of the level shifter**: nothing.
6. **Level shifter power pin**: 0 V. Its supply rail is missing.

The fault is not in the signal chain itself but in the power to one stage. Tracing then switches to that power rail.

## Stages to check at each point

At each component in the path, consider:

- **Power**: is its supply present and correct?
- **Enables and control**: is it enabled, selected, out of reset?
- **Inputs**: are the input signals correct?
- **Outputs**: are the outputs correct given the inputs?

If inputs, power and control are correct but the output is wrong, the component itself is likely faulty. If any input or supply is wrong, follow that instead.

## Analog signals

For analog paths, such as audio or sensor signals, inject a known test signal from a signal generator at the input and follow its amplitude and shape through each stage. Compare gain at each stage with the design.

## Common pitfalls

- **Assuming a missing signal means a failed source**: the source may be disabled by a missing enable or reset.
- **Loading the circuit**: probing high-impedance or high-frequency nodes can change their behavior.
- **Ignoring bidirectional or open-drain signals**: on shared lines, one faulty device can hold the line low for everyone.

> **Key takeaway:** Follow the signal stage by stage, splitting long paths in half, until you find the first bad point. At each stage, check power, control, inputs and outputs before blaming the component.

@@ logic-levels-and-timing

Digital signals represent 1s and 0s as voltages, but real voltages are never perfectly at the supply or ground. Digital circuits work only if signals are clearly high or low when they are sampled. Checking logic levels and timing finds faults that a simple "signal present" check misses.

## Logic level thresholds

Each logic family defines thresholds:

- **V_OH (min)**: the lowest voltage a driver guarantees for a high output.
- **V_OL (max)**: the highest voltage a driver guarantees for a low output.
- **V_IH (min)**: the lowest voltage a receiver guarantees to read as high.
- **V_IL (max)**: the highest voltage a receiver guarantees to read as low.

Between V_IL and V_IH is an undefined region. A signal sitting there may be read as either value, or cause the receiver to draw extra current.

## Typical 3.3 V CMOS values

| Parameter | Typical value |
|---|---|
| V_IH (min) | 2.0 V |
| V_IL (max) | 0.8 V |
| V_OH (min) | about 2.4 V or higher |
| V_OL (max) | about 0.4 V or lower |

Exact values vary by device; always check the datasheet. Lower-voltage families, such as 1.8 V and 1.2 V logic, have proportionally smaller thresholds and margins.

## Noise margin

The noise margin is the difference between what a driver guarantees and what a receiver needs. For a high level: V_OH (min) − V_IH (min). Using the values above, 2.4 − 2.0 = 0.4 V. Noise, ground bounce or a voltage drop larger than this can cause errors.

## Common level problems

- **Weak high**: a signal that should be 3.3 V measures 2.1 V. Causes include a weak or failing driver, excessive load, a missing pull-up, or two devices fighting.
- **Stuck low or high**: a line never changes. A shorted device on the line, a missing clock or a device holding it in reset are common causes.
- **Mid-level voltage**: a line sits around half the supply. Often it is floating (nothing driving it) or two outputs are driving opposite levels.
- **Mismatched families**: a 3.3 V device driving a 1.8 V input without level shifting, or a 1.8 V output that cannot reach a 3.3 V device's V_IH.

## Open-drain signals

Lines such as I²C and many interrupt and reset lines use **open-drain** outputs: devices can only pull the line low, and a pull-up resistor pulls it high. If the pull-up is missing, the line never goes high properly. If any device on the line is faulty and stuck low, the whole bus stops.

## Timing

Even correct voltage levels fail if timing is wrong:

- **Setup time**: data must be stable for a minimum time **before** the clock edge.
- **Hold time**: data must stay stable for a minimum time **after** the clock edge.
- **Rise and fall times**: slow edges, often caused by too much capacitance or weak pull-ups, can violate timing and cause multiple transitions to be detected.
- **Clock quality**: wrong frequency, excessive jitter or ringing on the clock affects everything that depends on it.

Use multiple oscilloscope channels or a logic analyzer to view clock and data together. A logic analyzer captures many digital channels and can decode protocols such as I²C, SPI and UART, which makes communication faults much easier to see.

## Reset and enable signals

Before suspecting a chip, check its reset and enable inputs. A chip held in reset looks dead. Confirm polarity: an active-low reset (RST#) must be **high** for normal operation.

> **Key takeaway:** A signal must be clearly high or low at the right time. Compare levels with V_IH and V_IL, look for weak, floating or fighting outputs, check pull-ups on open-drain lines and verify setup, hold and edge quality.

@@ fault-isolation-strategy

Fault isolation is the discipline that ties every diagnostic technique together. Instead of measuring randomly or replacing parts on a hunch, you form hypotheses, test them with the cheapest informative measurements and narrow the fault step by step until one component or connection explains all the symptoms.

## Start with information

1. **Symptoms**: what exactly happens? No power at all, power but no display, intermittent resets, overheating?
2. **History**: what happened before the failure? A drop, liquid exposure, a power surge, a firmware update, previous repairs?
3. **Visual inspection**: look for burned parts, corrosion, cracked components, damaged connectors and missing parts.

History and inspection often point straight to the fault and cost almost nothing.

## Form hypotheses

List plausible causes that would explain the symptoms. For "board draws power but nothing starts", hypotheses might include: a missing rail, a stuck reset, a missing clock, corrupted firmware or a failed processor.

Rank them by:

- **Likelihood**: what fails most often in this design or this kind of board?
- **Cost to test**: a quick voltage measurement versus removing a chip.

Test likely and cheap hypotheses first.

## Divide and conquer

Each test should split the remaining possibilities. A measurement that rules out half of the board is worth more than one that checks a single part. Common dividing points:

- **Power before signals**: confirm all rails are correct before looking at digital behavior.
- **Sequence order**: follow enable and power good signals in order.
- **Middle of a signal path**: measure halfway, then halve again.
- **Subsystems**: disconnect or disable optional sections to see if the fault remains.

## Compare with known-good

A working board of the same model is the most valuable diagnostic tool available. Compare voltages, resistances to ground, waveforms and current draw. Differences point directly to the fault. Without one, use schematics, datasheets and documented measurements.

## Use controlled changes

- Change **one thing at a time**, and measure the effect.
- Prefer reversible tests: lifting a pin or removing a jumper before replacing parts.
- When substituting a part, use one known to be good.

## Explain all the symptoms

A good diagnosis explains every observation. If a shorted capacitor explains the collapsed rail but not the overheating regulator, there may be a second fault, or the regulator may have failed because of the short. Fix the root cause and the consequences.

## Keep a log

Record each test: what you measured, where, the result and what it ruled in or out. Logs prevent repeated measurements, help when work is interrupted and build knowledge for future repairs of the same model.

## A sample sequence

| Step | Test | Result | Conclusion |
|---|---|---|---|
| 1 | Visual inspection | No visible damage | Continue |
| 2 | Input current, limited supply | 50 mA steady | Standby only; sequence not starting |
| 3 | Always-on rail | 3.3 V correct | Standby power fine |
| 4 | First enable signal | Not asserted | Look at controller |
| 5 | Controller clock | Missing | Check crystal circuit |
| 6 | Crystal load capacitor | Cracked, shorted | Replace and retest |

## Verify the repair

After the fix, test the board under realistic conditions, including the original symptom, extended operation and temperature, and recheck rails and current draw. Intermittent faults in particular need longer testing.

> **Key takeaway:** Gather history and inspect first, rank hypotheses by likelihood and cost to test, choose measurements that split the possibilities, compare with known-good references and make sure the diagnosis explains every symptom.
