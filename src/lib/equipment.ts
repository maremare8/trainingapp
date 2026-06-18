/**
 * Predefined equipment list with display labels and badge colors.
 * Each color uses Tailwind v4 CSS variables via oklch or standard classes.
 */

export interface EquipmentOption {
  id: string;
  label: string;
  /** Tailwind classes for the badge background + text */
  badgeClasses: string;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: "bodyweight", label: "Bodyweight", badgeClasses: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { id: "kettlebell", label: "Kettlebell", badgeClasses: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  { id: "trx", label: "TRX", badgeClasses: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  { id: "dumbbell", label: "Dumbbell", badgeClasses: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  { id: "barbell", label: "Barbell", badgeClasses: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  { id: "resistance-band", label: "Band", badgeClasses: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  { id: "pull-up-bar", label: "Pull-up Bar", badgeClasses: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400" },
  { id: "medicine-ball", label: "Med Ball", badgeClasses: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400" },
  { id: "jump-rope", label: "Jump Rope", badgeClasses: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400" },
];

export function getEquipmentOption(id: string): EquipmentOption | undefined {
  return EQUIPMENT_OPTIONS.find((e) => e.id === id);
}

/** Get display-ready equipment items for a list of IDs */
export function resolveEquipment(ids: string[]): EquipmentOption[] {
  return ids
    .map((id) => getEquipmentOption(id))
    .filter((e): e is EquipmentOption => e !== undefined);
}
