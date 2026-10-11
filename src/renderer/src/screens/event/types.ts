/**
 * How the next race is shortened for its launch: the step picked, and where a
 * new one goes. Handed down from the round page to the session it launches.
 */
export interface RaceLengthControl {
  /**
   * The factor the race is shortened by, one for the full race.
   */
  scale: number;
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * Called with the step picked.
   * @param scale The factor, one for the full race
   */
  onChange: (scale: number) => void;
}
