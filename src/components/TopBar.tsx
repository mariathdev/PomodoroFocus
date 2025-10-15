import { Bell, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { notificationManager } from '@/utils/notifications';
import { SettingsModal } from './SettingsModal';
import { TimerSettings } from '@/hooks/useTimer';

interface TopBarProps {
  settings: TimerSettings;
  onSettingsChange: (settings: Partial<TimerSettings>) => void;
}

export function TopBar({ settings, onSettingsChange }: TopBarProps) {
  const [notificationPermission, setNotificationPermission] = useState(
    notificationManager.getPermission()
  );

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'granted') {
      // Can't revoke permission programmatically, inform user
      alert('To disable notifications, please change your browser settings.');
      return;
    }

    const permission = await notificationManager.requestPermission();
    setNotificationPermission(permission);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Pomodoro Focus
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification toggle */}
        {notificationManager.isSupported() && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleNotificationToggle}
            className="h-10 w-10 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
            title="Toggle Notifications"
          >
            {notificationPermission === 'granted' ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Settings */}
        <SettingsModal settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </div>
  );
}
