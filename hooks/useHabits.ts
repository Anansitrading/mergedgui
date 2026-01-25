/**
 * useHabits Hook - Manages habits for a skill
 * Provides CRUD operations and state management for scheduled skill executions
 */

import { useState, useCallback, useEffect } from 'react';
import type { Habit, CreateHabitRequest, UpdateHabitRequest } from '../types/skills';
import {
  listHabits,
  createHabit as createHabitApi,
  updateHabit as updateHabitApi,
  deleteHabit as deleteHabitApi,
  activateHabit as activateHabitApi,
  deactivateHabit as deactivateHabitApi,
  runHabitNow as runHabitNowApi,
  resetHabitErrors as resetHabitErrorsApi,
  isHabitsApiError,
} from '../services/habitsApi';

// =============================================================================
// Types
// =============================================================================

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: (skillId: string) => Promise<void>;
  createHabit: (request: CreateHabitRequest) => Promise<Habit>;
  updateHabit: (habitId: string, updates: UpdateHabitRequest) => Promise<Habit>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabit: (habit: Habit) => Promise<Habit>;
  runNow: (habitId: string) => Promise<{ executionId: string; message: string }>;
  resetErrors: (habitId: string) => Promise<Habit>;
  clearError: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);

  // Fetch habits for a skill
  const fetchHabits = useCallback(async (skillId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSkillId(skillId);

    try {
      const response = await listHabits({ skillId });
      setHabits(response.habits);
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to fetch habits';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new habit
  const createHabit = useCallback(async (request: CreateHabitRequest): Promise<Habit> => {
    setError(null);

    try {
      const newHabit = await createHabitApi(request);
      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to create habit';
      setError(message);
      throw err;
    }
  }, []);

  // Update an existing habit
  const updateHabit = useCallback(async (habitId: string, updates: UpdateHabitRequest): Promise<Habit> => {
    setError(null);

    try {
      const updatedHabit = await updateHabitApi(habitId, updates);
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to update habit';
      setError(message);
      throw err;
    }
  }, []);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId: string): Promise<void> => {
    setError(null);

    try {
      await deleteHabitApi(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to delete habit';
      setError(message);
      throw err;
    }
  }, []);

  // Toggle habit active state
  const toggleHabit = useCallback(async (habit: Habit): Promise<Habit> => {
    setError(null);

    try {
      const updatedHabit = habit.isActive
        ? await deactivateHabitApi(habit.id)
        : await activateHabitApi(habit.id);

      setHabits(prev => prev.map(h => h.id === habit.id ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to toggle habit';
      setError(message);
      throw err;
    }
  }, []);

  // Run habit immediately
  const runNow = useCallback(async (habitId: string): Promise<{ executionId: string; message: string }> => {
    setError(null);

    try {
      const result = await runHabitNowApi(habitId);
      return { executionId: result.executionId, message: result.message };
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to run habit';
      setError(message);
      throw err;
    }
  }, []);

  // Reset errors and reactivate habit
  const resetErrors = useCallback(async (habitId: string): Promise<Habit> => {
    setError(null);

    try {
      const updatedHabit = await resetHabitErrorsApi(habitId);
      setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to reset habit errors';
      setError(message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    runNow,
    resetErrors,
    clearError,
  };
}

// =============================================================================
// Single Habit Hook
// =============================================================================

interface UseSingleHabitReturn {
  habit: Habit | null;
  isLoading: boolean;
  error: string | null;
  update: (updates: UpdateHabitRequest) => Promise<void>;
  toggle: () => Promise<void>;
  runNow: () => Promise<{ executionId: string; message: string }>;
  resetErrors: () => Promise<void>;
}

export function useSingleHabit(habitId: string | null): UseSingleHabitReturn {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load habit when ID changes
  useEffect(() => {
    if (!habitId) {
      setHabit(null);
      return;
    }

    const loadHabit = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listHabits({});
        const found = response.habits.find(h => h.id === habitId);
        setHabit(found || null);
      } catch (err) {
        const message = isHabitsApiError(err) ? err.message : 'Failed to load habit';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadHabit();
  }, [habitId]);

  const update = useCallback(async (updates: UpdateHabitRequest) => {
    if (!habit) return;
    setError(null);

    try {
      const updatedHabit = await updateHabitApi(habit.id, updates);
      setHabit(updatedHabit);
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to update habit';
      setError(message);
      throw err;
    }
  }, [habit]);

  const toggle = useCallback(async () => {
    if (!habit) return;
    setError(null);

    try {
      const updatedHabit = habit.isActive
        ? await deactivateHabitApi(habit.id)
        : await activateHabitApi(habit.id);
      setHabit(updatedHabit);
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to toggle habit';
      setError(message);
      throw err;
    }
  }, [habit]);

  const runNow = useCallback(async (): Promise<{ executionId: string; message: string }> => {
    if (!habit) throw new Error('No habit loaded');
    setError(null);

    try {
      const result = await runHabitNowApi(habit.id);
      return { executionId: result.executionId, message: result.message };
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to run habit';
      setError(message);
      throw err;
    }
  }, [habit]);

  const resetErrors = useCallback(async () => {
    if (!habit) return;
    setError(null);

    try {
      const updatedHabit = await resetHabitErrorsApi(habit.id);
      setHabit(updatedHabit);
    } catch (err) {
      const message = isHabitsApiError(err) ? err.message : 'Failed to reset habit errors';
      setError(message);
      throw err;
    }
  }, [habit]);

  return {
    habit,
    isLoading,
    error,
    update,
    toggle,
    runNow,
    resetErrors,
  };
}

export default useHabits;
