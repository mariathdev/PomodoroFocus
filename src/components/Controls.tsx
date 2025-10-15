import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/utils/sounds';

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function Controls({ isRunning, onStart, onPause, onReset, onSkip }: ControlsProps) {
  const handleClick = (action: () => void) => {
    soundManager.playClick(Math.random() * 0.1 - 0.05); // Slight pitch variation
    action();
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Reset button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleClick(onReset)}
        className="h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:scale-105 transition-all duration-base"
        title="Reset (R)"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      {/* Play/Pause button (primary) */}
      <Button
        size="icon"
        onClick={() => handleClick(isRunning ? onPause : onStart)}
        className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-base shadow-lg shadow-primary/20"
        title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
      >
        {isRunning ? (
          <Pause className="h-8 w-8 fill-current" />
        ) : (
          <Play className="h-8 w-8 fill-current ml-1" />
        )}
      </Button>

      {/* Skip button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleClick(onSkip)}
        className="h-12 w-12 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:scale-105 transition-all duration-base"
        title="Skip (N)"
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
