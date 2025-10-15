import { TimerMode } from '@/hooks/useTimer';
import { soundManager } from '@/utils/sounds';

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  completedPomodoros: number;
}

export function ModeSelector({ currentMode, onModeChange, completedPomodoros }: ModeSelectorProps) {
  const handleModeClick = (mode: TimerMode) => {
    soundManager.playClick();
    onModeChange(mode);
  };

  const modes: { id: TimerMode; label: string; shortcut: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', shortcut: '1' },
    { id: 'shortBreak', label: 'Short Break', shortcut: '2' },
    { id: 'longBreak', label: 'Long Break', shortcut: '3' },
  ];

  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full p-1 border border-border/30">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeClick(mode.id)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-base
              ${
                currentMode === mode.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }
            `}
            title={`${mode.label} (${mode.shortcut})`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Pomodoro counter */}
      {completedPomodoros > 0 && (
        <div className="ml-2 flex items-center gap-1.5 bg-card/30 backdrop-blur-sm rounded-full px-4 py-2.5 border border-border/30">
          <span className="text-2xl">🍅</span>
          <span className="text-sm font-medium text-muted-foreground">
            ×{completedPomodoros}
          </span>
        </div>
      )}
    </div>
  );
}
