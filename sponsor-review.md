# Sponsor review

Every brand in the sponsor book, which replaces the invented names in
`SPONSOR_BOOK` (`src/core/sponsor-offers/`): real companies, each with
evidence that it has backed motorsport. This file records where each brand and
its logo came from, so either can be traced and re-checked.

- **Ten trades, 314 brands.** The nine trades the book already had, plus Travel
  and logistics (airlines, hotels, ferries, freight and couriers). Tobacco is
  left out.
- **Stature decides who writes to whom.** It is relative to the trade:
  - **Global:** a household name with top-level motorsport deals. Writes at
    Gold and Platinum.
  - **Major:** well known internationally, with a serious racing presence.
    Writes from Bronze to Platinum.
  - **Specialist:** a niche, regional or enthusiast brand a privateer could
    plausibly get. Writes at Rookie, Bronze and Silver.

  Every trade has at least 10 brands open at every rung.
- **Brands left out:**
  - anything no longer trading;
  - Russian and Belarusian brands;
  - state tourism boards;
  - any brand nobody could find evidence for.

  One brand belongs to one trade.
- **Logos:** 170 of the 314, in `src/renderer/src/assets/sponsors/`. They are
  public domain or CC0 only, mostly the logo Wikidata records for the brand,
  else Simple Icons, else a search of Wikimedia Commons. CC BY-SA files were
  skipped, since they bring attribution and share-alike duties.
  - 65 of 72 global brands have one, 87 of 131 major and 18 of 111 specialist.
    Small brands rarely have a freely licensed logo, so a Rookie career will
    mostly see initials.
  - A brand without a logo shows its initials, as every sponsor did before.
- **A licence covers the file, not the trademark.** An offer from a real
  company implies an endorsement it never gave. Before Phase 14 -
  Distribution, decide whether real names and logos ship. Every logo is in one
  folder, and a missing logo falls back to initials, so removing them is
  deleting the folder.

## Doubts to check

The research flagged these, and they are worth a look before the book ships.

- **Thin or old evidence:**
  - Several 2026 F1 partners rest only on one aggregator's team list
    (pitdebrief.com): Goldman Sachs, Etihad, Hilton, Dell, Cisco and Standard
    Chartered.
  - Shopify, Airbnb and CrowdStrike come from one low-authority roundup.
  - Older deals:
    - Hoosier, to 2015.
    - Nitto, to 2014.
    - Mickey Thompson, to 2021.
    - Bardahl, to 2019.
    - Carrera, which did not renew with Alfa Romeo for 2022.
    - TW Steel and Kingfisher, historic only.
  - Single sources:
    - Schroth, a university team's sponsor page.
    - Sabelt, a USF Pro 2000 partner list.
    - Warsteiner, a SponsorPitch listing.
    - SunGod, one trade article.
  - Arnold Clark's evidence is its parts arm backing one stock car racer.
    Europcar's is Wikipedia's mention of Renault F1 and the Dakar.
- **Owner rather than brand:**
  - Fanatec (Endor AG).
  - Shannons (Suncorp).
  - Asetek SimSports (Asetek).
  - Eddie Stobart (Stobart).
  - Busch Light (Anheuser-Busch).
  - Champion, Pennzoil and Sunoco, which now trade under owners that are not
    their founders.
- **Nations that are a call:**
  - Gulf, Bardahl and Ray-Ban are given by origin (USA).
  - Shell is GBR.
  - Achilles is IDN, for the Radial brand.
  - Aon is IRL.
  - OKX is SYC, where it is registered.
  - VistaJet is MLT.
  - Gullwing is NLD.
  - Thrifty is USA, though its evidence is Australian Supercars.
  - Every British brand is GBR, rather than England or Scotland.
- **Stature that could go either way:**
  - Riedel, Hahn Air and Freeway Insurance are specialist, though each sits on
    an F1 or NASCAR partner list.
  - Repco, Halfords and VP Racing Fuels are specialist despite series-level
    deals.
  - DeWalt and Snap-on are global.
  - Carvana is global, though it is mostly American.
  - Alpinestars is global and Sparco major.
  - Piquadro and Delsey are major.
- **Near-duplicates:** Sterling Insurance is Adrian Flux's sister brand. Coors
  Light and Miller Lite share an owner.

## Left out

- **Brands:**
  - Mannol, RoboMarkets and Libertex, on suspected Russian ties.
  - Avon tyres, whose article is an unrelated company.
  - Brittany Ferries, Irish Ferries and DFDS, with no motorsport link found.
  - Würth, Hella, Varta, Autoglym, Remus, Bride, Goodride, Sava, Triangle,
    Penske Automotive, Sytner, Enterprise and Budget, for lack of evidence.
  - Heusinkveld, Moza and Playseat, whose evidence is esports only.
- **Logos rejected on review, the brand kept:**
  - These named another company: Fuchs, Lucas Oil, Royal Purple, Goodyear,
    Cooper, Nitto, Champion, Koni, H&R, AWS, Riedel, Kraken, ING, VKB,
    Budweiser, Patrón, Veltins, Krombacher, Coopers, Celsius, Vertu, Red Line
    and Busch Light.
  - These were out of date or a subsidiary's: Sunoco's 1954 mark, and NGK,
    which showed its parent Niterra.

## Oil and fuel - 31 brands, 18 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Aramco | SAU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Saudi_aramco_logo.svg) `aramco.png` | Formula One global partner from 2020 and partner of the Aston Martin F1 team [1](https://en.wikipedia.org/wiki/Saudi_Aramco) |
| Castrol | GBR | Global | [Commons](https://commons.wikimedia.org/wiki/File:Castrol_logo_2023.svg) `castrol.svg` | Sponsor of the Ford World Rally Team and M-Sport in the WRC since 2003 [1](https://en.wikipedia.org/wiki/Castrol) |
| Mobil 1 | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Mobil1_logo.png) `mobil-1.png` | McLaren F1 motor oil and fluids partner from 1995 to 2016 [1](https://en.wikipedia.org/wiki/Mobil_1) |
| Petronas | MYS | Global | [Commons](https://commons.wikimedia.org/wiki/File:PETRONAS-logo.svg) `petronas.svg` | Premium partner of Sauber Petronas and BMW Sauber F1, supplying fuel and lubricants, 1995-2009 [1](https://en.wikipedia.org/wiki/Petronas) |
| Repsol | ESP | Global | [Commons](https://commons.wikimedia.org/wiki/File:Repsol_2025.svg) `repsol.svg` | Longtime motorsport sponsor, backing Carlos Sainz Sr. through his WRC titles and the Honda MotoGP team [1](https://en.wikipedia.org/wiki/Repsol) |
| Shell | GBR | Global | [Commons](https://commons.wikimedia.org/wiki/File:Shell_wordmark_2019.svg) `shell.svg` | Fuel and lubricants partner of Scuderia Ferrari, dating to the first F1 season in 1950 [1](https://www.shell.ca/en_ca/drivers/motorsports/the-history-of-shells-technical-partnership-with-ferrari.html) |
| TotalEnergies | FRA | Global | [Commons](https://commons.wikimedia.org/wiki/File:TotalEnergies_wordmark_(2021-present).svg) `totalenergies.svg` | Longtime partner of Citroen Sport in the WRC, Dakar Rally and WTCC [1](https://en.wikipedia.org/wiki/TotalEnergies) |
| Valvoline | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Valvoline_company_logo.svg) `valvoline.svg` | NASCAR sponsor since 1981, including the Wood Brothers No. 21 in 1983-84 [1](https://en.wikipedia.org/wiki/Valvoline) |
| Eneos | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:ENEOS_logo.svg) `eneos.svg` | Title sponsor of Toyota Super GT GT500 entries, from Team Lexus LeMans ENEOS SC430 to the ENEOS Rookie Supra [1](https://en.wikipedia.org/wiki/Eneos) |
| Eni | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Eni_wordmark.svg) `eni.svg` | Returned to F1 with Alpine; exclusive fuel supplier to Moto2 and Moto3 [1](https://www.autosport.com/f1/news/eni-happy-returns-energy-company-back-in-f1-with-alpine/10695540/) |
| Fuchs | DEU | Major | - | Official lubricant supplier to Toyota Gazoo Racing UK in the BTCC, 2023 [1](https://fuchs.com/uk/en/company/news/motorsports/news-entry/4955-FUCHS-UK-join-Toyota-Gazoo-Racing-as-official-race-team-lubricant-supplier-for-2023-season) |
| Gulf | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Gulf_Oil_logo.svg) `gulf.svg` | Signed a MotoGP partnership with Trackhouse Racing in December 2024; famous historic Porsche 917 and McLaren livery [1](https://www.blackbookmotorsport.com/news/trackhouse-racing-motogp-gulf-oil-sponsorship-december-2024/) |
| Idemitsu | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Idemitsu_Kosan_wordmark.svg) `idemitsu.svg` | Title sponsor of the IMSA Mazda MX-5 Cup [1](https://www.mx-5cup.com/news/idemitsu-becomes-title-sponsor-of-mazda-mx-5-cup) |
| Liqui Moly | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:Liqui-moly.svg) `liqui-moly.svg` | Multi-year partner of the Australian Supercars Championship from 2023 [1](https://www.liqui-moly.com/en/press/press-releases/liqui-moly-inks-multi-year-partnership-agreement-with-supercars.html) |
| Lucas Oil | USA | Major | - | Primary sponsor of Kyle Busch at Richard Childress Racing in NASCAR, 2025 [1](https://www.blackbookmotorsport.com/news/nascar-rcr-kyle-busch-lucas-oil-primary-race-sponsorship-march-2025/) |
| Motul | FRA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Motul_logo.svg) `motul.svg` | McLaren F1 transmission lubricant supplier from 2026; official lubricant of the 24 Hours of Le Mans since 2016 [1](https://www.si.com/onsi/f1/motul-returns-to-formula-1-with-mclaren-in-2026) |
| Orlen | POL | Major | [Commons](https://commons.wikimedia.org/wiki/File:Orlen_wordmark_logo.svg) `orlen.svg` | Williams F1 partner in 2019 alongside Robert Kubica, then the Alfa Romeo team's title partner [1](https://www.crash.net/f1/news/911451/1/williams-secures-partnership-deal-polish-oil-firm-f1-2019) |
| Pennzoil | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Pennzoil_textlogo.png) `pennzoil.png` | Sponsored Rick Mears at Team Penske from 1983 to 1990, including his 1984 and 1988 Indy 500 wins [1](https://en.wikipedia.org/wiki/Pennzoil) |
| STP | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Stp_oil_brand_logo.png) `stp.png` | Sponsor of NASCAR champion Richard Petty from 1972 [1](https://en.wikipedia.org/wiki/STP_(motor_oil_company)) |
| Sunoco | USA | Major | - | Official Fuel of NASCAR since 2004 [1](https://en.wikipedia.org/wiki/Sunoco) |
| Bardahl | USA | Specialist | - | Lubricant supplier to Motorbase Performance in the BTCC, 2019; Sebastien Loeb Racing partner [1](https://alliance-racing.com/motorbase-performance-extends-partnership-with-abc-and-welcomes-bardahl-lubricants-as-new-technical-partner/) |
| ETS Racing Fuels | DEU | Specialist | - | Exclusive fuel supplier to the FIA European Rally Championship; fuel of the TCR World Tour [1](https://www.fia.com/news/fia-european-rally-championship-commits-sustainable-fuel-delivered-ets) |
| Eurol | NLD | Specialist | - | Technical partner of Chip Ganassi Racing in IndyCar for 2025 [1](https://chipganassiracing.com/news/eurol-lubricants-joins-chip-ganassi-racing-as-a-technical-partner) |
| Kroon-Oil | NLD | Specialist | - | Partner of MP Motorsport since 2013 [1](https://www.mpmotorsport.com/news/mp-motorsport-and-kroon-oil-extend-partnership-for-five-more-years) |
| Millers Oils | GBR | Specialist | - | Technical partner of Ginetta from 2019; title partner of Team HARD in the BTCC, 2023 [1](https://www.millersoils.co.uk/ginetta-cars-announces-millers-oils-as-new-technical-partner-for-2019/) |
| Penrite | AUS | Specialist | - | Official Oil of Supercars and Sandown 500 naming partner through 2027; Erebus naming sponsor 2015-20 [1](https://www.supercars.com/news/supercars-news-2025-penrite-extend-partnership-announcement-release-sandown-500-oil-partner) |
| Ravenol | DEU | Specialist | - | Official lubricant partner of ADAC GT Masters since 2016; title partner of the Nurburgring NLS [1](https://www.nuerburgring-langstrecken-serie.de/language/en/2025/12/02/ravenol-intensifies-its-commitment-to-the-nurburgring-nls-becomes-the-adac-ravenol-nurburgring-langstrecken-serie/) |
| Red Line | USA | Specialist | - | Sponsor of Kalitta Motorsports in NHRA, 2015; designated oil of the Formula Mazda Challenge [1](https://performanceracing.com/magazine/industry-news/02-10-2015/red-line-oil-sponsors-kalitta-motorsports) |
| Rowe | DEU | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Rowe_Mineral%C3%B6lwerk_logo.svg) `rowe.svg` | Owns ROWE Racing, winners of the Nurburgring 24 Hours in 2020 and 2025 with BMW [1](https://rowe-oil.com/en/about-rowe/sponsoring/rowe-racing) |
| Royal Purple | USA | Specialist | - | Official engine oil of Formula DRIFT, 2023-24; TRG-AMR team sponsor in IMSA, 2014 [1](https://prnewswire.com/news-releases/royal-purple-is-offical-engine-oil-of-formula-drift-for-2023--2024-301698404.html) |
| VP Racing Fuels | USA | Specialist | - | Official fuel of IMSA through 2030 and official racing fuel of NHRA from 2025 [1](https://vpracingfuels.com/vp-racing-and-imsa-extend-relationship-through-2030) |

## Tyres - 31 brands, 19 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Bridgestone | JPN | Global | [Commons](https://commons.wikimedia.org/wiki/File:Bridgestone_logo.svg) `bridgestone.svg` | Tyre supplier in Formula One, Le Mans and Grand Prix motorcycle racing [1](https://en.wikipedia.org/wiki/Bridgestone) |
| Continental | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Continental_wordmark.svg) `continental.svg` | Title sponsor of the IMSA Continental Tire SportsCar Challenge and tyre supplier to the WeatherTech Championship through 2018 [1](https://performanceracing.com/magazine/industry-news/09-26-2017/continental-tire-exit-imsa-end-2018-season) |
| Dunlop | GBR | Global | [Commons](https://commons.wikimedia.org/wiki/File:Dunlop_tires_logo.png) `dunlop.png` | Sole tyre supplier to the BTCC from 2003 to 2019 [1](https://www.tiretechnologyinternational.com/news/motorsport/goodyear-replaces-dunlop-as-british-touring-car-championship-tire-supplier.html) |
| Goodyear | USA | Global | - | Exclusive tyre of NASCAR's top three series; sole supplier to WEC LMGT3 and the BTCC [1](https://www.tiretechnologyinternational.com/news/motorsport/goodyear-and-nascar-renew-longstanding-tire-supply-partnership.html) |
| Hankook | KOR | Global | [Commons](https://commons.wikimedia.org/wiki/File:Logo_Hankook_Tire_2025.svg) `hankook.svg` | Exclusive tyre supplier to Formula E since Gen3; DTM supplier from 2011 [1](https://www.fiaformulae.com/en/news/1736/hankook-becomes-tyre-supplier-to-formula-e) |
| Michelin | FRA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Michelin_Wordmark.svg) `michelin.svg` | Exclusive tyre supplier to the WEC Hypercar class since 2021, reappointed through 2032 [1](https://www.fia.com/news/wec-fia-confirms-tyre-suppliers-2030-2032) |
| Pirelli | ITA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Pirelli_-_logo_full_(Italy,_1997).svg) `pirelli.svg` | Exclusive tyre partner of the FIA Formula One World Championship since 2011 [1](https://en.wikipedia.org/wiki/Pirelli) |
| Yokohama | JPN | Global | [Commons](https://commons.wikimedia.org/wiki/File:Yokohama_(Unternehmen)_logo.svg) `yokohama.svg` | Control tyre of Super Formula since 2016 and of the WTCC from 2006 to 2017 [1](https://yokohama.eu/en/motorsport) |
| BFGoodrich | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:BFGoodrich_logo.svg) `bfgoodrich.svg` | 13 Dakar Rally victories and 28 overall wins at the Baja 1000 [1](https://en.wikipedia.org/wiki/BFGoodrich) |
| Cooper | USA | Major | - | Presenting sponsor and exclusive tyre of the USF Pro Championships until 2023 [1](https://racer.com/2023/08/31/cooper-tires-usf-pro-championships-partnership-to-end/) |
| Falken | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Falken_Tire_logo.svg) `falken.svg` | Falken Motorsports runs Nurburgring endurance campaigns in NLS and the 24 Hours, 2026 [1](https://www.pmw-magazine.com/news/tires/falken-motorsports-set-for-nurburgring-endurance-campaigns-in-2026.html) |
| Firestone | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Firestone.svg) `firestone.svg` | Racing tyre supplier to the NTT IndyCar Series; F1 supplier 1950-74 [1](https://en.wikipedia.org/wiki/Firestone_(company)) |
| General Tire | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:General_Tire_logo.svg) `general-tire.svg` | Official tyre and sole supplier to the ARCA Menards Series from 2016 through 2024 [1](https://www.arcaracing.com/2020/01/13/general-tire-extends-agreement-to-stay-official-tire-of-arca/) |
| Giti | SGP | Major | - | Official race tyre of the Formula Regional Middle East and F4 Middle East championships [1](https://www.tyre-trends.com/auto-trends/giticompete-gtr1-selected-as-official-race-tyres-for-frmec-and-f4me) |
| Hoosier | USA | Major | - | Official tyre of the ARCA Racing Series until 2015; road, dirt and stock car racing supplier [1](https://www.rockcrawler.com/2015/10/general-tire-named-official-tire-supplier-of-arca-beginning-in-2016) |
| Kumho | KOR | Major | [Commons](https://commons.wikimedia.org/wiki/File:Kumho_Tire_logo_(2023).svg) `kumho.svg` | Title sponsor and exclusive tyre of the TCR World Tour from 2023 [1](https://www.tiretechnologyinternational.com/news/motorsport/kumho-tire-named-sole-tire-supplier-to-tcr-world-tour.html) |
| Maxxis | TWN | Major | [Commons](https://commons.wikimedia.org/wiki/File:MAXXIS_logo.svg) `maxxis.svg` | Exclusive tyre supplier to the FIA Karting Championships, 2024-2026; Coronel Dakar team title sponsor [1](https://www.maxxis.com/us/?p=43228) |
| MRF | IND | Major | [Commons](https://commons.wikimedia.org/wiki/File:Madras_Rubber_Factory_Logo.svg) `mrf.svg` | Team MRF Tyres marked 50 FIA European Rally Championship rallies at the Barum Czech Rally Zlin [1](https://www.tyrepress.com/tag/fia-european-rally-championship/) |
| Nexen | KOR | Major | - | Supplies the Adrenalin Motorsport NLS V6 class team, 2025; Superrace manufacturer champion [1](https://www.tiretechnologyinternational.com/news/motorsport/nexen-extends-participation-in-nls-racing-v6-class-for-2025.html) |
| Toyo | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Toyo_Tire_logo.svg) `toyo.svg` | Tyre partner of Toyota Gazoo Racing in the W2RC for 2026; Team Toyo Tires Drift in D1 since 2007 [1](https://www.pmw-magazine.com/news/tires/toyota-gazoo-racing-and-toyo-tire-continue-partnership-for-w2rc-2026.html) |
| Achilles | IDN | Specialist | - | Formula DRIFT series sponsor through 2019, fielding a 14-driver Team Achilles [1](https://www.moderntiredealer.com/industry-news/racing/article/11524549/achilles-tires-names-14-drivers-for-2019-formula-drift-pro) |
| DMACK | GBR | Specialist | - | First WRC win with Elfyn Evans at Wales Rally GB, 2017; DMACK World Rally Team [1](https://tyrepress.com/2017/11/dmack-ends-best-wrc-season-yet-on-a-high) |
| Federal | TWN | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Federal-Tires-logo.png) `federal.png` | Official tyre supplier to the Formula DRIFT PRO Championship from 2021 [1](https://www.pasmag.com/events/event-news/federal-tire-joins-formula-drift-as-an-official-tire-supplier) |
| Kenda | TWN | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:KENDA_Logo_White.png) `kenda.png` | Formula Drift tyre supplier since 2023, backing Fredric Aasbo and Ryan Tuerck [1](https://en.wikipedia.org/wiki/Kenda_Rubber_Industrial_Company) |
| Linglong | CHN | Specialist | - | Official control tyre brand of the 2025/26 D1NZ drifting championship [1](https://www.scoop.co.nz/stories/BU2510/S00335.htm) |
| Mickey Thompson | USA | Specialist | - | NHRA major event sponsor and Pro Mod contingency sponsor through 2021 [1](https://www.mickeythompsontires.com/news/mickey-thompson-back-as-nhra-major-event-sponsor-for-2021) |
| Nankang | TWN | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Nankang-logo.png) `nankang.png` | Title sponsor of the BRSCC BMW Compact Cup from 2017 and CityCar Cup in 2021 [1](https://brscc.co.uk/nankang-tyre-becomes-city-car-cup-title-sponsor-for-2021/) |
| Nitto | JPN | Specialist | - | Formula DRIFT sponsor through 2014, backing Vaughn Gittin Jr. and others [1](https://news.formulad.com/2010/fd-news/nitto-tire-announces-formula-drift-team-sponsorships/) |
| Petlas | TUR | Specialist | - | Title sponsor of the Turkish Offroad Championship and sponsor of the Turkish Drift Championship [1](https://akogrup.com.tr/tr/haberler/petlas-7-yildir-spora-kesintisiz-destek-sagliyor) |
| Sailun | CHN | Specialist | - | FIA official tyre supplier for FIA F4 Chinese Championship and TCR Asia [1](https://tyrepress.com/2024/04/sailun-an-fia-approved-tyre-supplier) |
| Vredestein | NLD | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Vredestein_tyres_logo.png) `vredestein.png` | Official tyre partner of the Mille Miglia, extended through 2027; Hellendoorn Rally partner [1](https://www.tyrenews.co.uk/news/apollo-tyres-extends-1000-miglia-partnership-through-2027) |

## Parts - 40 brands, 21 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Bosch | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Bosch-logo.svg) `bosch.svg` | Exclusive ECU and dashboard supplier to the DTM since 2000; GT3 ABS supplier [1](https://www.automotiveworld.com/news-releases/bosch-dtm-continue-successful-partnership-2017/) |
| Brembo | ITA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Brembo_logo_(2022).svg) `brembo.svg` | Supplies brake calipers to all 11 F1 teams in 2026; sole brake supplier of MotoGP [1](https://www.autobiz.ie/motorsport/brembo-group-now-supplying-all-f1-teamsnbsp) |
| Denso | JPN | Global | [Commons](https://commons.wikimedia.org/wiki/File:Denso.svg) `denso.svg` | Main sponsor of TGR Team SARD in Super GT; the DENSO KOBELCO SARD GR Supra [1](https://www.fenderbender.com/running-a-shop/operations/article/33022894/denso-announces-motorsports-sponsorships-for-2008) |
| DeWalt | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:DeWalt_Logo.svg) `dewalt.svg` | Primary sponsor of Matt Kenseth at Roush and Joe Gibbs Racing in NASCAR, 1999 to 2017 [1](https://www.jayski.com/2016/06/30/dewalt-announces-expanded-partnership-with-joe-gibbs-racing/) |
| Mahle | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Mahle.svg) `mahle.svg` | Engine component partner of Scuderia Ferrari, forging its F1 pistons, 2016 [1](https://newsroom.mahle.com/press/ja/press-releases/mahle-expands-cooperation-with-scuderia-ferrari-36928) |
| Marelli | ITA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Calsonic_Kansei_company_logo.svg) `marelli.svg` | Official Telemetry Services Supplier of Formula 1 [1](https://www.formula1.com/en/latest/article/marelli-to-become-official-telemetry-services-supplier-for-formula-1.3oamnTTUgfYiUmKjuapqQK) |
| NGK | JPN | Global | - | Sponsor of Walkinshaw Andretti United in Supercars, 2025; NISMO NDDP main sponsor in Super GT [1](https://ngk.com.au/ngk-returns-to-supercars-championship-in-2025-with-walkinshaw-andretti-united/) |
| Snap-on | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Snap-on_logo.svg) `snap-on.svg` | Sponsor of NHRA Funny Car driver Cruz Pedregon since 1992; Team Penske NASCAR and IndyCar sponsor [1](https://nhra.com/news/2017/snap-tools-renews-pedregon-through-2020-nhra-season) |
| Akrapovič | SVN | Major | - | BMW Motorsport official partner, in DTM from 2012 and expanded in 2016 [1](https://www.bmwblog.com/2016/05/27/bmw-motorsport-akrapovic-expand-collaboration) |
| AP Racing | GBR | Major | - | Supplies brakes and clutches to eight F1 teams in 2025; sole brake supplier of the NASCAR Next Gen Cup car [1](https://apracing.com/news-media/ap-racing-to-supply-8-of-10-f1-teams-in-2025) |
| BBS | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:BBS_logo.svg) `bbs.svg` | Standard wheel supplier to Formula 1 from 2022; made Ferrari's magnesium F1 wheels from 1991 [1](https://bbs-usa.com/news/article/72236/BBS_IS_OFFICIAL_SUPPLIER_OF_FORMULA_ONE_WHEELS/) |
| Bilstein | DEU | Major | - | Technology partner of Haupt Racing Team in DTM and the Nurburgring 24 Hours since 2020 [1](https://media.hauptracingteam.de/en/detail/item/55.html) |
| Champion | USA | Major | - | Spark plugs on around half of F1 race winners since 1950; Indy 500 winners in the 1960s and 1970s [1](https://www.grandprix.com/gpe/spon-013.html) |
| Enkei | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Enkei_company_logo.svg) `enkei.svg` | McLaren F1 official supplier for 2026; wheels in F1, WRC, Super GT and Super Taikyu [1](https://en.wikipedia.org/wiki/Enkei_Corporation) |
| Holley | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Holley_Performance_Products_logo.svg) `holley.svg` | Title sponsor of NHRA Factory X from 2024 and NMRA Ford Nationals [1](https://www.draglist.com/2023/12/08/holley-efi-named-title-sponsor-of-nhra-factory-x/) |
| Interstate Batteries | USA | Major | - | Founding sponsor of Joe Gibbs Racing in NASCAR since 1992 [1](https://nbcsports.com/nascar/news/joe-gibbs-racing-extends-partnership-with-interstate-batteries-in-multi-year-deal) |
| K&N | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:K%26N_Plain_Logo.svg) `k-and-n.svg` | Title sponsor of the NASCAR K&N Pro Series, 2011-2019, and official automotive filters of NASCAR [1](https://performanceracing.com/magazine/industry-news/03-20-2015/nascar-and-kn-filters-announce-multi-year-extension) |
| KW | DEU | Major | - | Official suspension partner of BMW Motorsport for the BMW M4 GT3; supplies half the NLS field [1](https://www.kwsuspensions.net/bmw-motorsport) |
| NAPA | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:NAPA_Auto_Parts_logo.svg) `napa.svg` | Primary sponsor of Chase Elliott at Hendrick Motorsports; official auto parts store of the NHRA [1](https://speedwaymedia.com/2022/07/20/napa-extends-sponsorship-of-hendrick-motorsports-and-driver-chase-elliott/) |
| O'Reilly Auto Parts | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:O%27Reilly_Auto_Parts_Logo.svg) `o-reilly-auto-parts.svg` | Title sponsor of the NASCAR O'Reilly Auto Parts Series, the second tier, from 2026 [1](https://rtrsports.com/en/blog/nascar-sponsors-list/) |
| Öhlins | SWE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Oehlins_logo.svg) `ohlins.svg` | Technical partner of Scuderia Ferrari F1 since 2022; suspension on nine of eleven MotoGP teams [1](https://ohlins.prezly.com/ohlinsr-racing-business-enters-technical-partnership-with-scuderia-ferrari-f1-team) |
| OZ Racing | ITA | Major | - | Supplied wheels for Williams' 1993 and 1996 F1 titles [1](https://www.ozracing.com/italian-company/history) |
| Recaro | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:Recaro_Logo.svg) `recaro.svg` | Sponsor of IMSA and technical partner of BMW M Motorsport from 2021 [1](https://imsa.com/partners/recaro) |
| Yuasa | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Logo_GS_Yuasa.svg) `yuasa.svg` | Title partner of Honda's works BTCC team, Team Dynamics, since 2011 [1](https://btcc.net/team-dynamics-retains-honda-backing-title-partnerships-with-halfords-and-yuasa/) |
| EBC Brakes | GBR | Specialist | - | Motorsport partner of the Caterham championships in 2025 and official partner of GT Cup in 2026 [1](https://www.ebcbrakes.com/race-motorsport-articles/ebc-brakes-racing-becomes-official-partner-of-gt-cup-for-2026-season) |
| Ferodo | GBR | Specialist | - | Brake pad partner of the Akkodis ASP team in WEC; decades of F1 winners since 1961 [1](https://www.ferodoracing.com/news/ferodo-celebrates-le-mans-podium-success-with-akkodis-asp-team) |
| H&R | DEU | Specialist | - | Technical partner of BMW Motorsport since 2010, supplying race springs [1](https://www.nuerburgring-langstrecken-serie.de/language/en/2010/03/12/hr-bmw-motorsport-a-sporting-partnership/) |
| Halfords | GBR | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Halfords_Autocentre_logo.svg) `halfords.svg` | Co-title sponsor of Team Dynamics Honda in the BTCC, as Halfords Yuasa Racing, from 2016 [1](https://btcc.net/halfords-returns-to-btcc-with-honda/) |
| Hawk Performance | USA | Specialist | - | Official Brake Products of the SCCA since 2003 [1](https://www.scca.com/articles/2019959-hawk-brake-through-performers-at-25-runoffs-in-wisconsin) |
| HKS | JPN | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:HKS_(company)_logo.png) `hks.png` | Backed teams in D1GP, JGTC, JTCC and F3; sponsored Formula Drift champion Daigo Saito [1](https://motoiq.com/hks-sponsors-championship-winning-formula-d-driver-daigo-saito) |
| Koni | NLD | Specialist | - | Presenting sponsor of SCCA Time Attack, Time Trials Nationals and Targa podiums, 2025 [1](https://www.scca.com/articles/2019449-koni-renews-support-for-scca-track-night-in-america-time-attack-and-targa-for-2025) |
| Milltek Sport | GBR | Specialist | - | Technical partner of Power Maxed Racing in the BTCC from 2018; title sponsor of the Civic Cup [1](https://powermaxedracing.com/blogs/news/180-milltek-sport-pmr-join-forces) |
| Mintex | GBR | Specialist | - | Sponsor of the MINI Challenge from 2022 and title sponsor of the British Historic Rally Championship, 2015-16 [1](https://thebrakereport.com/mintex-ups-mini-challenge-support/) |
| Pagid Racing | DEU | Specialist | - | Official partner of Porsche Motorsport North America [1](https://racing.porsche.com/en-US/motorsport-partners/pagid) |
| PIAA | JPN | Specialist | - | Official supplier to Super GT teams including Nakajima Racing and Gainer [1](https://www.piaa.com/racingteams) |
| Repco | AUS | Specialist | - | Title sponsor of the Supercars Championship and Bathurst 1000 from 2021 [1](https://www.justcars.com.au/news-and-reviews/repco-signs-on-as-supercars-naming-rights-sponsor/884078) |
| Sabelt | ITA | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Sabelt_logo.svg) `sabelt.svg` | Listed partner of the USF Pro 2000 Championship [1](https://www.usfpro2000.com/about/partners/sabelt) |
| Schroth | DEU | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Schroth-logo.svg) `schroth.svg` | Harness maker used by teams across the DTM and NASCAR [1](https://racing.herts.ac.uk/?p=2465) |
| Sonax | DEU | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Sonax_logo.svg) `sonax.svg` | Partner of the British GT Championship, Audi Sport ABT in Formula E, and Red Bull F1 [1](https://www.britishgt.com/news/724/sonax-joins-intelligent-money-british-gt-championship) |
| Tein | JPN | Specialist | - | Damper supplier behind six consecutive Super Taikyu series titles to 2012 [1](https://www.tein.co.jp/e/motorsport/2012/plan/index.html) |

## Technology - 30 brands, 19 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| AWS | USA | Global | - | Global Partner of Formula 1; GT World Challenge Powered by AWS [1](https://www.sro-motorsports.com/news/150/sro-motorsports-group-and-amazon-web-services-aws-agree-to-a-multiyear-extension-of-global-sponsorship) |
| Dell Technologies | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Dell_Technologies_logo.svg) `dell-technologies.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Google | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Google_2026_logo.svg) `google.svg` | Google Chrome and Google Cloud partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| HP | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:HP_logo_2025.svg) `hp.svg` | Title partner of Scuderia Ferrari HP, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| IBM | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:IBM_logo.svg) `ibm.svg` | Premium partner of Scuderia Ferrari, F1, 2025- [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| Lenovo | CHN | Global | [Commons](https://commons.wikimedia.org/wiki/File:Lenovo_logo_(2015_onwards)_2.svg) `lenovo.svg` | Global Partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Microsoft | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Microsoft_logo_(2012).svg) `microsoft.svg` | Principal partner of Mercedes-AMG Petronas F1, 2026- [1](https://www.sportcal.com/news/mercedes-f1-unveils-major-microsoft-tie-up-adds-nu-as-global-partner/) |
| Oracle | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Oracle_logo.svg) `oracle.svg` | Title partner of Oracle Red Bull Racing, F1 [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| AMD | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:AMD_Logo.svg) `amd.svg` | Partner of Mercedes F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| AT&T | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:AT%26T_logo_2016.svg) `at-and-t.svg` | Partner of Red Bull Racing, F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Atlassian | AUS | Major | [Commons](https://commons.wikimedia.org/wiki/File:Atlassian-logo.svg) `atlassian.svg` | Title partner of Atlassian Williams F1, 2025- [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| Bitdefender | ROU | Major | [Commons](https://commons.wikimedia.org/wiki/File:BitdefenderLogoBlue.svg) `bitdefender.svg` | Cybersecurity partner of Scuderia Ferrari, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| Cisco | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Cisco_logo_blue_2016.svg) `cisco.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Cognizant | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Cognizant_logo_2022.svg) `cognizant.svg` | Partner of Aston Martin F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| CrowdStrike | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:CrowdStrike_logo.svg) `crowdstrike.svg` | Partner of Mercedes F1; title sponsor of the 24 Hours of Spa [1](https://landing-sector4.pages.dev/insights/industry/gt-racing-sponsorships-q1-2026) |
| Qualcomm | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Qualcomm-Logo.svg) `qualcomm.svg` | Snapdragon brand is a partner of Mercedes F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Salesforce | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Salesforce.com_logo.svg) `salesforce.svg` | Global Partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Shopify | CAN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Shopify_logo_2018.svg) `shopify.svg` | Naming rights on Shopify Racing powered by TWOth, IMSA Michelin Pilot Challenge, 2026 [1](https://landing-sector4.pages.dev/insights/industry/gt-racing-sponsorships-q1-2026) |
| Tata Communications | IND | Major | [Commons](https://commons.wikimedia.org/wiki/File:Tata_Comm_logo.svg) `tata-communications.svg` | Official partner of Formula 1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| TeamViewer | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:TeamViewer_logo_new.svg) `teamviewer.svg` | Team partner of Mercedes F1, 2021-2026 [1](https://rtrsports.com/en/blog/mercedes-f1-sponsorship/) |
| AiM Sports | ITA | Specialist | - | Prize partner of Mazda's GT-3 Challenge club series, 2019-2020 [1](https://www.mazdamotorsports.com/2020/02/21/spotlight-aim-sports-supports-the-gt-3-challenge-presented-by-mpi/) |
| Asetek SimSports | DNK | Specialist | - | Branding on GetSpeed's Mercedes-AMG GT3 Evo, Nurburgring, 2022 [1](https://www.asetek.com/?p=6675) |
| Cube Controls | ITA | Specialist | - | Partner of TC Racing's F4 Spain campaign [1](https://www.cubecontrols.com/cube-controls-powers-up-tc-racings-f4-spain-and-esports-campaigns/) |
| Fanatec | DEU | Specialist | - | Title sponsor of GT World Challenge until 2024; technology partner of Black Falcon's Porsche 992 GT3 Cup [1](https://www.corsair.com/newsroom/press-release/fanatec-and-black-falcon-unite-real-world-and-sim-racing-to-field-creator-led-team-at-the-nurburgring) |
| MoTeC | AUS | Specialist | - | Preferred ECU provider of Trans Am TA2, 2023- [1](https://gotransam.com/news/Trans-Am-Series-Partners-with-MoTeC-USA/72427) |
| Next Level Racing | AUS | Specialist | - | Official cockpit partner of TC Racing, Spanish F4, 2025- [1](https://nextlevelracing.com//nl-nl/news/next-level-racing-announced-as-official-cockpit-partner-of-tc-esports-tc-racing-thibaut-courtoiss-pro-sim-racing-and-formula-4-team/) |
| Racelogic | GBR | Specialist | - | Official data and video partner of Trans Am and SVRA, 2019- [1](https://racer.com/2019/12/26/racelogic-joins-trans-am-and-svra-sponsor-roster/) |
| Riedel | DEU | Specialist | - | Radio communications partner of Scuderia Ferrari, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| Simucube | FIN | Specialist | - | Technical partner of Rodin Motorsport, 2026 [1](https://www.rodinmotorsport.com/news/rodin-motorsport-announce-technical-partnership-with-simucube) |
| Trak Racer | AUS | Specialist | - | Sim partner of the Alpine F1 Team, 2020- [1](https://www.alpinef1.com/news/trak-racer-extend-team-partnership) |

## Finance - 30 brands, 18 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| American Express | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:American_Express_logo_(2018).svg) `american-express.svg` | Official partner of Formula 1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Barclays | GBR | Global | [Commons](https://commons.wikimedia.org/wiki/File:Barclays_wordmark.svg) `barclays.svg` | Partner of Atlassian Williams F1, on the livery, 2026 [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| Goldman Sachs | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Goldman_Sachs_logo.svg) `goldman-sachs.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| HSBC | GBR | Global | [Commons](https://commons.wikimedia.org/wiki/File:HSBC_logo_(2018).svg) `hsbc.svg` | Sponsor of Stewart Grand Prix, then Jaguar Racing to 2001, F1 [1](https://raconteur.net/20-brands-that-defined-f1/) |
| Mastercard | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Mastercard_2019_logo.svg) `mastercard.svg` | Title partner of McLaren Mastercard F1 Team, 2026 [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| Santander | ESP | Global | [Commons](https://commons.wikimedia.org/wiki/File:Banco_Santander_Logotipo.svg) `santander.svg` | Official partner of Formula 1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| UBS | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:UBS_Logo.png) `ubs.png` | Partner of Mercedes F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Visa | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Visa_Inc._logo_(2021%E2%80%93present).svg) `visa.svg` | Title sponsor of Visa Cash App Racing Bulls, F1 [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| Allianz | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:Allianz.svg) `allianz.svg` | Williams F1 partner from 2000, later an F1 global partner; Formula E partner [1](https://www.allianz.com/en/press/news/commitment/sponsorship/news-2009-03-24.html) |
| Aon | IRL | Major | [Commons](https://commons.wikimedia.org/wiki/File:Aon_Corporation_logo.svg) `aon.svg` | Risk and insurance partner of Scuderia Ferrari, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| Coinbase | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Coinbase.svg) `coinbase.svg` | Partner of Aston Martin F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Crypto.com | SGP | Major | - | Official partner of Formula 1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| eToro | ISR | Major | [Commons](https://commons.wikimedia.org/wiki/File:EToro_Logo_2026.svg) `etoro.svg` | Exclusive trading and investment partner of Alpine F1, 2026 [1](https://au.motorsport.com/f1/news/alpine-2026-rebuild-gains-new-partner-as-etoro-joins-as-team-partner/10790245/) |
| ING | NLD | Major | - | Title sponsor of ING Renault F1 Team, 2008-2009 [1](https://raconteur.net/20-brands-that-defined-f1/) |
| Julius Baer | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Julius_B%C3%A4r_Logo.svg) `julius-baer.svg` | Global partner of Formula E since 2014 [1](https://www.sportcal.com/sponsorship/formula-e-founding-partner-julius-baer-in-fresh-multi-year-renewal/) |
| Kraken | USA | Major | - | Partner of Williams F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| OKX | SYC | Major | [Simple Icons](https://commons.wikimedia.org/wiki/File:OKX_logo.svg) `okx.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Revolut | GBR | Major | [Commons](https://commons.wikimedia.org/wiki/File:Revolut_logo.svg) `revolut.svg` | Title sponsor of Audi Revolut F1 Team, 2026- [1](https://rtrsports.com/en/blog/the-275-sponsorship-deals-of-the-2023-formula-1-season/) |
| Standard Chartered | GBR | Major | [Commons](https://commons.wikimedia.org/wiki/File:Standard_Chartered_(2021).svg) `standard-chartered.svg` | Official partner of Formula 1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| UniCredit | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Unicredit_logo.svg) `unicredit.svg` | Premium partner of Scuderia Ferrari, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| Adrian Flux | GBR | Specialist | - | Title sponsor of Team BMR's Subarus, BTCC, 2019; Power Maxed Racing, 2021 [1](https://www.thecheckeredflag.co.uk/2019/02/bmr-retain-subaru-and-adrian-flux-backing/) |
| Freeway Insurance | USA | Specialist | - | Primary sponsor of Daniel Suarez's No. 99, Trackhouse, NASCAR, 2022 [1](https://insurancenewsnet.com/oarticle/freeway-insurance-expands-partnership-with-trackhouse-daniel-suarez-for-2022-nascar-season) |
| Gullwing Racing Insurance | NLD | Specialist | - | Official insurance partner of GT World Challenge and SRO GT series [1](https://gt-world-challenge-europe.com/about/gullwing-racing-insurance) |
| Hagerty | USA | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Hagerty_(insurance)_logo.svg) `hagerty.svg` | Official partner of IMSA, 2020-; logo on a Porsche GT3 R at Watkins Glen [1](https://www.imsa.com/news/2025/03/27/imsa-welcomes-hagerty-as-official-partner/) |
| MultiBank Group | ARE | Specialist | - | Official sponsor of BMW M Motorsport, GT World Challenge Europe, 2020 [1](https://tradfi.multibankgroup.com/tw/about/milestones/multi-bank-group-official-partner-of-bmw-m-motorsport) |
| Price Forbes | GBR | Specialist | - | Team partner of Laser Tools Racing with MB Motorsport, BTCC, 2026 [1](https://www.markblundellmotorsport.com/news/laser-tools-racing-with-mb-motorsport-joins-forces-with-price-forbes) |
| RCIB Insurance | GBR | Specialist | - | Title sponsor of AmDtuning.com's MGs, BTCC, 2018 [1](https://btcc.net/rcib-insurance-autoaid-teams-with-amdtuning-com-for-2018-btcc-season/) |
| Shannons | AUS | Specialist | - | Backer of Liam Talbot, GT World Challenge Australia, 2025 [1](https://www.gt-world-challenge-australia.com/news/368/shannons-re-ignites-partnership-with-liam-talbot-for-2025-gt-world-challenge-australia-season) |
| Sterling Insurance | GBR | Specialist | - | Title partner of Power Maxed Racing's Vauxhalls, BTCC, 2019 [1](https://btcc.net/pmr-announces-sterling-insurance-as-title-partner-expanded-relationship-with-vauxhall/) |
| VKB | AUT | Specialist | - | Upper Austrian bank backing DTM champion Thomas Preining, 2023-2026 [1](https://www.weekend.at/chefinfo/vkb-partnerschaft-mit-dtm-pilot-preining-verlaengert) |

## Travel and logistics - 30 brands, 19 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| DHL | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:DHL_Logo.svg) `dhl.svg` | Global Partner and official logistics partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Emirates | ARE | Global | [Commons](https://commons.wikimedia.org/wiki/File:Emirates_banner_logo.svg) `emirates.svg` | Global Partner of Formula 1, 2013-2022 [1](https://www.formula1.com/en/latest/article.formula-1-and-emirates-renew-global-partnership.4WQ8fnFTheAAa4WkEyUyKE.html) |
| Etihad | ARE | Global | [Commons](https://commons.wikimedia.org/wiki/File:Etihad-airways-logo.svg) `etihad.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| FedEx | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:FedEx_Corporation_-_2016_Logo.svg) `fedex.svg` | Primary sponsor of Denny Hamlin's No. 11 Toyota, Joe Gibbs Racing, NASCAR, 2005-2024 [1](https://www.jayski.com/2024/11/11/end-of-an-era-denny-hamlin-reflects-on-20-seasons-with-fedex-sponsorship/) |
| Hilton | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Hilton_Worldwide_logo.svg) `hilton.svg` | Partner of McLaren F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| Marriott | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Marriott_International.svg) `marriott.svg` | Marriott Bonvoy and The Ritz-Carlton partners of Mercedes F1 [1](https://www.hospitalitynet.org/news/4093732.html) |
| Qatar Airways | QAT | Global | [Commons](https://commons.wikimedia.org/wiki/File:Qatar_Airways_logo.svg) `qatar-airways.svg` | Global Partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| UPS | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:United_Parcel_Service_logo_2014.svg) `ups.svg` | UPS Japan sponsors Team Taisan, Super GT, 2010- [1](https://www.racecar.com/news/50719/motorsport/ups-japan-extends-with-super-gt-team) |
| Airbnb | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Airbnb_Logo_B%C3%A9lo.svg) `airbnb.svg` | Title sponsor of the IMSA Airbnb Endurance Challenge, VP Racing SportsCar Challenge, 2026 [1](https://landing-sector4.pages.dev/insights/industry/gt-racing-sponsorships-q1-2026) |
| Atlas Air | USA | Major | - | Official logistics partner of Aston Martin F1, 2025- [1](https://www.aviacionline.com/atlas-air-worldwide-becomes-official-logistics-partner-of-aston-martin-aramco-formula-one-team) |
| CEVA Logistics | FRA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Logo_of_CEVA_Logistics_(2023).svg) `ceva-logistics.svg` | Premium partner of Scuderia Ferrari HP and Ferrari Hypercar [1](https://www.ajot.com/news/ceva-logistics-becomes-premium-partner-of-scuderia-ferrari-hp-and-ferrari-hypercar) |
| DP World | ARE | Major | [Commons](https://commons.wikimedia.org/wiki/File:DP_World_2021_logo.svg) `dp-world.svg` | Title sponsor of Renault DP World F1 Team, 2020 [1](https://www.seatrade-maritime.com/ports-logistics/dp-world-becomes-renault-f1-global-logistics-partner-and-title-sponsor) |
| Hyatt | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Hyatt_Logo.svg) `hyatt.svg` | Official hospitality partner of Audi Revolut F1, 2026 [1](https://www.loeb.com/en/experience/represented-hyatt-in-its-official-hospitality-partnership-with-audi-revolut-formula-1-team) |
| IHG | GBR | Major | [Commons](https://commons.wikimedia.org/wiki/File:IHG_Hotels_%26_Resorts_logo.svg) `ihg.svg` | Preferred hotel partner of Ford Chip Ganassi Racing, WEC, 2016 [1](https://www.conceptcarz.com/vehicle/z14845/a26610/view/motorsportsNews.aspx) |
| J.B. Hunt | USA | Major | - | Sponsor of Richard Petty Motorsports' No. 9 Ford, NASCAR, 2015-2016 [1](https://speedwaydigest.com/index.php/news/nascar-cup-series-news/27132-richard-petty-motorsports-gets-on-board-with-j-b-hunt-transport/) |
| Jumeirah | ARE | Major | - | Partner of Williams Racing, F1 [1](https://www.williamsf1.com/posts/b6421ef3-3e47-4a90-91b3-b90226b8a999/williams-racing-renews-ties-with-jumeirah-hotels-and-resorts) |
| Kuehne+Nagel | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:K%C3%BChne_%2B_Nagel_logo.svg) `kuehne-plus-nagel.svg` | Partner of ADAC GT Masters, expanded 2022 [1](https://www.adac-motorsport.de/en/adac-gt-masters/news/2022/adac-gt-masters-and-kuehne-and-nagel-expand-partnership/) |
| MSC Cruises | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:MSC_Cruises_Logo.png) `msc-cruises.png` | Global Partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Virgin Australia | AUS | Major | - | Naming rights sponsor of the Virgin Australia Supercars Championship, 2016- [1](https://airlinegeeks.com/2016/04/26/virgin-australia-becomes-naming-rights-sponsor-of-v8-supercars/) |
| VistaJet | MLT | Major | [Commons](https://commons.wikimedia.org/wiki/File:VistaJet_logo.svg) `vistajet.svg` | Private aviation partner of Scuderia Ferrari, F1 [1](https://rtrsports.com/en/blog/ferrari-formula-1-sponsor/) |
| DC Aviation | DEU | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Logo_DC-Aviation.svg) `dc-aviation.svg` | Sponsor of SSR Performance, DTM [1](https://www.evaint.com/dc-aviation-is-new-sponsor-of-dtm-team-ssr-performance/) |
| Eddie Stobart | GBR | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Eddie_Stobart_logo.png) `eddie-stobart.png` | Title sponsor of Stobart M-Sport Ford Rally Team, WRC, 2006-2012 [1](https://en.wikipedia.org/wiki/Stobart_Motorsport) |
| Hahn Air | DEU | Specialist | - | Partner of Racing Bulls, F1, 2026 [1](https://www.pitdebrief.com/?p=99203) |
| John West Logistics | AUS | Specialist | - | Major sponsor of Brad Jones Racing's Fullwood car, Supercars, Ipswich [1](https://www.bradjonesracing.com.au/news/john-west-logistics-expands-partnership-with-bjr-for-ipswich-super-440) |
| Landgraf | DEU | Specialist | - | Logistics group running Landgraf Motorsport's Mercedes-AMG GT3 Evo [1](https://www.mercedes-benz-trucks.com/en_GB/transport-magazine/landgraf.html) |
| Linx Cargo Care | AUS | Specialist | - | Partner of the Supercars Championship [1](https://www.supercars.com/news/supercars-partners-with-linx-cargo-care-group) |
| Metro Supply Chain | CAN | Specialist | - | Official partner of Lando Norris's LN4 Fusion junior team, 2026 [1](https://www.webull.com/news/15514328626439168) |
| Samedaylogistics | DEU | Specialist | - | Sponsor of W&S Motorsport's Porsches, expanded 2023 [1](https://ws-motorsport.de/en/news/ws-motorsport-and-samedaylogistics-expand-their-partnership) |
| Sentrim Hotels | KEN | Specialist | - | Backer of Darren Leung at Paradine Competition, WEC [1](https://citizen.digital/article/darren-leung-returns-to-wec-with-sentrim-backing-n390414) |
| Stena Line | SWE | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Stena_line_logo.svg) `stena-line.svg` | Title sponsor of Masters Historic Racing's Gentlemen Drivers series, 2016 [1](https://www.historicracingnews.com/Article/Stena-Line-to-Sponsor-Masters-GT-Series/447) |

## Drinks - 34 brands, 12 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Budweiser | USA | Global | - | BMW WilliamsF1 Team sponsor; long-running NASCAR backer [1](https://www.press.bmwgroup.com/usa/article/detail/T0020636EN_US/budweiser-sponsors-bmw-williamsf1-team) |
| Coca-Cola | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Coca-Cola_logo.svg) `coca-cola.svg` | NASCAR official soft drink and the Coca-Cola Racing Family of drivers, renewed 2026 [1](https://www.nascar.com/news-media/2026/02/12/nascar-coca-cola-north-america-extend-longstanding-partnership-bodyarmor-named-official-sports-drink-of-nascar/amp/) |
| Heineken | NLD | Global | [Commons](https://commons.wikimedia.org/wiki/File:Heineken_logo.svg) `heineken.svg` | Global Partner of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Johnnie Walker | SCT | Global | [Commons](https://commons.wikimedia.org/wiki/File:Johnnie_Walker_wordmark.svg) `johnnie-walker.svg` | McLaren partner from 2005, Official Whisky of Formula 1 from 2014 [1](https://www.formula1.com/en/latest/article/johnnie-walker-becomes-the-official-whisky-of-formula-1.3eX51MyGzSzKsJkHDzBv8d) |
| Martini | ITA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Martini_Logo.svg) `martini.svg` | Martini Racing liveries; iconic Williams F1 partner [1](https://rtrsports.com/pt-pt/blog/alcohol-motor-sports-sponsorships/) |
| Monster Energy | USA | Global | - | McLaren F1 partner from 2024 after 14 seasons with Mercedes [1](https://www.mclaren.com/racing/partners/monster-energy/) |
| Pepsi | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Pepsi_2023.svg) `pepsi.svg` | Jeff Gordon's No. 24 Hendrick Chevrolet carried Pepsi in the 2000s [1](https://www.essentiallysports.com/nascar-news-perspective-how-marketing-marvel-pepsi-got-forced-out-of-nascar-by-coca-cola-despite-jeff-gordons-unwavering-loyalty/) |
| Red Bull | AUT | Global | [Commons](https://commons.wikimedia.org/wiki/File:Logo_of_Red_bull.svg) `red-bull.svg` | Owner and name of Oracle Red Bull Racing in F1; Mugen Red Bull Super GT livery 2020 [1](https://rtrsports.com/en/blog/red-bull-racing-f1-sponsors/) |
| Asahi | JPN | Major | [Commons](https://commons.wikimedia.org/wiki/File:Asahi_logo.svg) `asahi.svg` | Dry Zero is Super GT series sponsor; backed four GT500 entries in 2025 [1](https://gourmet.watch.impress.co.jp/docs/news/2012331.html) |
| Bacardi | BMU | Major | - | Oracle Red Bull Racing partner, with Grey Goose and Bombay Sapphire [1](https://drinks-intel.com/news/bacardi-teams-up-with-oracle-red-bull-racing-in-formula-one/) |
| Busch Light | USA | Major | - | Official Beer of NASCAR; primary sponsor of Ross Chastain's No. 1 Trackhouse car [1](https://speedsport.com/nascar/nascar-cup-series/busch-light-continues-as-official-beer-of-nascar/) |
| Celsius | USA | Major | - | Scuderia Ferrari official energy drink; Kaulig Racing NASCAR sponsor since 2016 [1](https://www.motorsport.com/f1/news/ferrari-energy-drink-f1-sponsor-hamilton-era/10574049/) |
| Coors Light | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Coors_Light_logo.svg) `coors-light.svg` | NASCAR official beer 2008-2017; 14 years on the No. 40 car [1](https://www.mediapost.com/publications/article/68137/nascar-signs-coors-light-as-exclusive-beer-sponsor.html?edition=) |
| Ferrari Trento | ITA | Major | - | Official Toast of Formula 1 2021-2024; W Series sparkling wine partner [1](https://www.formula1.com/en/latest/article/ferrari-trento-named-official-toast-of-formula-1-ahead-of-2021-season.405qQwqTw4mD2PXmg7I9ae) |
| Jack Daniel's | USA | Major | - | Jack Daniel's Racing: major sponsor of Kelly Racing and Nissan Motorsport V8 Supercars, 2009-14 [1](https://www.supercars.com/news/jack-daniel-s-racing-celebrates-10-years-at-sydney-com-supertest) |
| Jägermeister | DEU | Major | - | Orange Jägermeister racing cars from 1972 to 2000, Porsche and DTM [1](https://www.mast-jaegermeister.de/en/brand-markets/jaegermeister-story/motor-racing/) |
| Jim Beam | USA | Major | - | Jim Beam Racing, Dick Johnson Racing; Supercars dark spirits partner 2019-21 [1](https://ministryofsport.com/jim-beam-back-on-board-with-supercars-after-3-year-hiatus/) |
| Kingfisher | IND | Major | [Commons](https://commons.wikimedia.org/wiki/File:Kingfisher_logo.svg) `kingfisher.svg` | On the Sahara Force India F1 cars under Vijay Mallya [1](https://app.sponsorpitch.com/deals/kingfisher-beer-sponsors-force-india-f1) |
| Lavazza | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Lavazza_-_logo_(Italy,_1995).svg) `lavazza.svg` | Official Team Partner of Williams 2020; Australian GP coffee partner 2023 [1](https://www.williamsf1.com/articles/c9cd49df-6917-47a7-9a38-694398ebe093/williams-racing-announces-new-partnership-with-lavazza) |
| Miller Lite | USA | Major | - | Team Penske NASCAR primary sponsor [1](https://www.teampenske.com/news/index.cfm/c/605/50931/Miller_Extends_Partnership_with_NASCAR,_Penske_Racing) |
| Moët & Chandon | FRA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Logo_Mo%C3%ABt_%26_Chandon.svg) `moet-and-chandon.svg` | Moët Hennessy Official Partner of Formula 1; Chandon with McLaren [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Patrón | MEX | Major | - | Tequila Patrón ESM in ALMS and IMSA to 2018 [1](https://www.autosport.com/imsa/news/esm-working-on-scenarios-to-stay-in-imsa-after-sponsor-patrons-exit-5297614/5297614/) |
| Peroni | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:LOGO_PERONI_CORPORATE_RGB.png) `peroni.png` | Peroni Libera 0.0% multi-year deal on the Aston Martin Cognizant F1 car, 2021 [1](https://www.astonmartinf1.com/en-GB/articles/peroni-libera-0-0-joins-aston-martin-cognizant-formula-one-team-in-multi) |
| Singha | THA | Major | - | Ferrari partner to 2017; TP12 Ferrari 458 in GT Asia; MotoGP official partner [1](https://mitorosso.com/singha-and-ferrari-together-until-2017/) |
| ABK Beer | DEU | Specialist | - | Laser Tools Racing with MB Motorsport, Jake Hill's BTCC BMW 2023 [1](https://markblundellmotorsport.com/news/abk-beer-team-up-with-laser-tools-racing-with-mb-motorsport-for-btcc-title-charge) |
| Beforeyouspeak | AUS | Specialist | - | Exclusive coffee provider to the Alpine F1 Team, 2025 [1](https://www.alpinef1.com/partners/team-supplier-beforeyouspeak-coffee) |
| Coopers | AUS | Specialist | - | Supercars official beer, cider and non-alcoholic partner 2025-27 [1](https://www.supercars.com/news/coopers-supercars-partnership-2025-news-extension) |
| Drowned Valley Brewing | USA | Specialist | - | Sponsored Mike Harmon Racing in NASCAR at EchoPark Speedway 2026 [1](https://www.jayski.com/2026/02/17/drowned-valley-brewing-company-sponsoring-mike-harmon-racing-at-echopark-speedway/) |
| Krombacher | DEU | Specialist | - | Pils 0,0% backed Team HARD in the BTCC, 2022 and 2023 [1](https://www.beerguild.co.uk/?p=98459) |
| Momentum Brewery | USA | Specialist | - | Race Brew 0.0% pole award with PT Autosport, Porsche Carrera Cup North America 2026 [1](https://sundaymanagement.com/index.php/2026/03/10/race-brew-0-0-returns-as-porsche-carrera-cup-na-pole-award-sponsor/) |
| Rooster Rojo | MEX | Specialist | - | J2 Racing Mercedes-AMG GT3, Nürburgring 24 Hours 2019 [1](https://www.thespiritsbusiness.com/?p=721261) |
| Vellamo | FIN | Specialist | - | Official hydration partner of TGR Haas F1 Team, from 2025 [1](https://haasf1team.com/news/tgr-haas-f1-team-and-vellamo-extend-partnership-multi-year-collaboration) |
| Veltins | DEU | Specialist | - | VELTINS-Lechner-Racing in the Porsche Mobil 1 Supercup; motorsport backer since 1997 [1](https://porsche.com/uk/motorsportandevents/motorsport/generalinformation/partner-veltins) |
| Warsteiner | DEU | Specialist | - | Sponsor of Audi Sport Team Abt in the DTM [1](https://app.sponsorpitch.com/deals/warsteiner-sponsors-audi-sport-abt) |

## Watches - 29 brands, 19 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Breitling | CHE | Global | - | Official Watch Partner of Aston Martin Aramco F1 Team, 2026 [1](https://pe-insights.com/private-equity-backed-breitling-makes-formula-one-debut-with-aston-martin-partnership/) |
| Hublot | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:Hublot_logo.svg) `hublot.svg` | Ferrari's official timekeeper and watch partner from 2011 [1](https://www.watchonista.com/editorial/in-depth/the-watch-brands-spending-millions-in-formula-1/) |
| IWC | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:International_Watch_Company_logo.svg) `iwc.svg` | Official watch partner of Mercedes-AMG Petronas F1, 2026 [1](https://oracleoftime.com/f1-2026-every-drivers-watch-team-partnership/) |
| Richard Mille | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:Richard_Mille_Logo.svg) `richard-mille.svg` | Watch partner of McLaren and Ferrari in F1, 2026 [1](https://oracleoftime.com/f1-2026-every-drivers-watch-team-partnership/) |
| Rolex | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:Logo_da_Rolex.png) `rolex.png` | Title sponsor of the Rolex 24 at Daytona; F1 official timekeeper 2013-2024 [1](https://www.tatlerasia.com/style/watches/rolex-endurance-racing-motorsport-le-mans) |
| TAG Heuer | CHE | Global | [Commons](https://commons.wikimedia.org/wiki/File:TAG_Heuer_logo.svg) `tag-heuer.svg` | Official Timekeeper of Formula 1 since 2025; Oracle Red Bull Racing partner [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Bell & Ross | FRA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Bellross_logo.svg) `bell-and-ross.svg` | Official watch partner of Renault's F1 team from 2016 [1](https://www.gptoday.net/en/news/f1/237354/renault-extends-partnership-with-bell-ross) |
| Blancpain | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Blancpain_logo.svg) `blancpain.svg` | Title partner of the Blancpain GT Series and official timer of FIA GT1 [1](https://www.sportbusiness.com/news/blancpain-the-official-timer-for-new-gt1-championship/) |
| Casio Edifice | JPN | Major | - | Official F1 partner of Toro Rosso and AlphaTauri from 2016; TOM'S and NISMO collaborations [1](https://www.casio.com/my/watches/edifice/partners/f1) |
| Certina | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Certina_wordmark_logo.svg) `certina.svg` | WRC official timekeeper from 2013; GT4 European Series partner [1](https://speed-live.it/?p=56227) |
| Chopard | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Logo_Chopard.svg) `chopard.svg` | World sponsor and official timekeeper of the Mille Miglia since 1988 [1](https://luxe.outlookindia.com/watches-jewellery/watches/chopard-returns-as-official-timekeeper-for-mille-miglia-2025) |
| Girard-Perregaux | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Girard-Perregaux_logo.svg) `girard-perregaux.svg` | Official watch partner of Williams F1 from 2026, Aston Martin 2021-25 [1](https://www.motorsport.com/f1/news/williams-announces-multi-year-girard-perregaux-partnership-ahead-of-2026-f1-season/10798959/) |
| H. Moser & Cie | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:H._Moser_%26_Cie_Logo.svg) `h-moser-and-cie.svg` | Global watch partner of the Alpine F1 Team, 2026 [1](https://oracleoftime.com/f1-2026-every-drivers-watch-team-partnership/) |
| Longines | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Longines_wordmark_logo.svg) `longines.svg` | Scuderia Ferrari official timekeeper 1980-1987 [1](https://timeandtidewatches.com/ferrari-watch-collaborations/) |
| Oris | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Oris_logo.svg) `oris.svg` | 18-year partnership with the Williams F1 team, from 2003 [1](https://www.motorsportmagazine.com/archive/article/august-2022/46/bremonts-williams-f1-watch) |
| Roger Dubuis | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Roger_Dubuis_Logo.svg) `roger-dubuis.svg` | Lamborghini Squadra Corse partner since 2017, Super Trofeo sponsor [1](https://www.rogerdubuis.com/our-world/motorsport/lamborghini-squadra-corse) |
| Tudor | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Tudor_(Uhrenmarke)_logo.svg) `tudor.svg` | Watch partner of the Racing Bulls F1 team, 2026 [1](https://oracleoftime.com/f1-2026-every-drivers-watch-team-partnership/) |
| Zenith | CHE | Major | [Commons](https://commons.wikimedia.org/wiki/File:Zenith_logo.svg) `zenith.svg` | Official timekeeper of the Tour Auto Optic 2000 from 2015 [1](https://www.luxuo.com/motoring/automobile/tour-auto-optic-2000-classic-cars-zenith-watches.html) |
| B.R.M Chronographes | FRA | Specialist | - | Official timekeeper of the GT4 European Series and FFSA GT [1](https://www.gt4europeanseries.com/news/290/new-official-timekeeper-b.r.m-chronographes) |
| Bomberg | CHE | Specialist | - | Official Timing Partner of the 24H Series, Middle East and Europe [1](https://bombergwatches.com/blogs/bomberg-in-the-pits/from-asia-to-europe-bomberg-expands-as-official-timing-partner-of-the-24h-series) |
| Bremont | GBR | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Bremont_Logo.svg) `bremont.svg` | Official Timing and Watch Partner of Williams Racing, 2021 [1](https://www.jurawatches.co.uk/blogs/watch-news/bremont-becomes-the-official-timing-and-watch-partner-for-williams-racing) |
| Desder | ITA | Specialist | - | Presenting partner of GT World Challenge at Monza [1](https://api.gt-world-challenge-europe.com/news/3214/desder-named-presenting-partner-of-gt-world-at-monza-exclusive-italian-watchmaker-unveils-desder-001) |
| Edox | CHE | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Edox_logo.svg) `edox.svg` | Official Timing Partner of BMW M Motorsport 2021: BMW Junior Team, M2 Cup, Nürburgring 24h [1](https://masterhorologer.com/2021/10/26/edox-swiss-watches-becomes-the-official-timing-partner-of-bmw-m-motorsport/) |
| Eterna | CHE | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Eterna-logo.gif) `eterna.png` | Timing partner of Alegra Motorsports, GTD winner at the 2017 Rolex 24 [1](https://en.worldtempus.com/article/eterna-timing-partner-of-the-gtd-class-winner-at-daytona-23463.html) |
| Oceaneva | USA | Specialist | - | Backs Derek Ware Racing in Lamborghini Super Trofeo North America, 2026 [1](https://oceaneva.com/blogs/oceaneva-news/oceaneva-dwr-lamborghini-super-trofeo) |
| Omologato | GBR | Specialist | - | Official Timing Partner of the 24H Series 2025; official watch of Watkins Glen [1](https://www.24hseries.com/news/omologato-named-official-timing-partner-of-the-24h-series-in-multi-year-deal) |
| Rebellion Timepieces | CHE | Specialist | - | Official timekeeper of GT World Challenge and partner of British GT [1](https://www.britishgt.com/news/806/intelligent-money-british-gt-championship-partners-with-rebellion-timepieces) |
| Tesouro | GBR | Specialist | - | Official Timing Partner of the Britcar Endurance Championship, 2025 [1](https://www.britcar-endurance.com/tesouro-becomes-official-timing-partner/) |
| TW Steel | NLD | Specialist | - | Official watch partner of Sahara Force India F1 from 2013, after Renault and Lotus [1](https://www.motorsportmagazine.com/archive/article/july-2013/101/timing-everything/) |

## Car dealers - 29 brands, 10 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| Avis | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Avis_logo.svg) `avis.svg` | Official vehicle rental partner of the FIA WEC and Le Mans, 2023-24 [1](https://www.24h-lemans.com/en/news/avis-budget-group-announces-new-partnership-with-fia-wec-and-24-hours-of-le-mans-57216) |
| Carvana | USA | Global | - | Primary sponsor of Jimmie Johnson's No. 48 Chip Ganassi IndyCar, 2021 [1](https://www.indycar.com/news/2020/10/10-24-johnson-ganassi-carvanna) |
| Europcar | FRA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Europcar-Logo.svg) `europcar.svg` | Sponsored the Renault F1 team and the Paris-Dakar [1](https://en.wikipedia.org/wiki/Europcar) |
| Hertz | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Hertz_Car_Rental_logo.svg) `hertz.svg` | Title sponsor of Cadillac Hertz Team JOTA in the WEC; Hendrick NASCAR primary sponsor [1](https://www.thedrive.com/news/why-hertz-is-getting-back-into-racing) |
| Autohero | DEU | Major | - | DTM series partner from 2021, on every car's windscreen banner [1](https://techprincess.it/autohero-main-partner-campionato-dtm/) |
| AutoNation | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:AutoNation_logo.svg) `autonation.svg` | Andretti IndyCar partner from 2013, on Alonso's McLaren-Honda at the 2017 Indy 500 [1](https://andrettiglobal.com/?p=1710) |
| Autotrader | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Autotrader_logo.svg) `autotrader.svg` | Sponsor of Joey Logano's No. 22 Team Penske Ford, NASCAR Cup from 2014 [1](https://www.conceptcarz.com/a6087/autotradercom-joins-team-penske-as-sponsor.aspx) |
| CarGurus | USA | Major | - | Presenting partner and official automotive marketplace of the NASCAR Canada Series [1](https://www.autoremarketing.com/?p=100901) |
| Carwow | GBR | Major | - | Sponsor of Porsche Carrera Cup Great Britain [1](https://racing.porsche.com/en-GB/carrera-cup-great-britain/partners) |
| cinch | GBR | Major | - | BTCC team sponsorship [1](https://cardealermagazine.co.uk/cinch-announces-btcc-team-sponsorship/187938) |
| EchoPark | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Sonic_Automotive_logo.png) `echopark.png` | Naming rights to Atlanta Motor Speedway, now EchoPark Speedway, from 2025 [1](https://www.blackbookmotorsport.com/news/atlanta-motor-speedway-echopark-naming-rights-nascar-june-2025/) |
| Emil Frey | CHE | Major | - | Dealer group's own Emil Frey Racing, Ferrari 296 GT3 in GT World Challenge Europe [1](https://gt-world-challenge-europe.com/team/687/emil-frey-racing) |
| HendrickCars.com | USA | Major | - | Majority sponsor of Kyle Larson's No. 5 Hendrick Motorsports car [1](https://speedwaymedia.com/?p=320360) |
| Lithia | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Lithia_Motors_logo.svg) `lithia.svg` | Lithia & Driveway primary sponsor of Pfaff Motorsports in IMSA, 2026 [1](https://lithiadriveway.com/featured/2026-pfaff-motorsports-sponsorship) |
| Sixt | DEU | Major | [Commons](https://commons.wikimedia.org/wiki/File:Sixt_Logo_2023.svg) `sixt.svg` | Title partner of the Porsche SIXT Carrera Cup Deutschland from 2024 [1](https://newsroom.porsche.com/en/2024/motorsports/porsche-carrera-cup-deutschland-sixt-partnership-35619.html) |
| Thrifty | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Thrifty-Rent-A-Car-Logo.svg) `thrifty.svg` | Official rental partner of Supercars since 2023; Bathurst 500 and Newcastle 500 naming rights [1](https://www.supercars.com/news/supercars-news-2026-thrifty-official-car-rental-partner-partnerships) |
| Vertu | GBR | Major | - | Multi-year partner of EXCELR8 in the BTCC from 2026, after Bristol Street Motors' title deal [1](https://btcc.net/?p=108016) |
| AMT Auto | GBR | Specialist | - | Sponsored Bobby Thompson in the BTCC from 2019 [1](https://amtauto.co.uk/news/amt-partners-british-touring-car-championship-bobby-thompson) |
| Arnold Clark | SCT | Specialist | [Commons](https://commons.wikimedia.org/wiki/File:Arnold_Clark_Logo.svg) `arnold-clark.svg` | Arnold Clark Autoparts backed stock car racer Holly Glen, 2022 [1](https://iaaf.co.uk/news/arnold-clark-autoparts-partners-with-stock-car-racer) |
| BCMC Group | DEU | Specialist | - | Premium car broker partnering Walkenhorst Motorsport [1](https://walkenhorst-motorsport.de/en/bcmc-group-a-strong-partner-of-walkenhorst-motorsport/) |
| Bommarito | USA | Specialist | - | Title sponsor of the Bommarito 500 IndyCar race at Gateway since 2017 [1](https://www.indycar.com/news/2019/02/02-06-voices-olson) |
| Carsome | MYS | Specialist | - | Backed an Audi R8 LMS Evo in the Thailand Super Series, 2021 [1](https://www.carsome.my/news/wp-json/wp/v2/posts/22234) |
| Evans Halshaw | GBR | Specialist | - | Pendragon's chain partnered Power Maxed Racing in the BTCC [1](https://www.evanshalshaw.com/about-us/btcc/) |
| Hendy Group | GBR | Specialist | - | Backed Árón Taylor-Smith's Team HARD Cupra Leon in the BTCC, 2021 [1](https://www.hendy.co.uk/news/hendy-group-accelerates-motorsport-support-with-sponsorship-of-british-touring-car) |
| John Clark | SCT | Specialist | - | Sponsors Gordon Shedden in the BTCC 2025-26 and British GT champion Jonny Adam [1](https://www.john-clark.co.uk/about-us/sponsorship/gordon-shedden/john-clark-motor-group-sponsors-gordon-shedden/) |
| LeithCars.com | USA | Specialist | - | Official dealership partner of Virginia International Raceway [1](https://autoremarketing.com/?p=59808) |
| MotorMall | AUS | Specialist | - | Naming rights to Wanneroo Raceway, a Supercars venue, from December 2025 [1](https://speedcafe.com/motorsport-news-2025-wanneroo-raceway-new-naming-rights-sponsor-motormall-carco-update-western-australia-wa/) |
| Neil Buckby Motors | AUS | Specialist | - | Bonnet sponsor on Erebus Motorsport's Supercars [1](https://speedcafe.com/erebus-inks-new-sponsorship-deals/) |
| Zeigler | USA | Specialist | - | Backs Carson Hocevar at Spire Motorsports, NASCAR Cup 2026 [1](https://speedwaymedia.com/?p=317866) |

## Clothing - 30 brands, 15 with a logo

| Brand | Nation | Stature | Logo | Evidence |
| --- | --- | --- | --- | --- |
| adidas | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Adidas_2022_logo.svg) `adidas.svg` | Official apparel partner of the Audi F1 Team, 2026 [1](https://www.audi.com/en/media-releases/four-rings-and-three-stripes-adidas-becomes-official-partner-of-the-future-audi-formula-1-team-16854?set_locale=true) |
| Alpinestars | ITA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Alpinestars_Logo.svg) `alpinestars.svg` | McLaren F1's technical racewear supplier; Lamborghini Squadra Corse partner [1](https://www.lamborghini.com/es-en/noticias/lamborghini-squadra-corse-wears-alpinestars) |
| Hugo Boss | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Hugo_Boss_logo_2021.svg) `hugo-boss.svg` | Over 30 years with McLaren, then Mercedes and Aston Martin F1 [1](https://www.autosport.com/f1/news/mclaren-extends-hugo-boss-deal-4438538/4438538/) |
| Louis Vuitton | FRA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Louis_Vuitton_logo.svg) `louis-vuitton.svg` | Official Partner of Formula 1, makes the podium trophy trunks [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Puma | DEU | Global | [Commons](https://commons.wikimedia.org/wiki/File:Puma-logo-(text).svg) `puma.svg` | McLaren official kit partner from 2026; Official Provider of Formula 1 [1](https://rtrsports.com/en/blog/formula-1-sponsors-and-partners/) |
| Tommy Hilfiger | USA | Global | [Commons](https://commons.wikimedia.org/wiki/File:Tommy_hilfig_vectorlogo.svg) `tommy-hilfiger.svg` | Official apparel partner of Cadillac F1 from 2026; Ferrari teamwear in the 1990s [1](https://www.autosport.com/f1/news/cadillac-names-tommy-hilfiger-as-its-first-official-f1-team-partner-for-2026/10729425/) |
| Carrera | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Logo_carrera.svg) `carrera.svg` | Safilo eyewear brand, multi-year Alfa Romeo Sauber F1 sponsor [1](https://www.yahoo.com/lifestyle/formula-1-eyewear-golden-ticket-040200440.html) |
| Castore | GBR | Major | - | TGR Haas F1 official kit partner 2026; Alpine and McLaren kit before [1](https://haasf1team.com/news/tgr-haas-f1-team-announces-castore-official-kit-and-retail-partner) |
| Delsey | FRA | Major | - | Luggage partner of the Alfa Romeo F1 Team [1](https://thepaddockmagazine.com/?p=12960) |
| Kappa | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Kappa_logo.svg) `kappa.svg` | Alpine F1 and Virgin Racing teamwear supplier [1](https://www.thenationalnews.com/lifestyle/fashion-beauty/2026/03/27/grid-fashion-which-f1-team-makes-the-most-stylish-clothes) |
| Maui Jim | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Maui_Jim_logo.svg) `maui-jim.svg` | Official sunglasses partner of Oracle Red Bull Racing; Haas from 2021 [1](https://manofmany.com/auto/maui-jim-teams-up-with-oracle-red-bull-racing-to-forge-the-future-of-f1) |
| New Era | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:New_Era_Cap.png) `new-era.png` | Williams official teamwear partner 2026 [1](https://speedcafe.com/f1-news-2026-williams-mclaren-apparel-wear-teamwear-new-updated-puma-new-era/) |
| Oakley | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Oakley_logo.svg) `oakley.svg` | Aston Martin F1 technical partner from 2021; Scuderia Ferrari eyewear from 2014 [1](https://astonmartinf1.com/en-GB/partner/oakley) |
| OMP | ITA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Omp_racing_logo.png) `omp.png` | Official racewear supplier to Aston Martin F1 from 2024 and Team Penske [1](https://www.astonmartinf1.com/en-GB/news/announcement/omp-becomes-official-racewear-supplier-to-aston-martin-aramco) |
| Piquadro | ITA | Major | - | Official luggage partner of Audi F1 2026, Racing Bulls 2024-25 [1](https://contenthub.audif1.com/en/releases/audi-revolut-f1-team-announces-piquadro-as-official-luxury-luggage-partner-71) |
| Ray-Ban | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Ray-Ban_logo_2.svg) `ray-ban.svg` | Key sponsor of Scuderia Ferrari, signed 2016 [1](https://www.yahoo.com/lifestyle/formula-1-eyewear-golden-ticket-040200440.html) |
| Simpson | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Simpson_performance_logo.png) `simpson.png` | Outfits the AMR IndyCar Safety Team 2025; ASA STARS safety sponsor [1](https://www.performanceracing.com/magazine/industry-news/04-04-2025/simpson-outfit-amr-indycar-safety-team-2025) |
| Sparco | ITA | Major | - | Official racewear supplier of Williams F1 from 2026; Haupt Racing Team partner [1](https://www.williamsf1.com/articles/e6f0bf47-67cd-4f33-bb57-7f14940c26c1/sparco-atlassian-williams-f1-team-official-racewear-and-technical-apparel-supplier) |
| Stand 21 | FRA | Major | - | Porsche Motorsport's worldwide racewear licence; Ligier European Series official partner [1](https://ligiereuropeanseries.com/stand-21-official-partner-of-the-ligier-european-series/) |
| Wrangler | USA | Major | [Commons](https://commons.wikimedia.org/wiki/File:Wrangler_Logo.svg) `wrangler.svg` | Wrangler Riggs primary sponsor of Ryan Blaney's No. 12 Team Penske Ford, 2018-20 [1](https://www.nascar.com/news-media/2018/10/15/vf-workwear-team-penske-announce-partnership/) |
| 5.11 Tactical | USA | Specialist | - | Technical apparel partner of GT World Challenge America [1](https://www.gt-world-challenge-america.com/news/896/5.11-tactical-renews-as-technical-apparel-partner-and-becomes-presenting-partner-of-gt-americas-long-beach-race-weekend) |
| Carl Friedrik | GBR | Specialist | - | Luggage licensing deal with Williams F1, February 2025 [1](https://www.theindustry.fashion/carl-friedrik-revs-up-performance-travel-offer-with-williams-racing-partnership/) |
| Globe-Trotter | GBR | Specialist | - | Global luxury luggage partner of the Aston Martin F1 Team [1](https://www.astonmartinf1.com/en-GB/news/announcement/amf1-announces-partnership-with-luxury-british-luggage-brand-globe-trotter) |
| ic! berlin | DEU | Specialist | - | Official Eyewear Partner of the Audi Revolut F1 Team, 2026 [1](https://contenthub.audif1.com/en/releases/audi-revolut-f1-team-announces-ic-berlin-as-official-partner-108) |
| OGIO | USA | Specialist | - | Official luggage supplier to the Aston Martin F1 Team [1](https://www.astonmartinf1.com/en-GB/articles/aston-martin-cognizant-formula-one-tm-team-shifts-gear-with-ogio) |
| Piloti | USA | Specialist | - | Driving shoes; sponsored Scuderia AlphaTauri 2020, AF Corse collaboration [1](https://piloti.com/pages/about-piloti) |
| Purewear | GBR | Specialist | - | Teamwear partner of 2 Seas Motorsport in British GT, 2023 [1](https://2seasmotorsport.co.uk/news/2-seas-motorsport-teamwear-merchandise-launched-by-new-partner-purewear) |
| RaceQuip | USA | Specialist | - | Safety partner of Road America, 2014 [1](https://performanceracing.com/magazine/industry-news/06-13-2014/racequip-becomes-safety-partner-road-america) |
| SunGod | GBR | Specialist | - | McLaren F1 eyewear partner [1](https://www.visionmonday.com/scene-and-heard/todays-read/article/a-growing-f1-audience-brings-eyewear-into-the-limelight) |
| Web Eyewear | ITA | Specialist | - | Marcolin brand on the Alfa Romeo F1 Team, 2022 [1](https://www.yahoo.com/lifestyle/formula-1-eyewear-golden-ticket-040200440.html) |
