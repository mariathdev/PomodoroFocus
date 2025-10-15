import { useState } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TimerSettings } from '@/hooks/useTimer';
import { soundManager } from '@/utils/sounds';

interface SettingsModalProps {
  settings: TimerSettings;
  onSettingsChange: (settings: Partial<TimerSettings>) => void;
}

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(soundManager.getVolume() * 100);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    soundManager.setVolume(newVolume / 100);
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundManager.setEnabled(enabled);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
          title="Settings (S)"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Timer durations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Timer Duration (minutes)
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="pomodoro" className="text-sm">Pomodoro</Label>
                <Input
                  id="pomodoro"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.pomodoroMinutes}
                  onChange={(e) => onSettingsChange({ pomodoroMinutes: parseInt(e.target.value) || 25 })}
                  className="w-20 bg-muted/50 border-border/50"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="shortBreak" className="text-sm">Short Break</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) => onSettingsChange({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
                  className="w-20 bg-muted/50 border-border/50"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="longBreak" className="text-sm">Long Break</Label>
                <Input
                  id="longBreak"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) => onSettingsChange({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                  className="w-20 bg-muted/50 border-border/50"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="interval" className="text-sm">Long Break Interval</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => onSettingsChange({ longBreakInterval: parseInt(e.target.value) || 4 })}
                  className="w-20 bg-muted/50 border-border/50"
                />
              </div>
            </div>
          </div>

          {/* Sound settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Sound
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="text-sm flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Enable Sounds
              </Label>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(volume)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Auto-start settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Auto-start
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-breaks" className="text-sm">Auto-start Breaks</Label>
                <Switch
                  id="auto-breaks"
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => onSettingsChange({ autoStartBreaks: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-pomodoros" className="text-sm">Auto-start Pomodoros</Label>
                <Switch
                  id="auto-pomodoros"
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => onSettingsChange({ autoStartPomodoros: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
