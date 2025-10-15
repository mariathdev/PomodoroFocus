import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  totalSeconds: number;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

const STORAGE_KEY = 'pomodoro_state';
const SETTINGS_KEY = 'pomodoro_settings';

export function useTimer(
  onComplete?: (mode: TimerMode) => void,
  onTick?: (secondsLeft: number) => void
) {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isRunning: false };
    }
    return {
      mode: 'pomodoro' as TimerMode,
      secondsLeft: settings.pomodoroMinutes * 60,
      isRunning: false,
      completedPomodoros: 0,
      totalSeconds: settings.pomodoroMinutes * 60,
    };
  });

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);

  // Get duration for current mode
  const getDuration = useCallback((mode: TimerMode): number => {
    switch (mode) {
      case 'pomodoro':
        return settings.pomodoroMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
    }
  }, [settings]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Precise timer using performance.now()
  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();
    accumulatedTimeRef.current = state.totalSeconds - state.secondsLeft;

    const tick = () => {
      if (!startTimeRef.current) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const totalElapsed = accumulatedTimeRef.current + elapsed;
      const newSecondsLeft = Math.max(0, state.totalSeconds - Math.floor(totalElapsed));

      if (newSecondsLeft !== state.secondsLeft) {
        setState(prev => ({ ...prev, secondsLeft: newSecondsLeft }));
        onTick?.(newSecondsLeft);
      }

      if (newSecondsLeft <= 0) {
        console.log('[Timer] Completed', state.mode);
        setState(prev => ({ ...prev, isRunning: false }));
        onComplete?.(state.mode);

        // Auto-start next session if enabled
        if (state.mode === 'pomodoro') {
          if (settings.autoStartBreaks) {
            setTimeout(() => skipToNext(), 1000);
          }
        } else if (settings.autoStartPomodoros) {
          setTimeout(() => skipToNext(), 1000);
        }
      } else {
        intervalRef.current = requestAnimationFrame(tick);
      }
    };

    intervalRef.current = requestAnimationFrame(tick);

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.secondsLeft, state.mode, state.totalSeconds, onComplete, onTick, settings.autoStartBreaks, settings.autoStartPomodoros]);

  const start = useCallback(() => {
    console.log('[Timer] Started', state.mode);
    setState(prev => ({ ...prev, isRunning: true }));
  }, [state.mode]);

  const pause = useCallback(() => {
    console.log('[Timer] Paused');
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    console.log('[Timer] Reset');
    const duration = getDuration(state.mode);
    setState(prev => ({
      ...prev,
      secondsLeft: duration,
      totalSeconds: duration,
      isRunning: false,
    }));
  }, [state.mode, getDuration]);

  const switchMode = useCallback((newMode: TimerMode) => {
    console.log('[Timer] Switching mode to', newMode);
    const duration = getDuration(newMode);
    setState(prev => ({
      ...prev,
      mode: newMode,
      secondsLeft: duration,
      totalSeconds: duration,
      isRunning: false,
    }));
  }, [getDuration]);

  const skipToNext = useCallback(() => {
    console.log('[Timer] Skipping to next');
    let newMode: TimerMode;
    let newCompletedPomodoros = state.completedPomodoros;

    if (state.mode === 'pomodoro') {
      newCompletedPomodoros += 1;
      // Determine if it's time for long break
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        newMode = 'longBreak';
      } else {
        newMode = 'shortBreak';
      }
    } else {
      newMode = 'pomodoro';
    }

    const duration = getDuration(newMode);
    setState(prev => ({
      ...prev,
      mode: newMode,
      secondsLeft: duration,
      totalSeconds: duration,
      isRunning: false,
      completedPomodoros: newCompletedPomodoros,
    }));
  }, [state.mode, state.completedPomodoros, settings.longBreakInterval, getDuration]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Reset current timer with new duration
    const updatedSettings = { ...settings, ...newSettings };
    const duration = state.mode === 'pomodoro' 
      ? (updatedSettings.pomodoroMinutes * 60)
      : state.mode === 'shortBreak'
      ? (updatedSettings.shortBreakMinutes * 60)
      : (updatedSettings.longBreakMinutes * 60);
    
    setState(prev => ({
      ...prev,
      secondsLeft: duration,
      totalSeconds: duration,
      isRunning: false,
    }));
  }, [settings, state.mode]);

  return {
    state,
    settings,
    start,
    pause,
    reset,
    switchMode,
    skipToNext,
    updateSettings,
  };
}
