import type {
  SubjectConfig,
  ComponentConfig,
  GradesMap,
  EnabledMap,
  LevelsMap,
  SummaryStats,
} from "./types";

/**
 * Get the active components for a subject based on the selected level.
 * If the subject has levels, returns the components for the selected level.
 * Otherwise, returns the subject's direct components.
 */
export function getActiveComponents(
  subject: SubjectConfig,
  selectedLevel: string | undefined
): ComponentConfig[] {
  if (subject.hasLevels && subject.levels.length > 0) {
    const level =
      subject.levels.find((l) => l.id === selectedLevel) || subject.levels[0];
    return level.components;
  }
  return subject.components;
}

/**
 * Get the units for a subject based on the selected level.
 * If the subject has levels, returns the units for the selected level.
 * Otherwise, returns the subject's direct units.
 */
export function getActiveUnits(
  subject: SubjectConfig,
  selectedLevel: string | undefined
): number {
  if (subject.hasLevels && subject.levels.length > 0) {
    const level =
      subject.levels.find((l) => l.id === selectedLevel) || subject.levels[0];
    return level.units;
  }
  return subject.units;
}

/**
 * Get the grade for a specific subject component from the grades map.
 */
export function getGrade(
  grades: GradesMap,
  subjectId: string,
  componentId: string
): number {
  return grades[subjectId + "_" + componentId] || 0;
}

/**
 * Calculate the final grade for a single subject.
 *
 * Formula (identical to original):
 *   final = sum of (grade * weight) for each component
 *   + (if dependency exists and base subject is enabled):
 *       baseSubjectFinal * depWeight
 *
 * Returns 0 if no grades entered.
 */
export function calcFinal(
  subject: SubjectConfig,
  allSubjects: SubjectConfig[],
  grades: GradesMap,
  enabled: EnabledMap,
  levels: LevelsMap
): number {
  const comps = getActiveComponents(subject, levels[subject.id]);
  let total = 0;
  let hasAny = false;

  for (const c of comps) {
    const g = getGrade(grades, subject.id, c.id);
    if (g > 0) hasAny = true;
    total += g * c.weight;
  }

  // Add dependency component if exists
  if (subject.dependsOnId && subject.depWeight != null) {
    const baseSub = allSubjects.find((s) => s.id === subject.dependsOnId);
    if (baseSub && enabled[baseSub.id]) {
      const baseGrade = calcFinal(baseSub, allSubjects, grades, enabled, levels);
      if (baseGrade > 0) hasAny = true;
      total += baseGrade * subject.depWeight;
    }
  }

  return hasAny ? Math.round(total * 100) / 100 : 0;
}

/**
 * Get the effective units for a subject, accounting for dependency overlap.
 * Extended subjects (e.g., תנ"ך מורחב 5 units) include the base subject's
 * units (תנ"ך 2 units). When both are enabled, the extended only adds the
 * incremental units (5 - 2 = 3) to avoid double-counting.
 */
export function getEffectiveUnits(
  subject: SubjectConfig,
  allSubjects: SubjectConfig[],
  enabled: EnabledMap,
  levels: LevelsMap
): number {
  const units = getActiveUnits(subject, levels[subject.id]);
  if (subject.dependsOnId && enabled[subject.id]) {
    const baseSub = allSubjects.find((s) => s.id === subject.dependsOnId);
    if (baseSub && enabled[baseSub.id]) {
      const baseUnits = getActiveUnits(baseSub, levels[baseSub.id]);
      return units - baseUnits;
    }
  }
  return units;
}

/**
 * Calculate the overall weighted average across all active subjects.
 *
 * Formula:
 *   avg = sum of (final * effectiveUnits) / sum of (effectiveUnits)
 *   only for enabled subjects with final > 0
 *
 * effectiveUnits adjusts for dependency overlap — extended subjects
 * only count incremental units above their base subject.
 */
export function calcSummary(
  allSubjects: SubjectConfig[],
  grades: GradesMap,
  enabled: EnabledMap,
  levels: LevelsMap
): SummaryStats {
  let totalUnits = 0;
  let weightedSum = 0;
  let activeCount = 0;

  for (const s of allSubjects) {
    if (!enabled[s.id]) continue;
    const final = calcFinal(s, allSubjects, grades, enabled, levels);
    if (final <= 0) continue;
    const units = getEffectiveUnits(s, allSubjects, enabled, levels);
    totalUnits += units;
    weightedSum += final * units;
    activeCount++;
  }

  return {
    totalUnits,
    avg: totalUnits > 0 ? Math.round((weightedSum / totalUnits) * 100) / 100 : 0,
    activeCount,
  };
}
