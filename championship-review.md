# Championship library - review notes

Everything from Phase 4's nine batches that was guessed, substituted, invented
or left for later, in one place. Each shipped file's header comment carries the
same facts in context; this is the checklist. Tick what you accept, strike what
should go.

Library at the time of writing: 133 championships, all available on the author's
install. None of the batches' rounds has been driven in the game yet - every
one was only lowered through `npm run series`.

## 1. Candidates for removal

### Invented championships

No real series races these cars. Each description says so.

- [ ] Hot Hatch Trophy - base front-wheel-drive hot hatches (road 5)
- [ ] Supercar Series - base road supercars (road 2)
- [ ] Hypercar Invitational - base hypercars (road 1)
- [ ] Supercar Classic - base road icons, sixties to eighties (road 2, off)
- [ ] Production Car Endurance - the series is invented, on the Bathurst 6 Hour's
      class rules (road 4 and 3)
- [ ] GT3 Sprint Series - a real format (Blancpain Sprint 2013) but deliberately
      no real season or calendar, because the GT3 (2010s) spec spans 2011-2016 cars
- [ ] GT86 Cup - a real idea with an invented calendar
- [ ] Formula UK - announced in 2016, never ran; everything but the car and the
      country is invented
- [ ] JDM Production - Japanese Pack road cars
- [ ] XX Programme Invitational - 599XX Evo, FXX K, P1 GTR
- [ ] Tuner Invitational - stage-tuned base cars and the Japanese Pack tuners
- [ ] Porsche Club Race - real PCA classes, invented season
- [ ] Porsche RS60 Spyder Cup - one-make for the 718 RS 60 (off)
- [ ] Formula X Invitational - RSS Formula Hybrid X, X Evo, V12-R
- [ ] GT-M Championship - RSS GT-M cars on a GT World Challenge sprint weekend
- [ ] Unlimited Invitational - RSS P91 Evo, GT-MX pair, Hyperion 2020
- [ ] EGT Championship - URD's EGT cars; sprint rounds field the sprint 9SRs
- [ ] S-FR Cup - Guerilla's Toyota S-FR Racing, a concept Toyota never built
- [ ] Liana GT Cup - Guerilla's imagined Liana GT V6 Cup

### Fillers

- [ ] Formula Abarth + and ++ (single-seater 4 and 3) - hidden by the filler switch

### Thin or heavily substituted calendars

- [ ] **Super Formula 2019** - two rounds only (Fuji, Okayama)
- [ ] **Super Formula 2023** - three rounds, all at Fuji
- [ ] **IndyCar 2020** - only Road America (two races) is a real 2020 venue.
      COTA and Laguna Seca were on the calendar as first published and cancelled
      by the pandemic; the Texas oval opener runs at Daytona's tri-oval over the
      same 300 miles, a track IndyCar never raced
- [ ] **IndyCar 2012** - Sonoma only, plus the Fontana 500-mile finale at Daytona
- [ ] **IndyCar 2018** - Road America and the Sonoma finale, plus the Pocono 500
      at Daytona
- [ ] **IndyCar 2021** - Road America and Laguna Seca, plus Texas's 300 miles at
      Daytona. None of the IndyCar seasons uses the short-oval kit: there is no
      short oval to race on
- [ ] **Formula E 2020-21** - two rounds, the Valencia double header
- [ ] **Formula E 2023-24** - three rounds: Mexico City and the Shanghai double header
- [ ] **Trans-Am TA2** - not tied to a season; seven American road courses the
      series races
- [ ] **GT World Challenge Sprint Cup, ADAC GT Masters, TCR Europe,
      Intercontinental GT Challenge** - not tied to a season; each races the
      circuits the series uses that Assetto Corsa has. The IGTC has only two
      rounds, Bathurst and Spa
- [ ] **Radical Cup UK** - not tied to a season; Silverstone, Brands Hatch Indy,
      Oulton Park and Croft
- [ ] **GT4 European Series, GT2 European Series, BMW M2 CS Racing Cup Italy,
      Ginetta GT4 Supercup** - not tied to a season
- [ ] **VLN 2004** - stands in for the planned Nurburgring 24 Hours 2004, which
      alone would be a one-off event; the calendar's shape is the modern
      series', not 2004's checked dates
- [ ] **Italian F4 Championship** - not tied to a season; "the Italian circuits it
      races" plus the Red Bull Ring, with Misano missing

## 2. Facts not verified

Where no source was found, a common scale or an assumed length stands in. The
file header says which.

| Championship | What is unverified |
|---|---|
| BOSS GP Open | Points table (25-18-15 stands in) |
| GT4 European Cup 2010 | Race length (an hour assumed); points read off the standings |
| Lamborghini Super Trofeo 2016 | Points table (15-12-10 one-make scale stands in) |
| GT3 Sprint Series | Both points tables are the nearest sourced ones, not the Sprint Series' own |
| Mk1 MX-5 Championship | Points table and a real season's calendar |
| Masters Racing Legends | Points table (25-18-15 stands in) |
| Masters Gentlemen Drivers | Points table (25-18-15 stands in) |
| Youngtimer Trophy | Points table (25-18-15 stands in) |
| DTM 1993 | Heat length (25 minutes) and heat grids |
| Group A 1987 | Crew pairings not found, so the field is invented |
| FIA GT 1997 | Points 10-6-4-3-2-1 is how the sources read, not confirmed |
| BPR Global GT 1996 | Points table (20-15-12 of the day stands in) |
| World Championship for Makes 1978 | Points table (20-15-12 stands in) |
| IROC 1974 | Race lengths and points (half-hour races, 9-6-4-3-2-1) |
| Porsche Supercup 2017 | The 20-18-16 table not confirmed for 2017 |
| Nurburgring Langstrecken-Serie | NLS points table (25-18-15 by class stands in) |
| MX-5 Cup 2024 | Points table not found in full |
| Roadster Party Race | Race length and points (30 min, 25-18-15) |
| Classic Endurance Racing 2 | Points table (25-18-15 stands in) |
| Tour Auto | Stage results are not a championship; 25-18-15 scores them |
| Formula 2 2020 | Sakhir outer loop laps worked out from distance |
| Formula 2 2024 | Imola laps worked out from distance |
| FIA Formula 3 2024 | All race lengths worked out from the usual distances |
| Italian F4 | Points table and pole points |
| Super Formula 2019 / 2023 | Race distances (usual 250 km worked out per circuit); 2023 pole points |
| WEC 2025 | Le Mans x2 and Bahrain 8h x1.5 multipliers "as understood for 2025"; Bahrain's table has half points (37.5, 22.5, 1.5) |
| FIA GT 2004 | 500 km race length believed, not checked |
| WEC 2024 (VRC) | Same multipliers as WEC 2025, not checked for 2024 |
| Formula E 2020-21 | Qualifying simplified to one session and a Super Pole; 45-minute races |
| Formula E 2023-24 | Race lengths (45 minutes stands in for Gen3's set lap counts); duels run as a knockout |
| IndyCar 2021 | Daytona's 120 laps stand for Texas's 212 at roughly the same 300 miles |
| BTCC 1998 | Points table, race lengths (40 and 80 km worked out), which Silverstone layout |
| Trans-Am TA2 | Race length (an hour) and points (25-18-15) |
| WEC 2024 (LFM) | Multipliers as for the other WEC seasons; qualifying is shared by both classes |
| GT World Challenge Sprint Cup | Points 16.5-12-9.5 "as understood"; which circuits a real season ran |
| GT World Challenge Endurance 2024 | The 2024 calendar (Paul Ricard, Spa, Nurburgring, Monza, Jeddah) as understood |
| Intercontinental GT Challenge | The season's other rounds; drivers' points are a 25-18-15 stand-in |
| ADAC GT Masters | Points 25-20-16 "as understood"; which circuits a real season ran |
| TCR Europe | Race length (30 min), points (25-18-15), which circuits a real season ran |
| Porsche Supercup 2025 | The calendar and the 25-20-17 table, both as understood |
| Porsche Supercup 2021 | The six races (two at the Red Bull Ring) and the points table, both as understood |
| Radical Cup UK | Points (25-18-15), race length (25 min), the second race's grid, the circuits |
| GT4 European Series | Points (25-18-15), which circuits a real season ran |
| GT2 European Series | Points (25-18-15), which circuits a real season ran |
| Porsche Supercup 2023 | The calendar and the 25-20-17 table, both as understood |
| BMW M2 CS Racing Cup Italy | Format (two races from qualifying), 25-minute races, points |
| Ginetta GT4 Supercup | Race 3's grid (race 2's top six reversed), 20-minute races, points |
| ALMS 2001 | The calendar's order, the race lengths, points (25-18-15) |
| VLN 2004 | The class names the cars sit in; points (the VLN scores by class size) |
| WEC 2012 | Whether Sebring 12 Hours paid more than a six-hour round |
| WEC 2014 / 2016 | That the Ligier JS P2 raced LMP2 both seasons (G-Drive in 2014, Extreme Speed in 2016), as understood |
| WEC 2025 | The LMGT3 makes (Lamborghini out, Mercedes-AMG in), as understood |
| WEC 2023 | The 1.5x for Sebring's 1000 miles and Bahrain's eight hours, as understood |
| IMSA 2017 | Points 35-32-30 "as understood"; every class races every round, where Lime Rock and VIR were GT only |
| IMSA 2025 | Points 350-320-300 "as understood" |
| FIA GT1 2010 | The calendar and its order, as understood; the qualifying knockout's cut sizes |

### Real entry lists to spot-check

- [ ] F1 1970, 1979, 1988, 1990, 1991, 1997, 2000, 2009, 2024: seats are "roughly in the order the season
      finished" - the order also sets relative AI pace
- [ ] F1 1970 / 1979 cut to 18, F1 1988 / 1990 to 20 and F1 1991 to 24 by pit boxes: the regular
      starters were chosen by hand
- [ ] F1 2019: Gasly and Albon sit where they finished the season, after the swap
- [ ] F1 2025: listed by team, as the teams finished (Alpine's second seat
      Colapinto)
- [ ] F1 2026: the season was under way when written; calendar as announced
      (Bahrain included), grid as it started. Anything since is missing
- [ ] F1 1997: Michael Schumacher keeps his seat despite his exclusion from the
      standings
- [ ] F1 2005 / 2007 / 2009: mid-season replacements left out - Friesacher,
      Albers and Bourdais / Piquet Jr. keep the seats they held longest
- [ ] DTM 2025 and WEC 2024 exist twice too (RSS / LFM, VRC / LFM)
- [ ] F1 2022-2026 exist twice, `(RSS)` and `(VRC)`, with identical entry lists
      and calendars
- [ ] ILMC 2011 GTE: the real crews, one driver per car, so works teams field four

## 3. Stand-ins and substitutions

### Venues

- Blancpain Endurance 2013, Super Trofeo 2016: Mugello for Paul Ricard
- BOSS GP Open: Nurburgring and Mugello for Hockenheim and Brno
- ILMC 2011 GTE: Monza 1000 km for Zhuhai
- Trofeo Abarth 500 2009: Magione for the missing Italian circuit (caps the grid at 18)
- DTM 1993: Zandvoort, Spa and Silverstone for Hockenheim, the Norisring,
  Donington and the airfield rounds
- IROC 1974: Laguna Seca for Riverside
- F1 1986: the Nurburgring GP circuit for Hockenheim
- F1 1957 / 1962: Silverstone for Aintree
- IndyCar 2012 / 2018 / 2020 / 2021: Daytona's tri-oval for each season's
  speedway race (Fontana, Pocono, Texas)
- F1 1986 / 2009: the Nurburgring GP circuit hosts a German Grand Prix
- WEC 2024 / 2025: Qatar missing; F1 seasons list their missing venues in the header
- LFM's large-box layouts (`spa/2022`, `monza/lfm`, `fn_imola/lfm` and others)
  carry the bigger GT and WEC grids
- Wherever a circuit has changed since, the laps cover the real race's distance
  rather than repeating the real lap count

### Cars

- GT4 European Cup 2010: Evora GTC, restricted, for Lotus' Evora GT4 (the DLC
  Maserati deliberately not named)
- Lotus Cup: Elise SC stands in for the naturally aspirated Production Elise
- Tour Auto: Shelby Cobra 427 for the eligible Cobra 289
- World Championship for Makes 1978: the 935/78 "Moby Dick" for the whole 935 field
- Roadster Party Race: the MX-5 ND road car for the NR-A club racer
- DTM 2021 / 2025 (RSS), WEC 2025: RSS's fictional cars stand for the real makes
- DTM 2021 / 2025 (RSS), WEC 2024 (VRC), BTCC 1998, Trans-Am TA2, F1 2007:
  the mods' fictional names stand for the real makes
- Porsche Supercup 2021: URD's Darche 992 Cup for the 911 GT3 Cup
- ALMS 2001: RSS's LMP Ferruccio 33 for the Ferrari 333 SP; LMP675 left out
- WEC 2012: the base BMW M3 GT2 stands for the Porsche and Aston Martin that raced GTE
- IMSA 2017: the LMP2 (2017) spec stands for the DPi-and-LMP2 Prototype class
- FIA GT1 2010: RSS's Adonis D9 and Lanzo V12 for the DBR9 and the Murcielago;
  the Corvette C6.R and Ford GT are missing
- WEC 2016: Yezhrod's 2014 Ligier JS P2 for the whole LMP2 class, Oreca 05s included
- WEC 2017: the 919 Hybrid 2015 / 2016 for the 2017 919 and the TS050, in LMP1
- WEC 2024 (VRC) / 2025: LFM's GT3s race LMGT3 beside the mods' hypercars, and
  Imola and Spa moved to their LFM layouts so both classes fit the pit lane
- Classes left out for want of a car: LMP2 in WEC 2012, LMP3 in ELMS 2025; GTE Am
  in WEC 2017 for want of pit boxes (Silverstone and the Nurburgring hold 24)
- GT2 European Series: Guerilla's imagined GT2s (BMW M2, 488, Liana) and its Cayman
  RSR race among the real ones
- F1 1988 / 1991: one car (MP4/4, Jordan 191) for the whole field
- F1 2025 (RSS): one team's car (Formula Hybrid Alpine 2025) for the whole field

### Balance of performance to sanity-check when driving

- Lotus Cup: Evora GX softened to ballast 60 / restrictor 10
- ILMC 2011 GTE: M3 and 458 towards the Evora
- JDM Production: 370Z restrictor 8, RX-7 ballast 30
- Porsche Club Race: Turbo S ballast 30, Cayman GT4 ballast 60
- XX Programme: P1 GTR restrictor 18, FXX K restrictor 25
- Tour Auto: Cobra ballast 60 + restrictor 20, RSR ballast 60
- Unlimited Invitational: GT-MX Macca restrictor 15
- Formula X Invitational: no BoP, on near-equal power to weight

### Race lengths without a format per round

Every F1, F2 and F3 season now states its races as distances, turned into laps
per round off the installed track, with one or two formats a season instead of
one per round. Every round still runs exactly the lap count it did before -
checked across all 457 rounds - because a round whose distance comes to another
count on the mod's track keeps its real count as an override.

- F1 from 1985: 305 km, sprints 100 km; Monaco and a few tracks whose mod
  length is slightly off keep their real laps (0-3 rounds a season)
- F2: 170 km feature, 120 km sprint, as the regulations say
- [ ] F3 2024: 117 km feature and 80 km sprint are what the real lap counts fit
      best, not a figure read from the regulations
- [ ] F1 before 1985: the distance is the one that fits most rounds (1954 503 km,
      1957 458, 1962 395, 1967 387, 1970 393, 1971 318, 1975 315, 1979 318);
      races then varied, so most rounds keep their own real laps
- FIA GT 2004: 500 km; Super Formula 250 km (2019) and 185 km (2023) - every
  round's real laps, no overrides
- [ ] BTCC 1998: 40 km sprints and 80 km features, the distances the laps were
      worked out from. Laps are now the fewest that cover them, so several
      races run one lap more than before (Silverstone 16 and 31, was 15 and 30)
- IndyCar states its races in laps, so its seasons keep a road-course and an
  oval format in laps, the other road rounds keeping their own counts
- The per-round helpers `withRaceLaps` and `withSessionLaps` are gone; no
  shipped championship has a format per round any more

### Timed races, converted to distances and lap counts

Assetto Corsa has no timed race offline - driven both ways, and Content
Manager's Quick Drive offers none either - so the eighty-two championships that
raced on the clock had to say their races another way. There are two answers,
split at four hours.

**Under four hours: a distance**, the kilometres the real duration covers at
the fastest class's pace. Each file's header states it; the pace behind it is a
judgement per championship and is the thing to check in the table below. A
distance becomes laps off each round's own layout, so the calendar shows both.

**Four hours and up: a lap count per round**, because one distance across a
calendar puts a 24-hour race at six hours over its duration at a slow circuit.
These come from the real race's own result - the winner's laps at that event -
converted to our layout where the circuit has changed length since. The
format's race carries the commonest count and each round that differs states
its own, the way the Formula 1 seasons do. Le Mans 2024 is 311 laps, the Rolex
24 781, the Spa 24 Hours 564 in 2013 and 478 in 2024.

- [ ] Every pace below is a judgement, none is read from a published average
      race speed, and a single figure per championship cannot fit both its
      fastest and its slowest circuit
- [ ] Where a championship's real races were a duration *and a lap* (Formula
      Abarth, the DTM, Italian F4, Formula E, the Supercups), that lap is inside
      the distance rather than stated - there is no "and one lap" to state
- [ ] A round whose circuit is much faster or slower than the championship's
      average can carry its own lap count as a `sessionLengths` override. The
      races of four hours and up all do; none of the shorter ones does yet

| Championship | km/h | Real duration -> distance raced |
| --- | --- | --- |
| adac-gt-masters | 160 | 55 min -> 145 km |
| alms-2001 | 175 | 165 min -> 480 km |
| audi-tt-cup-2016 | 135 | 30 min -> 70 km |
| blancpain-endurance-2013 | 160 | 180 min -> 480 km |
| bmw-m2-cs-racing-cup-italy | 135 | 25 min -> 55 km |
| boss-gp-open | 165 | 25 min -> 70 km |
| classic-endurance-racing-2 | 165 | 60 min -> 165 km |
| dtm-1993 | 150 | 25 min -> 65 km |
| dtm-2021 | 165 | 55 min -> 150 km |
| dtm-2025-lfm | 165 | 55 min -> 150 km |
| dtm-2025-rss | 165 | 55 min -> 150 km |
| egt-championship | 170 | 60 min -> 170 km |
| fia-gt-1997 | 175 | 180 min -> 530 km |
| fia-gt1-2010 | 165 | 60 min -> 165 km |
| formula-abarth | 135 | 28 min -> 65 km |
| formula-e-2020-21 | 100 | 45 min -> 75 km |
| formula-e-2023-24 | 110 | 45 min -> 85 km |
| formula-uk | 165 | 25 min -> 70 km |
| formula-x-invitational | 210 | 45 min -> 160 km |
| ginetta-gt4-supercup | 135 | 20 min -> 45 km |
| gt-m-championship | 165 | 60 min -> 165 km |
| gt-manufacturers-1962 | 150 | 180 min -> 450 km |
| gt-world-challenge-endurance-2024 | 160 | 180 min -> 480 km |
| gt-world-challenge-sprint | 165 | 60 min -> 165 km |
| gt2-european-series | 165 | 50 min -> 140 km |
| gt3-sprint-series | 160 | 60 min -> 160 km |
| gt4-european-cup-2010 | 140 | 60 min -> 140 km |
| gt4-european-series | 145 | 60 min -> 145 km |
| gt86-cup | 115 | 25 min -> 50 km |
| hot-hatch-trophy | 110 | 20 min -> 35 km |
| hypercar-invitational | 165 | 30 min -> 85 km |
| imsa-2017 | 175 | 160 min -> 470 km |
| imsa-2025 | 180 | 160 min -> 480 km |
| iroc-1974 | 150 | 30 min -> 75 km |
| italian-f4 | 150 | 25 min -> 65 km |
| jdm-production | 125 | 30 min -> 65 km |
| lamborghini-super-trofeo-2016 | 160 | 50 min -> 135 km |
| liana-gt-cup | 130 | 25 min -> 55 km |
| lotus-cup | 135 | 25 min -> 55 km |
| masters-gentlemen-drivers | 140 | 60 min -> 140 km |
| masters-racing-legends | 165 | 25 min -> 70 km |
| mx5-cup | 125 | 45 min -> 95 km |
| mx5-mk1-championship | 105 | 20 min -> 35 km |
| porsche-club-race | 145 | 30 min -> 75 km |
| porsche-rs60-spyder-cup | 120 | 30 min -> 60 km |
| porsche-supercup-2017 | 150 | 30 min -> 75 km |
| porsche-supercup-2021 | 150 | 30 min -> 75 km |
| porsche-supercup-2023 | 150 | 30 min -> 75 km |
| porsche-supercup-2025 | 150 | 30 min -> 75 km |
| production-car-endurance | 140 | 60 min -> 140 km |
| radical-cup-uk | 150 | 25 min -> 65 km |
| roadster-party-race | 110 | 30 min -> 55 km |
| s-fr-cup | 115 | 30 min -> 60 km |
| supercar-classic | 145 | 40 min -> 95 km |
| supercar-series | 150 | 40 min -> 100 km |
| tcr-europe | 135 | 30 min -> 70 km |
| tour-auto | 130 | 30 min -> 65 km |
| trans-am-ta2 | 155 | 60 min -> 155 km |
| trofeo-abarth-500-2009 | 115 | 25 min -> 50 km |
| tuner-invitational | 150 | 20 min -> 50 km |
| unlimited-invitational | 205 | 60 min -> 210 km |
| xx-programme | 175 | 30 min -> 90 km |
| youngtimer-trophy | 130 | 30 min -> 65 km |

### Endurance lap counts, from the real races

One line per championship, as written. Every figure is the real event's winning
distance; where our layout is a different length from the circuit that ran it,
the distance was kept and the laps recomputed.

| Championship | Rounds and laps |
| --- | --- |
| ilmc-2011-gte | six-hours: imola 198, silverstone 168; sebring-12: sebring 312; le-mans-24: le-mans 314; petit-le-mans: petit-le-mans 367 |
| wec-2012 | six-hours: spa 160, silverstone 194, sao-paulo 247, bahrain 191, fuji 233, shanghai 191; twelve-hours: sebring 325; le-mans: le-mans 378 |
| wec-2014 | six-hours: silverstone 167, spa 171, cota 186, fuji 236, shanghai 188, bahrain 195, sao-paulo 249; le-mans: le-mans 379 |
| wec-2016 | six-hours: silverstone 194, spa 160, nurburgring 194, cota 186, fuji 244, shanghai 195, bahrain 201; le-mans: le-mans 384 |
| wec-2017 | six-hours: silverstone 197, spa 173, nurburgring 204, mexico 240, cota 192, fuji 244, shanghai 195, bahrain 199; le-mans: le-mans 367 |
| wec-2023 | six-hours: portimao 222, spa 148, monza 200, fuji 229; eight-hours: sebring 239, bahrain 249; le-mans: le-mans 342 |
| wec-2024-vrc | six-hours: imola 205, spa 141, sao-paulo 236, cota 183, fuji 213; eight-hours: bahrain 235; le-mans: le-mans 311 |
| wec-2024-lfm | six-hours: imola 205, spa 141, sao-paulo 236, cota 183, fuji 213; eight-hours: bahrain 235; le-mans: le-mans 311 |
| wec-2025 | six-hours: imola 212, spa 150, sao-paulo 242, cota 183, fuji 202; eight-hours: bahrain 237; le-mans: le-mans 387 |
| elms-2025 | four-hours: barcelona 130, imola 126, spa 88, silverstone 104, portimao 135 |
| blancpain-endurance-2013 | twenty-four-hours: spa 564 |
| imsa-2017 | six-hours: watkins-glen 200; ten-hours: petit-le-mans 402; twelve-hours: sebring 348; daytona: daytona 659 |
| imsa-2025 | six-hours: watkins-glen 200; ten-hours: petit-le-mans 436; twelve-hours: sebring 353; daytona: daytona 781 |
| alms-2001 | four-hours: road-america 124; ten-hours: petit-le-mans 394; twelve-hours: sebring 370 |
| gt-world-challenge-endurance-2024 | spa-24: spa 478 |
| intercontinental-gt-challenge | twelve-hours: bathurst 323; spa-24: spa 537 |
| nurburgring-langstrecken-serie | four-hours: nls-1 27, nls-2 27, nls-3 27, nls-4 27, nls-5 27, nls-6 27; six-hours: nls-6h 35; twenty-four-hours: n24 159 |
| vln-2004 | four-hours: vln-1 24, vln-2 26, vln-3 27, vln-4 24, vln-5 25, vln-6 24, vln-8 24, vln-9 24, vln-10 27; six-hours: vln-7 39; twenty-four-hours: n24 137 |
| fia-gt-2004 | spa-24: spa 558 |
| group-a-1987 | spa-24: spa 481 |
| gt-manufacturers-1962 | twelve-hours: sebring 287; twenty-four-hours: le-mans 340 |
| world-sportscar-1969 | six-hours: boac-500 248, watkins-glen 273; twelve-hours: sebring 333; twenty-four-hours: daytona 670, le-mans 382 |
| world-championship-makes-1978 | six-hours: mugello 176, silverstone 188, watkins-glen 146, brands-hatch 249, vallelunga 209; twenty-four-hours: daytona 734 |
| bpr-global-gt-1996 | four-hours: monza 126, silverstone 108, nurburgring 122, brands-hatch 178, spa 100 |
| fia-gt-1997 | four-hours: silverstone 119, nurburgring 130, spa 101, a1-ring 161, mugello 132 |
| egt-championship | six-hours: sebring 165, watkins-glen 196, spa 145; ten-hours: road-atlanta 434 |
| production-car-endurance | six-hours: bathurst 131 |

**Substitutions, each because the real race was not a normal one:**

- [ ] WEC 2017 Fuji ran 113 laps in rain and fog - 2016's 244 stands in
- [ ] WEC 2025 COTA was red-flagged wet at 120 laps - 2024's 183 stands in
- [ ] FIA GT 1997 Silverstone was stopped at three hours - the round runs the
      full four-hour distance instead
- [ ] IMSA 2025 Watkins Glen came back as 169 laps, a pace well under GTP's -
      2017's 200 stands in, and the 2025 figure is worth rechecking
- [ ] VLN 2004 round 6 ran only 3h17 - the other rounds' 24 laps stands in
- [ ] GT World Challenge's Spa 24 2024 really was 478 laps in a wet edition,
      against 537 the year before; kept as it ran

**Rounds whose real race does not exist:**

- [ ] ALMS 2001 has no Road America round at all - it joined the calendar in
      2002, and the 2001 Road America 500 was a Grand-Am race. The round races
      500 miles (124 laps); it should probably be replaced by a real 2001 round
- [ ] The 1978 World Championship for Makes had no Brands Hatch round - the
      1979 race's distance stands in (249 laps)
- [ ] EGT and Production Car Endurance are invented, so their lap counts come
      from the nearest real race: Petit Le Mans' GTLM winner, the Bathurst 6
      Hour's outright winner, and so on

**One trap found on the way:**

- [ ] `vrc_mexico` reports its length as 2.606 km for every layout, where the
      real circuit is 4.304 km. Nothing races a distance there today - WEC 2017
      Mexico states its 240 laps - but any distance-stated race at that track
      would come out at nearly double the laps

### Prize money per class

Every multi-class championship now pays its classes differently. The
championship's own purse is the top class's; each tier below pays 0.6 of the
tier above, and an Am class (GTE Am, LMP2 Pro/Am, IMSA GTD) 0.75 of its tier.
Classes otherwise level share a purse - the NLS pays SP9 and SP-X alike, Cup 2
and Cup 3 alike, the BMW Cup and SP3T alike. WEC 2017's purse was raised to the
2016 season's, since LMP1 is its top class now.

- [ ] The factors themselves (0.6 a tier, 0.75 for Am) are a guess, not a
      reading of any real series' prize fund
- [ ] Entry fees are still one per championship; a class could carry its own the
      same way

## 4. Rules the engine cannot express yet

Each came up in at least one real season and is worth a ROADMAP decision:

- [ ] Best-N results counting (F1 up to 1990, several historic seasons)
- [x] ~~A timed race plus one lap~~ - there are no timed races any more:
      Assetto Corsa cannot run one offline, so every race is laps or a
      distance and the extra lap is inside the distance
- [ ] Fastest-lap point only for a top-ten finisher (F1 2019-2024)
- [ ] Points at intermediate hours (Spa 24 Hours in Blancpain 2013, FIA GT 2004)
- [ ] Compulsory pit stop or tyre change (F2 feature race, Super Formula, BTCC
      feature race)
- [ ] Formula E's energy management and attack mode
- [ ] Per-class qualifying and Hyperpole (WEC); manufacturers' points (IGTC);
      driver changes (GT World Challenge, ADAC GT Masters)
- [ ] IndyCar's points for leading a lap and leading the most laps
- [ ] Best of two qualifying sessions (F1 1990 and similar) - only one session is run

## 5. Follow-ups already known

- [ ] `formula-2-2024` became `formula-2-2024-rss` after Batch 4 was committed -
      only matters if a result or a customised copy was filed under the old id
- [ ] Tests for `withSessionLaps` (and the batches' core changes) after review,
      per the project's test workflow
- [ ] The timed-race conversion is owed tests too: `validateLength` refusing a
      race in minutes, and `buildRaceIni` refusing one with no laps
- [ ] Drive one round per batch in the game before calling the batches done
- [ ] Rounds that need no mod, only adding (see `missing-tracks.md`): Mexico City
      on VRC's `vrc_mexico` for F1 1967, 1986, 2015 and 2017, WEC 2016, WSPC 1990
      and Supercup 2017 (twice), whose headers still call it missing; and
      Supercup 2017's second Spa race
- [ ] F1 1971 and 1975 skip the Osterreichring although F1 1970 and 1979 race
      it on the Red Bull Ring; FIA GT 1997 may have Mugello in the wrong place
- [x] F1 2005's Hungaroring now comes before Istanbul, as it ran
- [x] ~~Six championship descriptions named the wrong DLC pack~~ - the
      provenance catalogue had the Red Pack and the Tripl3 Pack swapped, caught
      while authoring the content links against Steam's own app ids. Formula 1
      1954, 1957, 2013 and 2015 and GT3 Sprint Series said Tripl3 Pack where
      they meant Red Pack, and XX Programme Invitational the other way round;
      all six are corrected. No version was bumped, so
      `%APPDATA%/ac-career-mode/content-cache.json` still holds the old
      provenance - yours to delete
- [ ] Cars with no championship: the Nissan GT-R GT1's 2009, 2011 and Endurance
      versions. Yezhrod's 2014 Ligier JS P2 now races LMP2 in WEC 2014 and 2016,
      which puts Yezhrod on both championships' requirements
- [ ] WEC 2024 (VRC) and 2025 now need LFM as well as their own maker, for the
      LMGT3 class
- [ ] Known gap: mod layouts inside base circuits (`spa/2022`, `*_osrw`,
      `monza/lfm`) read as base provenance

## 6. Invented names replaced during authoring

For awareness only - these were caught and changed because they sat too close to
real people. Worth one more skim of the invented fields for anything missed.

- Batch 1-2: several real GT drivers and three real Lamborghini teams
- Batch 3: Holloway, Bernhard (a 919 driver), Villeneuve, Tsuchiya, two Initial D
  surnames on a Gunma AE86 team, Ballot-Lena, Merlo, Dumoulin, Garfield, Mottram
- Batch 4: Ambrose, Zanardi, Ottolenghi, Lafreniere
- Batch 5: the Formula E, BTCC and Trans-Am fields are new and unreviewed; IndyCar
  and WEC 2024 reuse the Batch 4 fields
- Batch 6: the WEC LMGT3, ADAC GT Masters, TCR Europe, Supercup 2025 and six
  Endurance Cup teams are new and unreviewed; GT World Challenge reuses the
  GT-M paddock, DTM 2025 (LFM) the RSS field and WEC's hypercars the WEC 2025 field
- Batch 7: the EGT and Radical Cup UK fields are new and unreviewed; Supercup 2021
  reuses the Supercup 2025 field
- Batch 8: the GT2 European Series and BMW M2 Cup fields, four GT4 teams and three
  ALMS prototype teams are new and unreviewed; the rest reuse earlier fields
  (ADAC GT Masters, Supercup, Radical Cup UK, Roadster Party Race, Trofeo Abarth
  500, FIA GT 2004, NLS)
- Batch 9: six LMP2 teams, five prototype teams and three IMSA LMP2 teams are new
  and unreviewed; the rest reuse the WEC, EGT and FIA GT 2004 paddocks
