import { useMemo } from 'react';
import { TimerMode } from '@/hooks/useTimer';

interface TimerProps {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  isRunning: boolean;
}

export function Timer({ secondsLeft, totalSeconds, mode, isRunning }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  // SVG circle properties
  const size = 320;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const modeLabel = useMemo(() => {
    switch (mode) {
      case 'pomodoro':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  }, [mode]);

  const modeColor = useMemo(() => {
    switch (mode) {
      case 'pomodoro':
        return 'stroke-primary';
      case 'shortBreak':
        return 'stroke-primary/70';
      case 'longBreak':
        return 'stroke-purple';
    }
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Mode label */}
      <div className="mb-8 text-center">
        <h2 className="text-lg font-medium text-muted-foreground tracking-wide uppercase">
          {modeLabel}
        </h2>
      </div>

      {/* Circular timer */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-20"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={`${modeColor} transition-all duration-300 ${
              isRunning ? 'animate-pulse-ring' : ''
            }`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              filter: 'drop-shadow(0 0 12px hsl(var(--primary-glow)))',
            }}
          />
        </svg>

        {/* Timer digits overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="timer-digits text-7xl md:text-8xl font-bold tabular-nums tracking-tight">
            <span className="text-foreground">
              {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-muted-foreground mx-1">:</span>
            <span className="text-foreground">
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-8 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isRunning
              ? 'bg-primary animate-pulse-glow'
              : 'bg-muted-foreground/30'
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isRunning ? 'Running' : 'Paused'}
        </span>
      </div>
    </div>
  );
}
