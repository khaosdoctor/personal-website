---
aliases:
  - DIY Fume Extractor
createdAt: 2026-06-28 23:08
lastEditedByAI: 2026-10-11T19:56:21Z
oneliner: Small project I made to test my knowledge in electronics. It's a mini 5V fume extractor made to be used when soldering.
status: in-progress
tags:
  - topic/electronics
  - type/idea/project
  - meta/done
  - meta/ai-assisted
title: Fume Extractor
updatedAt: 2026-10-11T19:56:21Z
x-personal-site-export-type: build
---
# Fume Extractor

## Overview

![[DIY Fume Extractor.png|450]]

The idea was to make the fume extractor so I wouldn't breathe the fumes from the solder. So I started a small project with a [[Potentiometer]] and a small 6cm 5V DC brushless fan.

## Design

After I tested it in the breadboard, I put a schematic in KiCAD to help me draw a PCB for it:

![[DIY Fume Extractor_diagram.png]]

I opted to have the fan in a Molex (J) connector because it would be easier if I needed to swap the fan for a bigger one later on, which is what I am planning to do with a 9V/12cm fan, this was basically the test.

## Bill of materials

| Part                                                    | Value                      | Qty | Notes                                                                                                                                               |
| ------------------------------------------------------- | -------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[Resistors\|Resistor]]                                 | 330R                       | 1   |                                                                                                                                                     |
| Resistor                                                | 2.2k                       | 1   | Just so the pot doesn't have a lot of dead room in GND. If you have a smaller pot this might not be needed                                         |
| [[Switches\|Switch]]                                    | SPST or SPDT               | 1   |                                                                                                                                                     |
| [[LEDs\|LED]]                                           | 5mm red                    | 1   |                                                                                                                                                     |
| [[Battery Holders\|Battery holder]]                     | 9V, with leads             | 1   |                                                                                                                                                     |
| [[Electrolytic Capacitors\|Capacitor]]                  | 0.1uF (100nF)              | 1   | Any cap, [[Ceramic Capacitors\|ceramic]] works too. If the cap is electrolytic, the negative should be to GND                                       |
| Capacitor                                               | 0.22uF (220nF)             | 1   |                                                                                                                                                     |
| [[Voltage Regulators\|Voltage regulator]]               | LM7805                     | 1   | Depends on the fan's voltage. A 9V or bigger fan runs straight from the battery. A 5V fan needs an LM7805 (**not** the 78L05, which is for low current) |
| [[Potentiometers\|Potentiometer]]                       | 1K (or less), linear       | 1   |                                                                                                                                                     |
| [[BJT Transistors\|Transistor]]                         | BC337                      | 1   |                                                                                                                                                     |
| Fan                                                     | 6cm, 5V DC brushless       | 1   |                                                                                                                                                     |

## Build log

- **[[2026-06-28]]:** Built it on a [[Protoboards|Perfboard]]. It "works"…
- **[[2026-06-30]]:** I desoldered everything, it was very bad. I will re-do it this month again.

## What broke and what I learned

The perfboard is terrible because I cannot stick the solder to it, so it looks like this:

![[DIY Fume Extractor_solder.png]]

Some parts don't have good continuity, like the blue wire over there which already came lose. I think I will just desolder it all and remove the components I can, then try to do it again.

## Next

- Swap the fan for a bigger 9V/12cm one.
- Simplify it by removing the pot, it makes no sense to have it there but I wanted to test it out.
- Re-do the build.
