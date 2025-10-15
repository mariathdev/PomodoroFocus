import { useEffect, useCallback } from 'react';
import { useTimer, TimerMode } from '@/hooks/useTimer';
import { Timer } from '@/components/Timer';
import { Controls } from '@/components/Controls';
import { ModeSelector } from '@/components/ModeSelector';
import { HistoryPanel, addHistoryEntry } from '@/components/HistoryPanel';
import { TopBar } from '@/components/TopBar';
import { soundManager } from '@/utils/sounds';
import { notificationManager } from '@/utils/notifications';

const Index = () => {
  const handleComplete = useCallback((mode: TimerMode) => {
    console.log('[App] Timer completed:', mode);
    
    // Play alarm sound
    soundManager.playAlarm();

    // Show notification
    if (mode === 'pomodoro') {
      notificationManager.showPomodoroComplete();
    } else {
      notificationManager.showBreakComplete();
    }

    // Add to history
    const duration = mode === 'pomodoro' 
      ? settings.pomodoroMinutes * 60
      : mode === 'shortBreak'
      ? settings.shortBreakMinutes * 60
      : settings.longBreakMinutes * 60;
    
    addHistoryEntry(mode, duration);

    // Update document title
    document.title = mode === 'pomodoro' 
      ? '✅ Break Time! - Pomodoro Focus'
      : '✅ Focus Time! - Pomodoro Focus';

    // Reset after a moment
    setTimeout(() => {
      document.title = 'Pomodoro Focus';
    }, 3000);
  }, []);

  const handleTick = useCallback((secondsLeft: number) => {
    // Update document title with countdown
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - Pomodoro Focus`;
  }, []);

  const {
    state,
    settings,
    start,
    pause,
    reset,
    switchMode,
    skipToNext,
    updateSettings,
  } = useTimer(handleComplete, handleTick);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          state.isRunning ? pause() : start();
          break;
        case 'r':
          e.preventDefault();
          reset();
          break;
        case '1':
          e.preventDefault();
          switchMode('pomodoro');
          break;
        case '2':
          e.preventDefault();
          switchMode('shortBreak');
          break;
        case '3':
          e.preventDefault();
          switchMode('longBreak');
          break;
        case 'n':
          e.preventDefault();
          skipToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.isRunning, start, pause, reset, switchMode, skipToNext]);

  // Request notification permission on first interaction
  useEffect(() => {
    const handleFirstClick = () => {
      notificationManager.requestPermission();
      document.removeEventListener('click', handleFirstClick);
    };

    document.addEventListener('click', handleFirstClick);
    return () => document.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <TopBar settings={settings} onSettingsChange={updateSettings} />

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-12 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Timer section */}
        <div className="flex-1 flex flex-col items-center justify-center w-full lg:sticky lg:top-8">
          <ModeSelector
            currentMode={state.mode}
            onModeChange={switchMode}
            completedPomodoros={state.completedPomodoros}
          />

          <Timer
            secondsLeft={state.secondsLeft}
            totalSeconds={state.totalSeconds}
            mode={state.mode}
            isRunning={state.isRunning}
          />

          <div className="mt-12">
            <Controls
              isRunning={state.isRunning}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skipToNext}
            />
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded">Space</kbd> Play/Pause</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded">R</kbd> Reset</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded">N</kbd> Skip</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted/30 rounded">1-3</kbd> Switch Mode</span>
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <div className="w-full lg:w-80 lg:sticky lg:top-8">
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <h2 className="text-xl font-bold mb-6">Activity</h2>
            <HistoryPanel />
          </div>
        </div>
      </main>

      {/* Footer credits */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Créditos: <span className="text-foreground font-medium">@mariathdev</span>
        </p>
      </footer>
    </div>
  );
};

export default Index;
