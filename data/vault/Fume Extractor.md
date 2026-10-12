---
aliases: [DIY Fume Extractor]
createdAt: 2026-06-28 23:08
lastEditedByAI: 2026-10-11T19:56:21Z
oneliner: "Small project I made to test my knowledge in electronics. It's a mini 5V fume extractor made to be used when soldering."
status: in-progress
tags: [topic/electronics, type/idea/project, meta/ai-assisted]
title: "Fume Extractor"
updatedAt: 2026-10-12T01:31:48Z
x-personal-site-export-type: build
---
# Fume Extractor

## Overview

The idea was to make the fume extractor so I wouldn't breathe the fumes from the solder. So I started a small project with a [[Potentiometer]] and a small 6cm 5V DC brushless fan.

![[DIY Fume Extractor.png|First version on a perfboard|450]]

The initial version was supposed to use a 6cm fan, however

## Design

After I tested it in the breadboard, I put a schematic in KiCAD to help me draw a PCB for it:

![[DIY Fume Extractor_diagram.png]]

I opted to have the fan in a Molex (J) connector because it would be easier if I needed to swap the fan for a bigger one later on, which is what I am planning to do with a 9V/12cm fan, this was basically the test.

### V1

The first board I ordered, from the [KiCad project](https://github.com/khaosdoctor/kicad-fume-extractor-5v/tree/610c8e3e5aa4c40a0b02b2769eef7642583af31b).

![[fume-extractor-v1-schematic.png|Fume extractor v1 schematic|700]]

![[fume-extractor-v1-pcb.png|Fume extractor v1 PCB layout, front view|700]]

### V2

The current version of the [KiCad project](https://github.com/khaosdoctor/kicad-fume-extractor-5v/tree/d25dcb77e7e6b90e89afc76eb4231ef546408225).

![[fume-extractor-v2-schematic.png|Fume extractor v2 schematic|700]]

![[fume-extractor-v2-pcb.png|Fume extractor v2 PCB layout, front view|700]]

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

- **[[2026-06-28]]:** Built it on a [[Protoboards|Perfboard]]. It "works"… But I can't really trust, the perfboard is bad because you need to stick solder into it but it will not stick! ![[DIY Fume Extractor_solder.png|This is the final state of it|400]]
- **[[2026-06-30]]:** I desoldered everything, it was very bad. I will re-do it this again.
- **[[2026-07-13]]:** I ordered an actual PCB for it, the project files are on my [Github project](https://github.com/khaosdoctor/kicad-fume-extractor-5v/tree/610c8e3e5aa4c40a0b02b2769eef7642583af31b) for it.
- **[[2026-08-02]]:** The original board worked quite ok

## Lessons learned

Perfboards are terrible because I cannot stick the solder to it, so it looks like this:

Some parts don't have good continuity, like the blue wire over there which already came lose. I think I will just desolder it all and remove the components I can, then try to do it again.

## Next
- Simplify it by removing the pot, it makes no sense to have it there but I wanted to test it out.
- Re-do the build.
