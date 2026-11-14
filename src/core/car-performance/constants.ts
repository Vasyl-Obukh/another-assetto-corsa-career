// Power's conversion and sanity bounds for the free text mod authors write into
// ui_car.json's specs block.

/**
 * Brake horsepower per kilowatt.
 */
export const BHP_PER_KW = 1.34102;

/**
 * Kilograms in a tonne, for the power-to-weight ratio.
 */
export const KG_PER_TONNE = 1000;

/**
 * Above this, the author wrote something that is not a power figure.
 */
export const MAX_BHP = 3000;

/**
 * Above this, the author wrote something that is not a torque figure.
 */
export const MAX_TORQUE_NM = 5000;

/**
 * Below this, the figure is not a car's weight - usually a stray decimal point.
 */
export const MIN_WEIGHT_KG = 100;

/**
 * Above this, the figure is not a car's weight.
 */
export const MAX_WEIGHT_KG = 5000;

/**
 * Above this, the figure is not a road-car or race-car top speed.
 */
export const MAX_SPEED_KPH = 600;

/**
 * Above this, the figure is not a nought-to-hundred time.
 */
export const MAX_ACCELERATION_S = 60;

/**
 * The earliest plausible model year. Benz Patent-Motorwagen.
 */
export const MIN_YEAR = 1885;

/**
 * The latest plausible model year, allowing for concepts dated ahead.
 */
export const MAX_YEAR = 2100;

/**
 * Above this, a curve point's engine speed is not an engine speed.
 */
export const MAX_RPM = 30000;

/**
 * Fewer points than this is not a curve anyone could read anything off.
 */
export const MIN_CURVE_POINTS = 2;
