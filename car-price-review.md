# Car price review

Every car the app's catalogue names, at what the real car costs - researched
for this list, then pulled to within 25% of the median of its class and
generation where one class held prices too far apart. Kept as the record of
where each figure in `CAR_PRICES` (`src/shared/utils/car-prices/constants.ts`)
comes from, so a price can be traced back and re-checked.

- **What a price is:** what one costs to acquire today - new from the maker
  while it is still built, otherwise what a typical example sells for, and for
  a car never sold (a works F1 car or hypercar) what building one cost. A tuned
  variant is its base car plus the work. A renamed replica (RSS, VRC and the
  like) is priced as the real car it copies.
- **Confidence:** high where a price for that exact car was read, medium where
  it comes from close relatives or ranges, low where it is an estimate.
  122 high, 364 medium, 111 low.
- **Pulled to the class:** 80 cars, each showing the researched figure.

## 24H Series GTX 2016-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `marc_mustang_v8_gt2` | MARC II V8 Mustang (2018, 24H Series GTX / Belcar) | $225,000 | market | medium | A 2018 MARC II V8 Mustang (carbon body, spaceframe, 5.2 Coyote V8) with spares sold on Racecarsdirect at 195,000 + VAT, currency not shown (taken as EUR, ~$226k at 1.16); MARC Cars quoted new cars at A$380k + GST (~$250k at 0.66) [1](https://racecarsdirect.com/Advert/Details/125402/trees) [2](https://velocitynews.co.nz/?p=32382) |

## BMW M2 Cup 2020-2023

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_bmw_m2_cs_racing` | BMW M2 CS Racing (2020) | $115,000 | market | high | As `gue_bmw_m2_cs`. Used M2 CS Racing asks cluster at EUR 98-110k ex VAT (Racecarsdirect, Racemarket); about EUR 100k (~$116k at 1.16) [1](https://racecarsdirect.com/Advert/Details/152804/bmw-m2-cs-racing-450-hp-8300-kms) [2](https://de.racemarket.net/rennfahrzeuge/rennwagen-kaufen/bmw-m2-cs-racing-i6239) |
| `gue_bmw_m2_cs` | BMW M2 CS Racing (2020) | $115,000 | market | high | Used M2 CS Racing asks cluster at EUR 98-110k ex VAT (Racecarsdirect, Racemarket); about EUR 100k (~$116k at 1.16) [1](https://racecarsdirect.com/Advert/Details/152804/bmw-m2-cs-racing-450-hp-8300-kms) [2](https://de.racemarket.net/rennfahrzeuge/rennwagen-kaufen/bmw-m2-cs-racing-i6239) |

## Brasileiro de Marcas 2011-2014 - median $65,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `copa_marcas_corolla_v4` | Brasileiro de Marcas Toyota Corolla (2014) | $65,000 | market | low | No car price published; a season cost about R$600k per car in 2011, the car itself estimated at ~R$350k (~$65k at 5.4) [1](https://motorshow.com.br/novidades-nas-pistas) |
| `copa_marcas_ford_v4` | Brasileiro de Marcas Ford Focus (2011-2014) | $65,000 | market | low | No car price published; a season cost about R$600k per car in 2011, the car itself estimated at ~R$350k (~$65k at 5.4) [1](https://motorshow.com.br/novidades-nas-pistas) |
| `copa_marcas_honda_v4` | Brasileiro de Marcas Honda Civic (2014) | $65,000 | market | low | No car price published; a season cost about R$600k per car in 2011, the car itself estimated at ~R$350k (~$65k at 5.4) [1](https://motorshow.com.br/novidades-nas-pistas) |
| `copa_marcas_lancer_v4` | Brasileiro de Marcas Mitsubishi Lancer (2014) | $65,000 | market | low | No car price published; a season cost about R$600k per car in 2011, the car itself estimated at ~R$350k (~$65k at 5.4) [1](https://motorshow.com.br/novidades-nas-pistas) |
| `copa_marcas_renault_v4` | Brasileiro de Marcas Renault Fluence (2014) | $65,000 | market | low | No car price published; a season cost about R$600k per car in 2011, the car itself estimated at ~R$350k (~$65k at 5.4) [1](https://motorshow.com.br/novidades-nas-pistas) |

## BTCC NGTC 2011- - median $95,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `civic_btcc_2023` | Honda Civic Type R BTCC NGTC (2023) | $120,000 (researched $135,000) | market | low | Newest-spec NGTC car; no sale found, estimated above the 2021 cars at ~GBP 100k (~$135k at 1.33); hybrid unit leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_cupra_leon_btcc` | Cupra Leon BTCC NGTC (2023, Team HARD) | $120,000 (researched $135,000) | market | low | Newest-spec NGTC car; no sale found, estimated above the 2021 cars at ~GBP 100k (~$135k at 1.33); hybrid unit leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `civic_btcc_2021` | Honda Civic Type R (FK8) BTCC NGTC (2021) | $115,000 | market | low | No sale of a recent NGTC car found; older cars ask GBP 60-75k, and NGTC cars cost GBP 200k+ to build against a GBP 100k target, so a 2021 car is estimated at ~GBP 86k (~$115k at 1.33); the hybrid unit is leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_corolla_btcc` | Toyota Corolla GR Sport BTCC NGTC (2021, Speedworks) | $115,000 | market | low | No sale of a recent NGTC car found; older cars ask GBP 60-75k and NGTC builds cost GBP 200k+, so a 2021 car is estimated at ~GBP 86k (~$115k); hybrid unit leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_focus_btcc` | Ford Focus ST BTCC NGTC (2021, Motorbase) | $115,000 | market | low | No sale of a recent NGTC car found; older cars ask GBP 60-75k and NGTC builds cost GBP 200k+ (Motorbase's first NGTC Focus about GBP 300k), so a 2021 car is estimated at ~GBP 86k (~$115k); hybrid unit leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_vauxhall_astra_2021` | Vauxhall Astra BTCC NGTC (2021, Power Maxed) | $115,000 | market | low | No sale of a recent NGTC car found; older cars ask GBP 60-75k and NGTC builds cost GBP 200k+, so a 2021 car is estimated at ~GBP 86k (~$115k); hybrid unit leased, not included [1](https://en.wikipedia.org/wiki/Next_Generation_Touring_Car) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `btcc_bmw_125i_m` | BMW 125i M Sport BTCC NGTC (2018, WSR) | $95,000 | market | medium | Later-spec NGTC car a little above the early ones; Infiniti Q50 title car listed and sold at GBP 59,995 + VAT, 2016 Levorg estimated GBP 65-75k (Iconic 2024) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `btcc_mg6` | MG6 GT BTCC NGTC (2019) | $95,000 | market | medium | Later-spec NGTC car; Infiniti Q50 title car listed and sold at GBP 59,995 + VAT, 2016 Levorg estimated GBP 65-75k (Iconic 2024) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `subaru_levog_btcc` | Subaru Levorg GT BTCC NGTC (2016-2019, BMR) | $95,000 | market | medium | Plato's 2016 Levorg (chassis 039-03) estimated GBP 65-75k at Iconic Silverstone 2024 and did not sell; a 2019-spec car taken at ~GBP 72k (~$95k at 1.33) [1](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) [2](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) |
| `fsr_aud_s3saloon_14` | Audi S3 Saloon BTCC NGTC (2014) | $90,000 | market | medium | Used NGTC cars: the 2020-21 title-winning Infiniti Q50 listed (and sold) at GBP 59,995 + VAT; Plato's 2016 Levorg estimated GBP 65-75k at Iconic Silverstone 2024 (unsold) - an early NGTC car taken at ~GBP 68k (~$90k at 1.33) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_bmw_125i_14` | BMW 125i M Sport BTCC NGTC (2014, WSR) | $90,000 | market | medium | Used NGTC cars: Infiniti Q50 title car listed and sold at GBP 59,995 + VAT; 2016 Levorg estimated GBP 65-75k (Iconic 2024, unsold) - taken at ~GBP 68k (~$90k at 1.33) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_cruze_btcc` | Chevrolet Cruze BTCC NGTC (2013-2016) | $90,000 | market | medium | Used NGTC cars: Infiniti Q50 title car listed and sold at GBP 59,995 + VAT; 2016 Levorg estimated GBP 65-75k (Iconic 2024, unsold) - taken at ~GBP 68k (~$90k at 1.33) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_mercedes_aclass_14` | Mercedes-Benz A-Class BTCC NGTC (2014, Ciceley) | $90,000 | market | medium | Used NGTC cars: Infiniti Q50 title car listed and sold at GBP 59,995 + VAT; 2016 Levorg estimated GBP 65-75k (Iconic 2024, unsold) - taken at ~GBP 68k (~$90k at 1.33) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |
| `fsr_toyota_avensis_14` | Toyota Avensis BTCC NGTC (2014, GPRM) | $90,000 | market | medium | Used NGTC cars: Infiniti Q50 title car listed and sold at GBP 59,995 + VAT; 2016 Levorg estimated GBP 65-75k (Iconic 2024, unsold) - taken at ~GBP 68k (~$90k at 1.33) [1](https://www.racecarsdirect.com/Advert/Details/132168/btcc-championship-winning-infiniti-q50) [2](https://iconicauctioneers.auctioneersvault.com/catalogues/the-iconic-sale-at-silverstone-festival-2024/25) |

## Can-Am (Group 7) 1966-1974

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_917_30` | Porsche 917/30 Spyder (1973) | $4,400,000 | market | high | 917/30 chassis 004 sold for $4.4m at Gooding Amelia Island 2012; a reported 2016 resale near $3m is unconfirmed [1](https://www.goodingco.com/press/article/led-by-the-record-breaking-usd4-4-million-porsche-917-30-can-am-spyder) |

## Clio Cup 2019-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_clio_cup_2023` | Renault (Alpine) Clio Cup, Clio V (2023) | $57,000 | new | high | Still built (facelifted for 2024). Alpine Racing's 2026 brochure lists EUR 48,990 ex VAT ex works, assembled (~$57k at 1.16); EUR 47,500 + VAT in 2023 [1](https://www.cliocup.fr/IMG/pdf/brochure_new_clio_cup_2026_en.pdf) [2](https://www.cliocup.fr/IMG/pdf/2023_clio_cup_series_pre_guidelines.pdf) |

## Concept (no class to compare)

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_redbull_x2010` | Red Bull X2010 (Gran Turismo 5 concept, 2010), detuned 630 hp version | $10,000,000 | build | low | Only a full-size, non-functioning model was ever built; no cost published. A working one-off is estimated above a contemporary F1 car's build [1](https://en.wikipedia.org/wiki/Red_Bull_X2010) |
| `urd_redbull_x2010_s1` | Red Bull X2010 (Gran Turismo 5 concept, 2010), full 1,500 hp spec | $10,000,000 | build | low | The full-spec X2010 (Wikipedia gives 1,483 hp); same build estimate [1](https://en.wikipedia.org/wiki/Red_Bull_X2010) |
| `fsr_formula_x` | No real equivalent - fictional 'Formula Xtreme' 1,100 hp single-seater (2017) | $2,500,000 | build | low | No real car; a bespoke 1,100 hp single-seater estimated well above a spec chassis (Super Formula SF23 ~$500k) and far below a works F1 car  |
| `toyota_gr_supra_racing` | Toyota GR Supra Racing Concept (2018 Geneva show car) | $600,000 | build | low | Running show concept with a full cage, built by Toyota Gazoo Racing; never sold or priced. Build estimated at a new GT3 car's price [1](https://media.toyota.co.uk/vehicles/gr-supra-racing-concept/) |
| `etruck_scania` | Scania electric race truck (fictional, Copa Truck style, 2024) | $500,000 | build | low | No electric Scania has raced in Copa Truck (VW's 2023 Meteor Mission Zero is a diesel hybrid); a one-off 1,000 hp electric race truck estimated above a diesel Copa Truck build [1](https://garagem360.com.br/primeiro-caminhao-de-corrida-hibrido-do-mundo-estreia-na-copa-truck/) |
| `gue_toyota_s-fr_cup` | Toyota S-FR Racing Concept (2016) | $150,000 | build | low | Show concept, never sold; estimated build cost of a one-off race-car concept  |

## DTM 2012-2018 - median $850,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_t5_maures_2018` | Mercedes-AMG C 63 DTM (2018) | $1,050,000 (researched $1,100,000) | market | medium | Mechatronik asked EUR 1,282,328 with spares (2021) for C63 DTM RS15-012, raced 2015-2018 and in 2018 aero at the end; a typical sale is put under that ask [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) [2](https://www.auto-motor-und-sport.de/motorsport/dtm-mercedes-c63-amg-gebrauchtwagen-wehrlein-verkauf-mechatronik/) |
| `urd_t5_aura_2018` | Audi RS 5 DTM (2018) | $950,000 | market | low | Taken as the 2018 RS 5 DTM. Estimated a little under the C63 DTM ask; Audi's factory sales are unpriced [1](https://www.motor1.com/news/755410/audi-r18-rs5-dtm-for-sale/) [2](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) |
| `urd_t5_bayro_2018` | BMW M4 DTM (2018) | $950,000 | market | low | Taken as the 2018 M4 DTM; priced with the 2018 Audi [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) |
| `urd_t5_aura_2015` | Audi RS 5 DTM (2015) | $850,000 | market | medium | Audi Sport racing legends sells ex-works RS 5 DTMs, starting with chassis 107 (2015 Hockenheim winner), and sold three in under a year; prices are undisclosed [1](https://www.motor1.com/news/755410/audi-r18-rs5-dtm-for-sale/) [2](https://www.carscoops.com/2026/04/audi-sport-racing-legends-backlog/) |
| `urd_t5_bayro_2015` | BMW M4 DTM (2015) | $850,000 | market | low | Taken as the M4 DTM. No race-car sale found (only road Champion Editions); priced with the Audi [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) |
| `urd_t5_maures_2015` | Mercedes-AMG C-Coupe DTM (2015) | $850,000 | market | low | Taken as the C-Coupe in its last season (the C63 DTM came in 2016); priced with the Audi [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) |
| `urd_t5_aura` | Audi RS 5 DTM (2013) | $750,000 | market | low | Replica identified from 'T5 Aura' and its "T5 Series 2013" livery. Estimated below later cars: a 2015-built C63 DTM asked EUR 1.28M (2021) and a 2019 Vantage DTM sold for EUR 522.5k (2024) [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) [2](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) |
| `urd_t5_bayro` | BMW M3 DTM (E92, 2012-2013) | $750,000 | market | low | Replica identified from 'T5 Bayro', with the E92 M3 body and a 2013 livery; same basis as the Aura [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) [2](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) |
| `urd_t5_maures` | Mercedes-AMG C-Coupe DTM (2013) | $750,000 | market | low | Replica identified from 'T5 Maures', with the C-Coupe body and a 2013 livery (its `ui_car.json` says 2015); same basis as the Aura [1](https://www.motor16.com/noticias/mercedes-amg-c63-dtm-tuyo-por-1282328-euros/) [2](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) |

## DTM Class 1 1993-1996 - median $650,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_mercedes_1995_dtm` | AMG-Mercedes C-Klasse V6 DTM/ITC (1995) | $650,000 | market | medium | As `Mercedes_DTM_1995`. No C-Klasse Class 1 sale found; priced with the Alfa 155 V6 TI that sold for EUR 552k (~$646k) at Bonhams Monaco, April 2026 [1](https://www.sportscarmarket.com/profile/1995-alfa-romeo-155-v6-ti-dtm) [2](https://supercarnostalgia.com/blog/one-to-buy-ex-amg-1994-mercedes-benz-w202-c-class-dtm-class-1) |
| `Mercedes_DTM_1995` | AMG-Mercedes C-Klasse V6 DTM/ITC (1995) | $650,000 | market | medium | No C-Klasse Class 1 sale found (RS 94 211 offered by Jan Luehn 2024, price on request; a 1995 car goes to RM Munich 20 Nov 2026); priced with the rival Alfa 155 V6 TI, which sold for EUR 552k (~$646k) at Bonhams Monaco, April 2026 [1](https://www.sportscarmarket.com/profile/1995-alfa-romeo-155-v6-ti-dtm) [2](https://supercarnostalgia.com/blog/one-to-buy-ex-amg-1994-mercedes-benz-w202-c-class-dtm-class-1) |
| `mercedes_dtm_95` | AMG-Mercedes C-Klasse V6 DTM/ITC (1995) | $650,000 | market | medium | As `Mercedes_DTM_1995`. No C-Klasse Class 1 sale found; priced with the Alfa 155 V6 TI that sold for EUR 552k (~$646k) at Bonhams Monaco, April 2026 [1](https://www.sportscarmarket.com/profile/1995-alfa-romeo-155-v6-ti-dtm) [2](https://supercarnostalgia.com/blog/one-to-buy-ex-amg-1994-mercedes-benz-w202-c-class-dtm-class-1) |
| `alfa_romeu-dtm_94` | Alfa Romeo 155 V6 TI DTM/ITC (1994) | $620,000 | market | medium | As `ks_alfa_romeo_155_v6`. 1994 Schuebel 155 V6 TI DTM re-offered at RM Paris Feb 2025 at EUR 500-600k, down from EUR 650-750k a year earlier; chassis 005 estimated GBP 500-600k (RM Paris 2022) - typical ~EUR 540k (~$620k) [1](https://radical-mag.com/2025/01/21/alfa-romeo-155-2-5-v6-ti/) [2](https://www.topgear.com/car-news/motorsport/we-want-alfa-romeo-155-v6-ti-more-anything-else-world) |
| `ks_alfa_romeo_155_v6` | Alfa Romeo 155 V6 TI DTM/ITC (1993-1996) | $620,000 | market | medium | 1994 Schuebel 155 V6 TI DTM re-offered at RM Paris Feb 2025 at EUR 500-600k, down from EUR 650-750k a year earlier; chassis 005 estimated GBP 500-600k (RM Paris 2022) - typical ~EUR 540k (~$620k) [1](https://radical-mag.com/2025/01/21/alfa-romeo-155-2-5-v6-ti/) [2](https://www.topgear.com/car-news/motorsport/we-want-alfa-romeo-155-v6-ti-more-anything-else-world) |

## E1-XP2 2011-2012

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `p4-5_2011` | Ferrari P4/5 Competizione by Scuderia Cameron Glickenhaus (2011) | $2,500,000 | build | medium | One-off on a 430 Scuderia; the road P4/5 cost Glickenhaus about $4m from Pininfarina, the race car estimated below that [1](https://en.wikipedia.org/wiki/Ferrari_P4/5_by_Pininfarina) |

## F1 1954-1960 - median $4,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_maserati_250f_12cyl` | Maserati 250F T2 V12 (1957) | $5,000,000 | market | low | The works V12 250F is essentially unique; priced above a typical 250F and below the ex-Moss offset 250F ($6-8m estimate, 2014)  |
| `ks_maserati_250f_6cyl` | Maserati 250F (1954) | $3,000,000 | market | medium | Genuine 250Fs: Monaco winner bid to $2.04m (unsold), ex-Moss car estimated $6-8m (2014); replicas make about $0.4-0.9m [1](https://www.paulfrasercollectibles.com/blogs/classic-cars/1956-maserati-250f-offered-at-6m-in-pebble-beach-auction) |

## F1 1961-1965

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_lotus_25` | Lotus 25 (1962) | $1,500,000 | market | medium | Clark's Lotus 25 made about $1m (Bonhams Sydney 2008) and a 25 recreation $959k (2007); raised for market growth since [1](https://www.sportscarmarket.com/profile/1962-lotus-25-f1) |

## F1 1967-1976 - median $2,250,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ferrari_312t` | Ferrari 312T (1975) | $2,800,000 (researched $6,000,000) | market | high | Lauda's 312T chassis 022 sold for $6.0m at Gooding Pebble Beach 2019, judged a fair price for a typical example [1](https://www.sportscarmarket.com/profile/1975-ferrari-312t-niki-lauda) |
| `ks_ferrari_312_67` | Ferrari 312 F1 (1967) | $2,800,000 (researched $3,000,000) | market | medium | Sibling 1969 Ferrari 312 F1 chassis 17 (Amon) bid to $1.15m unsold at Gooding Pebble Beach, chassis 19 bid $500k at RM 2003; priced above those bids for market growth and below Lauda's 312T ($6.0m, 2019) [1](https://www.hagerty.com/valuation-tools/past-sales/1969-ferrari-312_f1/17/a0262eb0-43cf-4f2f-b8b1-5da1d680176e) [2](https://www.hagerty.com/valuation-tools/past-sales/1969-ferrari-312_f1/19/c3780c65-33c4-4c8d-9bf6-e736ec991012) |
| `ks_lotus_72d` | Lotus 72D (1971-1972) | $2,500,000 | market | medium | A Lotus 72 made GBP 286k at H&H in 2007; DFV-era works F1 cars now trade in the low millions [1](https://www.racecar.com/news/18266/market-and-auction/286000-for-lotus-72-..) [2](https://www.sportscarmarket.com/profile/1975-ferrari-312t-niki-lauda) |
| `lotus_49` | Lotus 49 (1967) | $2,000,000 | market | medium | Ex-Hill Lotus 49B R8 was estimated GBP 700k-1m at Bonhams Goodwood 2014; one of 12 built, raised for market growth [1](https://classicandsportscar.com/news/classic-car-auctions/ex-graham-hill-lotus-49-to-be-auctioned-at-goodwood) |
| `rss_formula_70` | Lotus 72C / March 701 type Cosworth DFV car (1970), assumed | $2,000,000 | market | low | Generic 1970 British DFV car; a Lotus 72 made GBP 286k in 2007, such cars now trade in the low millions  |
| `rss_formula_70_s` | Lotus 72C / March 701 type Cosworth DFV car (1970), assumed | $2,000,000 | market | low | Variant of the Formula RSS 1970; generic British DFV car of 1970, valued as such cars now trade  |

## F1 1977-1982

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_79` | Williams FW07 (1979), assumed | $1,200,000 | market | medium | Taken as the FW07: Jones's GP-winning FW07/01 bid GBP 675k (~$940k) in 2018, FW07/04 sold ~$500k (Sotheby's Melbourne 2010), the best FW07s reported near $1m; raised a little for market growth [1](https://jerseyeveningpost.com/motors/2018/03/21/gp-winning-f1-car-could-sell-for-1m-at-auction/) [2](https://sportscarmarket.com/profile/1979-williams-fw07-formula-one) |

## F1 1983-1988 - median $10,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_1988_mclaren_mp4-4_r02` | McLaren-Honda MP4/4 (1988) | $10,000,000 | market | medium | Chassis MP4/4A-04 (Prost) changed hands privately via Tom Hartley Jnr in Dec 2025, price undisclosed; every MP4/4 is a Senna/Prost race winner, and Senna-raced winners of the era are estimated $9.5-12m (Lotus 98T-3, RM Sotheby's 2026) and $12-15m (MP4/6, RM Sotheby's 2025) [1](https://www.tomhartleyjnr.com/sold-the-most-dominant-formula-1-car-of-all-time-mclaren-mp4-4a-04/) [2](https://www.octane-magazine.com/news/ayrton-sennas-lotus-98t-f1-car-could-fetch-12m-in-rm-sothebys-auction/) [3](https://rmsothebys.com/media-center/press-releases/senna-s-mclaren-mp46-the-car-that-won-in-brazil-and-defined-his-third-and-final-drivers-championship) |
| `vrc_1988_mclaren_mp4-4_r04` | McLaren-Honda MP4/4 (1988) | $10,000,000 | market | medium | Chassis MP4/4A-04 (Prost) changed hands privately via Tom Hartley Jnr in Dec 2025, price undisclosed; every MP4/4 is a Senna/Prost race winner, and Senna-raced winners of the era are estimated $9.5-12m (Lotus 98T-3, RM Sotheby's 2026) and $12-15m (MP4/6, RM Sotheby's 2025) [1](https://www.tomhartleyjnr.com/sold-the-most-dominant-formula-1-car-of-all-time-mclaren-mp4-4a-04/) [2](https://www.octane-magazine.com/news/ayrton-sennas-lotus-98t-f1-car-could-fetch-12m-in-rm-sothebys-auction/) [3](https://rmsothebys.com/media-center/press-releases/senna-s-mclaren-mp46-the-car-that-won-in-brazil-and-defined-his-third-and-final-drivers-championship) |
| `vrc_1988_mclaren_mp4-4_r09` | McLaren-Honda MP4/4 (1988) | $10,000,000 | market | medium | Chassis MP4/4A-04 (Prost) changed hands privately via Tom Hartley Jnr in Dec 2025, price undisclosed; every MP4/4 is a Senna/Prost race winner, and Senna-raced winners of the era are estimated $9.5-12m (Lotus 98T-3, RM Sotheby's 2026) and $12-15m (MP4/6, RM Sotheby's 2025) [1](https://www.tomhartleyjnr.com/sold-the-most-dominant-formula-1-car-of-all-time-mclaren-mp4-4a-04/) [2](https://www.octane-magazine.com/news/ayrton-sennas-lotus-98t-f1-car-could-fetch-12m-in-rm-sothebys-auction/) [3](https://rmsothebys.com/media-center/press-releases/senna-s-mclaren-mp46-the-car-that-won-in-brazil-and-defined-his-third-and-final-drivers-championship) |
| `vrc_1988_mclaren_mp4-4_r10` | McLaren-Honda MP4/4 (1988) | $10,000,000 | market | medium | Chassis MP4/4A-04 (Prost) changed hands privately via Tom Hartley Jnr in Dec 2025, price undisclosed; every MP4/4 is a Senna/Prost race winner, and Senna-raced winners of the era are estimated $9.5-12m (Lotus 98T-3, RM Sotheby's 2026) and $12-15m (MP4/6, RM Sotheby's 2025) [1](https://www.tomhartleyjnr.com/sold-the-most-dominant-formula-1-car-of-all-time-mclaren-mp4-4a-04/) [2](https://www.octane-magazine.com/news/ayrton-sennas-lotus-98t-f1-car-could-fetch-12m-in-rm-sothebys-auction/) [3](https://rmsothebys.com/media-center/press-releases/senna-s-mclaren-mp46-the-car-that-won-in-brazil-and-defined-his-third-and-final-drivers-championship) |
| `lotus_98t` | Lotus-Renault 98T (1986) | $7,500,000 (researched $6,000,000) | market | medium | Senna's race-winning 98T-3 estimated $9.5-12m by RM Sotheby's (2026); a typical 98T without that history valued well below [1](https://www.motorsportmagazine.com/articles/single-seaters/f1/sennas-lotus-98t-heads-to-auction-with-an-estimate-of-up-to-12m/) |
| `rss_formula_1986` | Williams-Honda FW11 (1986), assumed | $7,500,000 (researched $3,500,000) | market | medium | Taken as the FW11; the record Williams at auction is Mansell's title-winning FW14B at GBP 2.703m (Bonhams Goodwood 2019, ~$3.4m), market firmer since; no FW11 sale found [1](https://www.drivencarguide.co.nz/news/iconic-williams-1992-formula-1-championship-winner-sells-for-51-million/) [2](https://www.classicandsportscar.com/node/48546) |

## F1 1989-1994 - median $4,500,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_1990_v10` | McLaren-Honda MP4/5B (1990), assumed | $5,650,000 (researched $6,000,000) | market | medium | Taken as the MP4/5B; Senna's MP4/8 made $5.0m (Bonhams Monaco 2018), Senna's MP4/6 estimated $12-15m (RM Sotheby's 2025) and McLaren's own MP4/6As reported at GBP 5-10m; a typical MP4/5B priced near the lower end [1](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) [2](https://www.carthrottle.com/news/mclaren-flogging-five-iconic-f1-cars-eye-watering-price-tag) [3](https://www.octane-magazine.com/news/sennas-mclaren-mp4-6-to-be-sold-by-rm-sothebys-in-december/) |
| `rss_formula_1990` | Ferrari 641 (1990), assumed | $4,500,000 | market | medium | Taken as the Ferrari 641; Prost's Ferrari 643 sold for $4.03m at RM Sotheby's Paris 2023 [1](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `vrc_1991_jordan_191` | Jordan-Ford 191 (1991) | $3,400,000 (researched $570,000) | market | medium | Bonhams Goodwood Revival 2026 estimate GBP 325-525k for a non-Schumacher 1991 Jordan-Ford 191 (midpoint ~GBP 425k at 1.34); Schumacher's debut car made EUR 1.3m (Bonhams Paris 2023) as the outlier [1](https://www.gpfans.com/en/f1-news/1088802/iconic-f1-car-made-famous-by-michael-schumacher-is-up-for-auction-and-could-cost-500-000/) [2](https://www.crash.net/f1/news/1019340/1/michael-schumacher-s-beautiful-jordan-sold-whopping-sevenfigure-price) |

## F1 1995-1997 - median $3,750,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_1997_ferrari_f310b` | Ferrari F310B (1997) | $4,700,000 (researched $5,000,000) | market | medium | Between Prost's 643 ($4.03m, 2023) and Schumacher's F300 ($6.2m, 2022) [1](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `vrc_1997_williams_fw19` | Williams-Renault FW19 (1997) | $2,800,000 (researched $2,500,000) | market | medium | No FW19 sale found; priced below the record Williams, Mansell's FW14B at GBP 2.703m (Bonhams Goodwood 2019, ~$3.4m), as a later and less storied title winner [1](https://www.classicandsportscar.com/node/48546) |

## F1 1998-2008 - median $3,375,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_f2004` | Ferrari F2004 (2004) | $4,200,000 (researched $6,000,000) | market | medium | F2004 chassis 234 made $3.2m in 2005; Schumacher-era Ferraris since sold at $6.6m (F2002, 2019) and $7.5m (F2001, 2017) [1](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `rss_formula_2000` | Ferrari F1-2000 (2000), assumed | $4,200,000 (researched $6,000,000) | market | medium | Taken as the F1-2000; neighbouring Ferraris sold at $6.2m (F300, 2022), $7.5m (F2001, 2017), $6.6m (F2002, 2019) [1](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `vrc_formula_alpha_2007_f07` | Ferrari F2007 (2007) | $4,000,000 | market | medium | Ferrenzo F07 taken as the F2007; Ferrari F1 Clienti cars of the era EUR 1.5-2.5m and rising, Massa's 248 F1 made $2.2m in 2007 [1](https://www.thedrive.com/news/6288/ferraris-2013-f1-race-car-may-be-the-last-one-rich-folks-can-buy) [2](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `vrc_formula_alpha_2007_mc22` | McLaren-Mercedes MP4-22 (2007) | $2,750,000 | market | medium | Taken as the MP4-22; sibling McLarens: MP4-17A-06 sold CHF 1.97m (2021), re-offered EUR 1.0-1.4m (2026); Hamilton's MP4-21 test car estimated GBP 2.2-2.75m; a Hamilton/Alonso MP4-22 at the top of that [1](https://rmsothebys.com/auctions/sm21/lots/r0014-2002-mclaren-mp417d/) [2](https://www.planetf1.com/news/kimi-raikkonen-mclaren-debut-season-david-coulthard-final-win-mclaren-auction) [3](https://www.sportskeeda.com/f1/news-2-7-million-worth-lewis-hamilton-driven-mclaren-f1-car-auction) |
| `vrc_2005_mclaren_mp420` | McLaren-Mercedes MP4-20 (2005) | $2,550,000 (researched $2,500,000) | market | medium | Sibling McLarens: race-winning MP4-17A-06 sold CHF 1.97m (RM St. Moritz 2021) and re-offered at EUR 1.0-1.4m no reserve (2026); Hamilton's MP4-21 test car estimated GBP 2.2-2.75m; MP4-20 (Raikkonen, 10 wins) priced between [1](https://rmsothebys.com/auctions/sm21/lots/r0014-2002-mclaren-mp417d/) [2](https://www.planetf1.com/news/kimi-raikkonen-mclaren-debut-season-david-coulthard-final-win-mclaren-auction) [3](https://www.sportskeeda.com/f1/news-2-7-million-worth-lewis-hamilton-driven-mclaren-f1-car-auction) |
| `vrc_2005_renault_r25` | Renault R25 (2005) | $2,550,000 (researched $1,000,000) | market | medium | Alonso's R24 race chassis made only GBP 218k (RM Sotheby's Paris 2022); the title-winning R25 valued higher [1](https://www.planetf1.com/news/fernando-alonso-renault-sold-lower-price) |

## F1 2009-2013 - median $3,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_f138` | Ferrari F138 (2013) | $3,500,000 | market | medium | Sold via Ferrari F1 Clienti (the last F1 car it offered); V8-era Clienti cars went for EUR 1.5-2.5m, prices since rising [1](https://www.thedrive.com/news/6288/ferraris-2013-f1-race-car-may-be-the-last-one-rich-folks-can-buy) [2](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `rss_formula_2010` | Ferrari F10 (2010), assumed | $3,500,000 | market | medium | Taken as the F10; V8-era Ferraris sold through F1 Clienti at EUR 1.5-2.5m and rising; McLaren MP4-25 made $6.7m in 2021 [1](https://www.thedrive.com/news/6288/ferraris-2013-f1-race-car-may-be-the-last-one-rich-folks-can-buy) [2](https://www.theclassicvaluer.com/post/the-top-10-most-expensive-f1-cars-to-sell-at-auction) |
| `rss_formula_2013` | Mercedes F1 W04 / Red Bull RB9 (2013), assumed | $3,000,000 | market | low | Generic British V8 car of 2013; Hamilton's W04 made $18.8m (2023) as an outlier, ordinary V8-era cars far less  |
| `vrc_2009_williams_fw31` | Williams-Toyota FW31 (2009) | $2,250,000 (researched $700,000) | market | low | No FW31 sale found; a winless midfield car, priced near Alonso's R24 (GBP 218k, 2022) with a V8-era premium  |
| `vrc_2009_williams_fw31_s1` | Williams-Toyota FW31 (2009) | $2,250,000 (researched $700,000) | market | low | Variant of the FW31 mod; winless midfield car priced near Alonso's R24 (GBP 218k, 2022) with a V8-era premium  |

## F1 2014-2016 - median $15,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_sf15t` | Ferrari SF15-T (2015) | $15,000,000 | build | medium | Ferrari has never sold a hybrid-era F1 car; build cost estimated around EUR 15m-$20m per car, power unit the bulk [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://www.thedrive.com/news/6288/ferraris-2013-f1-race-car-may-be-the-last-one-rich-folks-can-buy) |
| `vrc_2015_williams_fw37` | Williams-Mercedes FW37 (2015) | $15,000,000 | build | medium | No hybrid-era car of this kind sold; build cost estimated around EUR 15m-$20m per car, power unit the bulk [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |

## F1 2017-2021 - median $15,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_sf70h` | Ferrari SF70H (2017) | $15,000,000 | build | medium | Ferrari has never sold a hybrid-era F1 car; build cost estimated around EUR 15m-$20m per car, power unit the bulk [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://www.thedrive.com/news/6288/ferraris-2013-f1-race-car-may-be-the-last-one-rich-folks-can-buy) |
| `rss_formula_hybrid_2017` | Mercedes-AMG F1 W08 (2017), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2018` | Mercedes-AMG F1 W09 (2018), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2018_s1` | Mercedes-AMG F1 W09 (2018), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2019` | Mercedes-AMG F1 W10 (2019), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2020` | Mercedes-AMG F1 W11 (2020), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2021` | Mercedes-AMG F1 W12 / Red Bull RB16B (2021), assumed | $15,000,000 | build | medium | Never sold; hybrid-era F1 car costs about EUR 15m (2022 Red Bull estimate) to $20.6m (Motor Sport) per car to build, power unit two-thirds of it [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |

## F1 2022-2025 - median $16,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_hybrid_x` | Generic 2022-regulation F1 car (RSS built it to the 2022 rules as drafted in 2020, not a specific team's car) | $20,000,000 | build | medium | Motorsport Magazine (2025) puts one F1 car's manufacturing cost at about $20.6m, $18.3m of it the power unit [1](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_x_evo` | Generic 2022-regulation F1 car (updated EVO version) | $20,000,000 | build | medium | Motorsport Magazine (2025) puts one F1 car's manufacturing cost at about $20.6m, $18.3m of it the power unit [1](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2023` | Generic 2023 F1 car | $20,000,000 | build | medium | Motorsport Magazine (2025) puts one F1 car's manufacturing cost at about $20.6m, $18.3m of it the power unit [1](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2024` | Generic 2024 F1 car | $20,000,000 | build | medium | Motorsport Magazine (2025) puts one F1 car's manufacturing cost at about $20.6m, $18.3m of it the power unit [1](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2025` | Generic 2025 F1 car | $20,000,000 | build | medium | Motorsport Magazine (2025) puts one F1 car's manufacturing cost at about $20.6m, $18.3m of it the power unit [1](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2022` | Red Bull RB18 (2022), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2022_s` | Red Bull RB18 (2022), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2023` | Red Bull RB19 (2023), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2024` | Red Bull RB20 / McLaren MCL38 (2024), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `rss_formula_hybrid_2025_alpine` | Alpine A525 (2025) | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2022` | Ferrari F1-75 / Red Bull RB18 (2022), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2023_csp` | Red Bull RB19 (2023), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2024_csp` | Red Bull RB20 / McLaren MCL38 (2024), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |
| `vrc_formula_alpha_2025_csp` | McLaren MCL39 (2025), assumed | $16,000,000 | build | medium | Never sold; current F1 car build cost estimated at EUR 15m (Red Bull 2022) to $20.6m (Motor Sport), power unit about EUR 10m [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) |

## F1 2026- - median $16,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_hybrid_2026` | 2026-regulation F1 car (e.g. McLaren MCL40) | $16,000,000 | build | medium | Build cost of a 2026-rules car taken at the current EUR 15m-$20m estimates; McLaren sold a 2026 car pre-race for $11.5m with strings attached [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://motorsportmagazine.com/articles/single-seaters/f1/updated-schumacher-f2001-sets-new-record) |
| `rss_formula_hybrid_v12-r` | Fictional: RSS Formula Hybrid X 2026 chassis with a naturally aspirated V12 and KERS (no real counterpart); priced as a 2026 F1 car | $16,000,000 | build | low | No real car (RSS what-if V12 on its 2026 chassis); priced as a 2026 F1 car: MCL40A sold $11.48m (RM Sotheby's Abu Dhabi, Dec 2025), build about $20.6m (Motor Sport 2025), group held at $16m [1](https://www.planetf1.com/news/mclaren-f1-2026-car-sold-auction) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://rmsothebys.com/media-center/press-releases/rm-sotheby-s-achieves-over-1-billion-in-total-sales-cementing-a-record-setting-year-at-the-forefront-of-the-global-collector-car-market/) |
| `rss_formula_hybrid_x_2026` | Generic 2026-regulation F1 car | $16,000,000 | build | medium | McLaren sold a 2026 MCL40A with a 2026 Mercedes PU for $11.48m (RM Sotheby's Abu Dhabi, Dec 2025, delivery 2028, perks included); manufacturing cost about $20.6m, $18.3m of it the PU (Motor Sport 2025); held at the 2026 group's $16m between the two [1](https://www.planetf1.com/news/mclaren-f1-2026-car-sold-auction) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://rmsothebys.com/media-center/press-releases/rm-sotheby-s-achieves-over-1-billion-in-total-sales-cementing-a-record-setting-year-at-the-forefront-of-the-global-collector-car-market/) |
| `vrc_formula_alpha_2026` | Generic 2026-regulation F1 car | $16,000,000 | build | medium | McLaren sold a 2026 MCL40A with a 2026 Mercedes PU for $11.48m (RM Sotheby's Abu Dhabi, Dec 2025, delivery 2028, perks included); manufacturing cost about $20.6m, $18.3m of it the PU (Motor Sport 2025); held at the 2026 group's $16m between the two [1](https://www.planetf1.com/news/mclaren-f1-2026-car-sold-auction) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://rmsothebys.com/media-center/press-releases/rm-sotheby-s-achieves-over-1-billion-in-total-sales-cementing-a-record-setting-year-at-the-forefront-of-the-global-collector-car-market/) |
| `vrc_formula_alpha_2026_csp` | 2026-regulation F1 car (e.g. McLaren MCL40) | $16,000,000 | build | medium | Build cost of a 2026-rules car taken at the current EUR 15m-$20m estimates; McLaren sold a 2026 car pre-race for $11.5m with strings attached [1](https://www.planetf1.com/news/formula-1-car-cost-revealed) [2](https://motorsportmagazine.com/articles/single-seaters/f1/how-much-does-an-f1-car-cost) [3](https://motorsportmagazine.com/articles/single-seaters/f1/updated-schumacher-f2001-sets-new-record) |

## F2 2011-2017

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_2_v8` | Dallara GP2/11 (GP2 Series, and FIA F2 in 2017) | $200,000 | market | low | Estimate: retired V8 GP2 car, priced below the later F2 2018; no listing with a price found  |

## F2 2018-2023

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_2_v6_2020` | Dallara F2 2018 (FIA Formula 2) | $350,000 | market | low | Estimate: retired after 2023; new it was reported at about EUR 500k without engine  |

## F2 2024- - median $650,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_2_v6_2024` | Dallara F2 2024 | $650,000 | new | low | Estimate: its F2 2018 predecessor was reported at about EUR 500k without engine; Mecachrome engine leased, not included  |
| `vrc_formula_beta_2024` | Dallara F2 2024 | $650,000 | new | low | Estimate: its F2 2018 predecessor was reported at about EUR 500k without engine; Mecachrome engine leased, not included  |
| `vrc_formula_beta_2024_csp` | Dallara F2 2024 | $650,000 | new | low | Estimate: its F2 2018 predecessor was reported at about EUR 500k without engine; Mecachrome engine leased, not included  |

## F3 2019-2024

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_3_v6` | Dallara F3 2019 (FIA Formula 3) | $200,000 | market | low | Estimate: retired after 2024; priced off the EUR 265k a new Dallara 324 Euroformula car costs, less age  |

## F3 2025-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_3_v6_2026` | Dallara F3 2025 (FIA Formula 3) | $350,000 | new | low | Estimate: above the EUR 265k new Dallara 324 Euroformula car, as a heavier, more powerful V6 FIA F3 car; engine leased  |

## F4 2014-2021

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_4` | Tatuus F4-T014 (first-generation FIA Formula 4) | $34,000 | market | high | GB4 (which races the F4-T014): cars available from around GBP 25,000 complete with engine (~$33.5k at 1.34) [1](https://www.gb-4.net/info/the-car) |

## F4 2022-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_4_2024` | Tatuus F4-T421 (second-generation FIA Formula 4, as raced in Australian F4 2024) | $85,000 | new | medium | Reported new price about EUR 76k (via soymotor); Australian F4 ran the T421 in 2024 [1](https://en.wikipedia.org/wiki/AU4_Australian_Championship) |

## Formula Abarth 2010-2013

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `tatuusfa1` | Tatuus FA010 (Formula Abarth, 2010) | $35,000 | market | low | Estimate: retired Abarth-engined Tatuus junior single-seater, priced off used F4/Formula Renault-era Tatuus cars at roughly EUR 30k  |

## Formula E 2018-2022

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_2019_formula_lithium` | Spark SRT05e (Formula E Gen2) | $300,000 | market | low | Estimate: retired Gen2 car; new price was capped at roughly EUR 800k with battery (recalled, not re-checked)  |

## Formula E 2023-2026 - median $975,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_formula_lithium_2023` | Spark Gen3 (Formula E Gen3) | $975,000 | new | medium | Sum of published Gen3 figures: FIA tender capped a customer car at EUR 340k excluding battery and manufacturer parts, battery system EUR 250k; manufacturer powertrain assumed ~EUR 250k (not published); ~EUR 840k at 1.16 [1](https://envision-racing.com/?p=63535) [2](https://es.motorsport.com/formula-e/news/gen3-formula-e-coche-caracteristicas/4614092/) |
| `vrc_formula_lithium_2023_csp` | Spark Gen3 (Formula E Gen3) | $975,000 | new | medium | Sum of published Gen3 figures: FIA tender capped a customer car at EUR 340k excluding battery and manufacturer parts, battery system EUR 250k; manufacturer powertrain assumed ~EUR 250k (not published); ~EUR 840k at 1.16 [1](https://envision-racing.com/?p=63535) [2](https://es.motorsport.com/formula-e/news/gen3-formula-e-coche-caracteristicas/4614092/) |

## Formula E 2026- - median $1,200,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `formula_e_gen4` | Formula E GEN4 (2026-27) | $1,200,000 | build | low | No Gen4 price is published. Estimated above the Gen3's $975k for twice the power, all-wheel drive and a new battery; the last published cap, Gen2's, was EUR 817,300 ready to race [1](https://www.fia.com/news/fia-and-formula-e-unveil-gen4-setting-new-benchmark-speed-sustainability-and-innovation) |

## Formula Regional 2018-2025

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_tatuus_f3_t318_2018` | Tatuus F3 T-318 (Formula Regional, 2018-2025) | $95,000 | market | high | Replaced by the T-326 in FRECA for 2026. A 2019 T-318 asks EUR 84,900 (Feb 2026), a 300 hp Eurocup-3 car EUR 75k + VAT (~$87-98k at 1.16). Its liveries are Toyota Racing Series 2020 (Lawson, M2 Competition), raced in the T-318-derived Tatuus FT-60 [1](https://www.gotothegrid.com/en/ads/race-cars/single-seater/tatuus/for-sale/3889-tatuus-f3-t-318-regionale) [2](https://racecarsdirect.com/Advert/Details/159112/tatuus-t-318-eurocup3-300-hp-alfa-romeo-f3-46) |

## Ginetta Junior 2010-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ginetta_junior` | Ginetta G40 Junior (2010-) | $47,000 | new | medium | Still the Ginetta Junior car; new quoted at GBP 35k + VAT (~$47k at 1.34) by dealers; Motor Sport's guide gives GBP 39-45k new, GBP 15-35k used [1](https://britishbuiltcars.co.uk/Cars/cardetail/385/Ginetta/G40) [2](https://www.motorsportmagazine.com/archive/article/march-2022/132/ginetta-g40-race-car-buying-guide) |

## Grand-Am GX 2013

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `lotus_evora_gx` | Lotus Evora GX (2013 Grand-Am GX) | $100,000 | market | medium | No GX listing; relatives: Evora GTC GBP 67.5k, Evora GT4s EUR 64.9k + VAT to $105k; the GX ($335k new) put at the top of that [1](https://racemarket.net/race-cars/race-cars-for-sale/lotus-evora-gtc-i5827) [2](https://www.racingjunk.com/other/182696520/2012-lotus-evora-gt4.html) |

## Group 2 1966-1971

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_alfa_romeo_gta` | Alfa Romeo Giulia Sprint GTA (1965), Group 2 race spec | $350,000 | market | high | Recent GTA sales $286-430k (Gooding 2024 $335k, RM 2016 $336-360k) [1](https://goodingco.com/lot/1965-alfa-romeo-giulia-sprint-gta-1b) [2](https://www.classic.com/a/rm-sothebys-duemila-ruote-2016-kn3PDWY/lots/1965-alfa-romeo-giulia-sprint-gta-k4Z0d9W/) |
| `ford_mustang_66` | Ford Mustang notchback, FIA historic race car (1966) | $120,000 | market | medium | Re-identified as an FIA-spec historic racer; one of 16 period Group II Shelby notchbacks sold for $770k, but FIA historic Mustangs sell for GBP 50-60k (a 1965 notchback GBP 50,625, Iconic 2021) to over $100k with good papers - typical ~$120k [1](https://www.hagerty.com/valuation-tools/past-sales/1966-ford-mustang/6R07K191911/ca9186a4-046b-41c3-ad53-a31338ae6906) [2](https://iconicauctioneers.com/1965-ford-fia-mustang-4-7-race-car-rec10260-1-stoneleigh-0321) |

## Group 2 1966-1981

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ford_escort_mk1` | Ford Escort Mk1 RS1600, Group 2 race car (1970s) | $110,000 | market | medium | Group 2/4 Mk1 race cars estimated or listed GBP 50-125k [1](https://www.racecar.com/news/101362/market-and-auction/racecars-old-ford-escort-mk1-competition-car-iconic-auctioneers-race-retro-sale) [2](https://en.ascottcollection.com/ford-escort-group2) |

## Group 3 GT 1962-1965

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_250_gto` | Ferrari 250 GTO (1962-1964) | $45,000,000 | market | medium | Public sales $38.5M (Mecum 2026) and $51.7M (2023); private sales reported at $70M+ [1](https://motorillustrated.com/all-the-info-on-the-48-million-ferrari-gto-sold-at-auction/7544/) [2](https://www.cnbc.com/id/101914056) |

## Group 4 1970-1981

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ferrari_512bb_lm` | Ferrari 512 BB/LM (1979) | $2,300,000 | market | high | 512 BB/LM 35529 sold for EUR 1,973,750 (~$2.3M at 1.16) at RM's Guikas sale 2021; the seventh of 25 was estimated GBP 1.51-2.65M at RM Monterey 2026 and went unsold [1](https://www.classic-car-auctions.info/?p=9888) [2](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2026-08-15-ferrari-512-bb-lm-21e895) |
| `ks_porsche_911_carrera_rsr` | Porsche 911 Carrera RSR 3.0 (1974) | $1,750,000 | market | medium | RSR 3.0s have sold for $0.8-2.0m (Artcurial 2017 $2.02m); recent cars estimated $1.8-2.1m and bid to about $1.8m without selling [1](https://rmsothebys.com/auctions/mo21/lots/r0164-1974-porsche-911-carrera-rsr-30-iroc) |
| `fsr_porsche_934t_rsr_rr` | Porsche 934 Turbo RSR (1976) | $1,000,000 | market | high | Le Mans class-winning 934 (0155) sold $1.275M at Gooding Pebble Beach 2022; the last of 31 sold EUR 476k (RM Monaco 2012); an Arrow Blue car estimated $750-950k went unsold (Broad Arrow 2024) - typical ~$1M [1](https://www.racecar.com/news/97173/market-and-auction/le-mans-class-winning-porsche-934-group-4-rsr-turbo-at-goodings-pebble-beach-auctions) [2](https://rmsothebys.com/auctions/mc12/lots/r340-1976-porsche-934-turbo-rsr-fia-gr4) [3](https://www.theclassicvaluer.com/vehicle-details/broad-arrow-2024-04-27-porsche-934-e21219) |

## Group 4 Sports Car 1966-1971 - median $11,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_917_k` | Porsche 917 K (1970) | $13,750,000 (researched $14,000,000) | market | high | 917K chassis 024 sold for $14.08M at Gooding Pebble Beach 2017; few 917Ks lack major history [1](https://sportscardigest.com/gooding-company-pebble-beach-2017-auction-results/) |
| `ks_ford_gt40` | Ford GT40 Mk I (1966) | $8,250,000 (researched $8,000,000) | market | medium | Mk I GT40s sell $3-10M; a 1966 road-spec Mk I made $7.04M at Mecum in 2025 and another $10M; a raced example taken at about $8M [1](https://guideautoweb.com/en/articles/77155/this-1966-ford-gt40-mk-i-was-just-sold-for-10-million) [2](https://rmsothebys.com/auctions/mo16/lots/r153-1966-ford-gt40-mk-i/) |

## Group 5 1976-1982

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_935_78_moby_dick` | Porsche 935/78 'Moby Dick' (1978 works car) | $6,000,000 | market | medium | Unique works car still owned by Porsche; the Newman/Barbour 935 sold for $4.84m (2016) and a factory-supplied 935/77 for $1.43m, so the most famous works 935 is valued at about $6m [1](https://www.rennlist.com/how-tos/slideshows/5-most-expensive-porsches-ever-sold-at-auction-445998) [2](https://www.24h-lemans.com/en/news/sold-the-porsche-935-that-paul-newman-raced-at-le-mans-in-1979-42835) |
| `nis_23_supersilvia_83` | Nissan Silvia Turbo Super Silhouette (S110, 1983) | $400,000 | market | low | No Super Silhouette sale found; a 1986 240RS Group B (same S110 base) made EUR 214,560 (Paris 2021), a works Super Silhouette car estimated well above it for its rarity  |
| `chevrolet_dekon` | DeKon Chevrolet Monza IMSA AAGT (1977-1979) | $350,000 | market | medium | About a dozen DeKon Monzas built; a Monza IMSA AAGT replica sold for $207,662 (Bonhams Paris 2022), a genuine DeKon car estimated well above it [1](https://www.conceptcarz.com/w15015/dekon-monza.aspx) [2](https://stanceworks.com/2019/10/the-cars-that-beat-porsche-the-imsa-aagt-1975-chevy-dekon-monza-1002/) |

## Group 6 Prototype 1966-1967

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_330_p4` | Ferrari 330 P4 (1967) | $35,000,000 | market | medium | No 330 P4 sold publicly; its customer sibling the 412P (0854) made $30.25M at Bonhams Quail 2023, a works P4 priced just above it [1](https://bonhams.shorthandstories.com/rare-ferrari-412p-achieves-30-million-at-quail-auction) |

## Group 6 Prototype 1968-1971

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_908_lh` | Porsche 908 Langheck coupe (1968) | $3,500,000 | market | medium | A 908/02 Langheck sold for $3.4M at Bonhams and a 908/03 for $3.58M at RM Sotheby's [1](https://www.paulfrasercollectibles.com/blogs/classic-cars/porsche-flunder-langheck-prototype-realises-3-4m) [2](https://rmsothebys.com/auctions/mo17/lots/r206-1970-porsche-90803/) |

## Group A (DTM) 1984-1992 - median $530,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `bmw_m3_e30_dtm` | BMW M3 E30 Sport Evolution DTM (1992) | $540,000 | market | high | A 1992 E30 M3 DTM (Steve Soper, two DTM wins) sold for GBP 421,659 (~$560k) at Bonhams Monaco, April 2026, over its estimate; a typical works car a little less [1](https://www.theclassicvaluer.com/vehicle-details/bonhams-2026-04-24-bmw-3-series-e36-m3-sedan-e223c3) |
| `ks_mercedes_190_evo2` | Mercedes-Benz 190E 2.5-16 Evolution II DTM (1990-1992) | $520,000 | market | high | Bernd Schneider's 1992 AMG-Mercedes 190E Evo II DTM (four wins) sold for EUR 455,000 (~$520k at ~1.15) at RM Villa Erba, May 2023, within its EUR 450-550k estimate [1](https://www.motorbox.com/auto/magazine/vivere-auto/allasta-mercedes-amg-190-e-25-16-evolution-ii-ex-dtm) [2](https://www.carscoops.com/2023/02/relive-the-best-of-the-90s-with-this-amg-mercedes-190-e-2-5-16-evolution-ii-dtm/) |

## Group A 1982-1992

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ford_sierra_rs500a` | Ford Sierra RS500 Cosworth Group A (1987-1990) | $385,000 | market | high | Tim Harvey's ex-BTCC Labatt's RS500 sold for GBP 309,375 at Iconic NEC, Nov 2024; the ex-Rouse 1990 BTCC car was estimated GBP 250-300k (Silverstone 2025); the 1990 title car made GBP 182,250 in 2018 - typical ~GBP 290k (~$385k at 1.33) [1](https://iconicauctioneers.com/1989-ford-rs500-rec14197-1-nec-1124) [2](https://www.iconicauctioneers.com/1990-ford-sierra-rec15406-1-silverston-0825) [3](https://racecar.com/news/88016/market-and-auction/1990-ford-sierra-cosworth-rs500-group-a-sells-for-182250-at-race-retro-auction-results) |
| `bmw_m3_e30_gra` | BMW M3 E30 Group A (1987-1992) | $200,000 | market | medium | Ex-BTCC Group A M3 estimated GBP 140-180k; recreations list near GBP 75k [1](https://www.carandclassic.com/car/C1130126) |

## Group A 1987-1996

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_toyota_celica_st185` | Toyota Celica GT-Four (ST185) Group A rally car | $230,000 | market | medium | Ex-works 1993 TTE ST185 (3rd, 1993 Safari) offered at ~$209k; a TTE-built ST185 later upgraded to Group A sold for GBP 110,250 (Iconic NEC, Nov 2022) [1](https://japanesenostalgiccar.com/kidney-anyone-1993-ex-works-toyota-celica-st185-group-a-rally) [2](https://www.iconicauctioneers.com/1994-toyota-celica-rec11888-1-nec-1122) |

## Group B 1982-1986

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_audi_sport_quattro_rally` | Audi Sport quattro S1 E2 (1985) | $1,500,000 | market | medium | Works E2 with Mikkola history sold GBP 1.8m; a non-original E2 about GBP 543k [1](https://rmsothebys.com/auctions/lf22/lots/r0040-1985-audi-sport-quattro-s1-e2/) [2](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2024-05-11-audi-quattro-sport-0c14b5) |
| `opelmanta_400` | Opel Manta 400 Group B (1983), circuit trim | $210,000 | market | high | A 1985 works Manta 400 sold for GBP 157,916 (~$210k at 1.33) at Iconic, July 2026; road Manta 400s median GBP 112.5k since 2020 [1](https://www.theclassicvaluer.com/cars/opel/manta-400) [2](https://www.theclassicvaluer.com/vehicle-details/iconic-auctioneers-2026-07-25-opel-manta-400-ee3176) |

## Group C 1982-1993 - median $3,250,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_porsche_956_group_c_brun_1982` | Porsche 956 (customer car, Brun Motorsport livery) | $4,000,000 | market | medium | Brun's 956 was customer chassis 111 (bought June 1983); works 956-004 sold $3.18M (RM Paris 2014), customer 956-110 was estimated $4.5-6.75M and bid to GBP 2.73M unsold (2018), works 956-003 made $10.12M (2015) [1](https://supercarnostalgia.com/blog/porsche-956-chassis-111) [2](https://www.motorsportmagazine.com/special-article/auction-house-heros/141/top-5-porsches-the-most-valuable-stuttgart-icons-ever-sold) |
| `ks_mazda_787b` | Mazda 787B (1991) | $4,000,000 | market | medium | No 787B sale on record; Gooding estimated the earlier Mazda 767B at $1.8-2.4M, and the 787B is put at about double [1](https://www.drivencarguide.co.nz/reviews/a-japanese-le-mans-hero-is-now-for-sale/) |
| `ks_mercedes_c9` | Sauber-Mercedes C9 (1989) | $3,500,000 | market | medium | Championship C9-05 went unsold at EUR 1.25M (Retromobile 2008), a 1989 C9 reportedly made $2.2M (Coys 2017); Group C values have risen since [1](https://www.supercars.net/blog/1987→1989-sauber-mercedes-c9-share-499/) |
| `alfa_romeu_se048` | Alfa Romeo SE 048SP (1990, never raced) | $3,000,000 | build | low | Abarth-built prototype with the 164 Procar V10, shelved in September 1990 and kept by Alfa Romeo; no cost published, build estimated at a contemporary works Group C car [1](https://en.wikipedia.org/wiki/Alfa_Romeo_SE_048SP) |
| `fsr_jaguar_xjr12` | Jaguar XJR-12 (1990) | $3,000,000 | market | medium | No XJR-12 sale found; TWR-J12C-388, an XJR-9 later upgraded to XJR-12 spec, sold for $2.145M at RM Amelia Island 2015, and an XJR-11 was estimated GBP 1.05-1.25M (RM London 2019, unsold); raised for the 1990 Le Mans-era car and Group C values since [1](https://rmsothebys.com/auctions/am15/lots/r148-1988-jaguar-xjr9/) [2](https://rmsothebys.com/auctions/lf19/lots/r0057-1989-jaguar-xjr11/) |
| `ks_porsche_962c_longtail` | Porsche 962 C long tail (works, 1987) | $3,000,000 | market | medium | Customer 962Cs are estimated at EUR 1.2-1.5M (RM Paris 2024) and sell for $0.9-1.6M; ex-works Rothmans cars are guided several times higher [1](https://www.classic-car-auctions.info/european/france/paris/2024-rm-sothebys-paris-sale-top-racing-cars/attachment/1991-porsche-962-c/) |
| `ks_porsche_962c_shorttail` | Porsche 962 C short tail (works, 1987) | $3,000,000 | market | medium | Customer 962Cs are estimated at EUR 1.2-1.5M (RM Paris 2024) and sell for $0.9-1.6M; ex-works Rothmans cars are guided several times higher [1](https://www.classic-car-auctions.info/european/france/paris/2024-rm-sothebys-paris-sale-top-racing-cars/attachment/1991-porsche-962-c/) |
| `fsr_nissan_r90ck_rr` | Nissan R90CK (1990) | $2,437,500 (researched $1,000,000) | market | high | The ex-Le Mans R90C/1 sold for EUR 1,073,750 (~$1.16M) at RM Le Mans 2023; spare chassis R90C07 made $583k at Artcurial the same month - a typical car taken at ~$1M [1](https://rmsothebys.com/auctions/lm23/lots/r0005-1990-nissan-r90ck) [2](https://www.sportscarmarket.com/profile/1990-nissan-r90ck) |
| `fsr_porsche_962_rr` | Porsche 962 C (customer car, c.1990-1992) | $2,437,500 (researched $1,250,000) | market | high | A customer 962C, not the works cars Kunos models; a 1986 962C sold for $1,249,620 (Feb 2025) and SCM puts a typical 962 near $1.2M [1](https://www.classic.com/veh/1986-porsche-962c-962127-W9lEPjn) [2](https://www.sportscarmarket.com/profile/1990-nissan-r90ck) |

## GT1 1994-1998 - median $7,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_mclaren_f1_gtr` | McLaren F1 GTR (1995) | $8,750,000 (researched $25,000,000) | market | medium | F1 GTR chassis 10R sold for $34.7M in 2026 (record, famous owner); a GTR Longtail made $5.3M in 2014 before the F1 market rose; road F1s now ~$25M [1](https://www.racecar.com/news/104172/market-and-auction/1996-mclaren-f1-gtr-sold-for-34655000-usd-rm-sothebys-monterey-auction-results) [2](https://gtspirit.com/2014/01/20/mclaren-f1-gtr-longtail-sells-for-5-28-million-at-auction/) |
| `urd_maures_gtr_97` | Mercedes-AMG CLK GTR GT1 (1997) | $8,750,000 (researched $10,000,000) | market | medium | Replica identified from 'Maures LCK EGT1'. The 1997 title-winning chassis 004 was offered on Sotheby's Sealed (March 2024), with experts estimating about EUR 10M; no price was disclosed [1](https://www.motor1.com/news/710854/mercedes-amg-clk-gtr-gt1-auction/) [2](https://mercedesblog.com/mercedes-clk-gtr-the-winner-of-the-1997-fia-gt-championship-will-be-sold-at-auction/) |
| `ks_porsche_911_gt1` | Porsche 911 GT1-98 (works race car) | $7,000,000 | market | medium | Works GT1-98s rarely trade; a 911 GT1 Evo racer made $3.1M (2016) and a 1997 911 GT1 race car $7.05M (2024), so a GT1-98 is estimated at ~$7M [1](https://rmsothebys.com/auctions/mc16/lots/r146-1997-porsche-911-gt1-evolution/) [2](https://www.sportscarmarket.com/profile/1997-porsche-911-gt1) |
| `urd_egt1_darche_evo_97` | Porsche 911 GT1 Evolution (1997 race car) | $7,000,000 | market | medium | Replica identified from 'Darche 996 EGT1 EVO'. A 1997 911 GT1 race car (Roock/Rohr, never upgraded to Evo) sold for $7.045M at Broad Arrow Monterey 2024; a GT1 Evo racer made $3.1M in 2016 [1](https://www.sportscarmarket.com/profile/1997-porsche-911-gt1) [2](https://www.theclassicvaluer.com/vehicle-details/broad-arrow-2024-08-15-porsche-911-gt1-506979) |
| `rss_lmgt_nisumo_r39_v8` | Nissan R390 GT1 (1998) | $5,250,000 (researched $5,000,000) | market | low | Replica identified from 'Nisumo R39', V8 and 1998; works cars never sold, estimated off GT1 racers that have (911 GT1 $3-7M)  |

## GT1 2000-2009 - median $700,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_maserati_mc12_gt1` | Maserati MC12 GT1 (2004-2010) | $875,000 (researched $5,000,000) | market | medium | Only 12 GT1 racers built; no public GT1 result found. Track-only MC12 Corsa has made ~$2.8M and the road MC12 $5.2-9.5M, so a GT1 with history is estimated around $5M [1](https://www.motorsportretro.com/2020/06/for-sale-2004-ex-works-maserati-mc12-gt1/) [2](https://petrolicious.com/articles/want-to-own-one-of-only-12-maserati-mc12-corsas-ever-built) [3](https://www.maserati.com/us/en/news/mc-stradale-record-selling-at-auction) |
| `rss_gt_ferruccio_55` | Ferrari 550 Maranello GT1 (Prodrive 550 GTS, 2001-2004) | $875,000 (researched $1,200,000) | market | medium | Le Mans class-winning Prodrive 550 GTS; no sale found, set above the DBR9 ($616k in 2017) for its record and rarity [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_shadow_v8` | Chevrolet Corvette C6.R GT1 (2005-2009) - could also be the Saleen S7R | $850,000 | market | medium | Taken as the C6.R; no sale found, set between the DBR9 ($616k in 2017) and the C7.R ($855k in 2021) [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) [3](https://www.hagerty.com/media/?p=130358) |
| `fsr_aston_dbr9_06` | Aston Martin DBR9 (2005-2006) | $750,000 | market | high | As `rss_gt_adonis_d9_v12`. DBR9/9 sold for $616k at RM Monterey 2017 (twice its estimate), DBR9/05 $440k at Gooding 2013; values up since [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_adonis_d9_v12` | Aston Martin DBR9 (2005-2009) | $750,000 | market | high | Taken as the DBR9; DBR9/9 sold for $616k at RM Monterey 2017 (twice its estimate), DBR9/05 $440k at Gooding 2013; values up since [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_ferruccio_57` | Ferrari 575 GTC (2003-2005) | $650,000 | market | medium | Less successful 575 GTC; no sale found, set near the DBR9 ($616k in 2017) [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_lanzo_v12` | Lamborghini Murcielago R-GT (2004-2009) | $600,000 | market | medium | Taken as the Murcielago R-GT; no sale found, set a little under the DBR9 ($616k in 2017) [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_vortex_v10` | Dodge Viper GTS-R / Competition Coupe GT1 (2000s) | $550,000 | market | medium | Taken as a Viper GTS-R; no sale found, set a little under the DBR9 ($616k in 2017) [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |
| `rss_gt_tornado_v12` | Lister Storm GT (2000s FIA GT) | $525,000 (researched $500,000) | market | medium | Taken as the Lister Storm; no sale found, set below the DBR9 ($616k in 2017) as a privateer car [1](https://rmsothebys.com/auctions/mo17/lots/r161-2006-aston-martin-dbr9/) [2](https://www.24h-lemans.com/en/news/24-hours-of-le-mans-cars-go-for-50-million-dollars-in-california-47377) |

## GT1 2009-2011 - median $850,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `Yzd_Nissan_GTR_R35_GT1` | Nissan GT-R GT1 (R35, 2010 spec) | $850,000 | market | medium | JRM put its two championship-winning Nismo GT-R GT1s up for sale in 2012 at a $1M reserve each; chassis 102 (2010 Silverstone winner) offered by Art & Revs 2023, price on request - a typical chassis taken a little under the reserve [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |
| `Yzd_Nissan_GTR_R35_GT1_2009` | Nissan GT-R GT1 (R35, 2009 spec) | $850,000 | market | medium | Same car as the 2010 GT-R GT1: JRM's championship cars offered 2012 at a $1M reserve each; chassis 102 offered by Art & Revs 2023 [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |
| `Yzd_Nissan_GTR_R35_GT1_2009_Endu` | Nissan GT-R GT1 (R35, 2009 spec), endurance trim | $850,000 | market | medium | Same car as the 2010 GT-R GT1 in endurance trim: JRM's championship cars offered 2012 at a $1M reserve each [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |
| `Yzd_Nissan_GTR_R35_GT1_2011` | Nissan GT-R GT1 (R35, 2011 spec) | $850,000 | market | medium | Same car as the 2010 GT-R GT1: JRM's 2011 championship-winning cars offered 2012 at a $1M reserve each [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |
| `Yzd_Nissan_GTR_R35_GT1_2011_Endu` | Nissan GT-R GT1 (R35, 2011 spec), endurance trim | $850,000 | market | medium | Same car as the 2010 GT-R GT1 in endurance trim: JRM's 2011 championship-winning cars offered 2012 at a $1M reserve each [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |
| `Yzd_Nissan_GTR_R35_GT1_Endu` | Nissan GT-R GT1 (R35, 2010 spec), endurance trim | $850,000 | market | medium | Same car as the 2010 GT-R GT1 in endurance trim: JRM's championship cars offered 2012 at a $1M reserve each; chassis 102 offered by Art & Revs 2023 [1](https://www.racecar.com/news/53693/motorsport/jrm-racing-announces-charity-auction-for-gt1-cars) [2](https://supercarnostalgia.com/blog/one-to-buy-2010-nissan-r35-gt-r-nismo-gt1) |

## GT3 2006-2011 - median $205,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_ford_gt_gt3_rr` | Ford GT GT3 by Matech (2008-2011) | $350,000 | market | low | 18 built; no price found. Chassis 4 (ordered for Nelson Piquet) sold through Cooper Classic Cars, price not shown; a Doran Ford GT GT2 was asked at $310k (2022) and road Ford GTs now sell above that, so the GT3 is put a little higher [1](https://cooperclassiccars.com/2008-ford-gt-gt3-c-3793.htm) [2](https://www.thedrive.com/news/rescue-this-stunning-2008-ford-gt-race-car-from-a-life-parked-in-some-showroom) |
| `fsr_porsche_997r_13` | Porsche 911 GT3 R (997.2, 2010-2013) | $240,000 | market | high | Liveries run 2013-2016 (ADAC, Blancpain, PWC, VLN). Classic.com averages $237k over two sales (EUR 207k in Feb 2024, EUR 226,480 in Mar 2022); a low-hours 2011 car asks $335k on Racecarsdirect [1](https://www.classic.com/m/porsche/911/997/9972/gt3-r/) [2](https://racecarsdirect.com/Advert/Details/164200/2011-porsche-911-gt3-r) |
| `mercedes_sls_gt3` | Mercedes-Benz SLS AMG GT3 (2011) | $220,000 | market | medium | Racecarsdirect: two 2011 cars in 2015 spec offered at EUR 190k ex VAT, a 2012 car on a 2015 chassis at EUR 379k with extras (older ad); road SLS now ~$225k at auction [1](https://racecarsdirect.com/Advert/Details/64088/2x-mercedes-sls-amg-gt3) [2](https://www.racecarsdirect.com/Advert/Details/126366/mercedes-benz-sls-amg-gt3-with-lots-of-extras) |
| `bmw_z4_gt3` | BMW Z4 GT3 (2010) | $190,000 | market | medium | New EUR 298-315k in 2010-11; Turner offered a 2015 ex-PWC Z4 GT3 at $197k [1](https://www.autoguide.com/auto-news/2011/04/2011-bmw-z4-gt3-race-car-now-available-for-450000.html) [2](https://www.bmwblog.com/?p=175151) |

## GT3 2012-2015 - median $220,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `amr_v12_vantage_gt3` | Aston Martin V12 Vantage GT3 (2012) | $275,000 (researched $300,000) | market | medium | Sold asks: chassis 005 (2012 Brazil winner) at 260,000, a 2013 car at $325k (The Racers Group), a 2015 car at $380k (Tegiwa); a 2016 car estimated $350-500k (RM Sotheby's Miami 2026). A 2012 car taken at about $300k [1](https://racecarsdirect.com/Advert/Details/114152/common) [2](https://www.theracersgroup.com/?p=2504) [3](https://racecarsdirect.com/Advert/Details/156652/aston-martin-vantage-v12-gt3) [4](https://backoffice.rmsothebys.com/auctions/mi26/lots/r0007-2016-aston-martin-v12-vantage-gt3) |
| `ks_nissan_gtr_gt3` | Nissan GT-R Nismo GT3 (2013) | $250,000 | market | medium | EUR 298k new in 2012; the ex-Mardenborough Gran Turismo car was estimated at GBP 225-275k with its film fame [1](https://www.autoguide.com/auto-news/2012/01/nissan-gt-r-nismo-gt3-now-available-to-order-for-388000.html) [2](https://www.racecar.com/news/98871/market-and-auction/nissan-gt-r-race-car-from-new-gran-turismo-movie-for-sale-at-silverstone-auctions) |
| `ks_audi_r8_lms` | Audi R8 LMS Ultra (2012) | $230,000 | market | high | Dealer listings for R8 LMS Ultras ask EUR 190-228k [1](https://germancarsforsaleblog.com/motorsports-monday-2012-audi-r8-lms-ultra/) [2](https://audiclubna.org/find-of-the-day-2010-r8-lms-ultra) |
| `ks_mclaren_650_gt3` | McLaren 650S GT3 (2015) | $220,000 | market | medium | GBP 330k new in 2014; a converted 650S GT3 was listed at $189,900, reduced [1](https://www.p1groupe.com/inventory/2013-mclaren--650s-gt3) [2](https://autos.yahoo.com/blogs/motoramic/mclaren-s-new-650s-gt3-race-car-can-be-yours-for-a-cool--562-000-144608010.html) |
| `mclaren_mp412c_gt3` | McLaren MP4-12C GT3 (2012) | $220,000 | market | high | An unraced 2012 car sold at RM Sotheby's for $236,500 in 2019; a raced example sits a little under that [1](https://rmsothebys.com/auctions/fl19/lots/r0184-2012-mclaren-mp412c-gt3/) |
| `ks_lamborghini_huracan_gt3` | Lamborghini Huracan GT3 (2015) | $165,000 | market | medium | The later Huracan GT3 Evo lists at EUR 190k + VAT, and a 2021 Evo at $185k; the first-generation 2015 car put below [1](https://racecarsdirect.com/Advert/Search?searchText=Lamborghini+Huracan+GT3+EVO+for+sale+) [2](https://www.motor1.com/news/134439/lamborghini-huracan-gt3-for-sale/) |
| `lotus_evora_gtc` | Lotus Evora GTC (2011-2012) | $165,000 (researched $90,000) | market | high | Racemarket lists a Lotus Motorsport Evora GTC at GBP 67.5k incl VAT (~$90k); the seller puts a rebuild at GBP 250k+ [1](https://racemarket.net/race-cars/race-cars-for-sale/lotus-evora-gtc-i5827) |

## GT3 2016-2018 - median $255,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_488_gt3` | Ferrari 488 GT3 (2016) | $320,000 (researched $475,000) | market | medium | About $600-615k new; a 2017 488 GT3 Evo sold for $511k in 2026, later Evos for more [1](https://sportscar365.com/?p=108391) [2](https://www.classic.com/m/ferrari/488/gt3gte/) |
| `ks_mercedes_amg_gt3` | Mercedes-AMG GT3 (2016) | $320,000 (researched $330,000) | market | medium | A 2017 car was listed at $329,995 Buy It Now; Gooding estimated another $450-550k in 2018 [1](https://germancarsforsaleblog.com/motorsports-monday-2017-mercedes-amg-gt3/) [2](https://www.goodingco.com/lot/2017-mercedes-benz-amg-gt3) |
| `ks_audi_r8_lms_2016` | Audi R8 LMS GT3 (2016) | $280,000 | market | medium | About $402k new in 2015; an ex-Magnus 2017 chassis was listed at $299,999 [1](https://cdn-fastly.autoguide.com/auto-news/2015/09/new-audi-r8-lms-now-available-for-order.html) [2](https://www.sothebys.com/en/buy/_audi-r8-lms-gt3-car-automobile-d584) |
| `bentley_continental_gt3_18` | Bentley Continental GT3 (2018) | $265,000 | market | medium | Gen 1 2016 cars were offered at EUR 180k and 200k; Gen 2 cars have been listed (all sold, price not shown), put a little above Gen 1 at about EUR 230k [1](https://racecarsdirect.com/Advert/Details/100189/2016-bentley-continental-gt3---ch023-ch025) [2](https://racecarsdirect.com/Advert/Details/133259/bentley-continental-gt3-gen-ii) |
| `rss_gtm_lux_v8_evo` | Lexus RC F GT3 (late specification) | $260,000 | market | low | No RC F GT3 listing found; a late-spec car put a little above the 2016-2018 GT3s that do list (M6 EUR 190-239k, GT-R $235k)  |
| `jaguar_f-type_racing` | No real equivalent - fictional GT3-spec Jaguar F-Type (Project CARS livery set; closest real car the Emil Frey Jaguar XKR GT3) | $255,000 | estimate | low | No real car; priced as a typical GT3 of 2016-2018 at the class median  |
| `bm_nissan_gtr_gt3` | Nissan GT-R Nismo GT3 (2018) | $250,000 | market | medium | A 2015 Nismo GT-R GT3 (R35 GT3-8004) listed at $235k with all spares; the 2018 car put a little above [1](https://racecarsdirect.com/Advert/Details/123905/nismo-gt-r-gt3) |
| `dodge_viper17` | SRT Viper GT3-R (2015-2017) | $250,000 | market | low | No GT3-R sale found. $459k new (2013); valued with the GT3s of its age that do list (Nissan GT-R GT3 $235k, M6 GT3 EUR 190-239k) [1](https://www.foxnews.com/auto/srt-viper-gt3-r-racer-on-sale-for-459000.amp) [2](https://racecarsdirect.com/Advert/Details/123905/nismo-gt-r-gt3) |
| `ng_lexus_r_cf_gt3` | Lexus RC F GT3 (2017) | $250,000 | market | low | No RC F GT3 listing found (few built); valued on the 2016-2018 GT3s that do list - M6 EUR 190-239k, GT-R $235k, Bentley EUR 180-200k  |
| `rss_gtm_lux_v8` | Lexus RC F GT3 (2017) | $250,000 | market | low | No RC F GT3 listing found (few built); valued on the 2016-2018 GT3s that do list - M6 EUR 190-239k, GT-R $235k, Bentley EUR 180-200k  |
| `rss_gtm_bayer_v8` | BMW M6 GT3 (2016) | $225,000 | market | medium | Used M6 GT3s: EUR 190k (2016 Boutsen car) and EUR 239k + VAT (Rowe car) on Racecarsdirect, US$180k for chassis 1508 in 2020 [1](https://racecarsdirect.com/Advert/Details/134872/bmw-m6-gt3-for-sale) [2](https://www.v8sleuth.com.au/?p=20593) |
| `ks_porsche_911_gt3_r_2016` | Porsche 911 GT3 R (991.1, 2016) | $200,000 | market | medium | 991.1 GT3 R asks run from EUR 90k (MY2016, private seller in Spain) to EUR 275k (2018 Evo, older ad); 991.2s list at EUR 479-525k. Put at about EUR 170k [1](https://racecarsdirect.com/Advert/Details/159323/porsche-9911-gt3-r) [2](https://racecarsdirect.com/Advert/Details/96312/porsche-911-gt3-r-2018-evo) |

## GT3 2019-2022 - median $330,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `bm_amg_evo_2020_gt3` | Mercedes-AMG GT3 Evo (2020) | $415,000 (researched $520,000) | new | medium | Still sold; about EUR 400k at launch, put at about EUR 450k today; a used 2020 car listed at EUR 320k [1](https://www.carmagazine.co.uk/car-reviews/mercedes-benz/amg-gt3/) [2](https://www.auto-selection.com/voiture-occasion/mercedes-benz/amg-gt/gt3-chassis-433-338144) |
| `ks_bmw_m4_gt3_2022` | BMW M4 GT3 (2022) | $415,000 (researched $500,000) | market | medium | Superseded by the EUR 578k M4 GT3 Evo in 2025; a used pre-Evo car estimated a little below that [1](https://www.motorauthority.com/news/1145500_2025-bmw-m4-gt3-evo-24-hours-of-dubai) |
| `rss_gtm_mercer_v8` | Mercedes-AMG GT3 Evo (2020) | $415,000 (researched $520,000) | new | medium | Taken as the AMG GT3 Evo, still sold; about EUR 400k at launch, put at about EUR 450k today [1](https://www.carmagazine.co.uk/car-reviews/mercedes-benz/amg-gt3/) |
| `urd_michigan_gtd` | Chevrolet Corvette C8.R in IMSA GTD Pro trim (2022-2023) | $415,000 (researched $1,400,000) | market | high | Replica identified from 'Michigan GTD': the model of URD's Michigan EGT, the C8.R, run to GT3 level in GTD Pro (2022-2023); chassis 005, raced that way in 2023, is offered at $1.5M. Pulled to the GT3 class it races in [1](https://corvetteclub.org.uk/threads/c8-r-changes-for-imsa-gtd-pro-this-year.3278) [2](https://www.corvetteblogger.com/2025/11/01/corvettes-for-sale-corvette-c8-r-005-built-by-pratt-miller-is-offered-on-hemmings-for-1-5-million/) |
| `porsche_911_gt3_r_acc` | Porsche 911 GT3 R (991.2, 2019) | $395,000 | market | high | Classic.com benchmark $395,250 for the 991.2 GT3 R; two 2019 cars sold at $307k (Feb 2024) and $660k (May 2022) [1](https://classic.com/m/porsche/911/991/9912/gt3-r) |
| `lamborghini_huracan_evo2_gt3` | Lamborghini Huracan GT3 Evo2 (2023) | $360,000 | market | high | Racecarsdirect lists a low-mileage Huracan GT3 Evo2 at GBP 269k + VAT (~$360k at 1.34); no longer built (replaced by the Temerario GT3). Generation moved to 2019-2022: a 2022-homologated car valued used belongs with the R8 Evo II and NSX Evo22, not the new 2023- cars [1](https://www.racecarsdirect.com/Advert/Details/141115/lamborghini-huracan-gt3-evo2) [2](https://www.indycompetition.com/gts) |
| `lamborghini_huracan_gt3_evo2` | Lamborghini Huracan GT3 Evo2 (2023) | $360,000 | market | high | As `lamborghini_huracan_evo2_gt3`. Racecarsdirect lists a low-mileage Huracan GT3 Evo2 at GBP 269k + VAT (~$360k at 1.34); no longer built (replaced by the Temerario GT3) [1](https://www.racecarsdirect.com/Advert/Details/141115/lamborghini-huracan-gt3-evo2) [2](https://www.indycompetition.com/gts) |
| `rss_gtm_lanzo_v10_evo2` | Lamborghini Huracan GT3 Evo2 (2023) | $360,000 | market | high | Racecarsdirect lists a low-mileage Huracan GT3 Evo2 at GBP 269k + VAT (~$360k at 1.34); no longer built (replaced by the Temerario GT3). Generation moved to 2019-2022: a 2022-homologated car valued used belongs with the R8 Evo II and NSX Evo22, not the new 2023- cars [1](https://www.racecarsdirect.com/Advert/Details/141115/lamborghini-huracan-gt3-evo2) [2](https://www.indycompetition.com/gts) |
| `rss_gtm_lanzo_v10` | Lamborghini Huracan GT3 Evo (2019) | $300,000 | market | medium | Taken as the Huracan GT3 Evo; EUR 389k new, valued used from 2019-2022 GT3 peers [1](https://sportscar365.com/?p=71600) |
| `fsr_audi_lms_evo_2_gt3` | Audi R8 LMS GT3 Evo II (2022) | $270,000 | market | medium | EUR 429k + VAT new for 2022; a 2017 chassis upgraded to Evo II spec lists at $220k + VAT on Racecarsdirect, a genuine late chassis put a little above [1](https://www.audi.com/en/press-releases/second-evolution-of-the-audi-r8-lms-gt3-14114) [2](https://racecarsdirect.com/Advert/Details/155364/audi-r8-gt3-evo2-for-sale-ready-to-race-fully) |
| `fsr_audi_lms_evo_ii_gt3` | Audi R8 LMS GT3 Evo II (2022) | $270,000 | market | medium | As `fsr_audi_lms_evo_2_gt3`. EUR 429k + VAT new for 2022; a 2017 chassis upgraded to Evo II spec lists at $220k + VAT on Racecarsdirect, a genuine late chassis put a little above [1](https://www.audi.com/en/press-releases/second-evolution-of-the-audi-r8-lms-gt3-14114) [2](https://racecarsdirect.com/Advert/Details/155364/audi-r8-gt3-evo2-for-sale-ready-to-race-fully) |
| `rss_gtm_aero_v10_evo2` | Audi R8 LMS GT3 Evo II (2022) | $270,000 | market | medium | EUR 429k + VAT new for 2022; a 2017 chassis upgraded to Evo II spec lists at $220k + VAT on Racecarsdirect, a genuine late chassis put a little above [1](https://www.audi.com/en/press-releases/second-evolution-of-the-audi-r8-lms-gt3-14114) [2](https://racecarsdirect.com/Advert/Details/155364/audi-r8-gt3-evo2-for-sale-ready-to-race-fully) |
| `rss_gtm_akuro_v6_evo2` | Acura NSX GT3 Evo22 (2022) | $255,000 | market | medium | Racecarsdirect lists a Honda NSX GT3 Evo25 (one of two, retrofittable to Evo22) at EUR 220k + VAT (~$255k at 1.16) [1](https://racecarsdirect.com/Advert/Details/143606/honda-nsx-gt3-evo22) |
| `ac_friends_honda_nsx_gt3_evo` | Honda NSX GT3 Evo (2019) | $250,000 (researched $235,000) | market | medium | An NSX GT3 Evo25 lists at EUR 220k + VAT (~$255k); the earlier 2019 Evo put a little below [1](https://racecarsdirect.com/Advert/Details/143606/honda-nsx-gt3-evo22) |
| `urd_rekus_rcf_gt3` | Lexus RC F GT3 (2019) | $250,000 | market | low | Taken as the RC F GT3; no listing found (few built), priced as LFM's RC F GT3 off the GT3s of its age that do list  |

## GT3 2023- - median $650,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `corvette_z06_gt3_2024` | Chevrolet Corvette Z06 GT3.R (2024) | $735,000 | new | high | Chevrolet prices it from $735,000 [1](https://www.foxnews.com/auto/buy-chevrolet-corvette-racing-car.amp) [2](https://www.motor1.com/news/547151/chevrolet-corvette-z06-gt3-race/) |
| `rss_gtm_cortex_v8` | Chevrolet Corvette Z06 GT3.R (2024) | $735,000 | new | high | Taken as the Corvette Z06 GT3.R; Chevrolet prices it from $735,000 [1](https://www.foxnews.com/auto/buy-chevrolet-corvette-racing-car.amp) [2](https://www.motor1.com/news/547151/chevrolet-corvette-z06-gt3-race/) |
| `acf_aston_martin_vantage_gt3_evo` | Aston Martin Vantage AMR GT3 Evo (2024) | $725,000 | new | high | Base price GBP 575k (about $726k) at its 2024 launch [1](https://sportscar365.com/?p=122263) |
| `fsr_aston_martin_vantage_gt3` | Aston Martin Vantage AMR GT3 Evo (2024) | $725,000 | new | high | As `acf_aston_martin_vantage_gt3_evo`. Base price GBP 575k (about $726k) at its 2024 launch [1](https://sportscar365.com/?p=122263) |
| `rss_gtm_adonis_v8_evo` | Aston Martin Vantage AMR GT3 Evo (2024) | $725,000 | new | high | Taken as the Vantage GT3 Evo; base price GBP 575k (about $726k) at its 2024 launch [1](https://sportscar365.com/?p=122263) |
| `urd_amr_gt3_evo` | Aston Martin Vantage AMR GT3 Evo (2024) | $725,000 | new | high | Replica identified from 'Arthur Merlin Valor GT3 EVO'; base price GBP 575k (about $726k) at its 2024 launch [1](https://sportscar365.com/?p=122263) |
| `rss_gtm_bayer_i6_evo` | BMW M4 GT3 Evo (2025) | $665,000 | new | high | Taken as the M4 GT3 Evo; BMW lists it at EUR 578,000 [1](https://www.motorauthority.com/news/1145500_2025-bmw-m4-gt3-evo-24-hours-of-dubai) |
| `urd_bayro_gt3_evo` | BMW M4 GT3 Evo (2025) | $665,000 | new | high | Taken as the M4 GT3 Evo; BMW lists it at EUR 578,000 [1](https://www.motorauthority.com/news/1145500_2025-bmw-m4-gt3-evo-24-hours-of-daytona) |
| `ford_mustang_gt3_2024` | Ford Mustang GT3 (2024) | $650,000 | new | low | No published price, estimated from current GT3 list prices  |
| `fsr_ford_mustang_gt3` | Ford Mustang GT3 (2024) | $650,000 | new | low | As `ford_mustang_gt3_2024`. No published price, estimated from current GT3 list prices  |
| `ks_ferrari_296_gt3` | Ferrari 296 GT3 (2023) | $650,000 | new | medium | As `ks_ferrari_296_gt3_2023`. Ferrari said it costs a little more than the 488 GT3's $615k [1](https://sportscar365.com/?p=108391) |
| `ks_ferrari_296_gt3_2023` | Ferrari 296 GT3 (2023) | $650,000 | new | medium | Ferrari said it costs a little more than the 488 GT3's $615k [1](https://sportscar365.com/?p=108391) |
| `rss_gtm_furiano_96_v6` | Ferrari 296 GT3 (2023) | $650,000 | new | medium | Taken as the 296 GT3; Ferrari said it costs a little more than the 488 GT3's $615k [1](https://sportscar365.com/?p=108391) |
| `rss_gtm_hyperion_v8` | Ford Mustang GT3 (2024) | $650,000 | new | low | Taken as the Mustang GT3; no published price, estimated from current GT3 list prices  |
| `toyota_gr_gt3` | Toyota GR GT3 (2026) | $650,000 | new | low | No published price; Toyota's project manager told The Drive to take current GT3 cars as the reference, so priced at the 2023- GT3 median. An aggregator's EUR 348k is unsourced [1](https://www.motor1.com/news/781156/toyota-gr-gt3-price-availability/) [2](https://www.thedrive.com/news/toyotas-gr-gt-will-be-a-200000-plus-supercar) |
| `urd_detroit_coyote_gt3` | Ford Mustang GT3 (2025) | $650,000 | new | low | Taken as the Mustang GT3 from 'Coyote', its V8; no published price, estimated from current GT3 list prices  |
| `urd_ferrucci_926t_gt3_v2` | Ferrari 296 GT3 (2023) | $650,000 | new | medium | Taken as the 296 GT3; Ferrari said it costs a little more than the 488 GT3's $615k [1](https://sportscar365.com/?p=108391) |
| `mclaren_720s_gt3_evo` | McLaren 720S GT3 Evo (2023) | $600,000 | new | medium | The 720S GT3 was GBP 440k ($564k) in 2018; Evo estimated a little above [1](https://gtspirit.com/2018/08/28/mclaren-720s-gt3-announced-564000-price-tag/) [2](https://www.motor1.com/news/652600/mclaren-720s-gt3-evo-debut/) |
| `mclaren_720s_gt3_evo_endurance` | McLaren 720S GT3 Evo (2023), endurance version | $600,000 | new | medium | As `mclaren_720s_gt3_evo`. The 720S GT3 was GBP 440k ($564k) in 2018; Evo estimated a little above [1](https://gtspirit.com/2018/08/28/mclaren-720s-gt3-announced-564000-price-tag/) [2](https://www.motor1.com/news/652600/mclaren-720s-gt3-evo-debut/) |
| `mclaren_720s_gt3_evo_sprint` | McLaren 720S GT3 Evo (2023), sprint version | $600,000 | new | medium | As `mclaren_720s_gt3_evo`; sprint trim of the same car [1](https://gtspirit.com/2018/08/28/mclaren-720s-gt3-announced-564000-price-tag/) [2](https://www.motor1.com/news/652600/mclaren-720s-gt3-evo-debut/) |
| `porsche_992_gt3_r` | Porsche 911 GT3 R (992, 2023) | $600,000 | market | high | As `porsche_992_gt3_r_2023`. EUR 511k new; an ex-Pfaff car listed at $660k with spares; the Evo now lists at EUR 573k [1](https://www.dailysportscar.com/?p=460090) [2](https://newsroom.porsche.com/en_US/2022/motorsport/porsche-911-gt3-r-generation-992-customer-racing-car-premiere-29222.html) |
| `porsche_992_gt3_r_2023` | Porsche 911 GT3 R (992, 2023) | $600,000 | market | high | EUR 511k new; an ex-Pfaff car listed at $660k with spares; the Evo now lists at EUR 573k [1](https://www.dailysportscar.com/?p=460090) [2](https://newsroom.porsche.com/en_US/2022/motorsport/porsche-911-gt3-r-generation-992-customer-racing-car-premiere-29222.html) |
| `rss_gtm_lanzo_v8` | Lamborghini Temerario GT3 (2026) | $600,000 | new | medium | GT3 price unpublished; its sister Temerario Super Trofeo is $399k + tax in the US (EUR 295k + VAT), and Lamborghini GT3 cars have run about 1.5x the Super Trofeo (Huracan GT3 Evo EUR 389k vs ST Evo2 EUR 250k) [1](https://www.lambocars.com/web-stories/lamborghini-s-temerario-super-trofeo-creates-its-most-deliberate-racing-ladder-y/) [2](https://lambocars.com/lamborghini-temerario-gt3-v8-racing/) |
| `rss_gtm_macca_72_evo_v8` | McLaren 720S GT3 Evo (2023) | $600,000 | new | medium | Taken as the 720S GT3 Evo; the 720S GT3 was GBP 440k ($564k) in 2018, Evo estimated a little above [1](https://gtspirit.com/2018/08/28/mclaren-720s-gt3-announced-564000-price-tag/) [2](https://www.motor1.com/news/652600/mclaren-720s-gt3-evo-debut/) |
| `rss_gtm_protech_p92_f6` | Porsche 911 GT3 R (992, 2023) | $600,000 | market | high | Taken as the 992 GT3 R; EUR 511k new, an ex-Pfaff car listed at $660k with spares; the Evo now lists at EUR 573k [1](https://www.dailysportscar.com/?p=460090) [2](https://newsroom.porsche.com/en_US/2022/motorsport/porsche-911-gt3-r-generation-992-customer-racing-car-premiere-29222.html) |
| `urd_darche_992_23` | Porsche 911 GT3 R (992, 2023) | $600,000 | market | high | Taken as the 992 GT3 R; EUR 511k new, an ex-Pfaff car listed at $660k with spares; the Evo now lists at EUR 573k |

## GT3 track special (unrestricted) 2021-2024 - median $1,025,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_gtmx_mercer_extreme_v8` | Mercedes-AMG GT3 Edition 130Y Motorsport (2024) | $1,200,000 | new | high | Replica identified from 'Mercer Extreme V8' and its naturally aspirated V8 of over 680 hp: the 130Y is an unrestricted 680 PS GT3, 13 built, EUR 1,030,000 excluding VAT (about $1.195M) [1](https://www.motor1.com/news/730828/mercedes-amg-gt3-edition-130y-debuts/) [2](https://store.racesimstudio.com/p/gt-mx) |
| `rss_gtmx_protech_p92_f6_renn` | Porsche 911 GT3 R rennsport (992, 2023) | $1,150,000 | new | medium | Taken from 'P92 F6 Renn' and its 620 bhp; 77 built, reported at EUR 995k + VAT (price from memory) [1](https://en.wikipedia.org/wiki/Porsche_911_GT3_R_(992)) |
| `rss_gtmx_macca_v8` | McLaren 720S GT3X (2021, unrestricted GT3 track car) | $900,000 | market | medium | GBP 720-750k (~$984k) new in 2021, 15 built and sold out; a typical resale put a little under list [1](https://www.carscoops.com/?p=2337433) [2](https://www.topgear.com/car-reviews/mclaren/first-drive-13) |

## GT4 2007-2016 - median $76,500

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_maserati_gt_mc_gt4` | Maserati GranTurismo MC GT4 (2010-2015) | $96,000 (researched $100,000) | market | medium | Racecarsdirect: a GranTurismo MC GT4 (fewer than 30 built to GT4 spec) at EUR 89.5k, price reduced (~$104k) [1](https://racecarsdirect.com/Advert/Details/149167/maserati-granturismo-gt4) |
| `maserati_gt_mc_gt4` | Maserati GranTurismo MC GT4 (2010-2015) | $96,000 (researched $100,000) | market | medium | As `ks_maserati_gt_mc_gt4`. Racecarsdirect: a GranTurismo MC GT4 (fewer than 30 built to GT4 spec) at EUR 89.5k, price reduced (~$104k) [1](https://racecarsdirect.com/Advert/Details/149167/maserati-granturismo-gt4) |
| `gt4_ktm_xbow` | KTM X-Bow GT4 (2015-2018) | $78,000 | market | high | Classic.com benchmark $77.8k; a 2015 car sold for $77.5k in Nov 2025 [1](https://www.classic.com/m/ktm/x-bow/gt4) |
| `ginetta_g55_gt4` | Ginetta G55 GT4 | $75,000 | market | high | As `gt4_ginetta_g55`. A 2018 car sold for $95k (2024), a 2019 one listed at $85k, UK cars from GBP 35-50k [1](https://gtcup.co.uk/marketplace) [2](https://www.hagerty.com/valuation-tools/past-sales/2018-ginetta-g55/vin/3394cb4f-32ac-4a68-a439-e8fc11216930) |
| `gt4_ginetta_g55` | Ginetta G55 GT4 | $75,000 | market | high | A 2018 car sold for $95k (2024), a 2019 one listed at $85k, UK cars from GBP 35-50k [1](https://gtcup.co.uk/marketplace) [2](https://www.hagerty.com/valuation-tools/past-sales/2018-ginetta-g55/vin/3394cb4f-32ac-4a68-a439-e8fc11216930) |
| `lotus_2_eleven_gt4` | Lotus 2-Eleven GT4 (2009) | $57,000 (researched $55,000) | market | medium | 2-Elevens with GT4 cage/kit ask GBP 38-40k in the UK; track-only US cars $48-60k [1](https://racecarsdirect.com/Advert/Details/155619/lotus-2-eleven) [2](https://www.racingjunk.com/track-day/184808515/lotus-2-11.html) |

## GT4 2017-2022 - median $146,500

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `porsche_718_cayman_gt4_mr` | Porsche 718 Cayman GT4 Clubsport MR by Manthey (2019-2021) | $183,125 (researched $190,000) | tuned | medium | The 718 Clubsport ($160k, as `gt4_porsche_cayman_718`) plus Manthey's MR package, listed at EUR 40,778 (about EUR 34k net, ~$40k) [1](https://store.51gt3.com/products/manthey-718-cayman-gt4-clubsport-mr-package-mth001982-porsche-718-cayman-gt4-clubsport) [2](https://www.manthey-racing.com/kit-718-gt4-clubsport-mr-982) |
| `audi_r8_gt4` | Audi R8 LMS GT4 (2018) | $175,000 | market | medium | As `gt4_audi_r8`. EUR 198k net new (2017); a 2018 car was listed at GBP 150k + VAT [1](https://www.thespeedjournal.com/?p=22822) [2](https://www.audi-mediacenter.com/en/press-releases/audi-r8-lms-gt4-goes-on-sale-9429) |
| `gt4_audi_r8` | Audi R8 LMS GT4 (2018) | $175,000 | market | medium | EUR 198k net new (2017); a 2018 car was listed at GBP 150k + VAT [1](https://www.thespeedjournal.com/?p=22822) [2](https://www.audi-mediacenter.com/en/press-releases/audi-r8-lms-gt4-goes-on-sale-9429) |
| `bmw_m4_gt4` | BMW M4 GT4 F82 (2018) | $160,000 | market | high | As `gt4_bmw_m4`. Classic.com: a 2018 car sold for $168k in 2024, other bids $120-185k; EUR 169k net new [1](https://classic.com/m/bmw/4-series/f32/m4/gt4) [2](https://www.topgear.com/car-news/motorsport/new-ps160k-bmw-m4-gt4-racing-car) |
| `bmw_m4_gt4_endurence` | BMW M4 GT4 F82 (2018), endurance version | $160,000 | market | high | As `gt4_bmw_m4`; endurance trim of the same car [1](https://classic.com/m/bmw/4-series/f32/m4/gt4) [2](https://www.topgear.com/car-news/motorsport/new-ps160k-bmw-m4-gt4-racing-car) |
| `gt4_bmw_m4` | BMW M4 GT4 F82 (2018) | $160,000 | market | high | Classic.com: a 2018 car sold for $168k in 2024, other bids $120-185k; EUR 169k net new [1](https://classic.com/m/bmw/4-series/f32/m4/gt4) [2](https://www.topgear.com/car-news/motorsport/new-ps160k-bmw-m4-gt4-racing-car) |
| `gt4_porsche_cayman_718` | Porsche 718 Cayman GT4 Clubsport (2019-2021) | $160,000 | market | medium | A 2020 Clubsport sold at a $180k ask; European cars list at EUR 116-126k [1](https://rennlist.com/forums/market/1445098) [2](https://www.elferspot.com/en/?p=5031846) |
| `gt4_mclaren_570s` | McLaren 570S GT4 (2017-2022) | $150,000 | market | high | Classic.com 2019 benchmark $147.6k; sales $134-170k [1](https://classic.com/m/mclaren/570s/gt4/year-2019) [2](https://dupontregistry.com/autos/results/mclaren/570s--gt4) |
| `gt4_mercedes_amg` | Mercedes-AMG GT4 (2018) | $150,000 | market | medium | EUR 199k net new (2017); valued on used 2018-2019 GT4s at $140-170k [1](https://www.carscoops.com/2017/07/new-mercedes-amg-gt4-race-car-reporting/) |
| `gt4_panoz_avezzano` | Panoz Avezzano GT4 (2017) | $150,000 | market | low | Estimate: a handful built; the road Avezzano lists at $159.9k and GT4 rivals trade at $140-160k  |
| `gt4_saleen_s1` | Saleen S1 GT4 (2020) | $150,000 | market | low | Announced at $225k, later quoted under $200k; few built, so valued with the used GT4s around it  |
| `mclaren_570s_gt4` | McLaren 570S GT4 (2017-2022) | $150,000 | market | high | As `gt4_mclaren_570s`. Classic.com 2019 benchmark $147.6k; sales $134-170k [1](https://classic.com/m/mclaren/570s/gt4/year-2019) [2](https://dupontregistry.com/autos/results/mclaren/570s--gt4) |
| `mercedes_amg_gt4` | Mercedes-AMG GT4 (2018) | $150,000 | market | medium | As `gt4_mercedes_amg`. EUR 199k net new (2017); valued on used 2018-2019 GT4s at $140-170k [1](https://www.carscoops.com/2017/07/new-mercedes-amg-gt4-race-car-reporting/) |
| `amr_v8_vantage_gt4` | Aston Martin Vantage AMR GT4 (2018-2023) | $145,000 | market | high | As `gt4_aston_martin_vantage`. Racemarket lists Vantage AMR GT4s at EUR 110k (2020), 120k (2022) and 145k; about EUR 125k (~$145k at 1.16) [1](https://racemarket.net/race-cars/race-cars-for-sale/gt4/2020-aston-martin-vantage-gt4-17-a-i7154) [2](https://racemarket.net/race-cars/race-cars-for-sale/gt4/aston-martin-vantage-amr-gt4-2022-i4834) [3](https://racemarket.net/race-cars/race-cars-for-sale/gt4/aston-martin-vantage-amr-gt4-i5167) |
| `gt4_aston_martin_vantage` | Aston Martin Vantage AMR GT4 (2018) | $145,000 | market | high | Racemarket lists Vantage AMR GT4s at EUR 110k (2020), 120k (2022) and 145k; about EUR 125k (~$145k at 1.16) [1](https://racemarket.net/race-cars/race-cars-for-sale/gt4/2020-aston-martin-vantage-gt4-17-a-i7154) [2](https://racemarket.net/race-cars/race-cars-for-sale/gt4/aston-martin-vantage-amr-gt4-2022-i4834) [3](https://racemarket.net/race-cars/race-cars-for-sale/gt4/aston-martin-vantage-amr-gt4-i5167) |
| `gt4_toyota_supra` | Toyota GR Supra GT4 (2020, pre-Evo) | $145,000 | market | medium | EUR 175k net new (2020), since replaced by the Evo and Evo2; used value estimated from comparable GT4s [1](https://pressroom.toyota.com/toyota-gazoo-racing-to-commence-sales-of-gr-supra-gt4/) [2](https://www.autoblog.com/2019/10/29/2020-toyota-supra-gt4-race-car-details-price/) |
| `toyota_supra_gt4_cup_2019` | Toyota GR Supra GT4 (2020, pre-Evo) | $145,000 | market | medium | EUR 175k net new (2020), since replaced by the Evo and Evo2; used value estimated from comparable GT4s [1](https://pressroom.toyota.com/toyota-gazoo-racing-to-commence-sales-of-gr-supra-gt4/) [2](https://www.autoblog.com/2019/10/29/2020-toyota-supra-gt4-race-car-details-price/) |
| `chevrolet_camaro_gt4r` | Chevrolet Camaro GT4.R (2018) | $140,000 | market | high | As `gt4_camaro`. $259k new; a 2018 ex-IMSA car sold for $143k on Bring a Trailer in 2024 [1](https://gmauthority.com/blog/2017/09/chevrolet-camaro-gt4-r-priced-at-259000/) |
| `gt4_camaro` | Chevrolet Camaro GT4.R (2018) | $140,000 | market | high | $259k new; a 2018 ex-IMSA car sold for $143k on Bring a Trailer in 2024 [1](https://gmauthority.com/blog/2017/09/chevrolet-camaro-gt4-r-priced-at-259000/) |
| `gt4_ford_mustang` | Ford Mustang GT4 S550 (2017) | $140,000 | market | medium | About $225k new; valued on used 2017-2019 GT4s such as the Camaro GT4.R at $143k [1](https://www.fordmuscle.com/?p=9028) [2](https://multimaticmotorsports.com/wp-content/uploads/2024/08/2024_08_05-Mustang-GT4-Overview.pdf) |
| `alpine_a110_gt4` | Alpine A110 GT4 (2018) | $130,000 | market | medium | As `gt4_alpine_a110`. Superseded by the A110 GT4 Evo at EUR 200k net and the GT4+ at EUR 220k; the original is valued below them [1](https://cdn.group.renault.com/alp/uk/pdf/competitions/Alpine-A110-GT4-evo_EN.pdf.asset.pdf/0fff33c05e.pdf) [2](https://it.motor1.com/news/754154/alpine-a110-gt4-2025/) |
| `gt4_alpine_a110` | Alpine A110 GT4 (2018) | $130,000 | market | medium | Superseded by the A110 GT4 Evo at EUR 200k net and the GT4+ at EUR 220k; the original is valued below them [1](https://cdn.group.renault.com/alp/uk/pdf/competitions/Alpine-A110-GT4-evo_EN.pdf.asset.pdf/0fff33c05e.pdf) [2](https://it.motor1.com/news/754154/alpine-a110-gt4-2025/) |
| `gt4_sin_r1` | SIN R1 GT4 (2017-2019) | $110,000 (researched $80,000) | market | low | GBP 85k ex VAT for the homologated GT4 spec at launch; low-volume, estimated at $70-90k used  |

## GT4 2023- - median $235,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ford_mustang_GT4_2024` | Ford Mustang GT4 (2024) | $235,000 | new | low | Multimatic prices it on enquiry; estimated at the level of the current GT4s that publish a price (BMW M4 GT4 EVO EUR 219k net, Nissan Z GT4 $229k) [1](https://multimaticmotorsports.com/wp-content/uploads/2024/08/2024_08_05-Mustang-GT4-Overview.pdf) [2](https://tflcar.com/2022/11/nissan-z-gt4-race-car-debut/) |
| `fsr_bmw_m4_g86_gt4` | BMW M4 GT4 G82 (2023, now sold as the EVO) | $235,000 | new | high | As `gt4_bmw_m4_g82`. Launched at EUR 187k net (2022); the current M4 GT4 EVO is EUR 219k net [1](https://press.bmwgroup.com/global/article/detail/T0443468EN/tailored-updates:-bmw-m4-gt4-evo-responds-to-feedback-from-bmw-m-motorsport-customers) [2](https://bimmerlife.com/2022/06/17/bmw-motorsport-introduces-new-m4-gt4/) |
| `gt4_bmw_m4_g82` | BMW M4 GT4 G82 (2023, now sold as the EVO) | $235,000 | new | high | Launched at EUR 187k net (2022); the current M4 GT4 EVO is EUR 219k net [1](https://press.bmwgroup.com/global/article/detail/T0443468EN/tailored-updates:-bmw-m4-gt4-evo-responds-to-feedback-from-bmw-m-motorsport-customers) [2](https://bimmerlife.com/2022/06/17/bmw-motorsport-introduces-new-m4-gt4/) |
| `gt4_mercedes_amg_evo` | Mercedes-AMG GT4 with the Evo update (current) | $235,000 | new | medium | Still sold; one report puts the current car at about $237k, close to the BMW M4 GT4 EVO [1](https://znews.vn/sieu-xe-dua-mercedes-amg-gt4-the-he-moi-ra-mat-post1058826.html) |
| `aston_martin_vantage_gt4_evo` | Aston Martin Vantage GT4 (2024-) | $230,000 | new | medium | Taken as the current-generation Vantage GT4 (2024), still built; new price unpublished. Mirage Racing's 2025 title-winning car (MY2024) asks EUR 175k + VAT (~$203k at 1.16), so new is put a little above [1](https://www.racecarsdirect.com/Advert/Details/159709/aston-martin-vantage-gt4-evo---2025-champion) [2](https://sportscar365.com/imsa/impc/aston-martin-reveals-new-vantage-gt4/) |
| `nisssan_z_gt4_2023` | Nissan Z GT4 (2023) | $229,000 | new | high | Nissan's price is about $229,000 (JPY 33.2M) with the required race package, excluding shipping and tax [1](https://tflcar.com/2022/11/nissan-z-gt4-race-car-debut/) [2](https://global.nissannews.com/en/releases/nissan-z-gt4-at-the-2022-sema-show) |

## GT500 2020-2023 - median $750,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_jt5_moyoda_2021` | Toyota GR Supra GT500 (2021) | $750,000 | build | low | Works Class 1 car, never sold. The only public Class 1 result is a 2019 Aston Vantage DTM, which sold for EUR 522.5k with spares (RM Monaco 2024); a works GT500 build is put above that [1](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) |
| `urd_jt5_shiro_2021` | Nissan GT-R NISMO GT500 (2021) | $750,000 | build | low | Same basis as the Supra. A retired 2000 Supra GT500 with no engine or gearbox made only JPY 19.98M at Bingo (2024) [1](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) [2](https://bhauction.com/en/result/jdm-collectible-auction/lots/2000-toyota-supra-gt500) |
| `urd_jt5_snx_2021` | Honda NSX-GT (2021) | $750,000 | build | low | Same basis as the Supra; no GT500 build cost or sale was found in English or Japanese sources [1](https://rmsothebys.com/auctions/mc24/lots/r0098-2019-aston-martin-vantage-dtm/) |

## GTE 2011-2015 - median $425,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_corvette_c7r` | Chevrolet Corvette C7.R (Pratt & Miller, 2014-2019) | $530,000 (researched $800,000) | market | high | First C7.R at public auction (chassis 3, Daytona/Sebring winner) sold for $855k with spares on BaT in 2021; a typical chassis a little less. Designed to 2014 GTE rules, raced to 2019 [1](https://www.hagerty.com/media/?p=130358) [2](https://gmauthority.com/blog/2021/02/race-winning-2014-corvette-c7-r-now-headed-to-auction/) |
| `urd_egt_corvette` | Chevrolet Corvette C6.R ZR1 GT2 (2009-2013) | $530,000 (researched $600,000) | market | low | Taken as the C6.R ZR1; a ZR1-generation chassis was sold privately at an undisclosed price. Estimated below the C7.R's $855k (2021)  |
| `urd_egt_darche` | Porsche 911 RSR (991, 2013) | $530,000 (researched $900,000) | market | low | Replica identified from 'Darche' and its WEC anniversary livery (50 years of the 911). A 2014 991 RSR factory car is offered price on request; estimated under the 2017 RSR (ex-works $2.26M) [1](https://www.roadscholars.com/car-inventory/2014-porsche-911-rsr-type-991-porsche-factory-team-car) |
| `urd_egt_venom` | SRT Viper GTS-R (2012-2014) | $530,000 (researched $600,000) | market | low | Replica identified from 'Venom'. The #91 factory GTS-R is listed with no price shown; its customer derivative, the Viper GT3-R, was $459k new in 2013 [1](https://moparinsiders.com/?p=23935) [2](https://www.foxnews.com/auto/srt-viper-gt3-r-racer-on-sale-for-459000.amp) |
| `urd_egt_venom2` | SRT Viper GTS-R (2012-2014) | $530,000 (researched $600,000) | market | low | A second version of URD's Venom under the same name; priced the same [1](https://moparinsiders.com/?p=23935) |
| `lotus_evora_gte` | Lotus Evora GTE (2011) | $450,000 | market | high | One of the two 2011 Le Mans Evora GTEs offered at EUR 500k including two spare engines and spares [1](https://www.magnetomagazine.com/articles/one-of-two-lotus-evora-le-mans-cars-surfaces-for-sale-in-germany/) |
| `lotus_evora_gte_carbon` | Lotus Evora GTE (2011), lightweight carbon-bodied spec | $450,000 | market | medium | Same car as the Evora GTE; the carbon variant is a lighter spec of it, priced the same [1](https://www.magnetomagazine.com/articles/one-of-two-lotus-evora-le-mans-cars-surfaces-for-sale-in-germany/) |
| `urd_egt_bayro` | BMW Z4 GTE (2013) | $425,000 | market | low | Replica identified from its description, which follows "four successful years with the BMW M3 GT". No Z4 GTE sale found; set a little above the M3 GT2  |
| `bmw_m3_gt2` | BMW M3 GT2 (E92, 2009-2012) | $400,000 | market | medium | No sale of an M3 GT2 found; priced off same-era GT2/GTE cars - a 2011 458 GT2 asks ~$375k, an Evora GTE EUR 500k with spares. Built to 2009 GT2 rules, raced on as GTE [1](https://www.fchgt.com/?p=1834) [2](https://www.magnetomagazine.com/articles/one-of-two-lotus-evora-le-mans-cars-surfaces-for-sale-in-germany/) |
| `ferrari_458_gt2` | Ferrari 458 Italia GT2/GTE (Michelotto, 2011) | $400,000 | market | high | A 2011 customer 458 GT2 offered at $375k; ex-works AF Corse cars ask far more (one at GBP 1.35M) [1](https://www.fchgt.com/?p=1834) [2](https://www.pistonheads.com/buy/listing/14346608) |
| `urd_egt_ferruccio` | Ferrari 458 Italia GTE (2011-2015) | $400,000 | market | high | Replica identified from 'Ferruccio' and its restricted 4.5-litre V8; priced as the base game's 458 GT2 - a 2011 customer car offered at $375k |
| `urd_egt_ferruccio2` | Ferrari 458 Italia GTE (2011-2015) | $400,000 | market | high | A second version of URD's Ferruccio under the same name; priced the same |
| `urd_egt_am` | Aston Martin V8 Vantage GTE (2013) | $320,000 (researched $225,000) | market | high | Replica identified from 'Arthur Merlin' and its 2013 WEC GTE Pro programme; priced as Yezhrod's Vantage GTE - an unraced car built to 2016-2017 spec sold for $224k |
| `Yzd_Aston_Martin_V8_Vantage_GTE` | Aston Martin V8 Vantage GTE (2012-2017) | $320,000 (researched $225,000) | market | high | An unraced Vantage GTE built to 2016-2017 factory spec sold for $224k at RM Miami 2026 [1](https://rmsothebys.com/auctions/mi26/lots/r0005-2021-aston-martin-vantage-gte-2021) |

## GTE 2016-2023 - median $1,300,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_ferrucci_448t_egt` | Ferrari 488 GTE Evo (2018-2023) | $1,400,000 | market | medium | Replica identified from '448T'; a 2020 488 GTE Evo went unsold at RM Monaco 2026 against GBP 1.11-1.37M [1](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2026-04-25-ferrari-488-gte-ccffa8) |
| `urd_michigan_egt` | Chevrolet Corvette C8.R (2020-2023) | $1,400,000 | market | high | Corvette C8.R chassis 005 (one of six, IMSA race winner, Le Mans 2021/22), freshly rebuilt by Pratt Miller, offered on Hemmings Nov 2025 at $1.5M asking; a typical sale a little under asking [1](https://www.corvetteblogger.com/2025/11/01/corvettes-for-sale-corvette-c8-r-005-built-by-pratt-miller-is-offered-on-hemmings-for-1-5-million/) [2](https://gmauthority.com/blog/2025/11/race-winning-corvette-c8-r-005-up-for-sale-in-michigan/) |
| `yzd_ferrari_488_gte_evo` | Ferrari 488 GTE Evo (2018) | $1,400,000 | market | medium | A 2020 488 GTE Evo went unsold at RM Monaco 2026 against GBP 1.11-1.37M [1](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2026-04-25-ferrari-488-gte-ccffa8) |
| `urd_darche_egt_2020_sprint` | Porsche 911 RSR-19 (991.2, 2019-2023), sprint spec | $1,300,000 | market | medium | Replica identified from 'Darche 9SR Growler S' flat-six; no RSR-19 sale found, estimated from the 2017 RSR (EUR 991k new, ex-works $2.26M) [1](https://sportscar365.com/?p=59752) [2](https://en.wikipedia.org/wiki/Porsche_911_RSR-19) |
| `urd_darche_egt_2021_sprint` | Porsche 911 RSR-19 (991.2, 2019-2023), sprint spec | $1,300,000 | market | medium | Same RSR-19 as the Growler S, 2021 version; estimated from the 2017 RSR (EUR 991k new, ex-works $2.26M) [1](https://sportscar365.com/?p=59752) [2](https://en.wikipedia.org/wiki/Porsche_911_RSR-19) |
| `urd_detroit_egt_2019` | Ford GT GTE (2016-2019) | $1,300,000 | market | medium | No Ford GT GTE race-car sale found; the track-only Ford GT Mk II built off it by Multimatic sold for $1.006M (RM Arizona 2024), and the comparable BMW M8 GTE made $1.435M - a GTE chassis taken at about $1.3M [1](https://rmsothebys.com/auctions/az24/lots/r0050-2021-ford-gt-mk-ii/) [2](https://www.goodingco.com/lot/2019-bmw-m8-gte) |
| `yzd_ferrari_488_gte` | Ferrari 488 GTE (2016) | $1,300,000 | market | medium | A 488 GTE Evo went unsold against GBP 1.11-1.37M; the WEC-winning works car was estimated EUR 2.8-4M. A typical early car estimated ~$1.3M [1](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2026-04-25-ferrari-488-gte-ccffa8) [2](https://www.fchgt.com/?p=22359) |
| `ks_porsche_911_rsr_2017` | Porsche 911 RSR (991.2, 2017) | $1,250,000 | market | medium | Customer cars listed at EUR 991k new in 2017; an ex-works 2017 RSR sold for $2.26M in 2025, so a typical customer car is estimated ~$1.25M [1](https://sportscar365.com/?p=59752) [2](https://www.classic.com/m/porsche/911/991/9911/rsr) |
| `yzd_porsche_911_rsr_gte_2018` | Porsche 911 RSR (991.2, 2017-2018) | $1,250,000 | market | medium | Same car as the Kunos 911 RSR 2017: EUR 991k new for customers, an ex-works car sold for $2.26M in 2025 [1](https://sportscar365.com/?p=59752) [2](https://www.classic.com/m/porsche/911/991/9911/rsr) |
| `urd_bayro_egt_2018` | BMW M8 GTE (2018-2019) | $1,200,000 | market | high | Replica identified from 'Bayro 8'; the Rolex 24 class-winning M8 GTE sold for $1.435M at Gooding, a typical chassis a little less [1](https://www.goodingco.com/lot/2019-bmw-m8-gte) [2](https://www.imsa.com/news/2022/08/16/for-sale-slightly-used-bmw-racer-with-rolex-24-winning-pedigree/) |
| `urd_amr_egt_2019_v2` | Aston Martin Vantage AMR GTE (2018-2023) | $975,000 (researched $550,000) | market | medium | Replica identified from name and V8; an unraced previous-gen Vantage GTE sold for just $224k in 2026, the newer car estimated at ~$550k [1](https://rmsothebys.com/auctions/mi26/lots/r0005-2021-aston-martin-vantage-gte-2021) |

## IMSA GTO 1985-1993

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `f40_lm_ace` | Ferrari F40 LM (1989) | $9,000,000 | market | high | A 1993 Michelotto F40 LM (14th of 19) sold for $11.0M at RM Monterey 2025 against a $8.5-9.5M estimate; one made EUR 4.84M at RM Paris 2019 - typical now ~$9M [1](https://www.classic-car-auctions.info/?p=14798) [2](https://www.topgear.com/car-news/supercars/stare-blue-ferrari-f40-lm-just-sold-ps42m) |

## Indy Lights 2015- - median $300,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_formulalights_oval` | Dallara IL-15 Indy Lights, oval spec (2015-) | $300,000 | market | low | Same car in oval trim, priced the same [1](https://en.wikipedia.org/wiki/Dallara_IL-15) |
| `urd_formulalights_road` | Dallara IL-15 Indy Lights, road-course spec (2015-) | $300,000 | market | low | Still the Indy NXT spec chassis (Mazda-AER 2.0 turbo, 450 hp); no dollar price found. Estimated between the FIA F3 and F2 cars [1](https://en.wikipedia.org/wiki/Dallara_IL-15) |

## IndyCar 2012-2014 - median $250,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_formula_na_2012_oval` | Dallara DW12 IndyCar, 2012 speedway spec | $250,000 | market | medium | early-spec DW12 rolling chassis, well below a new car's $349k chassis cap plus kit; engine leased, not included; DW12 safety cell capped at $349k and aero kits at $70k (Wikipedia) [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2012_road` | Dallara DW12 IndyCar, 2012 road-course spec | $250,000 | market | medium | early-spec DW12 rolling chassis, well below a new car's $349k chassis cap plus kit; engine leased, not included; DW12 safety cell capped at $349k and aero kits at $70k (Wikipedia) [1](https://en.wikipedia.org/wiki/Dallara_DW12) |

## IndyCar 2015-2017 - median $325,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_fcdetroit_oval` | Dallara DW12 IndyCar, Chevrolet aero kit, speedway spec (2015-2017) | $325,000 | market | low | Same car in superspeedway trim, priced the same [1](https://www.indycar.com/news/2014/11/11-9-entrants-meet-aero-kit-deposit-deadline) |
| `urd_fcdetroit_road` | Dallara DW12 IndyCar, Chevrolet aero kit, road-course spec (2015-2017) | $325,000 | market | low | Used DW12 rolling chassis plus the $75,000 manufacturer aero kit; between the 2012-2014 cars and the UAK18 cars; engine leased, not included [1](https://www.indycar.com/news/2014/11/11-9-entrants-meet-aero-kit-deposit-deadline) |
| `urd_fcsuzuka_oval` | Dallara DW12 IndyCar, Honda aero kit, speedway spec (2015-2017) | $325,000 | market | low | Same car in superspeedway trim, priced the same [1](https://www.indycar.com/news/2014/11/11-9-entrants-meet-aero-kit-deposit-deadline) |
| `urd_fcsuzuka_road` | Dallara DW12 IndyCar, Honda aero kit, road-course spec (2015-2017) | $325,000 | market | low | As the Chevrolet-kit car; kits were capped at $75,000 [1](https://www.indycar.com/news/2014/11/11-9-entrants-meet-aero-kit-deposit-deadline) |

## IndyCar 2018-2023 - median $550,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_americas_2020` | Dallara DW12 IndyCar, 2020 road-course spec (UAK18 + aeroscreen) | $550,000 | new | medium | Still built: safety cell capped at $349k, aero kit about $70-90k, plus aeroscreen, gearbox and electronics; engines are leased and not included [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `rss_formula_americas_2020_oval` | Dallara DW12 IndyCar, 2020 speedway spec (UAK18 + aeroscreen) | $550,000 | new | medium | Still built: safety cell capped at $349k, aero kit about $70-90k, plus aeroscreen, gearbox and electronics; engines are leased and not included [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2021_oval` | Dallara DW12 IndyCar, 2021 speedway spec (UAK18 + aeroscreen) | $550,000 | new | medium | Still built: safety cell capped at $349k, aero kit about $70-90k, plus aeroscreen, gearbox and electronics; engines are leased and not included [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2021_road` | Dallara DW12 IndyCar, 2021 road-course spec (UAK18 + aeroscreen) | $550,000 | new | medium | Still built: safety cell capped at $349k, aero kit about $70-90k, plus aeroscreen, gearbox and electronics; engines are leased and not included [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2021_short` | Dallara DW12 IndyCar, 2021 short-oval spec (UAK18 + aeroscreen) | $550,000 | new | medium | Still built: safety cell capped at $349k, aero kit about $70-90k, plus aeroscreen, gearbox and electronics; engines are leased and not included [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2018_oval` | Dallara DW12 IndyCar, 2018 speedway spec (UAK18) | $415,000 (researched $400,000) | market | medium | a used UAK18-era DW12 below the ~$550k a current car comes to (chassis capped at $349k plus aero and systems); engine leased, not included; DW12 safety cell capped at $349k and aero kits at $70k (Wikipedia) [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2018_road` | Dallara DW12 IndyCar, 2018 road-course spec (UAK18) | $415,000 (researched $400,000) | market | medium | a used UAK18-era DW12 below the ~$550k a current car comes to (chassis capped at $349k plus aero and systems); engine leased, not included; DW12 safety cell capped at $349k and aero kits at $70k (Wikipedia) [1](https://en.wikipedia.org/wiki/Dallara_DW12) |
| `vrc_formula_na_2018_short` | Dallara DW12 IndyCar, 2018 short-oval spec (UAK18) | $415,000 (researched $400,000) | market | medium | a used UAK18-era DW12 below the ~$550k a current car comes to (chassis capped at $349k plus aero and systems); engine leased, not included; DW12 safety cell capped at $349k and aero kits at $70k (Wikipedia) [1](https://en.wikipedia.org/wiki/Dallara_DW12) |

## Ligier JS2 R 2019-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ligier_js2_r` | Ligier JS2 R (2019-) | $103,000 | new | medium | Mod named 'Ligier GT4' (it races in X-GT4 Italy). Ligier's launch price EUR 89,000 excl. VAT before options (~$103k at 1.16); not the 650 hp JS2 RS (from EUR 250k) [1](https://ligierautomotive.com/wp-content/uploads/2018/12/brochure-js2-r_vflight-1.pdf) [2](https://lesvoitures.fr/ligier-js2-r/) |

## LMDh 2023- - median $2,900,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `acura_arx06_2023` | Acura ARX-06 (2023) | $2,900,000 | build | medium | As `urd_akuma_axr006`. Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `alpine_a424` | Alpine A424 (2024) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `bmw_m_hybrid_v8_2023` | BMW M Hybrid V8 (2024) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `cadillac_v_series_r_2023` | Cadillac V-Series.R (2023) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `lamborghini_sc63` | Lamborghini SC63 (2024) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `porsche_963_2023` | Porsche 963 (2023) | $2,900,000 | new | high | Porsche sells the 963 to customer teams at $2.9M (about EUR 2.5M), car alone without spares [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `rss_mph_bayer_hybrid_v8` | BMW M Hybrid V8 (2024) | $2,900,000 | build | medium | Bayer Hybrid V8 taken as the BMW M Hybrid V8; works car never sold, priced at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `rss_mph_callahan_v8` | Cadillac V-Series.R (2025) | $2,900,000 | build | medium | Callahan V8 taken as the Cadillac V-Series.R; works car never sold, priced at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `rss_mph_lanzo_v8_evo` | Lamborghini SC63 (2025) | $2,900,000 | build | medium | Lanzo S6 V8 Evo taken as the Lamborghini SC63; works car never sold, priced at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `rss_mph_protech_p96_v8` | Porsche 963 (2024) | $2,900,000 | new | high | Protech P96 taken as the Porsche 963, sold to customer teams at $2.9M (about EUR 2.5M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `urd_akuma_axr006` | Acura ARX-06 (2023) | $2,900,000 | build | medium | Akuma AXR-006 taken as the Acura ARX-06; works car never sold, priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid  |
| `urd_bayro_m_hybrid_v8` | BMW M Hybrid V8 (2023) | $2,900,000 | build | medium | Taken as the BMW M Hybrid V8; works car never sold, priced at the Porsche 963 customer price ($2.9M)  |
| `urd_dallas_vsr_hybrid` | Cadillac V-Series.R (2023) | $2,900,000 | build | medium | Dallas VSR taken as the Cadillac V-Series.R; works car never sold, priced at the Porsche 963 customer price ($2.9M)  |
| `volvo_concept_lmdh` | No real equivalent - fictional Volvo LMDh (2026) | $2,900,000 | build | low | No real car; priced as an LMDh at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `vrc_pt_2024_arden` | Alpine A424 (2024) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `vrc_pt_2024_arden_csp` | Alpine A424 (2024) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `vrc_pt_2024_cadenza` | Cadillac V-Series.R (2024) | $2,900,000 | build | medium | Cadenza V taken as the Cadillac V-Series.R; works car never sold, priced at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `vrc_pt_2024_cadenza_csp` | Cadillac V-Series.R (2024) | $2,900,000 | build | medium | Cadenza V taken as the Cadillac V-Series.R; works car never sold, priced at the Porsche 963 customer price ($2.9M) [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |
| `yzd_cadillac_v_lmdh` | Cadillac V-Series.R (2023) | $2,900,000 | build | medium | Works car never sold; priced at the Porsche 963 customer price ($2.9M), sharing the cost-capped LMDh spec chassis and hybrid [1](https://www.stuttcars.com/porsche-963-lmdh-2023/) [2](https://en.endurance-info.com/auto/article/105100-how-much-does-lmdh-cost) |

## LMGTP 1999-2003 - median $5,500,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_lmgt_toyama_2zero_v8` | Toyota GT-One TS020 (1999) | $6,000,000 | market | low | Replica identified from '2-Zero' (TS020) and 1999; works cars never sold, estimated off late-90s GT1/GTP racers  |
| `urd_mercedes_clr_lm` | Mercedes-Benz CLR (1999) | $5,000,000 | market | low | All CLRs stay with Mercedes and none has sold; estimated off late-90s GT1/GTP racers that have  |

## LMH 2021- - median $4,500,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ferrari_499p_2023` | Ferrari 499P (2023) | $5,400,000 | build | medium | Works car never sold; Ferrari sells the track-only 499P Modificata for EUR 5.1M (about $5.4M) [1](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) [2](https://topgear.com.sg/news/ferrari-499p-modificata-is-a-870hp-track-toy-that-costs-eu51m-and-is-built-for-mortals) |
| `vrc_pt_2024_ferrenzo` | Ferrari 499P (2024) | $5,400,000 | build | medium | Ferrenzo P49 taken as the Ferrari 499P; works car never sold; Ferrari sells the track-only 499P Modificata for EUR 5.1M (about $5.4M) [1](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) [2](https://topgear.com.sg/news/ferrari-499p-modificata-is-a-870hp-track-toy-that-costs-eu51m-and-is-built-for-mortals) |
| `vrc_pt_2024_ferrenzo_csp` | Ferrari 499P (2024) | $5,400,000 | build | medium | Ferrenzo P49 taken as the Ferrari 499P; works car never sold; Ferrari sells the track-only 499P Modificata for EUR 5.1M (about $5.4M) [1](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) [2](https://topgear.com.sg/news/ferrari-499p-modificata-is-a-870hp-track-toy-that-costs-eu51m-and-is-built-for-mortals) |
| `peugeot_9x8` | Peugeot 9X8 (2024) | $4,500,000 | build | medium | Works hybrid LMH never sold; bracketed by a non-hybrid customer LMH (Glickenhaus quoted $2.5M ready to race, 2022), the EUR 3M (~$3.4M) cap on ERS supply to LMH customers, and the EUR 5.1M 499P Modificata - a hybrid chassis taken at ~$4.5M [1](https://www.autosport.com/wec/news/glickenhaus-le-mans-third-car-bid-falls-through/8843583/) [2](https://en.wikipedia.org/wiki/Le_Mans_Hypercar) [3](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) |
| `toyota_gr010` | Toyota GR010 Hybrid (2023) | $4,500,000 | build | medium | Works hybrid LMH never sold; bracketed by a non-hybrid customer LMH (Glickenhaus quoted $2.5M ready to race, 2022), the EUR 3M (~$3.4M) cap on ERS supply to LMH customers, and the EUR 5.1M 499P Modificata - a hybrid chassis taken at ~$4.5M; nothing found setting the GR010 above the 9X8 [1](https://www.autosport.com/wec/news/glickenhaus-le-mans-third-car-bid-falls-through/8843583/) [2](https://en.wikipedia.org/wiki/Le_Mans_Hypercar) [3](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) |
| `urd_gr010` | Toyota GR010 Hybrid (2021) | $4,500,000 | build | medium | Moyoda Hybrid taken as the GR010; works hybrid LMH never sold, priced as LFM's GR010 between a customer non-hybrid LMH and the 499P Modificata  |
| `vrc_pt_2023_pageau_98` | Peugeot 9X8 (2023) | $4,500,000 | build | medium | Pageau 9T8 = Peugeot 9X8. Works hybrid LMH never sold; bracketed by a non-hybrid customer LMH (Glickenhaus quoted $2.5M ready to race, 2022), the EUR 3M (~$3.4M) cap on ERS supply to LMH customers, and the EUR 5.1M 499P Modificata - a hybrid chassis taken at ~$4.5M [1](https://www.autosport.com/wec/news/glickenhaus-le-mans-third-car-bid-falls-through/8843583/) [2](https://en.wikipedia.org/wiki/Le_Mans_Hypercar) [3](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) |
| `vrc_pt_2023_pageau_98_csp` | Peugeot 9X8 (2023) | $4,500,000 | build | medium | Pageau 9T8 = Peugeot 9X8. Works hybrid LMH never sold; bracketed by a non-hybrid customer LMH (Glickenhaus quoted $2.5M ready to race, 2022), the EUR 3M (~$3.4M) cap on ERS supply to LMH customers, and the EUR 5.1M 499P Modificata - a hybrid chassis taken at ~$4.5M [1](https://www.autosport.com/wec/news/glickenhaus-le-mans-third-car-bid-falls-through/8843583/) [2](https://en.wikipedia.org/wiki/Le_Mans_Hypercar) [3](https://www.motorauthority.com/news/1141277_ferrari-499p-modificata-le-mans-price) |
| `vrc_pt_2024_isola` | Isotta Fraschini Tipo 6 LMH Competizione (2024) | $3,500,000 | build | medium | Isola Santini taken as the Isotta Fraschini Tipo 6 LMH Competizione; never sold as a race car; the road-going Tipo 6 LMH Strada is listed at EUR 3.25M (about $3.5M) [1](https://www.motorpasion.com/otras-competiciones/ir-carretera-que-te-adelante-hypercar-24-horas-le-mans-ha-hecho-esta-antigua-marca-que-ha-renacido) [2](https://www.motor1.com/features/723948/isotta-fraschini-tipo-6-history/) |
| `vrc_pt_2024_isola_csp` | Isotta Fraschini Tipo 6 LMH Competizione (2024) | $3,500,000 | build | medium | Isola Santini taken as the Isotta Fraschini Tipo 6 LMH Competizione; never sold as a race car; the road-going Tipo 6 LMH Strada is listed at EUR 3.25M (about $3.5M) [1](https://www.motorpasion.com/otras-competiciones/ir-carretera-que-te-adelante-hypercar-24-horas-le-mans-ha-hecho-esta-antigua-marca-que-ha-renacido) [2](https://www.motor1.com/features/723948/isotta-fraschini-tipo-6-history/) |
| `urd_scg007_lmh` | Glickenhaus SCG 007 LMH (2021) | $3,400,000 (researched $2,500,000) | build | medium | Glickenhaus's last figures are $2.5M ready to race (2022), and EUR 5M (2020) for a car plus spares, support and rebuilds for three races [1](https://thedrive.com/news/36503/want-to-race-your-own-scg-007-in-the-wec-hypercar-class-thatll-be-6-million) |
| `yzd_vanwall_vandervell_680` | Vanwall Vandervell 680 (ByKolles, 2023) | $3,400,000 (researched $2,700,000) | build | medium | Non-hybrid privateer LMH like the Glickenhaus 007, which Glickenhaus offered at $2.5M ready to race (EUR 2.5M in some reports, ~$2.9M) plus ~$2M of spares; taken at ~$2.7M [1](https://www.autosport.com/wec/news/glickenhaus-le-mans-third-car-bid-falls-through/8843583/) [2](https://thedrive.com/news/36503/want-to-race-your-own-scg-007-in-the-wec-hypercar-class-thatll-be-6-million) |

## LMP1 2011-2013

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_audi_r18_etron_2012` | Audi R18 e-tron quattro (2012) | $2,500,000 | market | medium | As `yzd_audi_r18_etron_2012`. Audi Sport now sells rebuilt ex-works R18 chassis privately; reported at above EUR 2M [1](https://www.motor16.com/noticias/2-millones-euros-8-unidades-mejor-audi/) [2](https://www.topgear.com/car-news/used-cars/audi-now-selling-its-old-racing-cars-beginning-r18-e-tron-and-dtm-rs-5) |
| `yzd_audi_r18_etron_2012` | Audi R18 e-tron quattro (2012) | $2,500,000 | market | medium | Audi Sport now sells rebuilt ex-works R18 chassis privately; reported at above EUR 2M [1](https://www.motor16.com/noticias/2-millones-euros-8-unidades-mejor-audi/) [2](https://www.topgear.com/car-news/used-cars/audi-now-selling-its-old-racing-cars-beginning-r18-e-tron-and-dtm-rs-5) |

## LMP1 2014-2020 - median $4,000,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_lmp1_protech_p91_evo` | Porsche 919 Hybrid Evo (2018) | $5,000,000 | build | low | Protech P91 Evo taken as the unrestricted 919 Hybrid Evo; one-off works car, estimated above the 919's $4M build cost  |
| `ks_porsche_919_hybrid_2015` | Porsche 919 Hybrid (2015) | $4,000,000 | build | low | Works car never sold; estimated chassis build cost including the hybrid system, above an ex-works Audi R18's market value  |
| `ks_porsche_919_hybrid_2016` | Porsche 919 Hybrid (2016) | $4,000,000 | build | low | Works car never sold; estimated chassis build cost including the hybrid system, above an ex-works Audi R18's market value  |
| `ks_toyota_ts040` | Toyota TS040 Hybrid (2014) | $4,000,000 | build | low | Works car never sold; estimated chassis build cost, same as the Porsche 919 Hybrid  |
| `urd_px1_darche` | Porsche 919 Hybrid (2015) | $4,000,000 | build | low | Replica identified from 'PX1 Darche 2015'; priced as Porsche Pack 2's 919 Hybrid 2015 - works car never sold, estimated chassis build cost  |
| `urd_px1_darche_s1` | Porsche 919 Hybrid (2015) | $4,000,000 | build | low | A second version of URD's PX1 Darche under the same name; priced the same  |
| `ks_audi_r18_etron_quattro` | Audi R18 e-tron quattro (2014) | $3,000,000 (researched $2,500,000) | market | medium | Audi Sport now sells rebuilt ex-works R18 chassis privately; reported at above EUR 2M [1](https://www.motor16.com/noticias/2-millones-euros-8-unidades-mejor-audi/) [2](https://www.topgear.com/car-news/used-cars/audi-now-selling-its-old-racing-cars-beginning-r18-e-tron-and-dtm-rs-5) |
| `urd_px1_aura` | Audi R18 e-tron quattro (2015) | $3,000,000 (researched $2,500,000) | market | medium | Replica identified from 'PX1 Aura 2015'; priced as Ready to Race's 2014 R18 - Audi Sport sells rebuilt ex-works R18 chassis privately  |
| `urd_px1_revolution` | Rebellion R-One (2014, Toyota V8) | $3,000,000 (researched $1,100,000) | market | low | Privateer non-hybrid LMP1 built by Oreca; no sale found. Lola's last LMP1 (B12/60, 2012) asks GBP 795k (2024) [1](https://www.motorsportmagazine.com/archive/article/may-2024/125/lolas-last-lmp1-car-goes-up-for-sale) |
| `urd_px1_revolution_v6` | Rebellion R-One AER (2015) | $3,000,000 (researched $1,100,000) | market | low | Same chassis with the AER P60 engine; priced as the 2014 car [1](https://www.motorsportmagazine.com/archive/article/may-2024/125/lolas-last-lmp1-car-goes-up-for-sale) |
| `urd_px1_shiro` | Nissan GT-R LM NISMO (2015) | $3,000,000 | build | low | Replica identified from 'PX1 Shiro 2015' and its #22 and #23 liveries. Works car, retired after one race and never sold; build cost estimated at the bottom of the class  |

## LMP2 2011-2016

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_px2_loire` | Oreca 05 LMP2 (2015) | $350,000 | market | low | Replica identified from 'PX2 Loire' (Loire is Oreca, as with the Loire 07); the preview shows a closed 2015 LMP2. No 05 sale found; a 2013 Oreca 03 Nissan asks about GBP 295k, so the newer car is set near it  |
| `ligier_jsp2` | Ligier JS P2 (2014) | $300,000 | market | medium | As `yzd_ligier_jsp2`. Ex-G-Drive 2015 Le Mans class-podium JS P2 (Nissan) offered by Ascott Collection; a JS P2 was reportedly asked at EUR 400k in 2023 - typical sale taken at ~$300k [1](https://en.ascottcollection.com/ligier-jsp2) |
| `yzd_ligier_jsp2` | Ligier JS P2 (2014) | $300,000 | market | medium | Ex-G-Drive 2015 Le Mans class-podium JS P2 (Nissan) offered by Ascott Collection, now eligible for Masters Endurance Legends; a JS P2 was reportedly asked at EUR 400k in 2023 - typical sale taken at ~$300k [1](https://en.ascottcollection.com/ligier-jsp2) |

## LMP2 2017- - median $545,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `mazda_rt24` | Mazda RT24-P DPi (2017-2021) | $550,000 | market | medium | No RT24-P sale found; a Dallara-based Cadillac DPi-V.R, its IMSA DPi contemporary, was offered at $550,000 [1](https://www.thedrive.com/news/32164/you-can-buy-this-cadillac-dpi-imsa-racer-for-550000-right-now) [2](https://multimaticmotorsports.com/cars/mazda-rt24-p/) |
| `acf_oreca_07` | Oreca 07 LMP2 (2023) | $545,000 | new | medium | Still built; about EUR 500k new, race-ready [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) [2](https://en.wikipedia.org/wiki/Oreca_07) |
| `urd_loire07_21` | Oreca 07 LMP2 (2021 spec) | $545,000 | new | medium | Loire 07 taken as the Oreca 07, still built; about EUR 500k new, race-ready [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) [2](https://en.wikipedia.org/wiki/Oreca_07) |
| `yzd_oreca_07_2021` | Oreca 07 LMP2 (2021 spec) | $545,000 | new | medium | Still built; about EUR 500k new, race-ready [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) [2](https://en.wikipedia.org/wiki/Oreca_07) |
| `yzd_oreca_07_2022` | Oreca 07 LMP2 (2022 spec) | $545,000 | new | medium | Still built; about EUR 500k new, race-ready [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) [2](https://en.wikipedia.org/wiki/Oreca_07) |
| `ligier_jsp217` | Ligier JS P217 (2017) | $410,000 (researched $300,000) | market | medium | As `lmp2_ligier_jsp217`. A 2018-raced JS P217 is offered at $215k as an unassembled roller with no engine, left suspension or electronics; complete with a Gibson GK428 ~$300k [1](https://www.indycompetition.com/items/ligier-ps217-lmp2-car---%24215%2C000) |
| `lmp2_dallara_p217` | Dallara P217 (2017) | $410,000 (researched $300,000) | market | medium | No P217 price found (a United Autosports car was sold through Car & Classic, price not shown); valued as its contemporary the JS P217, ~$300k complete with a Gibson engine [1](https://www.carandclassic.com/car/C1497414) [2](https://www.indycompetition.com/items/ligier-ps217-lmp2-car---%24215%2C000) |
| `lmp2_ligier_jsp217` | Ligier JS P217 (2017) | $410,000 (researched $300,000) | market | medium | A 2018-raced JS P217 is offered at $215k as an unassembled roller with no engine, left suspension or electronics; complete with a Gibson GK428 ~$300k [1](https://www.indycompetition.com/items/ligier-ps217-lmp2-car---%24215%2C000) |
| `yzd_oreca_07_2017` | Oreca 07 LMP2 (2017 spec) | $410,000 (researched $400,000) | market | medium | Used early Oreca 07 chassis, valued below the EUR 500k (about $545k) new price of the car still built [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) |
| `yzd_oreca_07_imsa` | Oreca 07 LMP2 IMSA (2017 spec) | $410,000 (researched $400,000) | market | medium | Used early Oreca 07 chassis, valued below the EUR 500k (about $545k) new price of the car still built [1](https://www.diariomotor.com/competicion/noticia/oreca-celebra-la-construccion-de-su-chasis-07-lmp2-numero-100/) |

## LMP3 2015-2019

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ligier_jsp3` | Ligier JS P3 (2015) | $100,000 | market | medium | GBP 140k new (capped); classic.com comps for a 2017 car $50-100k, a 2016 car asks GBP 125k, Motor Sport's guide cites a 2017 car at GBP 101k [1](https://www.motorsportmagazine.com/archive/article/february-2022/132/dallara-f308-race-car-buying-guide-2) [2](https://classic.com/veh/2017-ligier-js-p3-106-nwlk9XW) [3](https://www.race-cars.com/Advert/Details/132525/2016-ligier-jsp3-lmp3) |
| `ginetta_g57_lmp3` | Ginetta-Juno LMP3 (2015-2016) | $90,000 | market | low | Mod named 'G57 LMP-3' (the G57 itself is the P2-class derivative); the preview is the first-generation Ginetta LMP3. No price found; set a little under the JS P3, the class's most raced car [1](https://www.motorsportprospects.com/?p=3584) [2](https://www.motorsportmagazine.com/archive/article/february-2022/132/dallara-f308-race-car-buying-guide-2) |

## LMP3 2020-2024 - median $200,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `acfsk_adess_03_evo` | ADESS-03 Evo LMP3 (2020) | $200,000 | market | medium | No price found; one of the four 2020-2024 LMP3 chassis under the same EUR 239k new-car cap, so valued as the JS P320 [1](https://www.autosport.com/wec/news/new-lmp3-rules-cycle-outlined-for-2020-and-includes-power-boost-5283520/5283520/) [2](https://en.wikipedia.org/wiki/ADESS-03) |
| `acfsk_ginetta_g61_lt_p3` | Ginetta G61-LT-P3 (2020) | $200,000 | market | medium | Launched at EUR 239k (the class cap); an almost unused 2020 car went unsold on Collecting Cars in 2021 against a EUR 268,800 new price. Valued as the JS P320 [1](https://collectingcars.com/for-sale/2020-ginetta-g61-lt-p3-lmp3-prototype) [2](https://petrolicious.com/ginetta-confirms-lmp3-racing-return-with-unveil-of-new-challenger-for-2020) |
| `acfsk_ligier_jsp320` | Ligier JS P320 (2020) | $200,000 | market | medium | As `urd_px320`; a second version of the same car [1](https://ligierautomotive.com/en/news/the-new-ligier-lm-p3-the-js-p320-hits-the-track/) [2](https://rmsothebys.com/auctions/mo26/lots/v0012-2020-ligier-js-p320/) |
| `fsr_ligier_jsp320` | Ligier JS P320 (2020) | $200,000 | market | medium | As `urd_px320`. EUR 239k excluding taxes new (2019), now replaced by the JS P325; used cars ask EUR 150-170k plus VAT [1](https://ligierautomotive.com/en/news/the-new-ligier-lm-p3-the-js-p320-hits-the-track/) [2](https://rmsothebys.com/auctions/mo26/lots/v0012-2020-ligier-js-p320/) |
| `urd_px320` | Ligier JS P320 (2020) | $200,000 | market | medium | Replica identified from 'Legion PX320'. EUR 239k excluding taxes new (2019), now replaced by the JS P325; used cars ask EUR 150-170k plus VAT. A Katech LT1-converted example made $313k (RM 2026), which is not typical [1](https://ligierautomotive.com/en/news/the-new-ligier-lm-p3-the-js-p320-hits-the-track/) [2](https://rmsothebys.com/auctions/mo26/lots/v0012-2020-ligier-js-p320/) |
| `acfsk_duqueine_d08_lmp3_2020` | Duqueine D08 LMP3 (2020) | $190,000 | market | high | A 2022 D08 (JDC-Miller) asks $190k (Nov 2025); a 2018 D08 estimated EUR 100-150k at Artcurial (2026) [1](https://racecarsdirect.com/Advert/Details/159954/2022-duqueine-d08-lmp3) [2](https://www.artcurial.com/en/sales/6604/lots/54-a) |

## LMP3 2025-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ginetta_g61_evo` | Ginetta G61-LT-P325 Evo (2025) | $345,000 | new | medium | No Ginetta price published; the ELMS gives EUR 299,000 for a complete third-generation LMP3 (Toyota powertrain EUR 89,200 of it), ~$347k at 1.16 [1](https://www.europeanlemansseries.com/article/next-gen-lmp3-powered-by-toyota-for-2025-season-679a0c7c7ff99117c053773a) |

## Lotus Cup 2013-2021

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `gue_liana_gt_v6_cup` | Lotus Exige V6 Cup R (assumed; renamed Lotus) | $95,000 | market | medium | Taken as the Exige V6 Cup R (identification assumed): used ones GBP 60-90k in the UK, $85-96k sold in the US [1](https://racecarsdirect.com/Advert/Details/153676/lotus-exige-v6-cup-r) [2](https://racecarsdirect.com/Advert/Details/113422/2016-lotus-exige-v6-cup-r) |

## N-GT 2000-2004 - median $420,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `bmw_m3_gtr_2005` | BMW M3 GTR (E46, P60 V8), 2005 spec | $525,000 (researched $1,000,000) | market | low | As `gue_bmw_m3_e46_gtr`. Built for ALMS GT (N-GT equivalent) in 2001, later N24 winner; only a handful built and no public sale found - estimated as a rare works GT car  |
| `gue_bmw_m3_e46_gtr` | BMW M3 GTR (E46, P60 V8), 2004 Nurburgring 24h version | $525,000 (researched $1,000,000) | market | low | Built for ALMS GT (N-GT equivalent) in 2001, later N24 winner; only a handful built and no public sale found - estimated as a rare works GT car  |
| `rss_gtn_ferruccio_36` | Ferrari 360 Modena N-GT (2001-2003) | $420,000 | market | medium | Ferrari 360 N-GT (Michelotto, 17 built): one failed to sell at RM Woodcote Park 2026 against GBP 350-400k (~$475-550k); a 2003 360 GT sold for $335k (RM 2018) - typical taken at ~$420k [1](https://rmsothebys.com/auctions/wp26/lots/r0016-2001-ferrari-360-ngt/) [2](https://rmsothebys.com/auctions/ca18/lots/r0061-2003-ferrari-360-gt/) |
| `rss_gtn_furiano_36` | Ferrari 360 GTC (2003-2004) - assumed; may be another 360 N-GT build | $420,000 | market | medium | Ferrari 360 GTC/N-GT: priced as the 360 N-GT - one failed to sell at RM 2026 against GBP 350-400k, a 360 GT sold $335k (RM 2018); 360 GTC chassis 2060 offered 2021, price on request [1](https://rmsothebys.com/auctions/wp26/lots/r0016-2001-ferrari-360-ngt/) [2](https://www.fchgt.com/?p=17743) |
| `rss_gtn_protech_96` | Porsche 911 GT3-RS (996, 2001-2004 N-GT) | $330,000 | market | high | Ex-works 2001 996 GT3-RS (3x N24) asking EUR 280k (~$325k) at a dealer; the 2002 N-GT champion Freisinger car failed to sell at RM Milan 2025 against a EUR 300-500k estimate [1](https://www.octane-magazine.com/cars-for-sale/gt3-rs-364) [2](https://rmsothebys.com/auctions/ml25/lots/r0008-2001-porsche-911-gt3-rs/) |

## N24 SP8 2000-2009

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `gue_nissan_skyline_r34_24h` | Nissan Skyline GT-R (R34) Nurburgring 24h racer (early 2000s) | $300,000 | market | low | Estimated as a collectable R34 GT-R (road cars now $150-250k) plus a 24h race build  |

## NASCAR Brasil Sprint Race 2022-2023

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `camaro_nascar_br` | NASCAR Brasil Sprint Race Chevrolet Camaro (2022-2023) | $90,000 | market | low | No price published for the tube-frame series car; estimated at ~R$500k (~$90k at 5.4), below a Stock Car Pro car [1](https://en.wikipedia.org/wiki/NASCAR_Brasil_Sprint_Race) |
| `mustang_nascar_br` | NASCAR Brasil Sprint Race Ford Mustang (2022-2023) | $90,000 | market | low | No price published for the tube-frame series car; estimated at ~R$500k (~$90k at 5.4), below a Stock Car Pro car [1](https://en.wikipedia.org/wiki/NASCAR_Brasil_Sprint_Race) |

## NASCAR Cup 2013-2021

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_hyperion_2020` | NASCAR Cup Series Gen-6 stock car (2020) | $90,000 | market | medium | Ex-Roush 2020 Gen-6 Cup chassis with a 600hp crate engine asks $67.5k; an unraced 2021 Cup roller bid $30k (2023) - with a Cup-spec 750hp engine ~$90k [1](https://www.motorious.com/articles/handpicked/street-legal-2020-nascar-gen/) [2](https://www.hagerty.com/marketplace/auction/2021-ford-mustang-nascar-cup-car/3U5rAXVbE03Fn0ZMAwX3Xt) |

## NASCAR Cup Next Gen 2022- - median $350,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_chevrolet_camaro_2022` | NASCAR Cup Next Gen Chevrolet Camaro ZL1 (2022) | $350,000 | new | medium | Next Gen cars are bought from single-source suppliers, never sold whole; Denny Hamlin put a complete running car at about $350k (2023), up from a $225k launch budget [1](https://racingnews.co/2023/10/04/what-is-the-cost-of-the-nascar-next-gen-racecar) |
| `fsr_ford_mustang_2022` | NASCAR Cup Next Gen Ford Mustang (2022) | $350,000 | new | medium | Next Gen cars are bought from single-source suppliers, never sold whole; Denny Hamlin put a complete running car at about $350k (2023), up from a $225k launch budget [1](https://racingnews.co/2023/10/04/what-is-the-cost-of-the-nascar-next-gen-racecar) |
| `fsr_ford_mustang_2024` | NASCAR Cup Next Gen Ford Mustang Dark Horse (2024) | $350,000 | new | medium | Next Gen cars are bought from single-source suppliers, never sold whole; Denny Hamlin put a complete running car at about $350k (2023), up from a $225k launch budget [1](https://racingnews.co/2023/10/04/what-is-the-cost-of-the-nascar-next-gen-racecar) |
| `fsr_toyota_camry_2022` | NASCAR Cup Next Gen Toyota Camry TRD (2022) | $350,000 | new | medium | Next Gen cars are bought from single-source suppliers, never sold whole; Denny Hamlin put a complete running car at about $350k (2023), up from a $225k launch budget [1](https://racingnews.co/2023/10/04/what-is-the-cost-of-the-nascar-next-gen-racecar) |
| `fsr_toyota_camry_2024` | NASCAR Cup Next Gen Toyota Camry XSE (2024) | $350,000 | new | medium | Next Gen cars are bought from single-source suppliers, never sold whole; Denny Hamlin put a complete running car at about $350k (2023), up from a $225k launch budget [1](https://racingnews.co/2023/10/04/what-is-the-cost-of-the-nascar-next-gen-racecar) |

## One-make cup (Lamborghini Super Trofeo) 2015-2017

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_lamborghini_huracan_st` | Lamborghini Huracan LP 620-2 Super Trofeo (2015) | $150,000 | market | medium | About $300k new; used 2015-2016 cars bid $170k and listed under $180k years ago [1](https://www.carscoops.com/?p=1697888) [2](https://www.classic.com/a/mecum-monterey-2018-ln1MGnB/lots/2015-lamborghini-huracan-super-trofeo-W9zXaXp/) |

## One-make cup (Trofeo Abarth 500) 2008-2013

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_abarth500_assetto_corse` | Abarth 500 Assetto Corse (2008) | $40,000 | market | medium | 49 built for the one-make series; a 2009 car drew a EUR 32k high bid unsold in 2022 [1](https://themarket.co.uk/us/listings/fiat/abarth-500-assetto-corse-49/200f9116-04df-409d-a3b8-6e1a3eed6fed) |

## One-make cup 2012-2021

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_praga_r1` | Praga R1 | $130,000 | market | high | A 2014 Praga R1 (chassis 015) listed at $129,800 (Jalopnik, Feb 2026); a turbo-converted R1T prototype at $159k [1](https://jalopnik.com/2110870/praga-r1-race-car-for-sale-cheaper-than-porsche-911) [2](https://www.race-cars.com/Advert/Details/132254/praga-r1t-prototype-race-car) |

## One-make cup 2013-2016

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `lotus_exige_v6_cup` | Lotus Exige V6 Cup (2013) | $90,000 | market | high | US-spec Exige S V6 Cup (1 of 15) listed at $89,950 [1](https://classiccars.com/listings/view/2105071/2013-lotus-exige-for-sale-in-bellevue-washington-98005) |

## One-make cup 2014-2017

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_mercedes_cla250` | Mercedes-Benz CLA 45 AMG Racing Series (Mercedes-Benz Challenge Brasil, 2014-2019) | $55,000 | market | low | Sold new for R$360,000 (~$155k at 2.33, 2014) for the Brazilian Mercedes-Benz Challenge; no used sale found, a car from the ended series estimated at ~R$300k (~$55k at 5.4) [1](https://motorshow.com.br/mercedes-benz-inaugura-uma-nova-categoria-do-automobilismo) [2](https://en.wikipedia.org/wiki/Mercedes-Benz_Challenge) |
| `ks_bmw_m235i_racing` | BMW M235i Racing (2014-2017) | $50,000 | market | medium | EUR 59,500 net new; used examples estimated at about $50k [1](https://www.bimmerfile.com/2013/12/08/video-m235i-racing-from-bmw-motorsport/) [2](https://carscoops.com/?p=127638) |

## One-make cup 2015-2017

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_audi_tt_cup` | Audi Sport TT Cup (2015-2017) | $110,000 | market | low | Cars were arrive-and-drive only (EUR 99-120k a season incl. preparation); value of the car itself estimated  |

## One-make cup 2016-2018

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_cayman_gt4_clubsport` | Porsche Cayman GT4 Clubsport (981, 2016) | $100,000 | market | high | 981 GT4 Clubsports: $90k (2016, California, RacingJunk); EUR 85-105k + VAT in Europe, MR-updated cars to EUR 120k [1](https://www.racingjunk.com/track-day/184784629/2016-porsche-981-gt4-clubsport-.html) [2](https://racecarsdirect.com/Advert/Details/137012/porsche-cayman-981-gt4-clubsport) |

## One-make cup 2016-2024

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_mazda_mx5_cup` | Mazda Global MX-5 Cup car (ND, Long Road Racing) | $59,000 | new | medium | Mazda's listed price $58,900 ready-to-race (launch $53,000); no newer figure found [1](https://grassrootsmotorsports.com/articles/mazda-and-long-road-racing-perhaps-ultimate-practi/) [2](https://www.motorauthority.com/news/1100301_mazda-announces-pricing-for-miata-mx-5-cup-car) |

## One-make cup 2020-2023

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `gue_ferrari_488_challange_gt2` | Ferrari 488 Challenge Evo (2020), mod's fictional GT2 conversion | $210,000 | market | high | Racemarket lists a Ferrari 488 Challenge Evo at EUR 180k (~$209k at 1.16) [1](https://racemarket.net/race-cars/race-cars-for-sale/gt3/ferrari-488-challenge-evo-i7532) |

## One-make cup 2022-present

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_huracan_st_evo_2` | Lamborghini Huracan Super Trofeo EVO2 (2022) | $290,000 | new | high | As `gue_lamborghini_huracan_st_evo2`. Super Trofeo EVO2 sold at EUR 250k before taxes (2021) [1](https://www.hdmotori.it/lamborghini/articoli/n538688/lamborghini-huracan-super-trofeo-evo2-motore) [2](https://www.motor16.com/noticias/nuevo-lamborghini-dani-pedrosa-620-potencia/2/) |
| `gue_lamborghini_huracan_st_evo2` | Lamborghini Huracan Super Trofeo EVO2 (2022) | $290,000 | new | high | Super Trofeo EVO2 sold at EUR 250k before taxes (2021); the mod runs it to GT2 spec [1](https://www.hdmotori.it/lamborghini/articoli/n538688/lamborghini-huracan-super-trofeo-evo2-motore) [2](https://www.motor16.com/noticias/nuevo-lamborghini-dani-pedrosa-620-potencia/2/) |

## Porsche Carrera Cup 2017-2020

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_911_gt3_cup_2017` | Porsche 911 GT3 Cup 991.2 (2017-2019) | $190,000 | market | high | Classic.com benchmark $192k for the 991.2 Cup, sales averaging $187k [1](https://classic.com/m/porsche/911/991/9912/gt3-cup) [2](https://www.motorsportprospects.com/a-2019-porsche-911-gt3-cup-991-2-race-car-is-for-sale-in-the-motorsport-prospects-marketplace/) |

## Porsche Carrera Cup 2021-2025 - median $250,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_porsche_992_gt3_cup` | Porsche 911 GT3 Cup 992.1 (2021) | $250,000 | market | high | As `gue_porsche_911_gt3_cup_992`. Replaced by the 992.2 Cup for 2026; classic.com benchmark $250k for the 992.1 Cup, a 2021 car listed at $255k [1](https://classic.com/m/porsche/911/992/9921/gt3-cup) [2](https://www.kellymoss.com/for-sale/2021-porsche-992-gt3-cup-car) [3](https://news.dupontregistry.com/sponsored/broad-arrow-auctions-preview-2021-porsche-911-gt3-cup/) |
| `gue_porsche_911_gt3_cup_992` | Porsche 911 GT3 Cup 992.1 (2021) | $250,000 | market | high | Replaced by the 992.2 Cup for 2026; classic.com benchmark $250k for the 992.1 Cup, a 2021 car listed at $255k [1](https://classic.com/m/porsche/911/992/9921/gt3-cup) [2](https://www.kellymoss.com/for-sale/2021-porsche-992-gt3-cup-car) [3](https://news.dupontregistry.com/sponsored/broad-arrow-auctions-preview-2021-porsche-911-gt3-cup/) |
| `lrs_porsche_911_992_gt3_cup` | Porsche 911 GT3 Cup 992.1 (2021) | $250,000 | market | high | Replaced by the 992.2 Cup for 2026; classic.com benchmark $250k for the 992.1 Cup, a 2021 car listed at $255k [1](https://classic.com/m/porsche/911/992/9921/gt3-cup) [2](https://www.kellymoss.com/for-sale/2021-porsche-992-gt3-cup-car) [3](https://news.dupontregistry.com/sponsored/broad-arrow-auctions-preview-2021-porsche-911-gt3-cup/) |
| `urd_darche_cup_2021` | Porsche 911 GT3 Cup 992.1 (2021) - URD replica | $250,000 | market | high | Replaced by the 992.2 Cup for 2026; classic.com benchmark $250k for the 992.1 Cup, a 2021 car listed at $255k [1](https://classic.com/m/porsche/911/992/9921/gt3-cup) [2](https://www.kellymoss.com/for-sale/2021-porsche-992-gt3-cup-car) [3](https://news.dupontregistry.com/sponsored/broad-arrow-auctions-preview-2021-porsche-911-gt3-cup/) |

## Praga R1 2021-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_praga_r1_2024` | Praga R1 (2021- generation, 2024) | $225,000 | new | medium | Still built; the 2021-generation turbo R1 was announced at EUR 195,000 (~$226k at 1.16). An ex-works 2022 Gen 5 asks GBP 140k + VAT, another 2022 car GBP 70k + VAT [1](https://www.pmw-magazine.com/news/new-competition-car/praga-shows-details-of-2021-r1.html) [2](https://www.racecarsdirect.com/Advert/Details/130430/ex-works-praga-r1-gen-5-2022) |

## Radical Cup 2023- - median $147,990

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `urd_radical_sr10xxr_2023` | Radical SR10 XXR (2023) | $180,000 | new | high | US dealer (Spring Mountain) list price: SR10 XXR starts at $179,990 (UK GBP 132,200 per City AM) [1](https://springmountainracing.com/products/radical-sr10-xxr) [2](https://cityam.com/?p=2141398) |
| `urd_radical_sr3xxr_2023` | Radical SR3 XXR (2023) | $115,000 | new | high | US dealer (Spring Mountain) list price: SR3 XXR starts at $115,990 [1](https://springmountainracing.com/products/radical-sr3-xxr) |

## Road cars

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_alfa_33_stradale` | Alfa Romeo Tipo 33 Stradale (1967) | $10,000,000 | market | medium | 1968 Tipo 33 Stradale listed at $9.5M (private sale, estimated, 2025) among the dearest Alfas sold; 18 built, none at public auction; the EUR 30M press figure comes from a 2026 legal dispute, not a sale [1](https://www.italpassion.fr/en/alfa-romeo/voici-les-10-alfa-romeo-les-plus-cheres-de-lhistoire-toutes-vendues-plus-d1-million-e/) [2](https://www.italpassion.fr/en/alfa-romeo/une-des-18-alfa-romeo-33-stradale-estimee-30-millions-deuros-a-disparue-la-famille-offre-une-belle-recompense/) |
| `ks_ferrari_288_gto` | Ferrari 288 GTO (1984-1987) | $6,500,000 | market | medium | Record EUR 9.1M (Paris 2026), Mecum about EUR 7M weeks before; $3.9M in 2023, values climbing fast [1](https://www.octane-magazine.com/news/record-e9-1m-ferrari-288-gto-headlines-gooding-christies-paris-debut/) [2](https://broadarrowauctions.com/vehicles/jc23_034/1985-ferrari-288-gto) |
| `ks_pagani_huayra_bc` | Pagani Huayra BC (2016-2018) | $4,250,000 | market | medium | 2017 BC coupe at RM Sotheby's Dec 2024 about GBP 3.35m [1](https://www.theclassicvaluer.com/vehicle-details/rm-sotheby-s-2024-12-01-pagani-huayra-0df174) [2](https://www.carscoops.com/2020/04/low-mileage-2017-pagani-huayra-bc-for-sale-only-multi-millionaires-need-apply/) |
| `ferrari_laferrari` | Ferrari LaFerrari (2013-2016) | $4,000,000 | market | high | 2025 sales: $3.85m at Mecum Indy, CHF 3.32m at RM Zurich; $5.48m in Jan 2026 [1](https://www.carpro.com/blog/mecum-indy-2025-tops-100-million-dollars-in-sales) [2](https://rmsothebys.com/media-center/press-releases/rm-sotheby-s-opens-the-2026-auction-season-with-63-million-arizona-sale-led-by-ferrari-enzo-f50-and-laferrari/) |
| `ks_lamborghini_miura_sv` | Lamborghini Miura P400 SV (1971-1973) | $4,000,000 | market | medium | Low-mile SV $4.46m in 2025; record $6.6m in 2026; earlier sales around EUR 2.4m [1](https://www.carscoops.com/2026/04/lamborghini-miura-sv-auction/) [2](https://www.supercars.net/blog/?p=893755) |
| `ruf_yellowbird` | RUF CTR 'Yellowbird' (1987-1989) | $4,000,000 | market | medium | Record $6.055M for a 1,056-mile car (2025) versus $1.08M in 2018; typical example estimated between [1](https://www.motor1.com/news/753604/most-expensive-ruf-model-sold-auction/) [2](https://retrorides.com.au/news/this-iconic-ruf-ctr-yellowbird-could-fetch-over-us6000000-at-auction) |
| `ferrari_f40` | Ferrari F40 (1987-1992) | $3,300,000 | market | high | Hagerty guide $2.4m in early 2025, up 33-55% since; sold examples $3.1-3.7m [1](https://hagerty.com/valuation-tools/past-sales/1990-ferrari-f40/ZFFMN34A4L0087219/5e767def-c553-4e60-ae53-498b14764a81) [2](https://www.maxim.com/rides/why-this-ferrari-f40-could-be-the-car-collectors-steal-of-2026/) |
| `pagani_huayra` | Pagani Huayra coupe (2012-2018) | $3,000,000 | market | medium | 2016 Huayra sold for $3.19M (Barrett-Jackson 2026); Huayra Roadster $3.4M in 2025 [1](https://news.dupontregistry.com/blogs/auctions/3-19m-pagani-huayra-tops-barrett-jackson-palm-beach-2026-auction) [2](https://classicandsportscar.com/node/74572) |
| `shelby_cobra_427sc` | Shelby Cobra 427 S/C (1966) | $3,000,000 | market | medium | 427 S/C CSX3040 estimated $3-3.75M at The Amelia 2024; plain 427 roadsters sell around $0.7-1M+ [1](https://www.motorious.com/articles/handpicked/the-1966-shelby-427-s-c-cobra/) [2](https://www.justcars.com.au/news-and-reviews/shelby-cobra-tops-mecum-auction/11477) |
| `ferrari_f40_s3` | Ferrari F40 (1987-1992), Stage 3 tune | $2,850,000 | tuned | medium | Base F40 median auction price about GBP 2.07m (~$2.75m, The Classic Valuer) plus about $100k for turbos, intercoolers and engine work to 610hp [1](https://www.theclassicvaluer.com/buyers-guide/ferrari/f40) |
| `ks_porsche_918_spyder` | Porsche 918 Spyder (2013-2015) | $2,500,000 | market | medium | duPont Registry index $2.7m for a Weissach-pack 918 in 2026; plain cars a little less, special-paint cars sold for $4.7-6m [1](https://news.dupontregistry.com/blogs/auctions/the-porsche-air-water-auction-2026-top-10-results-and) |
| `ks_mclaren_p1` | McLaren P1 (2013-2015) | $1,900,000 | market | medium | Auction results $1.6M (Collecting Cars), $2.09M (Bonhams), record $2.89M (2026) [1](https://news.dupontregistry.com/blogs/dr-live/mclaren-p1-sets-a-new-public-auction-record-as-a-second-porsche-918-spyder-leads-the-docket-on-dupont-registry-live) [2](https://www.drivencarguide.co.nz/news/mclaren-p1-smashes-record-for-highest-online-auction-sale-price/) |
| `ks_ruf_rt12r_awd` | RUF RT12 R AWD (2011-2013) | $700,000 | market | medium | No AWD RT12 R sale found; RT12 R sales $649k-813.5k (Broad Arrow 2024, Hagerty records), RT12 family average about $595k over ten sales; about nine RT12 Rs built [1](https://www.hagerty.com/valuation-tools/past-sales/2012-ruf-rt_12/W09BD0382CPR06147/681875a8-6124-41a8-8fbc-336a8863013a) [2](https://www.theclassicvaluer.com/vehicle-details/broad-arrow-2024-08-15-porsche-ruf-rt12-52b86d) |
| `ks_ruf_rt12r` | RUF RT12 R (2011-2013) | $650,000 | market | medium | RT12 R sales $649k-813.5k (Broad Arrow 2024, Hagerty records); RT12 family about $595k over ten sales [1](https://www.hagerty.com/valuation-tools/past-sales/2012-ruf-rt_12/W09BD0382CPR06147/681875a8-6124-41a8-8fbc-336a8863013a) [2](https://www.theclassicvaluer.com/vehicle-details/broad-arrow-2024-08-15-porsche-ruf-rt12-52b86d) [3](https://www.classic.com/m/ruf/rt-12) |
| `ks_audi_sport_quattro_s1` | Audi Sport quattro (1984), Step 1 tune | $615,000 | tuned | medium | Base Sport quattro: RM Sotheby's Arizona sales $665k (2024) and $758.5k (2025, est. $375-475k), $401.5k in 2015; typical car taken at $600k, plus about $15k for boost and engine work to 370hp. The base row ($500k) looks low [1](https://rmsothebys.com/media-center/press-releases/az25_results) [2](https://audiclubna.org/84-audi-sport-quattro-highlights-22-9m-arizona-sale-by-rm-sothebys) |
| `ks_audi_sport_quattro` | Audi Sport quattro (1984) | $600,000 | market | medium | RM Sotheby's Arizona sales $665k (2024) and $758.5k (2025) after $401.5k in 2015; a typical car taken at $600k [1](https://rmsothebys.com/media-center/press-releases/az25_results) [2](https://audiclubna.org/84-audi-sport-quattro-highlights-22-9m-arizona-sale-by-rm-sothebys) [3](https://rmsothebys.com/auctions/az15/lots/r192-1984-audi-sport-quattro/) |
| `ks_porsche_911_r` | Porsche 911 R (991, 2016) | $600,000 | market | medium | 2026 Bring a Trailer results GBP 487k (1,900 miles) and GBP 599k (291 miles), about $650-800k at 1.34; a 4,700-mile car bid past $555k; typical driven car taken at $600k [1](https://www.theclassicvaluer.com/vehicle-details/bring-a-trailer-2026-07-22-porsche-911-991-r-9f58ea) [2](https://www.theclassicvaluer.com/vehicle-details/bring-a-trailer-2026-06-19-porsche-911-991-r-076804) [3](https://www.motorious.com/articles/vehicle-make-7/this-one-owner-2016-porsche-911-r-has-4-700-miles-and-a-bid-past-555-000/) |
| `ks_lamborghini_countach_s1` | Lamborghini Countach LP5000 Quattrovalvole, Step 1 tune | $510,000 | tuned | medium | Base Countach QV $500k from the researched base row (Hagerty sold records $530-573k, classic.com $412.5k), plus about $10k for exhaust, carburettor and suspension work [1](https://www.classic.com/m/lamborghini/countach/lp5000-quattrovalvole/year-1988/) |
| `ks_lamborghini_countach` | Lamborghini Countach LP5000 Quattrovalvole (1985-1988) | $500,000 | market | high | Hagerty sold records $530-573k; Classic.com $412.5k in Oct 2025 [1](https://hagerty.com/valuation-tools/past-sales/1987-lamborghini-countach/ZA9CA05A3HLA12108/3b8c1d1c-34e2-4052-a0e0-d3485dcda9c5) [2](https://www.classic.com/m/lamborghini/countach/lp5000-quattrovalvole/year-1988/) |
| `ks_lamborghini_aventador_sv` | Lamborghini Aventador LP750-4 SV coupe (2015-2017) | $450,000 | market | medium | SV coupe sold $478.5k at RM; median of all SV sales since 2020 about GBP 357k [1](https://rmsothebys.com/auctions/fl19/lots/r0368-2017-lamborghini-aventador-lp7504-sv-coupe) [2](https://www.theclassicvaluer.com/cars/Lamborghini/Aventador-SV) |
| `ks_ferrari_812_superfast` | Ferrari 812 Superfast (2017-2024) | $320,000 | market | high | Classic.com market benchmark $315-322k across 48 sales [1](https://www.classic.com/m/ferrari/812/superfast) |
| `ferrari_458_s3` | Ferrari 458 Italia (2010-2015), Stage 3 lightweight build | $310,000 | tuned | medium | Base 458 $250k (base row, 2025 auction median $267k) plus about $60k: carbon bonnet $2.5-9.6k, Capristo carbon programme saving 100kg+, exhaust and race parts to reach 1,140kg [1](https://dmc.ag/?p=11721) [2](https://gtspirit.com/2012/06/18/official-capristo-exhaust-and-carbon-fiber-parts-for-ferrari-458-italia/) |
| `ks_lamborghini_huracan_performante` | Lamborghini Huracan Performante (2017-2019) | $290,000 | market | medium | US Performante listings $288-330k [1](https://www.truecar.com/used-cars-for-sale/listings/lamborghini/huracan/location-paramount-ca/) |
| `ferrari_458` | Ferrari 458 Italia (2010-2015) | $250,000 | market | high | 2025 auction median about $267k; a 2014 car sold $257.6k at Bonhams Miami 2025 [1](https://www.classic.com/a/bonhams-the-miami-auction-2025-V4Mlezp/lots/2014-ferrari-458-italia-p6my5VW) [2](https://oldcarsdata.com/ferrari/458/colors/other) |
| `ks_lamborghini_gallardo_sl_s3` | Lamborghini Gallardo LP570-4 Superleggera, twin-turbo Step 3 build | $245,000 | tuned | medium | Base Superleggera about $150k (base row) plus Underground Racing's Stage 3 twin-turbo Gallardo package at $94k (1,000-1,250hp depending on fuel) [1](https://www.motorauthority.com/news/1054426_underground-racing-builds-1500-horsepower-lamborghini-gallardo) [2](https://www.kbb.com/lamborghini/gallardo/2011/lp-570-4-superleggera-coupe-2d) |
| `ks_ferrari_488_gtb` | Ferrari 488 GTB (2015-2019) | $230,000 | market | medium | Used 488 GTBs at about $185-290k in listings and guides [1](https://www.iseecars.com/used_cars-t5989-used-ferrari-488-gtb-for-sale) [2](https://automonitor.io/blog/should-i-buy-a-new-or-used-ferrari-488/) |
| `mercedes_sls` | Mercedes-Benz SLS AMG coupe (2011-2014) | $220,000 | market | high | Classic.com market benchmark $219,672 for a 2013 SLS coupe [1](https://www.classic.com/m/mercedes-benz/sls/coupe/year-2013) |
| `ks_nissan_skyline_r34` | Nissan Skyline GT-R (R34) V-Spec (1999-2002) | $200,000 | market | medium | 2026 V-Spec II sales EUR 110k to AUD 348k; dealer asks around $220-250k [1](https://www.classic.com/m/nissan/skyline/r34/gt-r/year-2001/) [2](https://www.shopforcars.com.au/vehicledetail/2000/nissan/skyline/2d_coupe/hr34/836035) |
| `ks_porsche_911_gt3_rs` | Porsche 911 GT3 RS (991.1, 2016) | $185,000 | market | medium | Hagerty: 2016 991.1 GT3 RS #3 condition $137-161k, average auction sale about $199k over the past year [1](https://www.motorious.com/articles/vehicle-make-7/this-one-owner-2016-porsche-911-r-has-4-700-miles-and-a-bid-past-555-000/) |
| `ks_maserati_alfieri` | Maserati Alfieri concept (2014), priced as its production successor the GranTurismo Modena (2023) | $160,000 | new | medium | Concept never built; priced as its production successor, the 2026 GranTurismo Modena, starting MSRP about $158,200 (TrueCar; dealer MSRPs $156-163k) [1](https://www.truecar.com/overview/maserati/granturismo/2026) |
| `ks_lamborghini_gallardo_sl` | Lamborghini Gallardo LP570-4 Superleggera (2010-2013) | $150,000 | market | medium | Sales and listings $130-190k; KBB $130k [1](https://www.kbb.com/lamborghini/gallardo/2011/lp-570-4-superleggera-coupe-2d) [2](https://www.carscoops.com/?p=2333306) |
| `ks_nissan_gtr` | Nissan GT-R NISMO (2017) | $150,000 | market | medium | 2016 NISMO auction median $135-156k; a 2021 sold near $210k [1](https://www.conceptcarz.com/valuation/25025/Nissan-GT-R-NISMO.aspx) [2](https://www.jalopnik.com/2092390/2021-nissan-gt-r-5-year-depreciation/) |
| `ks_porsche_991_turbo_s` | Porsche 911 Turbo S (991.2, 2017) | $135,000 | market | medium | PCARMarket: 2017 991.2 Turbo S cabriolet sold $125k (17.6k miles, 2024), a coupe final offer $118k (46k miles); dealer asks to $185k [1](https://www-backend.pcarmarket.com/auction/2017-porsche-911-turbo-s-cabriolet-7) [2](https://www-backend.pcarmarket.com/auction/dealtank-2017-porsche-911-turbo-s-3) |
| `ks_mclaren_570s` | McLaren 570S coupe (2015-2021) | $125,000 | market | medium | US asks $120-135k for 2017 coupes; UK averages GBP 78-101k [1](https://www.kbb.com/cars-for-sale/used/mclaren/570s) [2](https://www.autouncle.co.uk/en-gb/used-cars/McLaren/570S/in/West%20Sussex/Horsham) |
| `bmw_m3_e30_drift` | BMW M3 E30 (1986-1991), drift build | $120,000 | tuned | medium | Base E30 M3 $90k (base row, Hagerty/ConceptCarz) plus about $20k for a 340hp engine build and about $10k for drift chassis parts and cage [1](https://www.conceptcarz.com/valuation/12139/bmw-e30-m3.aspx) [2](https://tunedrides.com/blog/drift-build-guide/) |
| `ks_toyota_supra_mkiv_tuned` | Toyota Supra (A80), time attack build (~690 bhp) | $120,000 | tuned | medium | Supra $70k (this pass) plus about $22k for a ~690hp single-turbo engine (2011 shop build under $15k installed) and about $28k for aero, cage and suspension [1](https://www.revscene.net/forums/640995-if-money-no-object-you-were-tasked-building-2-print.html) [2](https://www.fastcar.co.uk/cars/modified-toyota-supra-mk4/) |
| `ks_toyota_supra_mkiv_drift` | Toyota Supra (A80), drift build (~620 bhp) | $105,000 | tuned | medium | Supra $70k (this pass) plus about $20k for a big single turbo, fuel and management (a shop built one under $15k installed for ~785hp in 2011) and about $15k for drift chassis work [1](https://www.revscene.net/forums/640995-if-money-no-object-you-were-tasked-building-2-print.html) [2](https://tunedrides.com/blog/drift-build-guide/) |
| `ks_porsche_cayman_gt4_std` | Porsche Cayman GT4 (981, 2016) | $100,000 | market | high | Classic.com 981 Cayman GT4 average $95k ($87-104k); listings $90-122k [1](https://classic.com/m/porsche/cayman/981/gt4/year-2015) [2](https://www.autoguide.com/auto/2016-porsche-cayman-gt4-for-sale-44640223) |
| `bmw_m3_e30_s1` | BMW M3 E30 (1986-1991), Step 1 tune | $93,000 | tuned | medium | Base E30 M3 $90k (base row) plus about $3k for intake, exhaust and chip [1](https://www.conceptcarz.com/valuation/12139/bmw-e30-m3.aspx) |
| `bmw_m3_e30` | BMW M3 E30 (1986-1991) | $90,000 | market | medium | Hagerty average condition 3 for the E30 M3 about $111k; ConceptCarz auction average about $98k; typical drivers lower [1](https://www.hagertybroker.ca/resources/hagerty-insights/valuation-trends-bmw-can) [2](https://www.conceptcarz.com/valuation/12139/bmw-e30-m3.aspx) |
| `ks_audi_r8_plus` | Audi R8 V10 plus, first generation (2013-2015) | $90,000 | market | medium | 550PS facelift Gen I; PistonHeads Gen I V10 from GBP 45k, later Plus cars list GBP 68-85k [1](https://www.pistonheads.com/buy/audi/r8/year/2016) [2](https://www.parkers.co.uk/audi/for-sale/trim-plus) |
| `ks_mazda_rx7_tuned` | Mazda RX-7 (FD3S) Spirit R, tuned (~440 bhp) | $90,000 | tuned | low | Spirit R at about $65k plus about $25k for single-turbo conversion and supporting work  |
| `bmw_1m_s3` | BMW 1 Series M Coupe (2011), Stage 3 tune | $87,000 | tuned | medium | Base 1M $75k (base row, high: 2025 sales $67-84k) plus about $12k for upgraded turbos, fuelling, intercooler and tune to 400hp [1](https://www.hagerty.com/valuation-tools/past-sales/2011-bmw-1m/WBSUR9C57BVT47729/764e2d4f-501f-4524-87a2-2e22a6f741a1) |
| `ks_alfa_giulia_qv` | Alfa Romeo Giulia Quadrifoglio (2016-present) | $85,000 | new | medium | Still on sale; US MSRP not found, estimated from Australian A$153,700 and earlier US pricing near $80-87k [1](https://carexpert.com.au/alfa-romeo/giulia/2025) |
| `mclaren_mp412c` | McLaren MP4-12C (2011-2014) | $85,000 | market | medium | Recent 2012 auction sales $66-100k, median about $78.5k; Mecum sale $115.5k in 2022 [1](https://oldcarsdata.com/mclaren/mp4-12c/year/2012) [2](https://hagerty.co.uk/articles/future-classic-mclaren-mp4-12c) |
| `ks_porsche_991_carrera_s` | Porsche 911 Carrera S (991.2, 2017) | $83,000 | market | high | KBB 2017 911 Carrera S coupe fair purchase price $82,400; a 2017 Carrera S sold $95k in 2026 (classic.com) [1](https://www.kbb.com/porsche/911/2017/carrera-s-coupe-2d) |
| `lotus_exige_scura` | Lotus Exige Scura (2009-2010 limited edition) | $80,000 | market | medium | Shannons estimate AUD 110-140k for a Scura coupe (about $75-90k) [1](https://www.justcars.com.au/news-and-reviews/rare-lotus-on-offer-in-shannons-spring-auction/946923) [2](https://w.goauto.com.au/new-models/lotus/exige/scura/2009-10-28/657.html) |
| `bmw_1m` | BMW 1 Series M Coupe (2011) | $75,000 | market | high | 2025 auction results and sales about $67-84k [1](https://www.hagerty.com/valuation-tools/past-sales/2011-bmw-1m/WBSUR9C57BVT47729/764e2d4f-501f-4524-87a2-2e22a6f741a1) [2](https://www.bmwblog.com/?p=410556) |
| `ktm_xbow_r` | KTM X-Bow R (2011-present) | $75,000 | market | medium | US new from $88.5k in 2011; a 2017 car listed $79,950 in 2025 [1](https://www.classic.com/m/ktm/x-bow/r) [2](https://www.autoblog.com/2011/03/04/ktm-x-bow-will-start-at-88-500-in-the-u-s/) |
| `ks_toyota_supra_mkiv` | Toyota Supra RZ / Turbo (A80, 1993-2002) | $70,000 | market | medium | Hagerty: US Supra Turbo in good condition about $75k (2024); classic.com JDM RZ/GZ average about $58k ($43-73k); taken between the two [1](https://www.slashgear.com/1486638/how-much-1998-toyota-supra-turbo-worth-today) [2](https://classic.com/m/toyota/supra/4th-gen/rz/year-1997) |
| `lotus_exige_s` | Lotus Exige S V6 coupe (2012-2015) | $70,000 | market | high | Hagerty records 2013 Exige S sales at $60.9k and $84.5k [1](https://www.hagerty.com/valuation-tools/past-sales/2013-lotus-exige/SCCLHHSA4DHH10201/3e3f3630-c4d3-4d47-8cff-5edd6f63d08b) [2](https://www.hagerty.com/valuation-tools/past-sales/2013-lotus-exige/SCCLHHSC4DHC10749/09f59cb3-613c-447e-86ed-b8f9209cf27d) |
| `ks_mazda_rx7_spirit_r` | Mazda RX-7 (FD3S) Spirit R Type A (2002) | $65,000 | market | medium | Classic.com Spirit R benchmark $61,130; 2026 sales AUD 90k and $43k [1](https://www.classic.com/m/mazda/rx-7/3rd-gen/spirit-r/) [2](https://www.iconicauctioneers.com/2003-mazda-rx-7-spirit-r-type-a-rec09087-13-0819) |
| `lotus_exige_s_roadster` | Lotus Exige S V6 Roadster (2013-2015) | $64,000 | market | medium | 2013 Exige S Roadster offered at GBP 49,500 in the UK; slightly under the coupe [1](https://www-cdn.pistonheads.com/buy/listing/18689602) |
| `lotus_exige_240_s3` | Lotus Sport Exige 240R, Stage 3 tuning (~270 bhp) | $63,000 | tuned | medium | 240R at about $53k plus about $10k for engine and weight-saving work [1](https://www.pistonheads.com/buy/listing/18139815) |
| `lotus_evora_s_s2` | Lotus Evora S (2011-2014), Stage 2 tuning (~400 bhp) | $60,000 | tuned | medium | Evora S at about $52k plus about $8k for pulley, exhaust and remap [1](https://www.classic.com/m/lotus/evora/s/year-2011) |
| `lotus_2_eleven` | Lotus 2-Eleven (2007-2011) | $58,000 | market | medium | GBP 39,995 new; 2008 cars listed EUR 48.9-53.9k [1](https://www.carandclassic.com/la/C2039821) [2](https://en.wikipedia.org/wiki/Lotus_2-Eleven) |
| `ks_abarth_595ss_s2` | Fiat Abarth 595 esseesse (1960s), Step 2 tune | $55,000 | tuned | medium | Base 595 esseesse $45k (base row) plus about $10k for a period race engine doubling output to 65hp [1](https://www.conceptcarz.com/valuation/22558/Fiat-595.aspx) |
| `lotus_elise_sc_s2` | Lotus Elise SC (2008-2011), Step 2 tuning | $55,000 | tuned | medium | Elise SC base about $45k (Hagerty past sales) plus about $10k for a fuller suspension, brake and aero package [1](https://hagerty.ca/valuation-tools/lotus/elise/2008/2008-lotus-elise) |
| `ks_porsche_718_boxster_s_pdk` | Porsche 718 Boxster S PDK (982, 2017) | $53,000 | market | medium | KBB 2017 718 Boxster S fair purchase price $50,730; PDK a small premium (about $3k option new) [1](https://www.kbb.com/porsche/718-boxster/2017/s-roadster-2d/) |
| `lotus_exige_240` | Lotus Sport Exige 240R (2005, 50 built) | $53,000 | market | medium | UK dealer asking GBP 39,900 for a 2005 240R; GBP 43,995 new [1](https://www.pistonheads.com/buy/listing/18139815) [2](https://evo.co.uk/lotus/exige/8243/lotus-exige-exige-gets-240bhp-special) |
| `ks_porsche_718_cayman_s` | Porsche 718 Cayman S (982, 2017) | $52,000 | market | high | KBB 2017 718 Cayman S fair purchase price $52,470 (private party $44-52k) [1](https://www.kbb.com/porsche/718-cayman/2017/s-coupe-2d) |
| `lotus_evora_s` | Lotus Evora S (2011-2014) | $52,000 | market | high | 2011-2014 Evora S sell for about $43-63k (Classic.com sales, TrueCar/KBB listings) [1](https://www.classic.com/m/lotus/evora/s/year-2011) [2](https://www.truecar.com/used-cars-for-sale/listings/lotus/evora/year-2014) |
| `ks_porsche_718_boxster_s` | Porsche 718 Boxster S manual (982, 2017) | $51,000 | market | high | KBB 2017 718 Boxster S fair purchase price $50,730 (private party $43-50k) [1](https://www.kbb.com/porsche/718-boxster/2017/s-roadster-2d/) |
| `bmw_m3_e92_drift` | BMW M3 E92 Coupe (2008-2013), drift build | $50,000 | tuned | medium | Base E92 M3 $35k (base row) plus about $15k for angle kit, cage, coilovers and hydraulic handbrake (competition drift builds about $20k all-in) [1](https://www.carscoops.com/2026/04/bmw-e92-m3-record-sale/) [2](https://tunedrides.com/blog/drift-build-guide/) |
| `ks_porsche_panamera` | Porsche Panamera Turbo 971 (2017) | $50,000 | market | high | TrueCar average $55k; KBB private party $44.5-49k [1](https://truecar.com/used-cars-for-sale/listings/porsche/panamera/year-2017) [2](https://www.kbb.com/porsche/panamera/2017/turbo-sedan-4d) |
| `lotus_elise_sc_s1` | Lotus Elise SC (2008-2011), Step 1 tuning | $50,000 | tuned | medium | Elise SC sells around $40-53k (Hagerty past sales), plus about $5k of mild suspension/brake work [1](https://hagerty.ca/valuation-tools/lotus/elise/2008/2008-lotus-elise) [2](https://www.hagerty.com/valuation-tools/past-sales/2010-lotus-elise/SCCLHCZC4AHA10751/4024e924-b2e5-4b9e-a190-0b9aaf8216a7) |
| `ks_abarth_595ss_s1` | Fiat Abarth 595 esseesse (1960s), Step 1 tune | $48,000 | tuned | medium | Base 595 esseesse $45k (base row, ConceptCarz auction average $43k) plus about $3k for carburettor and exhaust work [1](https://www.conceptcarz.com/valuation/22558/Fiat-595.aspx) |
| `ks_abarth_595ss` | Fiat Abarth 595 esseesse (1960s) | $45,000 | market | medium | ConceptCarz auction average for the 1965 Abarth 595 about $43k; esseesse at the upper end [1](https://www.conceptcarz.com/valuation/22558/Fiat-595.aspx) |
| `ks_alfa_romeo_4c` | Alfa Romeo 4C coupe (2014-2019) | $45,000 | market | medium | KBB values a 2015 coupe in the mid-$20ks while auction results run $35-66k; typical good example estimated at $45k [1](https://www.kbb.com/alfa-romeo/4c/2015/coupe-2d) [2](https://hypercars.io/listing/1217441) |
| `ks_bmw_m4_akrapovic` | BMW M4 Coupe F82 with Akrapovic Evolution exhaust | $45,000 | tuned | medium | Base F82 M4 $38k (base row, CarGurus) plus the titanium Akrapovic Evolution Line, $6.7k at launch and AUD 10.3k (about $6.7k) now [1](https://www.bmwblog.com/2014/08/14/release-akrapovic-f8x-m3m4-exhaust-system/) [2](https://modeautoconcepts.com/products/akrapovic-evolution-line-titanium-w-carbon-tailpipes-suits-bmw-m3-m4-f80-f82) |
| `lotus_elise_sc` | Lotus Elise SC (2008-2011) | $45,000 | market | medium | Hagerty past sales and valuation for the US Elise SC around $40-53k, the figure the Step 1/2 rows already rest on [1](https://hagerty.ca/valuation-tools/lotus/elise/2008/2008-lotus-elise) |
| `ks_corvette_c7_stingray` | Chevrolet Corvette C7 Stingray (2014) | $43,000 | market | high | Classic.com comparables $40.7-48.6k; dealer listings $36-43k [1](https://www.classic.com/veh/2014-chevrolet-corvette-4Z5B8ep) [2](https://truecar.com/used-cars-for-sale/listings/chevrolet/corvette/year-2014/location-houston-tx) |
| `ks_toyota_ae86_tuned` | Toyota AE86, tuned (~200 bhp) | $43,000 | tuned | medium | AE86 $28k (classic.com benchmark) plus about $15k for a built 4A-GE on ITBs to 200hp and suspension [1](https://www.classic.com/m/toyota/corolla/5th-gen-e80/levintruenogt/) |
| `ks_toyota_ae86_drift` | Toyota AE86, drift build (~185 bhp) | $40,000 | tuned | medium | AE86 $28k (classic.com benchmark) plus about $12k for engine work to 185hp and drift chassis parts (angle kit, coilovers, hydraulic handbrake, cage $5-10k) [1](https://www.classic.com/m/toyota/corolla/5th-gen-e80/levintruenogt/) [2](https://tunedrides.com/blog/drift-build-guide/) |
| `bmw_m3_e92_s1` | BMW M3 E92 Coupe (2008-2013), Step 1 tune | $38,000 | tuned | medium | Base E92 M3 $35k (base row) plus about $3k for intake, exhaust and tune [1](https://www.carscoops.com/2026/04/bmw-e92-m3-record-sale/) |
| `ks_bmw_m4` | BMW M4 Coupe F82 (2014-2020) | $38,000 | market | medium | CarGurus 2018 M4 average about $43k; earlier 2015-2016 cars lower [1](https://www.cargurus.com/Cars/l-Used-BMW-M4-Balm-d2258_L5243) |
| `ks_porsche_cayenne` | Porsche Cayenne Turbo S 958.2 (2015) | $38,000 | market | medium | UK 2015 Turbo S listings GBP 29-40k; US 2015 Cayennes up to $42k [1](https://www.cargurus.co.uk/Cars/l-Used-2015-Porsche-Cayenne-Turbo-S-ev12746) [2](https://truecar.com/used-cars-for-sale/listings/porsche/cayenne/year-2015) |
| `bmw_z4_drift` | BMW Z4 sDrive35is E89, drift build | $36,000 | tuned | medium | Base Z4 35is $22k (base row) plus about $14k for a 390hp tune and drift chassis work [1](https://www.truecar.com/used-cars-for-sale/listings/bmw/z4/?trim=35is) [2](https://tunedrides.com/blog/drift-build-guide/) |
| `bmw_m3_e92` | BMW M3 E92 Coupe (2008-2013) | $35,000 | market | medium | Typical E92 M3s sell $30-40k; record low-mile cars far higher [1](https://www.carscoops.com/2026/04/bmw-e92-m3-record-sale/) |
| `ks_mazda_mx5_nd` | Mazda MX-5 (ND) 2.0 | $32,000 | new | high | 2026 MX-5 Miata Sport soft top $31,665 including $1,235 destination (KBB); Club $35,165 [1](https://www.kbb.com/car-news/2026-mazda-mx-5-miata-starts-at-31665) [2](https://news.mazdausa.com/2026-01-27-2026-Mazda-MX-5-Miata-Pricing-and-Packaging?asPDF=1) |
| `ks_nissan_370z` | Nissan 370Z Nismo (2015-2020) | $28,000 | market | high | KBB fair purchase price for a 370Z Nismo Tech coupe $27,710 (2017) and $27,010 (2018) [1](https://www.kbb.com/nissan/370z/2017/nismo-tech-coupe-2d) [2](https://www.kbb.com/nissan/370z/2018/nismo-tech-coupe-2d/) |
| `ks_toyota_ae86` | Toyota Sprinter Trueno / Corolla GT-S (AE86) | $28,000 | market | medium | Classic.com market benchmark $27,981 for the 1983-1987 Levin/Trueno GT; hypercars.io AE86 average $19k across all trims [1](https://www.classic.com/m/toyota/corolla/5th-gen-e80/levintruenogt/) [2](https://hypercars.io/make/toyota/corolla/corolla-ae86?page=27) |
| `ks_ford_mustang_2015` | Ford Mustang GT (2015) | $26,000 | market | medium | US dealer listings for 2015 GTs $18-34k depending on mileage [1](https://www.autotrader.com/cars-for-sale/2015/ford/mustang/calhoun-ga) |
| `bmw_z4_s1` | BMW Z4 sDrive35is E89, Step 1 tune | $25,000 | tuned | medium | Base Z4 35is $22k (base row) plus about $3k for bolt-ons [1](https://www.truecar.com/used-cars-for-sale/listings/bmw/z4/?trim=35is) |
| `bmw_z4` | BMW Z4 sDrive35is E89 (2011-2016) | $22,000 | market | medium | US dealer listings for the 35is $12-29k; 2014-2015 cars about $23k [1](https://www.truecar.com/used-cars-for-sale/listings/bmw/z4/?trim=35is) [2](https://www.motorious.com/articles/handpicked/2012-bmw-z4-sdrive35is-no-reserve-hagerty-marketplace/) |
| `ks_maserati_quattroporte` | Maserati Quattroporte GTS (2014) | $22,000 | market | medium | KBB private party $16-19k, dealer about $20k, Hagerty sales $29-33k [1](https://www.kbb.com/maserati/quattroporte/2014/gts-sedan-4d) [2](https://www.hagerty.com/valuation-tools/past-sales/2014-maserati-quattroporte/vin/47601113-02b6-4e9a-b935-e093f50b8527) |
| `ks_porsche_macan` | Porsche Macan Turbo (2015) | $19,000 | market | high | KBB private party $15.7-18.6k; dealer listings $16-23k [1](https://www.kbb.com/porsche/macan/2015/turbo-sport-utility-4d) |
| `ks_maserati_levante` | Maserati Levante S (2017) | $17,000 | market | high | KBB national value about $17k; private party $15-17k [1](https://www.kbb.com/maserati/levante/2017/s-sport-utility-4d) |
| `ks_toyota_gt86` | Toyota GT86 (2012-2020) | $17,000 | market | high | KBB 2017 Toyota 86 fair purchase price $17,980, private party $15-18k [1](https://www.kbb.com/toyota/86/2017/coupe-2d/) |
| `abarth500_s1` | Abarth 500 esseesse (2009), Step 1 tune | $16,000 | tuned | medium | Base 500 esseesse $14k (base row, AutoUncle GBP 11.2k) plus about $2k for ECU, intake and exhaust [1](https://www.autouncle.co.uk/en-gb/used-cars/Abarth/500/in/Suffolk/Ipswich) |
| `ks_audi_a1s1` | Audi S1 quattro (2014-2018) | $16,000 | market | medium | UK Autotrader 2015 S1s list GBP 11.5-15k [1](https://www.autotrader.co.uk/cars/audi/s1/2015) |
| `abarth500` | Abarth 500 esseesse (2009) | $14,000 | market | medium | UK AutoUncle average for a used 500 esseesse about GBP 11,200 [1](https://www.autouncle.co.uk/en-gb/used-cars/Abarth/500/in/Suffolk/Ipswich) |
| `alfa_romeo_giulietta_qv` | Alfa Romeo Giulietta 1750 TBi Quadrifoglio Verde (2010-2016) | $12,000 | market | medium | Used listings GBP 6-12.5k in the UK, EUR 12.7-15k in Italy [1](https://www.theaa.com/used-cars/cardetailsforprint/189913846) [2](https://www.automobile.it/verona-alfa-romeo-giulietta-1750-tbi-quadrifoglio-verde/183809226) |
| `alfa_romeo_giulietta_qv_le` | Alfa Romeo Giulietta Quadrifoglio Verde Launch Edition (2014) | $12,000 | market | medium | One of 100 UK cars, new GBP 30,120-30,280; a 120k-mile 2014 car listed at GBP 3,250 on PistonHeads; priced as the regular QV ($12k), the edition earning little premium [1](https://www-cdn.pistonheads.com/buy/listing/20982812) [2](https://www.carkeys.co.uk/car-reviews/alfa-romeo-giulietta-quadrifoglio-verde-1750-tp-240hp-launch-edition) |
| `ks_mazda_miata` | Mazda MX-5 Miata NA (1989-1997) | $10,000 | market | high | Hagerty: good-condition 1992 about $9.5k; most recent NA sale $8.4k [1](https://hagerty.com/apps/valuationtools/1992-Mazda-MX~5_Miata) |
| `ks_alfa_mito_qv` | Alfa Romeo MiTo Quadrifoglio Verde (2009-2018) | $7,000 | market | high | UK AutoUncle average GBP 5,161; Spain EUR 7,850 [1](https://www.autouncle.es/es/coches-segunda-mano/Alfa%20Romeo/MiTo/t-Quadrifoglio%20Verde) |

## SP-X 2015-2019

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_glickenhaus_scg003` | Scuderia Cameron Glickenhaus SCG 003 Competizione (2015) | $2,000,000 | build | medium | SCG 003 reported at $2m (Top Gear) and the street 003S at $1.3m (Road & Track); the 003C race car taken at $2m [1](https://en.wikipedia.org/wiki/Scuderia_Cameron_Glickenhaus_SCG_003) |

## Sports car (Appendix C) 1960-1961

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_porsche_718_spyder_rs` | Porsche 718 RS 60 Spyder (1960) | $3,500,000 | market | high | RS 60 Spyder chassis 718-060 sold for $3,525,000 at RM Sotheby's Monterey 2025 [1](https://rmsothebys.com/auctions/mo25/lots/r0144-1960-porsche-718-rs-60-spyder-by-wendler) |

## SRO GT2 2019-present - median $435,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `gue_935_gt2` | Porsche 935 (2019, GT2 RS-based clubsport) | $545,000 (researched $1,350,000) | market | high | EUR 701,948 + VAT new, 77 built; resale now EUR 1.13M (2024 sale) to a ~$1.47M market benchmark. Track-day special rather than a homologated GT2 car [1](https://download.newsroom.porsche.com/dam/jcr:285c67f6-e0b2-44b7-a7be-109c6f33ea4c/PAG_Infografik_935_EN.pdf) [2](https://jalopnik.com/the-porsche-935-is-back-with-700-horsepower-and-77-exam-1829371570) |
| `gue_brabham_bt63_gt2` | Brabham BT63 GT2 (2021) | $545,000 (researched $650,000) | new | medium | No BT63 price found; set well below the BT62 track car (about $1.4m) and above typical GT2 customer cars [1](https://en.wikipedia.org/wiki/Brabham_BT62) |
| `gue_gt2_rs_clubsport` | Porsche 911 GT2 RS Clubsport (991.2, 2019) | $545,000 (researched $550,000) | market | high | EUR 405k + VAT new, 200 built; 2019 cars ask $470k (Porsche Finder), EUR 450k (Elferspot), $550-625k (US dealers); the $795k ex-Verstappen car is a record, not typical [1](https://newsroom.porsche.com/en_AU/motorsports/media-guide/race-cars/porsche-911-gt2-rs-clubsport.html) [2](https://motorcarclassics.com/2019-porsche-911-gt2-rs-clubsport-c-1104.htm) [3](https://www.elferspot.com/en/?p=5453419) |
| `porsche_935` | Porsche 935 (2019, GT2 RS-based clubsport) | $545,000 (researched $1,350,000) | market | high | As `gue_935_gt2`. EUR 701,948 + VAT new, 77 built; resale now EUR 1.13M (2024 sale) to a ~$1.47M market benchmark. Track-day special rather than a homologated GT2 car [1](https://download.newsroom.porsche.com/dam/jcr:285c67f6-e0b2-44b7-a7be-109c6f33ea4c/PAG_Infografik_935_EN.pdf) [2](https://jalopnik.com/the-porsche-935-is-back-with-700-horsepower-and-77-exam-1829371570) |
| `porsche_991ii_gt2_rs_cs_evo` | Porsche 911 GT2 RS Clubsport Evo (991.2) | $545,000 (researched $550,000) | market | medium | Priced as `gue_gt2_rs_clubsport`: EUR 405k + VAT new, 200 built; 2019 cars ask $470k-625k. No separate price found for the Evo upgrade [1](https://newsroom.porsche.com/en_AU/motorsports/media-guide/race-cars/porsche-911-gt2-rs-clubsport.html) [2](https://motorcarclassics.com/2019-porsche-911-gt2-rs-clubsport-c-1104.htm) [3](https://www.elferspot.com/en/?p=5453419) |
| `gue_amg_gt2` | Mercedes-AMG GT2 (2023) | $470,000 | new | high | Race-ready AMG GT2 costs EUR 486,710 in Germany incl. 19% VAT (Nov 2023), about EUR 409k net [1](https://www.auto-motor-und-sport.de/fahrbericht/tracktest-mercedes-amg-gt2-vollgas-mit-707-ps/) |
| `mercedes_amg_gt2_enduro` | Mercedes-AMG GT2 (2023), endurance version | $470,000 | new | high | As `gue_amg_gt2`. Race-ready AMG GT2 costs EUR 486,710 in Germany incl. 19% VAT (Nov 2023), about EUR 409k net [1](https://www.auto-motor-und-sport.de/fahrbericht/tracktest-mercedes-amg-gt2-vollgas-mit-707-ps/) |
| `mercedes_amg_gt2_sprint` | Mercedes-AMG GT2 (2023), sprint version | $470,000 | new | high | As `gue_amg_gt2`; sprint trim of the same car [1](https://www.auto-motor-und-sport.de/fahrbericht/tracktest-mercedes-amg-gt2-vollgas-mit-707-ps/) |
| `gue_maserati_mc20_gt2` | Maserati MC20 GT2 (2023) | $450,000 | new | medium | No race-car price published; the AMG GT2 is EUR 409k net and the road MC20 GT2 Stradale GBP 338,880, so put near the AMG [1](https://www.auto-motor-und-sport.de/fahrbericht/tracktest-mercedes-amg-gt2-vollgas-mit-707-ps/) [2](https://autocar.co.uk/car-news/new-cars/track-ready-maserati-mc20-gt2-stradale-goes-sale-%C2%A3338880) |
| `maserati_mc20_gt2` | Maserati MC20 GT2 (2023) | $450,000 | new | medium | As `gue_maserati_mc20_gt2`. No race-car price published; the AMG GT2 is EUR 409k net and the road MC20 GT2 Stradale GBP 338,880, so put near the AMG [1](https://www.auto-motor-und-sport.de/fahrbericht/tracktest-mercedes-amg-gt2-vollgas-mit-707-ps/) [2](https://autocar.co.uk/car-news/new-cars/track-ready-maserati-mc20-gt2-stradale-goes-sale-%C2%A3338880) |
| `gue_bmw_m2_gt2` | No real equivalent - fictional GT2-spec BMW M2 (closest real car BMW M2 CS Racing / M4 GT4) | $420,000 | new | medium | No real car; priced as a typical new SRO GT2 car: Audi R8 LMS GT2 EUR 338k, KTM X-Bow GT2 ~$319k, Porsche GT2 RS Clubsport EUR 405k, AMG GT2 EUR 409k (all net), averaging about $420k [1](https://sportscar365.com/sro/gt2/audi-begins-deliveries-of-r8-lms-gt2/) [2](https://www.motorpasion.com.mx/industria/ktm-x-bow-gt2-gtx-dos-nuevos-bolidos-te-diviertas-lindo-pista/amp) |
| `gue_liana_gt2` | Assumed Ginetta GT2 (G56-based, British SRO GT2 car) | $420,000 | new | medium | No real car; priced as a typical new SRO GT2 car: Audi R8 LMS GT2 EUR 338k, KTM X-Bow GT2 ~$319k, Porsche GT2 RS Clubsport EUR 405k, AMG GT2 EUR 409k (all net), averaging about $420k [1](https://sportscar365.com/sro/gt2/audi-begins-deliveries-of-r8-lms-gt2/) [2](https://www.motorpasion.com.mx/industria/ktm-x-bow-gt2-gtx-dos-nuevos-bolidos-te-diviertas-lindo-pista/amp) |
| `gue_porsche_cayman_rsr` | No real equivalent - fictional Cayman built to GT2 power (closest real car 718 Cayman GT4 RS Clubsport) | $420,000 | new | medium | No real car; priced as a typical new SRO GT2 car: Audi R8 LMS GT2 EUR 338k, KTM X-Bow GT2 ~$319k, Porsche GT2 RS Clubsport EUR 405k, AMG GT2 EUR 409k (all net), averaging about $420k [1](https://sportscar365.com/sro/gt2/audi-begins-deliveries-of-r8-lms-gt2/) [2](https://www.motorpasion.com.mx/industria/ktm-x-bow-gt2-gtx-dos-nuevos-bolidos-te-diviertas-lindo-pista/amp) |
| `audi_r8_lms_gt2` | Audi R8 LMS GT2 (2019) | $325,000 (researched $300,000) | market | high | As `gue_audi_r8_lms_gt2`. EUR 338k + VAT new (2019); used R8 GT2s on Racecarsdirect at EUR 225k + VAT, EUR 270-295k and $310k (sold) [1](https://www.racecarsdirect.com/Advert/Details/141834/audi-r8-gt2) [2](https://racecarsdirect.com/Advert/Details/146855/audi-r8-gt2) [3](https://sportscar365.com/sro/gt2/audi-begins-deliveries-of-r8-lms-gt2/) |
| `fsr_ktm_xbow_gt2_endurance` | KTM X-Bow GT2 (2020-), endurance version | $325,000 (researched $300,000) | new | medium | As `gue_ktm_xbow_gt2`. No race-car price found; the road-legal X-Bow GT-XR derived from it costs EUR 284,900, race car put slightly above [1](https://en.wikipedia.org/wiki/KTM_X-Bow) |
| `fsr_ktm_xbow_gt2_sprint` | KTM X-Bow GT2 (2020-), sprint version | $325,000 (researched $300,000) | new | medium | As `gue_ktm_xbow_gt2`; sprint trim of the same car [1](https://en.wikipedia.org/wiki/KTM_X-Bow) |
| `gue_audi_r8_lms_gt2` | Audi R8 LMS GT2 (2019) | $325,000 (researched $300,000) | market | high | EUR 338k + VAT new (2019); used R8 GT2s on Racecarsdirect at EUR 225k + VAT, EUR 270-295k and $310k (sold) [1](https://www.racecarsdirect.com/Advert/Details/141834/audi-r8-gt2) [2](https://racecarsdirect.com/Advert/Details/146855/audi-r8-gt2) [3](https://sportscar365.com/sro/gt2/audi-begins-deliveries-of-r8-lms-gt2/) |
| `gue_ktm_xbow_gt2` | KTM X-Bow GT2 (2020-) | $325,000 (researched $300,000) | new | medium | No race-car price found; the road-legal X-Bow GT-XR derived from it costs EUR 284,900, race car put slightly above [1](https://en.wikipedia.org/wiki/KTM_X-Bow) |

## Stock Car Pro Series 2020-2024

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `stockcorolla_2023` | Stock Car Pro Series Toyota Corolla (2023) | $165,000 | market | low | No car or chassis price published (the series spent R$85M developing its 2025 car); estimated at ~R$900k (~$165k at 5.4), a little above a used Supercars COTF car [1](https://forbes.com.br/forbes-life/forbes-motors/2023/08/com-aposta-em-tecnologia-stock-car-reinventa-carro-para-2025/) [2](https://en.wikipedia.org/wiki/Stock_Car_Pro_Series) |
| `stockcruze_2023` | Stock Car Pro Series Chevrolet Cruze (2023) | $165,000 | market | low | No car or chassis price published (the series spent R$85M developing its 2025 car); estimated at ~R$900k (~$165k at 5.4), a little above a used Supercars COTF car [1](https://forbes.com.br/forbes-life/forbes-motors/2023/08/com-aposta-em-tecnologia-stock-car-reinventa-carro-para-2025/) [2](https://en.wikipedia.org/wiki/Stock_Car_Pro_Series) |

## Super Formula 2019-2022

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_supreme` | Dallara SF19 (Super Formula) | $300,000 | market | low | Estimate: retired SF19 chassis, priced off other Dallara top-tier spec chassis; engine leased, not included  |

## Super Formula 2023-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_formula_rss_supreme_25` | Dallara SF23 (Super Formula) | $500,000 | new | low | Estimate: current Dallara spec chassis, priced near an IndyCar DW12's $349k chassis cap plus aero and systems; engine leased  |

## Super Touring 1993-2000 - median $175,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `btcc_volvo_850` | Volvo 850 Super Touring (1995-1996, TWR BTCC saloon) | $220,000 (researched $225,000) | market | medium | As `vrc_erc_1994_vokker` (the same TWR 850, there in its 1994 estate form). Volvo 850 TWR car valued above the family for its fame; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1994_vokker` | Volvo 850 Super Touring (1994, TWR BTCC) - VRC replica | $220,000 (researched $225,000) | market | medium | Volvo 850 TWR car valued above the family for its fame; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1994_vokker_csp` | Volvo 850 Super Touring (1994, TWR BTCC) - VRC replica | $220,000 (researched $225,000) | market | medium | Volvo 850 TWR car valued above the family for its fame; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1998_alfio` | Alfa Romeo 156 D2 Super Touring (1998) - VRC replica | $200,000 | market | medium | Italian works Alfa valued at the top of the family; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1998_alfio_csp` | Alfa Romeo 156 D2 Super Touring (1998) - VRC replica | $200,000 | market | medium | Italian works Alfa valued at the top of the family; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `btcc_ford_mondeo_stw` | Ford Mondeo Super Touring (1996-1998) | $175,000 | market | medium | As `vrc_erc_1999_fortix`. Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1998_auriel` | Audi A4 quattro Super Touring (1998) - VRC replica | $175,000 | market | high | RM Sotheby's sold a 1997 Audi A4 quattro Super Touring (ST/31) for GBP 112k in 2016; allowed for appreciation since [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1998_auriel_csp` | Audi A4 quattro Super Touring (1998) - VRC replica | $175,000 | market | high | RM Sotheby's sold a 1997 Audi A4 quattro Super Touring (ST/31) for GBP 112k in 2016; allowed for appreciation since [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1999_fortix` | Ford Mondeo Super Touring (1999) - VRC replica | $175,000 | market | medium | Late Prodrive works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1999_fortix_csp` | Ford Mondeo Super Touring (1999) - VRC replica | $175,000 | market | medium | Late Prodrive works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1999_gojira` | Honda Accord Super Touring (1999) - VRC replica | $175,000 | market | medium | Late works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1999_gojira_csp` | Honda Accord Super Touring (1999) - VRC replica | $175,000 | market | medium | Late works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `btcc_bmw_320i_stw` | BMW 320i E36 Super Touring (1996-1998) | $170,000 | market | high | As `vrc_erc_1997_beamer`. RM Sotheby's sold a 1996 BMW 320i Super Touring for $168k (Monterey 2023) [1](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1997_beamer` | BMW 320i E36 Super Touring (1997) - VRC replica | $170,000 | market | high | RM Sotheby's sold a 1996 BMW 320i Super Touring for $168k (Monterey 2023) [1](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1997_beamer_csp` | BMW 320i E36 Super Touring (1997) - VRC replica | $170,000 | market | high | RM Sotheby's sold a 1996 BMW 320i Super Touring for $168k (Monterey 2023) [1](https://rmsothebys.com/auctions/mo23/lots/r0032-1996-bmw-320i-super-touring/) |
| `vrc_erc_1998_pageau` | Peugeot 406 Super Touring (1998) - VRC replica | $150,000 | market | medium | Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1998_pageau_csp` | Peugeot 406 Super Touring (1998) - VRC replica | $150,000 | market | medium | Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1999_renoir` | Renault Laguna Super Touring (1999) - VRC replica | $150,000 | market | medium | A Williams Laguna ST was estimated at GBP 80-120k in 2016 (unsold); Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [2](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) |
| `vrc_erc_1999_renoir_csp` | Renault Laguna Super Touring (1999) - VRC replica | $150,000 | market | medium | A Williams Laguna ST was estimated at GBP 80-120k in 2016 (unsold); Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [2](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) |
| `vrc_erc_1999_vorax` | Vauxhall Vectra Super Touring (1998) - VRC replica | $140,000 | market | medium | Vectra a less successful works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |
| `vrc_erc_1999_vorax_csp` | Vauxhall Vectra Super Touring (1998) - VRC replica | $140,000 | market | medium | Vectra a less successful works car; Super Touring comps: Audi A4 ST sold GBP 112k (2016), BMW 320i ST sold $168k (2023), Laguna ST est GBP 80-120k (2016), Primera ST asked GBP 70k (2019) [1](https://rmsothebys.com/auctions/lf16/lots/r139-1997-audi-a4-quattro-super-touring) [2](https://rmsothebys.com/auctions/lf16/lots/r114-1997-renault-laguna-btcc-super-touring/) [3](https://www.drivencarguide.co.nz/news/british-touring-car-dream-btcc-nissan-primera-for-sale-with-a-kiwi-connection/) |

## Supercars Car of the Future 2013-2017

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ford_falcon_fg_sv8` | V8 Supercars Ford Falcon FG, Car of the Future (2013) | $120,000 | market | low | Winners ask far more (the 2013 Bathurst-winning FG at A$625k, Winterbottom's 2015 title FG X at A$800k), but a race-ready Gen2 ZB Commodore listed at A$220k for Super2 (2025); a typical COTF car estimated at ~A$185k (~$120k at 0.65) [1](https://www.motorsport.com/v8supercars/news/bathurst-winning-ford-used-car-website/4416460/) [2](https://www.v8sleuth.com.au/800000-price-tag-on-restored-winterbottom-title-winner/) [3](https://speedcafe.com/supercars-news-triple-eight-holden-commodore-for-sale-facebook-marketplace/) |

## Supercars Project Blueprint 2007-2012

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_ford_falcon_11` | V8 Supercars Ford Falcon FG (2011) | $100,000 | market | low | Famous cars make far more (van Gisbergen's first-win 2011 FG03 auctioned May 2026, expected at several hundred thousand AUD), but a later, race-ready Gen2 ZB Commodore listed at A$220k for Super2 (2025); a typical Project Blueprint car estimated at ~A$155k (~$100k at 0.65) [1](https://www.carexpert.com.au/car-news/shane-van-gisbergens-first-v8-supercars-winning-ford-falcon-up-for-auction) [2](https://speedcafe.com/supercars-news-triple-eight-holden-commodore-for-sale-facebook-marketplace/) |
| `fsr_hol_commodore_11` | V8 Supercars Holden Commodore VE (2011) | $100,000 | market | low | Priced with the 2011 Falcon FG: a race-ready Gen2 ZB Commodore listed at A$220k (2025); a typical Project Blueprint car estimated at ~A$155k (~$100k at 0.65) [1](https://speedcafe.com/supercars-news-triple-eight-holden-commodore-for-sale-facebook-marketplace/) [2](https://www.carexpert.com.au/car-news/shane-van-gisbergens-first-v8-supercars-winning-ford-falcon-up-for-auction) |

## TCR 2015- - median $165,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fw_cupra_tcr_2024` | Cupra Leon VZ TCR / Leon Competicion (2024) | $170,000 | new | high | Motorsport Magazine: the 2025 Leon VZ TCR race car costs GBP 125k before options (~$168k at 1.34) [1](https://motorsportmagazine.com/archive/article/june-2025/136/king-of-leons-cupras-latest-touring-car-on-track) |
| `fw_audi_rs3_tcr_2024` | Audi RS 3 LMS TCR, second generation (2021-) | $165,000 | new | medium | The second-generation RS 3 LMS went on sale at $163k (2021) [1](https://en.wikipedia.org/wiki/Audi_RS_3_LMS_TCR) |
| `fsr_hyundai_elantra_n_tcr` | Hyundai Elantra N TCR (2024 update) | $150,000 | new | medium | As `fw_elantra_tcr_2024`. New price unpublished; a one-year-old 2025 Elantra N TCR Evo (BHA Nurburgring car) asks $115-125k and earlier cars EUR 75-85k, so new put just below the Cupra (GBP 125k) [1](https://www.racingjunk.com/tcr/184814513/2025-hyundai-elantra-n-tcr-evo-race-car-.html) [2](https://www.racecarsdirect.com/Advert/Details/151196/nr-3-tcr-hyundai-elantra-n-2021) |
| `fw_elantra_tcr_2024` | Hyundai Elantra N TCR (2024 update) | $150,000 | new | medium | New price unpublished; a one-year-old 2025 Elantra N TCR Evo (BHA Nurburgring car) asks $115-125k and earlier cars EUR 75-85k, so new put just below the Cupra (GBP 125k) [1](https://www.racingjunk.com/tcr/184814513/2025-hyundai-elantra-n-tcr-evo-race-car-.html) [2](https://www.racecarsdirect.com/Advert/Details/151196/nr-3-tcr-hyundai-elantra-n-2021) |
| `fsr_renault_megane_rs` | Renault Megane RS TCR by Vukovic Motorsport (2019-2020) | $123,750 (researched $95,000) | market | low | Taken as Vukovic's Megane RS TCR (TCR Europe 2019-2020); no price found for the race car, while its 360 hp track-day replica, the Megane RS TC4 (30 built), was quoted at EUR 50k in 2020 - the race car estimated at ~EUR 80k (~$95k at 1.16) [1](https://www.autosprint.ch/en/?p=47622) [2](https://www.pmw-magazine.com/news/new-competition-car/vukovic-motorsport-tcr-spec-megane.html) |
| `opel_astra_tcr` | Opel Astra TCR (2016) | $123,750 (researched $60,000) | market | low | Launched at EUR 95k before taxes and no longer sold; no used ask found, a first-generation TCR car of that age estimated at ~EUR 52k (~$60k at 1.16) [1](https://tcr-series.com/homologated-cars/item/opel-astra-tcr) |

## Track day (no class to compare)

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_lamborghini_sesto_elemento` | Lamborghini Sesto Elemento (2011) | $3,000,000 | market | medium | Track-only, 20 built at about EUR 2m new; resale asks around EUR 3m [1](https://news.dupontregistry.com/blogs/lamborghini-news/lamborghini-sesto-elemento-reportedly-for-sale) [2](https://www.automotiveaddicts.com/31754/lamborghini-sesto-elemento-costs-2-2-million) |
| `ferrari_599xxevo` | Ferrari 599XX Evoluzione (2012) | $1,500,000 | market | medium | Corse Clienti XX programme car, no race class; one sold for EUR 1.4m in 2012 against a stated value of EUR 1.3m [1](https://www.paulfrasercollectibles.com/blogs/classic-cars/ferrari-599xx-evoluzione-auction-makes-2-3m-for-earthquake-victims) [2](https://www.autoguide.com/auto-news/2012/09/ferrari-599xx-evo-sold-to-google-exec-for-charity.html) |
| `fsr_ruf-rt12r_rr` | RUF RT12 R in race trim (2011; conversion, no real race version) | $750,000 | tuned | low | The road RT12 R ($650k, as `ks_ruf_rt12r`: sales $649-813.5k) plus an estimated $100k for a race conversion (545 bhp, 1,150 kg) [1](https://www.hagerty.com/valuation-tools/past-sales/2012-ruf-rt_12/W09BD0382CPR06147/681875a8-6124-41a8-8fbc-336a8863013a) |
| `dodge_ram_1500` | Ram 1500 Hemi V8 track build (2026) | $70,000 | tuned | low | 2026 Ram 1500 Big Horn/Warlock with the returning Hemi V8 lists at C$71,880-71,985 in Canada (~$52k at 0.72); plus an estimated $18k of track preparation [1](https://www.auto123.com/en/news/amp/ram-1500-2026-v8-hemi-pricing-canada/73555/) [2](https://www.guideautoweb.com/en/articles/80790/here-s-how-much-the-hemi-v8-costs-with-the-2026-ram-1500) |
| `fsr_mercedes_a45` | Mercedes-AMG A 45 (W176) race build (2016) | $60,000 | tuned | low | No racing series ran an A 45; priced as a used W176 A 45 (~$30k) plus an estimated $30k of cage, aero and race preparation  |

## Track-only (no class to compare)

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_ferrari_fxx_k` | Ferrari FXX K (2015) | $5,000,000 | market | medium | Non-Evo FXX K sold $4.28M (RM Abu Dhabi 2019); Evo versions now EUR 5-7M [1](https://www.thedrive.com/news/31298/two-ferrari-race-cars-and-a-one-off-pagani-zonda-bring-17-7m-at-auction) [2](https://rmsothebys.com/auctions/mc26/lots/r0036-2018-ferrari-fxxk-evo) |
| `pagani_zonda_r` | Pagani Zonda R (2009-2010) | $5,000,000 | market | medium | Zonda R 'Revolucion spec' sold for $5.34M at RM Amelia Island 2023 [1](https://www.classic-car-auctions.info/usa/2023-rm-sothebys-amelia-island-sale-auction-results/) |
| `ks_mclaren_p1_gtr` | McLaren P1 GTR (2015-2016) | $1,450,000 | market | high | P1 GTR #23 sold for $1,435,000 at RM Sotheby's Miami, Feb 2025 [1](https://rmsothebys.com/auctions/mi25/lots/r0031-2015-mclaren-p1-gtr/) |
| `lotus_exos_125_s1` | Lotus T125 Exos, Stage 1 upgrade (~750 bhp) | $400,000 | tuned | low | T125 at about $350k plus an estimated $50k for the engine upgrade  |
| `lotus_exos_125` | Lotus T125 Exos (2011-2013) | $350,000 | market | high | RM Sotheby's sales of $417.5k (2019) and $381.75k (2022), EUR 320k in 2024, one at $174k in 2025 [1](https://rmsothebys.com/auctions/am19/lots/r0073-2013-lotus-t125/) [2](https://rmsothebys.com/auctions/am22/lots/r0046-2013-lotus-t125/) [3](https://en.wikipedia.org/wiki/Lotus_T125) |
| `ks_lotus_3_eleven` | Lotus 3-Eleven (2016-2017), Race version | $125,000 | market | medium | Auction average $118k (Mecum high $126.5k); UK asks GBP 89-105k [1](https://www.conceptcarz.com/valuation/28159/Lotus-3-Eleven.aspx) [2](https://classifieds.seloc.org/ads/lotus-3-eleven/) |

## Trans-Am TA2 2016- - median $165,000

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `vrc_arc_ta2_chevrette` | Chevrolet Camaro TA2 (Gen 6 body) - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |
| `vrc_arc_ta2_chevrette_csp` | Chevrolet Camaro TA2 (Gen 6 body) - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |
| `vrc_arc_ta2_dagger` | Dodge Challenger TA2 - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |
| `vrc_arc_ta2_dagger_csp` | Dodge Challenger TA2 - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |
| `vrc_arc_ta2_mare` | Ford Mustang TA2 - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |
| `vrc_arc_ta2_mare_csp` | Ford Mustang TA2 - VRC replica | $165,000 | new | medium | Howe quoted a full ready-to-race TA2 at about $170k at PRI (Dec 2024, forum report); used cars run $80-110k and a 2025 Howe Mustang lists at A$190k in Australia [1](https://classicmotorsports.com/forum/grm/howe-hr6-400-horsepower-and-2600-pounds/275325/page2) [2](https://moparinsiders.com/for-sale-stevens-miller-racing-is-selling-one-of-their-dodge-challenger-ta2-race-cars/) [3](https://www.ta2racingaustralia.com/shop-product/mustang/2025-howe-ta2-mustang) |

## Turismo Nacional 2017-

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `fsr_onix_2023` | Chevrolet Onix, Turismo Nacional BR (2023) | $40,000 | market | low | Modified production car (~200 hp); no price published, estimated as a new Onix (from R$101,790 in 2026) plus race preparation, ~R$215k (~$40k at 5.4) [1](https://en.wikipedia.org/wiki/Turismo_Nacional_BR) [2](https://tabelacarros.com/post/onix-2026-fica-r-22-mil-mais-barato-e-abala-rivais) |

## VLN SP4T 2011-2013

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `ks_audi_tt_vln` | Audi TT RS VLN (2011, SP4T) | $100,000 | market | low | EUR 180k net new in 2011; a used one of that age estimated at about $100k  |

## WSC / LMP 1994-2003

| Car | Real car | Price | Basis | Confidence | Note |
| --- | --- | ---: | --- | --- | --- |
| `rss_lmp_ferruccio_33_v12` | Ferrari 333 SP (1999) | $4,000,000 | market | medium | Ferruccio 33 V12 taken as the Ferrari 333 SP; 333 SPs made $2.09M (Gooding 2015) rising to a record CHF 5.2M (RM Zurich 2025), typical example now about $4M [1](https://www.goodingco.com/lot/1998-ferrari-333-sp) [2](https://rmsothebys.com/media-center/press-releases/tailored-for-speed-rm-sotheby-s-achieves-record-chf-70-million-with-100-sell-through-making-the-collection-rm-sotheby-s-highest-ever-grossing-european-sale) |

