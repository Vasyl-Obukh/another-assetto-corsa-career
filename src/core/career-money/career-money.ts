// A career's money: what a round costs to enter and to rent a car for, what
// its races and its final standing pay, what its cars cost, and the ledger
// every change of it is written into. Pure, so the career store decides when
// and this decides what. Every line is keyed by what it settles, so working out
// what is owed again pays nothing twice.

import type {
  Career,
  CareerSeason,
  LedgerLine,
  OwnedCar,
  SeasonEntry,
  SeasonEvent,
} from '../../shared/types/index.ts';
import { editionOver } from '../../shared/utils/editions/index.ts';
import { isHistoric, isInvited } from '../../shared/utils/historic/index.ts';
import { prizeTable, scaledPrize } from '../../shared/utils/prizes/index.ts';

/**
 * What entering one of a career's rounds costs.
 *
 * A historic event costs nothing while the player is invited - the car comes
 * with the seat, and so does the entry - and a fee of zero is nothing to pay.
 * @param entry The season's entry the round belongs to
 * @param event The round
 * @returns The fee, or null when it costs nothing
 */
export const feeOf = (entry: SeasonEntry, event: SeasonEvent): number | null => (
  isInvited(entry) || !event.entryFee ? null : event.entryFee
);

/**
 * The key a round's entry fee is posted under.
 * @param event The round
 * @returns The key
 */
const feeKey = (event: SeasonEvent): string => `fee:${event.raceId}`;

/**
 * Whether a round's entry fee has been paid.
 * @param career The career
 * @param event The round
 * @returns True once it is on the ledger
 */
export const feePaid = (career: Career, event: SeasonEvent): boolean => (
  career.ledger.some((line) => line.key === feeKey(event))
);

/**
 * What launching a round's next session costs: its fee, when that is still to
 * be paid. Only a career has money, so a standalone championship owes nothing.
 * @param career The career
 * @param entry The season's entry the round belongs to
 * @param event The round
 * @returns What is owed, zero for nothing
 */
export const feeOwed = (career: Career, entry: SeasonEntry, event: SeasonEvent): number => {
  const fee = feeOf(entry, event);

  return career.kind === 'career' && fee !== null && !feePaid(career, event) ? fee : 0;
};

/**
 * What every line about one round says of where it came from.
 * @param season The season it falls in
 * @param entry The season's entry
 * @param event The round
 * @returns The line's fields naming the round
 */
const roundOf = (
  season: CareerSeason,
  entry: SeasonEntry,
  event: SeasonEvent,
): Pick<LedgerLine, 'season' | 'series' | 'seriesName' | 'edition' | 'round' | 'roundName' | 'number'> => {
  const at = entry.championship.rounds.findIndex((one) => one.id === event.round);

  return {
    season: season.index,
    series: entry.series,
    seriesName: entry.championship.name,
    edition: entry.edition,
    round: event.round,
    roundName: entry.championship.rounds[at]?.name ?? event.round,
    number: at + 1,
  };
};

/**
 * The line paying a round's entry fee.
 * @param season The season it falls in
 * @param entry The season's entry
 * @param event The round
 * @param fee What it costs
 * @returns The line
 */
export const feeLine = (
  season: CareerSeason,
  entry: SeasonEntry,
  event: SeasonEvent,
  fee: number,
): LedgerLine => ({
  key: feeKey(event),
  kind: 'fee',
  date: event.date,
  amount: -fee,
  ...roundOf(season, entry, event),
});

/**
 * The key a round's rent is posted under.
 * @param event The round
 * @returns The key
 */
const rentKey = (event: SeasonEvent): string => `rent:${event.raceId}`;

/**
 * Whether a round's rent has been paid.
 * @param career The career
 * @param event The round
 * @returns True once it is on the ledger
 */
export const rentPaid = (career: Career, event: SeasonEvent): boolean => (
  career.ledger.some((line) => line.key === rentKey(event))
);

/**
 * What launching a round's next session costs in rent: the round's, when its
 * car is rented and the rent is still to be paid.
 * @param career The career
 * @param entry The season's entry the round belongs to
 * @param event The round
 * @param rent What a round of the car costs to rent
 * @returns What is owed, zero for nothing
 */
export const rentOwed = (career: Career, entry: SeasonEntry, event: SeasonEvent, rent: number): number => (
  career.kind === 'career' && entry.car.source === 'rented' && !rentPaid(career, event) ? rent : 0
);

/**
 * The line paying a round's rent.
 * @param season The season it falls in
 * @param entry The season's entry
 * @param event The round
 * @param rent What it costs
 * @param name The car's name
 * @returns The line
 */
export const rentLine = (
  season: CareerSeason,
  entry: SeasonEntry,
  event: SeasonEvent,
  rent: number,
  name: string,
): LedgerLine => ({
  key: rentKey(event),
  kind: 'rent',
  date: event.date,
  amount: -rent,
  ...roundOf(season, entry, event),
  car: { model: entry.car.model, name },
});

/**
 * What every line about a car shares: a key numbered like a change of speed's,
 * since the same car may be bought, sold and repainted any number of times,
 * and the day and season it falls on.
 * @param career The career, before the line
 * @param kind What kind of line
 * @param model The car's folder ID
 * @returns The line's fields
 */
const carLine = (
  career: Career,
  kind: 'purchase' | 'sale' | 'repaint',
  model: string,
): Pick<LedgerLine, 'key' | 'kind' | 'date' | 'season'> => ({
  key: `${kind}:${model}:${career.ledger.length}`,
  kind,
  date: career.date,
  season: career.seasons[career.seasons.length - 1]?.index ?? 0,
});

/**
 * The line buying a car.
 * @param career The career, before the purchase
 * @param model The car's folder ID
 * @param name The car's name
 * @param livery The livery it is bought in, by name
 * @param price What it costs
 * @returns The line
 */
export const purchaseLine = (
  career: Career,
  model: string,
  name: string,
  livery: string | undefined,
  price: number,
): LedgerLine => ({
  ...carLine(career, 'purchase', model),
  amount: -price,
  car: { model, name, ...(livery === undefined ? {} : { livery }) },
});

/**
 * The line selling a car.
 * @param career The career, before the sale
 * @param owned The car as the garage holds it
 * @param name The car's name
 * @param value What it sells for
 * @returns The line
 */
export const saleLine = (career: Career, owned: OwnedCar, name: string, value: number): LedgerLine => ({
  ...carLine(career, 'sale', owned.model),
  amount: value,
  car: {
    model: owned.model, name, paid: owned.paid, bought: owned.bought,
  },
});

/**
 * The line repainting a car.
 * @param career The career, before the repaint
 * @param model The car's folder ID
 * @param name The car's name
 * @param from The livery it wore, by name
 * @param livery The livery it wears now, by name
 * @param cost What the repaint costs
 * @returns The line
 */
export const repaintLine = (
  career: Career,
  model: string,
  name: string,
  from: string | undefined,
  livery: string | undefined,
  cost: number,
): LedgerLine => ({
  ...carLine(career, 'repaint', model),
  amount: -cost,
  car: {
    model, name, ...(from === undefined ? {} : { from }), ...(livery === undefined ? {} : { livery }),
  },
});

/**
 * The line a career opens on.
 * @param date The day it starts, as an ISO date
 * @param money What it starts with
 * @returns The line
 */
export const openingLine = (date: string, money: number): LedgerLine => ({
  key: 'opening', kind: 'opening', date, season: 0, amount: money,
});

/**
 * The line saying a career's prize speed changed, which moves no money
 * and is kept so a run played at more than one speed says so.
 * @param career The career, before the change
 * @param to The speed it runs at from now on
 * @returns The line
 */
export const speedLine = (career: Career, to: number): LedgerLine => ({
  key: `speed:${career.ledger.length}`,
  kind: 'speed',
  date: career.date,
  season: career.seasons[career.seasons.length - 1]?.index ?? 0,
  amount: 0,
  speed: { from: career.settings.prizeSpeed, to },
});

/**
 * Whether an edition has run its course: every round raced or given up, its
 * last day behind the clock, and every round given up raced by the field.
 * @param entry The season's entry
 * @param today The ISO date the clock stands at
 * @returns True once its final standings stand
 */
const settled = (entry: SeasonEntry, today: string): boolean => (
  editionOver(entry, today) && entry.events.every((event) => event.status !== 'missed' || event.simulated)
);

/**
 * Every prize a career has earned and not yet been paid: the player's place in
 * each race they drove, and their place in the table of every edition that has
 * run its course - a historic event paying its purse per race and standing in
 * no table.
 * @param career The career
 * @returns The lines owed, dated by the event that earned each
 */
export const owedPrizes = (career: Career): LedgerLine[] => {
  if (career.kind !== 'career') return [];

  const paid = new Set(career.ledger.map((line) => line.key));
  const speed = career.settings.prizeSpeed;
  const owed: LedgerLine[] = [];

  for (const season of career.seasons) {
    for (const entry of season.entries) {
      const positions = prizeTable(entry.championship, entry.entry, 'positions');
      const historic = isHistoric(entry);

      for (const event of entry.events) {
        for (const race of event.score?.races ?? []) {
          const key = `race:${event.raceId}:${race.launch}`;
          // The player's own place alone: a race simulated, or raced in their
          // seat by the driver it names, pays the player nothing.
          const place = race.simulated || paid.has(key) ? undefined : race.places.find((one) => (
            one.entry === entry.entry && one.seat === entry.playerSeat && !one.substitute && !one.bonusOnly
          ));
          const amount = place ? scaledPrize(positions[place.classPosition - 1] ?? 0, speed) : 0;
          if (place && amount > 0) {
            owed.push({
              key,
              kind: historic ? 'historic' : 'race',
              date: event.date,
              amount,
              ...roundOf(season, entry, event),
              race: race.name,
              place: place.classPosition,
            });
          }
        }
      }

      const key = `standings:${season.index}:${entry.series}:${entry.edition}`;
      // A championship the player withdrew from pays its races and no table.
      if (historic || entry.withdrawn || paid.has(key) || !settled(entry, career.date)) continue;
      const row = entry.standings.classes
        .find((one) => one.entry === entry.entry)?.drivers
        .find((one) => one.seat === entry.playerSeat && !one.substitute);
      const standings = prizeTable(entry.championship, entry.entry, 'standings');
      const amount = row && row.races > 0 ? scaledPrize(standings[row.position - 1] ?? 0, speed) : 0;
      const last = entry.events.reduce<string>((latest, event) => (event.date > latest ? event.date : latest), '');
      if (row && amount > 0) {
        owed.push({
          key,
          kind: 'standings',
          date: last,
          season: season.index,
          amount,
          series: entry.series,
          seriesName: entry.championship.name,
          edition: entry.edition,
          place: row.position,
        });
      }
    }
  }

  return owed;
};

/**
 * Writes lines into a career's ledger and its money.
 * @param career The career
 * @param lines What to post, oldest first
 * @returns The career, or the same one when there was nothing to post
 */
export const post = (career: Career, lines: readonly LedgerLine[]): Career => (lines.length === 0 ? career : {
  ...career,
  money: career.money + lines.reduce((sum, line) => sum + line.amount, 0),
  ledger: [...career.ledger, ...lines],
});

/**
 * Pays a career every prize it is owed.
 * @param career The career
 * @returns The career, paid - the same one when nothing was owed
 */
export const payOut = (career: Career): Career => post(career, owedPrizes(career));
