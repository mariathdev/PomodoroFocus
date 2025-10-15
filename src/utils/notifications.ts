// Browser Notification API wrapper with permission flow

export type NotificationPermission = 'default' | 'granted' | 'denied';

class NotificationManager {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission as NotificationPermission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[NotificationManager] Notifications not supported');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result as NotificationPermission;
      console.log('[NotificationManager] Permission:', result);
      return this.permission;
    } catch (error) {
      console.error('[NotificationManager] Permission request failed:', error);
      return 'denied';
    }
  }

  async show(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.log('[NotificationManager] Permission not granted, skipping notification');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Vibrate on mobile if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      console.log('[NotificationManager] Notification shown:', title);
    } catch (error) {
      console.error('[NotificationManager] Failed to show notification:', error);
    }
  }

  showPomodoroComplete() {
    this.show('Pomodoro Completed! 🍅', {
      body: 'Great work! Time for a break.',
      tag: 'pomodoro-complete',
      requireInteraction: false,
    });
  }

  showBreakComplete() {
    this.show('Break Over! ⏰', {
      body: 'Ready to focus again?',
      tag: 'break-complete',
      requireInteraction: false,
    });
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const notificationManager = new NotificationManager();
