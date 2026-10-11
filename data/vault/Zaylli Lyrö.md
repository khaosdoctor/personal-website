---
aliases: [Lyrö]
coverUrl: https://raw.githubusercontent.com/khaosdoctor/blog-assets/master/images/gear/zaylli-lyr.webp
createdAt: 2026-06-16T17:21:00Z
icon: 🎧
oneliner: "My first proper hifi gear with detachable cables and on-ear."
personalRating: 8.8
state:
  - owned
  - not-actively-used
tags: [type/equipment/headphones, topic/music/gear/headphones, meta/ai-assisted]
title: "Zaylli Lyrö"
type:
  - hi-fi
  - semi-open-back
  - on-ear
updatedAt: 2026-10-03T00:00:00Z
x-personal-site-category: audio
---
# Zaylli Lyrö

| Review link | [Headfonics](https://headfonics.com/zaylli-lyro-review/)                           |
| ----------- | ---------------------------------------------------------------------------------- |
| Maker       | Zaylli                                                                             |
| Model       | Lyrö                                                                               |
| Type        | Semi-open-back on-ear headphones with stereo imaging control and hi fidelity audio |

---

## Store

| Store | Price | Checked |
| --- | --- | --- |
| Zaylli (official) | [$249](https://zaylli.com/products/lyro) | 2026-07-02 |

## Description

My first proper hi-fi headphones. The knobs on the cups let me tune how much bass they have.

## Impressions

This headphone actually came to me in an email advertisement for Kickstarter. It's basically something I wasn't planning on buying, but I thought was gonna be really cool because they have these features of being super light as well as this knob in the back that allows you to change kinda the bass level for the sound.

It's an open back headphone or some semi open back headphone, whatever that means. But I think it means that you can turn it into a closed back headphone or a fully open back headphone by turning the knob on the cans. As any open back headphone, it cannot be used outside, because it's completely open, so it will not isolate anything and you won't hear anything. But internally this is one of the most interesting pieces of hardware I've ever got.

### General

The initial impression on this was that it was remarkably light. And I thought it was actually gonna be a piece of crap because it's super thin. But it's actually really well made. It's all aluminum and the drivers in the cans are removable, so you can change the entire body of the headphone and keep only the drivers. Which is amazing because if you really like the sound and if you really like the cans it has, you can actually move to another headphone. But I don't know if they actually support any other headphone, which is a shame.

It comes with several accessories, so I got the full pack. It has all the cables being detachable. So they use the same type of connections as the in-ear monitors use. It's an [[MMCX]] pair of pins: ![[Zaylli Lyrö_MMCX.png|Micro Miniature Coaxial cable connection]]

Using this type of connection is really good because it allows me to remove any of the cables and just store the body itself. I got a pair of simple MMCX connector to a 3.5 phone jack connector, which is standard. I also got a [[Digital-to-analog converter|DAC]] that goes from a USB-C to a common 3.5 jack, pretty similar to the apple ones. I got an extra pair of 3.5 millimeters like the first one. I also got another one with an MMCX connector in one end and the other end is a balanced jack which I will probably never use because I don't have any balanced 4.4mm jacks around.

And the final one, it's the most interesting one because it's a double microphone cable. It's an USB C to a double MMCX, but in the middle of these there is a microphone. And this microphone is connected to the MMCX connector using a 2-pin (0.78mm) connector like this: ![[Zaylli Lyrö_two pin.png|Two pin connector]]

And in the end of it there's a proper headset mic. So I _could_ use the Lyrö as my main headphone in the computer, which would be awesome if I had an extra USB-C that I could plug into, I might actually try it by removing my table DAC one day.

### Audio Quality

The audio quality is actually pretty good. I have tested it in multiple computers, but I haven't really used it in [[Linux]], for example. I mostly used it in a MacBook, and it's really good. For a headphone that is not that expensive, I think it was a pretty good acquisition. It does require some [[Equalizer (audio effect)|equalization]] though, but it doesn't really change too much the sound you're getting from it.

[Oratory1990](https://www.reddit.com/r/oratory1990/comments/1q5fmbz/eq_for_zaylli_lyr%C3%B6_onear_headphone/) has an EQ preset and a [[Frequency Response Chart|Frequency Response]] chart that's rather interesting. You see, since you can turn the knob on the drivers, the bass response will change.

So, the headphone has a rotating knob on the outside of the earcup, and turning this knob changes the acoustic [[Impedance|impedance]] connecting to the center port of the speaker. They say it's by mechanically changing the cross-section of a tube connecting to the back of the speaker and stuff (which I didn't understand at all), but it theoretically changes the output of the headphone at [[Low frequencies (sound)|lower]] frequencies. I haven't really noticed any of those, but according to the post, it affects frequencies from 10 to well over 500 [[Hertz|Hz]]. But it's mostly centered around 40 to 50 Hz. And it slightly reduces the 2~3kHz frequencies as well. So the chart with the knob in all positions look like this: ![[Zaylli Lyrö_FRC.png|Notice the value change in the bass]]

If we overlap this to the [[Harman Curve]], you get something like this: ![[Zaylli Lyrö_FRC_harman.png|Comparison with Harman curve]]

The most noticeable effect, I think, is the changes in the low highs (or high mids?) which is the most different part of the spectrum. Also, an interesting part of having it on-ear rather than over-ear is that the perception of sound or the frequency response actually changes depending on the way you position the headphones in your ear. So if you go more towards your front, or more to the back of your head, the response will be way different, and it can vary a lot. And this I have noticed. This FR shows it with the knob set in the minimum: ![[Zaylli Lyrö_FRC_position.png|Comparison in different parts of the ear with the knob in the minimum setting]]

## EQ Presets

Oratory has also made some EQ presets that tune it quite a bit: ![[Zaylli Lyrö_EQ.png]]

The APO presets are different for each one. The first is for the knob set to minimum, what Zaylli calls "Diffuse Field":

```bash
# /EQ-minimum-bass-diffuse-field
Preamp: -5.2 dB
Filter 1: ON PK Fc 100 Hz Gain -2.7 dB Q 0.31
Filter 2: ON PK Fc 1100 Hz Gain -2.1 dB Q 2.00
Filter 3: ON PK Fc 1500 Hz Gain 3.0 dB Q 1.00
Filter 4: ON PK Fc 3100 Hz Gain -2.4 dB Q 3.20
Filter 5: ON PK Fc 3600 Hz Gain -3.7 dB Q 3.00
Filter 6: ON PK Fc 5300 Hz Gain 5.0 dB Q 1.40
Filter 7: ON PK Fc 7500 Hz Gain -2.0 dB Q 3.00
Filter 8: ON HSC Fc 10000 Hz Gain 5.0 dB Q 0.80
```

Then the knob at 50%:

```bash
# /EQ-Knob-half-way
Preamp: -2.6 dB
Filter 1: ON LSC Fc 68 Hz Gain 2.5 dB Q 0.80
Filter 2: ON PK Fc 138 Hz Gain -1.7 dB Q 1.30
Filter 3: ON PK Fc 230 Hz Gain -1.6 dB Q 1.30
Filter 4: ON PK Fc 1170 Hz Gain -2.0 dB Q 2.00
Filter 5: ON PK Fc 1500 Hz Gain 2.0 dB Q 1.00
Filter 6: ON HSC Fc 3000 Hz Gain -1.0 dB Q 0.35
Filter 7: ON PK Fc 3500 Hz Gain -7.4 dB Q 1.70
Filter 8: ON PK Fc 5100 Hz Gain 3.5 dB Q 2.00
Filter 9: ON PK Fc 7500 Hz Gain -2.0 dB Q 3.00
Filter 10: ON HSC Fc 10000 Hz Gain 2.0 dB Q 0.71
```

And finally one that doesn't really depend on the Knob setting:

```bash
# /EQ-only
Preamp: -3.1 dB
Filter 1: ON PK Fc 55 Hz Gain -8.4 dB Q 0.30
Filter 2: ON LSC Fc 105 Hz Gain 5.5 dB Q 0.71
Filter 3: ON PK Fc 1200 Hz Gain -2.1 dB Q 2.00
Filter 4: ON PK Fc 1550 Hz Gain 2.2 dB Q 1.00
Filter 5: ON HSC Fc 3000 Hz Gain -1.0 dB Q 0.35
Filter 6: ON PK Fc 3600 Hz Gain -6.4 dB Q 2.00
Filter 7: ON PK Fc 5300 Hz Gain 4.0 dB Q 2.00
Filter 8: ON PK Fc 7500 Hz Gain -2.0 dB Q 3.00
Filter 9: ON HSC Fc 10000 Hz Gain 2.0 dB Q 0.71
```

## Final thoughts

I'm positively surprised with it because they're comfortable, they are very thin, very light, and the quality is really good. And they have a good price. What actually caught my attention is that I wanted to exchange my default frame for a neckband. And they proactively responded for support and they were very honest about the state of this neckband. They said that the neckband is still breaking a lot, so they don't recommend the purchase now. But they would recommend it if I was going to purchase later on when they do a version 2. So they actually want me on the customer support as well. I highly recommend these.

## Related

- [[AKG K72]]
- [[Beyerdynamics DT 990 Pro]]
- [[KZ ZSN Pro X]]
