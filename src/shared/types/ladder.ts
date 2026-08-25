// The career ladder: what kind of racing a championship is, and how far up it
// sits. Both are fields on the championship, and neither is a property of a car.
//
// Tier in particular cannot live on a car, and that is not a modelling
// preference. A championship is configured by a spec or by an explicit list of
// cars, and the car list is what one-make series use - the MX-5 Cup, the TT Cup,
// the Abarth 500 Assetto Corse - so those cars carry no spec to hang a tier off
// at all. Even for a car the catalogue does name, one number could not hold the
// answer: a GT3 car races in a world championship and in a national club series,
// and a Porsche Cup 992 runs in Supercup and in a regional Carrera Cup. Those are
// different rungs.
//
// It also has to be per entry rather than per championship. WEC is one series
// with one calendar, entered as Hypercar, LMP2 or LMGT3, and the GT3 entry sits a
// tier below the prototype ones - so it occupies two rungs at once.

/**
 * The kind of racing a championship is, and the axis a driver's level is held
 * per.
 *
 * A driver may enter any series at or below their level in that discipline, and
 * enters a new one a tier below their best level elsewhere - so this is what
 * decides that an IndyCar driver steps into Formula 2 rather than straight into
 * Formula 1.
 */
export enum Discipline {
  SINGLE_SEATER = 'single-seater',
  SPORTSCAR = 'sportscar',
  TOURING = 'touring',
  ROAD = 'road',
}

/**
 * Where one championship entry sits on the ladder.
 *
 * Held per entry rather than per championship, because a multi-class series is
 * entered at a different level depending on which class you enter it in.
 */
export interface LadderPosition {
  /**
   * The kind of racing this entry is.
   */
  discipline: Discipline;
  /**
   * Which rung, 1 being the top. Contiguous within a discipline, so there is
   * never a level a driver can hold but not race at.
   */
  tier: number;
}