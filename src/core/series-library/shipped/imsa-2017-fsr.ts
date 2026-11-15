import { IMSA_2017 } from './imsa-2017.ts';
import { seat } from './utils.ts';
import { CarSpec, Discipline } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * IMSA WeatherTech SportsCar Championship, 2017 - on First Studio Race's cars.
 *
 * The same season as IMSA_2017, its calendar, formats and points, with FSR's
 * cars. A copy rather than more cars in the original, because FSR's cars never
 * share a class with another maker's and the original keeps racing without
 * them. Two classes of the real three. Prototype is the LMP2 (2017, FSR) spec:
 * the Mazda RT24-P DPi, with the Ligier JS P217 and the Dallara P217 as the
 * LMP2s; the Cadillac and Nissan DPis and the Oreca 07 and Riley Mk. 30 have no
 * FSR car. GTD is the GT3 (2010s, FSR) spec: the Viper GT3-R, which raced the
 * class from 2015, and the 991.2 GT3 R standing in for the 991.1 GT3 R that
 * raced it; the spec's V12 Vantage, Matech Ford GT, 997 GT3 R, RUF RT12 R and
 * fictional F-Type never raced it. Whether a Viper still raced in 2017, and a
 * Dallara P217 as an LMP2, was not checked. GTLM is left out, since FSR has no
 * GTE car, and its teams race GTD instead.
 *
 * Ten of twelve rounds at their real lengths - the Rolex 24, the Sebring 12
 * Hours, Long Beach's hundred minutes, the Circuit of the Americas, the Watkins
 * Glen 6 Hours, Lime Rock, Road America, VIR, Laguna Seca and Petit Le Mans.
 * Detroit and Canadian Tire Motorsport Park have no recommended track. Every
 * class races every round, where Lime Rock and VIR were GT only. Long Beach's
 * and the Circuit of the Americas' thirty boxes cap the grid.
 *
 * Points are 35-32-30-28-26 and down to 1 in each class, the table as
 * understood rather than checked. The field is invented, IMSA_2017's.
 *
 * Source: https://en.wikipedia.org/wiki/2017_WeatherTech_SportsCar_Championship
 */
export const IMSA_2017_FSR: Championship = {
  ...IMSA_2017,
  id: 'imsa-2017-fsr',
  name: 'IMSA SportsCar Championship 2017 (FSR)',
  description: {
    en: 'America\'s sports car championship of 2017 on First Studio Race\'s cars: the Mazda DPi and '
      + 'the LMP2s in Prototype, the Viper and the 911 GT3 R in GTD, ten rounds from the Rolex 24 to '
      + 'Petit Le Mans.',
    uk: 'Американський чемпіонат спортивних машин 2017 року на машинах First Studio Race: Mazda DPi і '
      + 'LMP2 у класі Prototype, Viper і 911 GT3 R у GTD, десять етапів від Rolex 24 до Petit Le Mans.',
  },
  entries: [
    {
      id: 'prototype',
      name: 'Prototype',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('pr-dix-1', 'dixie', 'Beau Ledbetter', 'USA'),
        seat('pr-dix-2', 'dixie', 'Travis Oakhurst', 'USA'),
        seat('pr-sun-1', 'sunshine', 'Marco Villafane', 'USA'),
        seat('pr-sun-2', 'sunshine', 'Derek Hollings', 'USA'),
        seat('pr-hud-1', 'hudson', 'Ryan Voorhees', 'USA'),
        seat('pr-hud-2', 'hudson', 'Evan Tappan', 'USA'),
        seat('pr-stl-1', 'saint-laurent', 'Mathis Gendreau', 'CAN'),
        seat('pr-stl-2', 'saint-laurent', 'Félix Rioux', 'CAN'),
        seat('pr-baj-1', 'baja', 'Rodrigo Villaseñor', 'MEX'),
        seat('pr-baj-2', 'baja', 'Emilio Treviño', 'MEX'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2017_FSR },
    },
    {
      id: 'gtd',
      name: 'GTD',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('arr-1', 'arrowhead', 'Edward Halsbury', 'GBR'),
        seat('arr-2', 'arrowhead', 'Samuel Crowther', 'GBR'),
        seat('don-1', 'donau', 'Maximilian Straubinger', 'DEU'),
        seat('don-2', 'donau', 'Leonhard Irlbacher', 'DEU'),
        seat('rub-1', 'rubicone', 'Giulio Santarcangeli', 'ITA'),
        seat('rub-2', 'rubicone', 'Nicola Verucchi', 'ITA'),
        seat('rou-1', 'route-66', 'Hunter Blankenship', 'USA'),
        seat('rou-2', 'route-66', 'Mason Tedrick', 'USA'),
        seat('nec-1', 'neckar', 'Jonas Eisenlohr', 'DEU'),
        seat('nec-2', 'neckar', 'Pascal Wohlfahrt', 'DEU'),
        seat('loi-1', 'loire', 'Victor Aubineau', 'FRA'),
        seat('loi-2', 'loire', 'Rémi Pelletan', 'FRA'),
        seat('pac-1', 'pacific-rim', 'Kai Ashford', 'USA'),
        seat('pac-2', 'pacific-rim', 'Dylan Ybarra', 'USA'),
        seat('lau-1', 'laurentian', 'Olivier Bergevin', 'CAN'),
        seat('lau-2', 'laurentian', 'Samuel Pouliot', 'CAN'),
        seat('shi-1', 'shizen', 'Ryota Kanemoto', 'JPN'),
        seat('shi-2', 'shizen', 'Yamato Seki', 'JPN'),
        seat('rio-1', 'rioplatense', 'Tomás Albarracín', 'ARG'),
        seat('rio-2', 'rioplatense', 'Joaquín Laprida', 'ARG'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_2010S_FSR },
      entryFee: 5400,
      prizes: {
        positions: [21600, 15100, 10800, 8200, 6250, 4750, 3450, 2600, 1750, 1100],
        standings: [173000, 108000, 69000, 45500, 28000],
      },
    },
  ],
};
