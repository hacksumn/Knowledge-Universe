@@ heat-load-and-airflow

Almost every watt of electricity that IT equipment consumes ends up as heat. A rack drawing 10 kW is, in effect, a 10 kW heater. Cooling a data center means moving that heat from the chips to the outdoors continuously, without letting equipment get too hot.

## Measuring heat load

- Heat load in watts is roughly equal to IT power in watts.
- In North America, cooling is often expressed in tons of refrigeration. One ton is 12,000 BTU per hour, or about 3.517 kW of heat removal.
- A 1 MW IT load therefore needs about 284 tons of cooling, before adding heat from lighting, people, UPS losses and other equipment.

## How air carries heat

Air-cooled servers pull cool air in at the front and push warm air out the back. The amount of heat air can carry depends on how much air flows and how much it warms up:

`heat (kW) ≈ 1.2 × airflow (m³/s) × temperature rise (°C)`

The factor 1.2 comes from the density and heat capacity of air at typical conditions. In imperial units, a common rule is `BTU/h ≈ 1.08 × CFM × ΔT (°F)`.

## A worked example

A 10 kW rack with a 12 °C rise from front to back needs:

10 ÷ (1.2 × 12) ≈ 0.69 m³/s, or roughly 1,470 cubic feet per minute.

If the temperature rise is only 8 °C, the same rack needs about 1.04 m³/s. Larger temperature differences mean less air has to move, which saves fan energy.

## Inlet temperature guidelines

ASHRAE publishes widely used thermal guidelines for data processing equipment. For many classes of equipment, the recommended inlet range is 18–27 °C (64.4–80.6 °F), with wider allowable ranges. Running at the warmer end of the recommended range reduces cooling energy, but leaves less margin if cooling fails.

What matters is the temperature at the **server inlet**, not the room average or the return air temperature at the cooling unit.

## The path of heat

1. Chips heat up; heat sinks spread the heat into server airflow.
2. Server fans push warm air into the hot aisle.
3. Cooling units (CRACs or CRAHs) draw in warm air and pass it over cooling coils.
4. The coils transfer heat into a refrigerant or chilled water.
5. That heat is carried to chillers, condensers or cooling towers and rejected outdoors.

- A **CRAC** (computer room air conditioner) contains its own refrigeration compressor.
- A **CRAH** (computer room air handler) uses chilled water from a central plant.

## Airflow problems

Even with enough cooling capacity, poor airflow creates hot spots:

- **Recirculation**: hot exhaust air finds its way back to server inlets, often over the tops of racks or through gaps.
- **Bypass**: cold air returns to the cooling units without passing through any equipment, wasting capacity.
- **Missing blanking panels**: empty rack slots let hot air flow back to the front.
- **Cable obstructions**: under raised floors, cables can block airflow to perforated tiles.

Simple fixes such as blanking panels, sealed cable openings and correct tile placement are among the cheapest efficiency improvements available.

> **Key takeaway:** IT power becomes heat, and air carries it in proportion to flow and temperature rise. Manage inlet temperatures and stop hot and cold air mixing before adding more cooling.

@@ hot-aisle-and-cold-aisle-containment

The most basic airflow rule in a data center is to keep cold supply air and hot exhaust air apart. Hot-aisle and cold-aisle layouts, and the containment systems built on them, do exactly that.

## The hot-aisle / cold-aisle layout

Racks are arranged in rows, with fronts facing fronts and backs facing backs:

- **Cold aisles** are between rack fronts. Cooled air is delivered here, and servers draw it in.
- **Hot aisles** are between rack backs. Servers exhaust warm air here, and it returns to the cooling units.

This simple arrangement prevents one row's exhaust from blowing directly into the next row's inlets. But without physical barriers, air still mixes over the tops and ends of rows.

## Containment

Containment adds physical barriers to stop that mixing.

**Cold aisle containment (CAC)** encloses the cold aisle with doors at the ends and a roof or panels over the top. The rest of the room becomes a hot environment.

**Hot aisle containment (HAC)** encloses the hot aisle and ducts the hot air directly back to the cooling units, often through a ceiling plenum or in-row coolers. The rest of the room stays at the cool supply temperature.

## Comparing the two

| | Cold aisle containment | Hot aisle containment |
|---|---|---|
| Room temperature outside the aisle | Hot | Cool |
| Comfort for staff in the room | Lower | Higher |
| Retrofit difficulty | Often easier with raised floors | May need ceiling plenum or ducting |
| Ride-through if cooling stops | Small cold volume, warms fast | Large cool room volume buys a little time |
| Equipment outside the aisle | Sits in hot air | Sits in cool air |

Both approaches work well. The choice often depends on building layout, existing cooling design and whether non-contained equipment shares the room.

## Why containment saves energy

When hot and cold air do not mix:

- Cooling units receive hotter return air, so their coils transfer heat more efficiently.
- Supply air temperatures can be raised, because there is no need to overcool to compensate for hot spots.
- Higher chilled-water temperatures become possible, which improves chiller efficiency and allows more hours of free cooling.
- Fans can slow down, because they no longer have to oversupply air to fight recirculation. Fan power scales roughly with the cube of fan speed, so small speed reductions save a lot of energy.

## Making containment work

Containment fails if air finds its way around it:

- Install blanking panels in every empty rack unit.
- Seal gaps between racks and under rack bottoms.
- Use brush grommets for cable openings.
- Keep containment doors closed.
- Balance airflow so the contained aisle has slightly more supply air than the servers draw, avoiding recirculation through any gaps.

## Fire safety

Containment roofs and panels can interfere with fire detection and suppression. Designs must meet local fire codes, often with panels that drop away automatically when a fire is detected, or detection and sprinklers inside the contained space.

## Monitoring

Temperature sensors at the top, middle and bottom of rack inlets show whether containment is working. Pressure sensors across the containment boundary help keep airflow balanced.

> **Key takeaway:** Separate supply and exhaust air with aisle layouts and containment. Hotter return air and fewer hot spots let cooling run warmer, slower and more efficiently.

@@ chilled-water-plants

Large data centers often use a central chilled-water plant instead of many standalone air conditioners. The plant cools water, pumps it to air handlers or cooling coils near the IT equipment, and carries the absorbed heat back to be rejected outdoors.

## The main loops

A typical water-cooled plant has two water loops connected by chillers:

1. **Chilled-water loop.** Chilled water, commonly supplied somewhere between about 10 and 20 °C in modern data centers, flows to CRAHs or coils. It picks up heat from the air and returns several degrees warmer.
2. **Condenser-water loop.** The chiller moves heat from the chilled-water loop into the condenser loop, which carries it to cooling towers.

## Inside a chiller

A chiller runs a vapor-compression refrigeration cycle:

- In the **evaporator**, refrigerant absorbs heat from the chilled water and evaporates.
- The **compressor** raises the refrigerant's pressure and temperature.
- In the **condenser**, refrigerant releases heat into the condenser water and condenses.
- An **expansion valve** drops the pressure, and the cycle repeats.

Chiller efficiency is often expressed as kW of electricity per ton of cooling, or as a coefficient of performance (COP): heat removed divided by electricity used. A COP of 6 means 6 kW of heat is moved for every 1 kW of compressor power.

## Cooling towers

Cooling towers reject heat by evaporating a small portion of the condenser water into outside air. Evaporation is very effective, but it consumes water. Water use is a significant environmental concern for large sites, measured by metrics such as water usage effectiveness (WUE), in liters of water per kWh of IT energy.

Air-cooled chillers and dry coolers reject heat to air without evaporation. They use little water but are less efficient in hot weather.

## Free cooling (economization)

When outdoor conditions are cool enough, the plant can bypass the chiller compressors:

- **Waterside economizers** use a heat exchanger to cool the chilled water directly with cold condenser water from the towers.
- **Airside economizers** bring filtered outside air directly into the data center when temperature and humidity allow.

Warmer chilled-water setpoints extend the number of hours each year when free cooling is possible, which is a major reason modern facilities run warmer than older ones.

## Temperature difference and flow

The heat carried by water is proportional to flow rate multiplied by the temperature rise (ΔT) between supply and return. Designing for a larger ΔT means less water needs to be pumped, saving pump energy. Poor airflow management in the white space lowers return temperatures and erodes this benefit.

## Redundancy and resilience

Chilled-water plants include redundant chillers, pumps and towers, often in N+1 configurations. Other resilience features include:

- **Thermal storage tanks** of chilled water that keep cooling running for minutes after a power interruption while chillers restart.
- **Chillers on UPS or quick-restart controls**, since some chillers take several minutes to restart after losing power.
- **Looped piping** with isolation valves so sections can be maintained without shutting down cooling.

> **Key takeaway:** A chilled-water plant moves heat from IT air to water, through chillers and out via cooling towers or dry coolers. Warmer water temperatures and large temperature differences unlock free cooling and lower energy use.

@@ direct-to-chip-liquid-cooling

Air cooling has limits. As processors and accelerators draw more power, the amount of air needed to carry away their heat becomes impractical. Direct-to-chip liquid cooling brings liquid right to the hottest components, removing heat far more effectively than air.

## Why liquid works better

Water can carry thousands of times more heat than the same volume of air for the same temperature rise. A small flow of liquid through a cold plate can remove heat that would require a large volume of fast-moving air. This lets racks reach power densities that air cooling cannot support.

## How it works

1. **Cold plates** are mounted directly on CPUs, GPUs and sometimes memory or voltage regulators. Coolant flows through fine channels inside the plate, absorbing heat from the chip.
2. **Manifolds** in the rack distribute coolant to each server and collect it back, often with quick-disconnect fittings that seal when unplugged.
3. A **coolant distribution unit (CDU)** pumps the coolant around this secondary loop and transfers heat to the facility water through a heat exchanger.
4. The **facility water loop** carries heat to the chilled-water plant or directly to dry coolers or cooling towers.

Keeping a separate secondary loop lets the CDU control coolant quality, temperature and pressure, and isolates the sensitive IT loop from the larger facility system.

## Single-phase and two-phase

- **Single-phase** systems use a liquid, typically water with additives such as propylene glycol, that stays liquid and carries heat by warming up.
- **Two-phase** systems use a fluid that boils on the cold plate, absorbing heat as it changes to vapor, then condenses elsewhere. Boiling removes a lot of heat at a nearly constant temperature, but the systems are more complex.

## Warm-water cooling

Chips can tolerate high temperatures, so direct-to-chip systems can often run with warm facility water, sometimes 30 °C or more on the supply side. Warm water can be cooled by dry coolers for most or all of the year without chillers, which saves significant energy. The return water is warm enough to be useful for heat reuse, such as heating nearby buildings.

## Hybrid cooling

Cold plates typically capture most, but not all, of a server's heat. Components such as storage, network cards and power supplies still need air. Many liquid-cooled racks therefore combine cold plates with some air cooling, or use rear-door heat exchangers to capture the remaining heat.

## Immersion cooling

An alternative approach submerges entire servers in a non-conductive fluid, either single-phase (the fluid circulates) or two-phase (the fluid boils). Immersion removes nearly all heat through liquid but requires different hardware handling and maintenance practices.

## Operational considerations

- **Leaks.** Quick-disconnects, leak detection sensors and drip trays reduce risk.
- **Water quality.** Filtration and chemistry control prevent corrosion and clogged cold-plate channels.
- **Commissioning.** New loops need flushing, pressure testing and air removal.
- **Failure behavior.** Liquid-cooled chips can overheat in seconds if flow stops, so pumps and CDUs need redundancy and fast alarms.

> **Key takeaway:** Direct-to-chip cooling uses cold plates and a CDU-managed loop to remove heat at the source. It enables much denser racks and warm-water operation, at the cost of new plumbing, monitoring and maintenance skills.

@@ pue-and-what-it-leaves-out

Power usage effectiveness (PUE) is the most widely used efficiency metric for data centers. It is simple to calculate and easy to compare, which is why it is popular, and also why it is easy to misuse.

## The definition

`PUE = total facility energy ÷ IT equipment energy`

Total facility energy includes everything: IT equipment, cooling, power distribution losses, lighting and offices that serve the data center. IT equipment energy is what the servers, storage and network devices consume.

- A PUE of 1.0 would mean every kilowatt-hour goes to IT equipment, with no overhead.
- A PUE of 1.5 means that for every 1 kWh of IT energy, 0.5 kWh goes to overhead.

## A worked example

Over a year, a facility uses 15,000 MWh in total, of which 10,000 MWh goes to IT equipment.

PUE = 15,000 ÷ 10,000 = **1.5**

Overhead is 5,000 MWh, a third of the total. If better cooling cuts overhead to 3,000 MWh, PUE falls to 1.3.

## Typical values

Industry surveys have reported average PUE values around 1.5 to 1.6 for many years, while large modern facilities often report annual PUEs of about 1.1 to 1.2. Climate, cooling design, load level and age all make a big difference.

## Measure over time

PUE varies with weather and load. A single reading on a cold night can look excellent. Meaningful PUE is measured over a full year, with continuous metering at consistent points. Standards such as ISO/IEC 30134-2 define measurement categories so results can be compared.

## What PUE leaves out

**It ignores IT efficiency.** PUE measures overhead relative to IT energy, not whether the IT equipment does useful work. Running inefficient, idle servers raises IT energy and can actually **improve** PUE.

**It can move costs between categories.** Server fans count as IT energy. Raising room temperatures may reduce cooling energy while server fans speed up, so PUE improves while total energy barely changes.

**It ignores water.** Evaporative cooling can reduce electricity use and PUE while consuming large volumes of water. Water usage effectiveness (WUE) is tracked separately.

**It ignores carbon.** A facility with a low PUE powered by fossil fuels may have a higher carbon footprint than one with a higher PUE powered by renewable energy. Carbon usage effectiveness (CUE) addresses this.

**It ignores heat reuse.** Exporting waste heat to warm buildings does not change PUE. Energy reuse effectiveness (ERE) was designed to capture it.

**It depends on load.** Lightly loaded facilities usually have worse PUE because fixed overheads are spread over less IT energy.

## Using PUE well

- Track it over time for the same facility to measure the effect of improvements.
- Compare facilities only when measurement methods and conditions are similar.
- Pair it with total energy, IT utilization, water and carbon metrics.
- Remember the goal is less energy and impact overall, not just a smaller ratio.

> **Key takeaway:** PUE is total facility energy divided by IT energy. It is a useful measure of overhead, but it says nothing about IT efficiency, water, carbon or heat reuse, so use it alongside other metrics.
