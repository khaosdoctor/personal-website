---
aliases: []
coverUrl: https://raw.githubusercontent.com/khaosdoctor/blog-assets/master/images/gear/beyerdynamics-dt-990-pro.webp
createdAt: 2026-01-05T03:01:00Z
icon: 🎧
oneliner: One of the best headphones I ever had
personalRating: 9.7
state:
  - owned
  - actively-used
tags:
  - topic/music/gear/headphones
  - type/equipment/headphones
title: Beyerdynamics DT 990 Pro
type:
  - studio
  - open-back
  - over-ear
  - hifi
  - monitor
  - mixing
updatedAt: 2026-10-03T00:00:00Z
x-personal-site-category: audio
---

# Beyerdynamics DT 990 Pro

| Maker       | Beyerdynamic |
| ----------- | --- |
| Model       | DT 990 Pro |
| Type        | Open-back over-ear studio headphones (45mm dynamic drivers, 250 Ω, open-back) |

## Store

| Store | Price | Checked |
| --- | --- | --- |
| Thomann SE | [1 666 kr](https://www.thomann.se/beyerdynamic_dt990pro.htm) | 2026-07-02 |

## Description

One of the best headphones I ever had. Right now I use them for monitoring and mixing, and sometimes just to listen to music on the [[Gaming PC]].

## Impressions

I originally bought this phone because I was getting into music production and started to get a bit more audiophilic, wanting to hear things as lossless as I could. For mixing and range, people recommended open-back headphones so I can get the sense of ambiance and dynamic range, but sacrificing the ability to be movable because these types of headphones cannot isolate anything.

After reading a **lot** about headphones, I kept seeing this particular model come up quite often as the "studio legend", it's been around since [[1988]] or something, and it has been upgraded over the years, with the latest addition being the DT 990 Pro X (which is twice as expensive). So I decided to give it a try.

### General

This is probably one of the best headphones I've used in the past decade. It's remarkably comfortable, the cans are big enough to cover the whole ear without hurting, and the Velor covers allow for glasses to slide in without getting trapped in the leather.

It's very sturdy, mostly made of metal with the cups being plastic. The wire is a bit too long for my taste and it's not coiled, and I can't change it, which is a problem too, but nothing that bothered me too much, of course it would be better if I could not have a gigantic cable laying around.

### Audio Quality

For the sound quality, out of the box it depends on what place you're using it, for example, I used it on Windows, Mac and [[Linux]], on [[Windows]] and [[MacOS]] I had to EQ it using PEACE (on Windows) and eqMac (on Mac) and the sound was better than without it. This headphone has a massive increase in [[High frequencies (sound)]] and some bump to the [[Middle frequencies (sound)]], more specifically a small bump to frequencies from 50-300Hz and 2kHz-20kHz

![[DT-990-Pro-frequency-response.png|DT 990 Frequency Response Curve]]

According to the [[Frequency Response Chart]], this headphone has a **very high** boost to the treble and all the high frequencies. Which is kinda expected for a mixing headphone since **it's meant to be a mixing headphone, not a monitoring one** (hence the open back). So this needed equalization in both Windows and Mac, however, in Linux I found that the EQ with EasyEffects is almost the same as without it, I still applied a [[Limiter (audio effect)]] and a [[Crossfeed (audio effect)|Crossfeed]] to the line so I get a better signal response, but the overall EQ was not super life changing.

## EQ Presets

There's a [list](https://www.reddit.com/r/oratory1990/wiki/index/list_of_presets/) of presets in the Oratory1990 subreddit, I took one from there and it's a PDF file.

On the bottom there's a table with a list of bands and EQ presets we can set in APO, I set it like this:

```bash
# /DT990-Pro-APO-Preset-Fresh-Earpads
Preamp: -5.3 db
Filter 1: ON PK Fc 63 Hz Gain -3.8 dB Q 0.7
Filter 2: ON LSC Fc 105 Hz Gain 5.5 dB Q 0.71
Filter 3: ON PK Fc 160 Hz Gain -2.6 dB Q 0.8
Filter 4: ON PK Fc 680 Hz Gain 3.5 dB Q 0.7
Filter 5: ON PK Fc 1170 Hz Gain -2.1 dB Q 1.2
Filter 6: ON PK Fc 2000 Hz Gain 1 dB Q 1
Filter 7: ON PK Fc 2900 Hz Gain -1.5 dB Q 3
Filter 8: ON PK Fc 5950 Hz Gain -6.4 dB Q 3.5
Filter 9: ON PK Fc 8300 Hz Gain -6.5 dB Q 7
Filter 10: ON HSC Fc 11000 Hz Gain -6 dB Q 0.71
```

Each filter is a band, PK means a [[Bell curve (equalizer)|Bell/Peak curve]], LSC is a [[Low Shelf (equalizer)|Low shelf]], and HSC is a [[High Shelf (equalizer)]]. `Q` is for `Quality` and it's the level of sharpness of the curve. We can import this setup for any APO-enabled EQ software.

There's also another one for old earpads:

```bash
# /DT990-APO-Preset-Old-Earpads
Preamp: -4,7 dB
Filter 1: ON LS Fc 105 Hz Gain 5,0 dB Q 0,71
Filter 2: ON PK Fc 100 Hz Gain -5,2 dB Q 0,4
Filter 3: ON PK Fc 650 Hz Gain 1,2 dB Q 1,8
Filter 4: ON PK Fc 1900 Hz Gain -0,6 dB Q 3,0
Filter 5: ON PK Fc 2600 Hz Gain -0,9 dB Q 5,0
Filter 6: ON PK Fc 3150 Hz Gain 2,5 dB Q 1,41
Filter 7: ON PK Fc 3800 Hz Gain -0,9 dB Q 5,0
Filter 8: ON PK Fc 8400 Hz Gain -2,5 dB Q 6,0
Filter 9: ON PK Fc 9400 Hz Gain -3,0 dB Q 6,0
Filter 10: ON HS Fc 9000 Hz Gain -6,0 dB Q 0,71
```

> [!note] Note to self
> Apparently the DT990 loses bass over time, since on fresh earpads the basses are attenuated but on old earpads we can't see ranges below 100Hz. More than that, the low mids and high mids also gain power because the 6xxHz range is severely attenuated in the old earpads. Apparently it also gains more treble over time.

## Final impressions

For my first open-back headphones I think they are pretty good. They're comfortable, good audio quality, and good price. Obviously there are others which are better and more expensive, but I think this is a good allrounder for both studio mixing and home listening. Definitely worth it.

## Related

- [[AKG K72]]
- [[Zaylli Lyrö]]
- [[KZ ZSN Pro X]]
