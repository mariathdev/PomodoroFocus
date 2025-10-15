import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { TimerMode } from '@/hooks/useTimer';

export interface HistoryEntry {
  id: string;
  mode: TimerMode;
  completedAt: number;
  duration: number; // in seconds
}

const HISTORY_KEY = 'pomodoro_history';
const MAX_HISTORY = 50;

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Subscribe to history updates
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const todayEntries = history.filter((entry) => {
    const entryDate = new Date(entry.completedAt);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  const pomodorosToday = todayEntries.filter((e) => e.mode === 'pomodoro').length;
  const totalMinutesToday = Math.round(
    todayEntries.reduce((sum, e) => sum + e.duration, 0) / 60
  );

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">No sessions yet. Start your first Pomodoro!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🍅</span>
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
          <div className="text-3xl font-bold">{pomodorosToday}</div>
        </div>

        <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Minutes</span>
          </div>
          <div className="text-3xl font-bold">{totalMinutesToday}</div>
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {history.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2.5 px-4 bg-card/20 backdrop-blur-sm rounded-lg border border-border/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {entry.mode === 'pomodoro' ? '🍅' : '☕'}
                </span>
                <div>
                  <div className="text-sm font-medium">
                    {entry.mode === 'pomodoro'
                      ? 'Pomodoro'
                      : entry.mode === 'shortBreak'
                      ? 'Short Break'
                      : 'Long Break'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(entry.duration / 60)}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function addHistoryEntry(mode: TimerMode, duration: number) {
  const saved = localStorage.getItem(HISTORY_KEY);
  const history: HistoryEntry[] = saved ? JSON.parse(saved) : [];

  const newEntry: HistoryEntry = {
    id: Date.now().toString(),
    mode,
    completedAt: Date.now(),
    duration,
  };

  const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  // Trigger storage event for same-window updates
  window.dispatchEvent(new Event('storage'));
  
  console.log('[History] Added entry:', newEntry);
}
