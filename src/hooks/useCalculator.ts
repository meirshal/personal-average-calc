"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  SchoolConfig,
  SubjectConfig,
  CalculatorState,
  SummaryStats,
  GradesMap,
  EnabledMap,
  LevelsMap,
} from "@/lib/types";
import { calcFinal, calcSummary, getEffectiveUnits } from "@/lib/calculator";
import { getAllSubjects } from "@/lib/default-config";

const STORAGE_PREFIX = "bagrut_calc_";

function getStorageKey(schoolSlug: string): string {
  return STORAGE_PREFIX + schoolSlug;
}

function loadState(schoolSlug: string): CalculatorState {
  const defaultState: CalculatorState = {
    enabled: {},
    grades: {},
    levels: {},
    extras: {},
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const saved = localStorage.getItem(getStorageKey(schoolSlug));
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled || {},
        grades: parsed.grades || {},
        levels: parsed.levels || {},
        extras: parsed.extras || {},
      };
    }
  } catch {
    // Ignore parse errors
  }
  return defaultState;
}

function saveState(schoolSlug: string, state: CalculatorState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(schoolSlug), JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function useCalculator(config: SchoolConfig) {
  const [state, setState] = useState<CalculatorState>(() =>
    loadState(config.slug)
  );

  const allSubjects = useMemo(() => getAllSubjects(config), [config]);

  // Persist state changes to localStorage
  useEffect(() => {
    saveState(config.slug, state);
  }, [config.slug, state]);

  // Get grade for a specific component
  const getGrade = useCallback(
    (subjectId: string, componentId: string): number => {
      return state.grades[subjectId + "_" + componentId] || 0;
    },
    [state.grades]
  );

  // Set grade for a specific component
  const setGrade = useCallback(
    (subjectId: string, componentId: string, value: number) => {
      const clamped = Math.min(100, Math.max(0, Number(value) || 0));
      setState((prev) => ({
        ...prev,
        grades: {
          ...prev.grades,
          [subjectId + "_" + componentId]: clamped,
        },
      }));
    },
    []
  );

  // Toggle subject active/inactive
  const toggleSubject = useCallback(
    (subjectId: string) => {
      setState((prev) => {
        const newEnabled = { ...prev.enabled };
        newEnabled[subjectId] = !newEnabled[subjectId];

        // Auto-enable dependency subject
        const subject = allSubjects.find(
          (s: SubjectConfig) => s.id === subjectId
        );
        if (subject?.dependsOnId && newEnabled[subjectId]) {
          newEnabled[subject.dependsOnId] = true;
        }

        return { ...prev, enabled: newEnabled };
      });
    },
    [allSubjects]
  );

  // Set level for a subject (e.g. Math 4/5 units)
  const setLevel = useCallback(
    (subjectId: string, levelId: string) => {
      setState((prev) => ({
        ...prev,
        levels: { ...prev.levels, [subjectId]: levelId },
      }));
    },
    []
  );

  // Set extra checkbox
  const setExtra = useCallback(
    (key: string, value: boolean) => {
      setState((prev) => ({
        ...prev,
        extras: { ...prev.extras, [key]: value },
      }));
    },
    []
  );

  // Calculate final for a specific subject
  const getSubjectFinal = useCallback(
    (subject: SubjectConfig): number => {
      return calcFinal(
        subject,
        allSubjects,
        state.grades,
        state.enabled,
        state.levels
      );
    },
    [allSubjects, state.grades, state.enabled, state.levels]
  );

  // Get units for a specific subject (accounting for level selection and dependency overlap)
  const getSubjectUnits = useCallback(
    (subject: SubjectConfig): number => {
      return getEffectiveUnits(subject, allSubjects, state.enabled, state.levels);
    },
    [allSubjects, state.enabled, state.levels]
  );

  // Calculate overall summary
  const summary: SummaryStats = useMemo(() => {
    return calcSummary(allSubjects, state.grades, state.enabled, state.levels);
  }, [allSubjects, state.grades, state.enabled, state.levels]);

  // Reset all data
  const resetAll = useCallback(() => {
    setState({
      enabled: {},
      grades: {},
      levels: {},
      extras: {},
    });
  }, []);

  // Check if a subject is enabled
  const isEnabled = useCallback(
    (subjectId: string): boolean => {
      return !!state.enabled[subjectId];
    },
    [state.enabled]
  );

  // Get selected level for a subject
  const getSelectedLevel = useCallback(
    (subjectId: string): string | undefined => {
      return state.levels[subjectId];
    },
    [state.levels]
  );

  // Get extra checkbox value
  const getExtra = useCallback(
    (key: string): boolean => {
      return !!state.extras[key];
    },
    [state.extras]
  );

  return {
    config,
    allSubjects,
    summary,
    getGrade,
    setGrade,
    toggleSubject,
    setLevel,
    setExtra,
    getExtra,
    getSubjectFinal,
    getSubjectUnits,
    isEnabled,
    getSelectedLevel,
    resetAll,
    enabled: state.enabled,
    grades: state.grades as GradesMap,
    levels: state.levels as LevelsMap,
    enabledMap: state.enabled as EnabledMap,
  };
}
