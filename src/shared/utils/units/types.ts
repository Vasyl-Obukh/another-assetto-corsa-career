// The quantities a unit system decides, and the units it writes them in.

/**
 * A kind of measurement the screens show, each kept on disk in one metric unit:
 * a speed in km/h, a distance in kilometres, a short length in metres, a weight
 * in kilograms, a torque in newton metres and a temperature in Celsius.
 */
export type Quantity = 'speed' | 'distance' | 'length' | 'weight' | 'torque' | 'temperature';

/**
 * A unit a quantity is written in.
 */
export type Unit = 'kph' | 'mph' | 'km' | 'mi' | 'm' | 'ft' | 'kg' | 'lb' | 'nm' | 'lbft' | 'c' | 'f';
