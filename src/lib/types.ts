// ============================================================
// Types for the Bagrut Calculator
// ============================================================

/** A single grade component (e.g. "שאלון 35481", weight 0.65) */
export interface ComponentConfig {
  id: string;
  name: string;
  weight: number;
  sortOrder: number;
}

/** A level option for multi-level subjects (e.g. Math 4/5 units) */
export interface LevelConfig {
  id: string;
  label: string;
  units: number;
  sortOrder: number;
  components: ComponentConfig[];
}

/** A single subject (e.g. "מתמטיקה") */
export interface SubjectConfig {
  id: string;
  name: string;
  categoryId: string;
  units: number;
  hasLevels: boolean;
  levels: LevelConfig[];
  /** Components directly on the subject (when hasLevels=false) */
  components: ComponentConfig[];
  /** ID of the subject this depends on (e.g. תנ"ך מורחב depends on תנ"ך) */
  dependsOnId: string | null;
  /** Display label for the dependency */
  depLabel: string | null;
  /** Weight of the dependency grade in final calculation */
  depWeight: number | null;
  sortOrder: number;
}

/** A category grouping subjects (e.g. "מקצועות חובה") */
export interface CategoryConfig {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  subjects: SubjectConfig[];
}

/** Full school configuration */
export interface SchoolConfig {
  id: string;
  name: string;
  slug: string;
  categories: CategoryConfig[];
}

// ============================================================
// Calculator State Types
// ============================================================

/** Grades map: key = `${subjectId}_${componentId}`, value = grade 0-100 */
export type GradesMap = Record<string, number>;

/** Enabled subjects map: key = subjectId, value = true/false */
export type EnabledMap = Record<string, boolean>;

/** Selected levels map: key = subjectId, value = levelId */
export type LevelsMap = Record<string, string>;

/** Full calculator state persisted in localStorage */
export interface CalculatorState {
  enabled: EnabledMap;
  grades: GradesMap;
  levels: LevelsMap;
  extras: Record<string, boolean>;
}

/** Summary stats for the overall average */
export interface SummaryStats {
  totalUnits: number;
  avg: number;
  activeCount: number;
}

/** Per-subject calculated final */
export interface SubjectFinal {
  subjectId: string;
  final: number;
  units: number;
}
