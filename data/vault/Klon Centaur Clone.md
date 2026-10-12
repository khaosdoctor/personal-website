---
aliases: []
coverUrl: https://diymusicgear.dk/wp-content/uploads/2026/05/5401a.png
createdAt: 2026-06-16T00:00:00Z
icon: 🎸
lastEditedByAI: 2026-10-12T00:00:00Z
oneliner: "Handbuilt Klon Centaur clone, my first DIY pedal build"
personalRating: 8.8
state:
  - owned
  - actively-used
status: built
tags: [topic/music/gear/pedals, type/equipment/guitar-pedal, meta/ai-assisted]
title: "DIY Klon Centaur Clone"
type:
  - overdrive
  - diy
  - guitar-pedal
updatedAt: 2026-10-12T00:18:44Z
x-personal-site-category: pedalboard
x-personal-site-export-type: [uses, build]
x-personal-site-parent: "[[Lekato Pedalboard]]"
---

# DIY Klon Centaur Clone

| Maker       | DIY (handbuilt)   |
| ----------- | ----------------- |
| Model       | Klon Centaur      |
| Type        | Overdrive / boost |

## Store

| Store                                      | Price                                                            | Checked    |
| ------------------------------------------ | ---------------------------------------------------------------- | ---------- |
| [DIY Music Gear](https://diymusicgear.dk/) | [369kr](https://diymusicgear.dk/product/klon-centaur-overdrive/) | 2026-09-20 |

## Description

A Klon Centaur overdrive clone that I built myself, and my first pedal build. I heard a lot about this pedal, the Centaur is a classic. It got really famous more recently, after some famous artists started using it, but back when it was created it wasn't that known and it wasn't that famous either.

A bit of the history: Bill Finnegan developed it in Boston with engineers from MIT and released it in 1994, going after the sound of an amp pushed hard instead of another Tube Screamer. He built every single unit by hand, around 8,000 of them until he stopped in 2008, and he covered the boards in black epoxy so nobody could copy the circuit. The secrecy plus the small numbers is basically why the used prices went crazy and the pedal became a legend.

It's an overdrive pedal, so it simulates an amplifier being pushed when you send the volume knob to the maximum. Back then amplifiers were made with valves, so you had that natural degradation of the sound and that natural warm distortion. The clone is an attempt to reproduce that sound, but in a way where the analog signal, differently from other overdrive pedals, still stays in the signal you're distorting. So instead of distorting the whole thing and having no clean original signal left, I have both the clean signal and the overdriven signal on top of each other.

The way it gets there is with a charge pump. Most pedals run the operational amplifier around a 4.5 volt bias, which is half of a 9 volt battery, so it has something to oscillate around. The Klon keeps that bias, but it also has a charge pump that doubles and inverts the supply, so the op amps get +18 volts and -9 volts to work with. That's a lot more headroom, and the distortion comes out better and more natural than the squarer digital distortions we're used to hearing.

The clipping diodes are germanium, 1N34A, two or four of them if I'm not mistaken. Those didn't come with the kit, it shipped with standard clipping diodes, so I swapped them for the germanium ones. They sit in the feedback loop of the second op amp and at moderate gain they barely conduct, so a good part of the character actually comes from the op amp stages and from that blend with the clean signal. Germanium is relatively sensitive to temperature. The build also has a lot of resistors and a lot of capacitors, and all the capacitors are polypropylene.

## Impressions

The temperature thing means that depending on the day you're playing it can sound warmer or colder, a bit more digital or a bit less, with a slightly more solid distortion or not. In general that's cool, but when you have to repeat the signal and repeat the sound, it's a nightmare.

The germanium is the only reason I wouldn't give this pedal a 9 point something or a 10. It's hard to predict the sound it's going to have, sometimes it's good, sometimes it's bad, sometimes it doesn't conduct anything and sometimes it conducts a lot, so it depends a lot. Especially here in Sweden, where we get six months of absurd cold and six months of absurd heat.

I think this is an excellent pedal to play, mostly because it doesn't distort the sound that much, but it can distort quite a lot if you push the knobs to the maximum. Right now I use it as my first distortion pedal, right after the [[Boss CS-3|compressor]] and before everything else. If it's on a lighter setting, just as a light overdrive, it's basically acting as a booster. So I can turn on the Klon and the [[Boss DS-1|DS-1]] together and it works like a volume booster with a little bit of distortion, they go really well together. The only one that doesn't work with it is the [[Boss MT-2 Metal Zone|Metal Zone]], which basically eats every signal that comes before it and gives the same output to everyone.

I also think the enclosure is very beautiful and it was very easy to build, and with those polypropylene capacitors it has a relatively warmer sound.

It's a very versatile pedal and I like it a lot. What I want to do at some point is recreate this build with all the original components, if I can manage to find them.

## Final thoughts

I think this is a pedal every guitar player should have at least once, or at least try once, even if you have to build your own or buy one already made. Today it's probably the most cloned pedal in history, which is a funny irony considering that Klon literally means clone.

It's a sound everyone should hear at some point in their life and try to understand how it works, because it says a lot about how pedals, guitars and electric instruments work in general. There's a lot more to it than that thick and direct distortion we're used to from metal and rock. It's a much more winding thing, full of small details, with way more variation than the basics.

## Build log

- **[[2026-05-19]]:** Assembled the first version of the pedalboard and decided the next pedal would be an overdrive, either a Tube Screamer clone or a Centaur clone.
- **[[2026-06-01]]:** Bought the Klon DIY kit from [DIY Music Gear](https://diymusicgear.dk/product/klon-centaur-overdrive/). It shipped the same day.
- **[[2026-06-13]]:** Built it in one sitting. It took about 8 hours and I finished around 4 AM. The time kinda flew by because I was talking in Discord with some friends and it was a lovely sunny day
![[2026-06-14_klon-centaur.png|The finished board|400]]
- **[[2026-06-15]]:** It took me a while to assemble it because I wanted to see if the board itself was secured, the jacks were hitting the top sides of the board and the knobs were not well fitted so it took me a while to adjust them all.
![[2026-06-14_klon_assembled.png|Assembled in the enclosure|400]]
- **[[2026-06-23]]**: I found a [[1N34A Germanium Diode]] swap to replace the current ones in the kit, didn't see much difference honestly.

## What broke and what I learned

- It took so long because there were too many components, and very small ones, with some really tight spaces to fit them.
- The wires going to the jacks were too short, so I had to solder and desolder them multiple times. Same with several other components.
- I was soldering at the wrong temperature. Raising it to 375 °C made it work a lot better. I was told 270 °C, which is way too low for my solder.
- Learned how to use desoldering braid.
- Burned my fingers multiple times.

## Next

- Recreate this build with all the original components, if I can manage to find them.

## Related

- [[Boss DS-1]]
- [[Ibanez Tube Screamer Mini]]
- [[Lekato Pedalboard]]
- [[Boss PSA-230S AC Adaptor]]
- [[Guitar Patch Cables]]
