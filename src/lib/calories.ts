/**
 * Calorie estimation using duration-split MET method with EPOC correction.
 *
 * Based on measured HIIT data:
 * - Wang et al. 2024 (Tabata ~9.5 MET average)
 * - Falcone et al. 2015 (HIIT ~8.7 MET average)
 * - EPOC values from LaForgia, Withers & Gore 2006
 *
 * Expected accuracy: ±20–30% vs lab measurement (typical for MET-based
 * estimation without heart-rate data).
 */

export type Sex = "male" | "female";
export type IntensityOverride = "light" | "moderate" | "high" | "extreme";

interface MetProfile {
  metWork: number;
  metRest: number;
  epoc: number;
}

const OVERRIDE_PROFILES: Record<IntensityOverride, MetProfile> = {
  light:    { metWork: 5,  metRest: 2.0, epoc: 1.05 },
  moderate: { metWork: 7,  metRest: 2.5, epoc: 1.07 },
  high:     { metWork: 10, metRest: 2.5, epoc: 1.10 },
  extreme:  { metWork: 12, metRest: 2.0, epoc: 1.12 },
};

const SEX_FACTOR: Record<Sex, number> = {
  male: 1.0,
  female: 0.95,
};

/**
 * Derive a MET profile from the work-to-rest ratio when no manual override
 * is set. Uses measured data for calibration.
 */
function autoProfile(workSec: number, restSec: number): MetProfile {
  if (restSec <= 0) {
    // All work, no rest — treat as high intensity
    return { metWork: 10, metRest: 2.0, epoc: 1.12 };
  }
  const ratio = workSec / restSec;
  if (ratio >= 2) {
    // Tabata-style (2:1 or denser)
    return { metWork: 10, metRest: 2.0, epoc: 1.12 };
  }
  if (ratio >= 1) {
    // Moderate-high (1:1 to 2:1)
    return { metWork: 8.5, metRest: 2.5, epoc: 1.09 };
  }
  // Lower density (< 1:1)
  return { metWork: 7, metRest: 3.0, epoc: 1.07 };
}

export interface CalorieInput {
  /** Total active exercise seconds (across all rounds). */
  workTimeSec: number;
  /** Total rest seconds (between exercises + between rounds). */
  restTimeSec: number;
  /** User body weight in kg. */
  weightKg: number;
  /** User sex. */
  sex: Sex;
  /** Optional manual intensity override on the workout. */
  intensityOverride?: IntensityOverride | null;
}

/**
 * Estimate calories burned for a workout.
 *
 * Returns kcal as a rounded integer.
 */
export function estimateCalories(input: CalorieInput): number {
  const { workTimeSec, restTimeSec, weightKg, sex, intensityOverride } = input;

  if (weightKg <= 0 || (workTimeSec <= 0 && restTimeSec <= 0)) return 0;

  const profile = intensityOverride
    ? OVERRIDE_PROFILES[intensityOverride]
    : autoProfile(workTimeSec, restTimeSec);

  const workHours = workTimeSec / 3600;
  const restHours = restTimeSec / 3600;

  const kcalWork = profile.metWork * weightKg * workHours;
  const kcalRest = profile.metRest * weightKg * restHours;
  const withEpoc = (kcalWork + kcalRest) * profile.epoc;
  const corrected = withEpoc * (SEX_FACTOR[sex] ?? 1);

  return Math.round(corrected);
}
