// Notification Service for SERENE
// Manages browser push notifications for wellness reminders

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isPermissionGranted()) {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options,
    };

    new Notification(title, defaultOptions);
  }

  // Wellness Reminder Notifications
  async sendMoodCheckInReminder(): Promise<void> {
    await this.sendNotification('Time for a mood check-in 💙', {
      body: 'How are you feeling today? Track your mood in SERENE.',
      tag: 'mood-reminder',
      requireInteraction: false,
    });
  }

  async sendJournalReminder(): Promise<void> {
    await this.sendNotification('Journal time ✍️', {
      body: 'Take a moment to reflect and write in your journal.',
      tag: 'journal-reminder',
      requireInteraction: false,
    });
  }

  async sendBreathingExerciseReminder(): Promise<void> {
    await this.sendNotification('Take a breathing break 🌬️', {
      body: 'Pause and practice a calming breathing exercise.',
      tag: 'breathing-reminder',
      requireInteraction: false,
    });
  }

  async sendWellnessCheckIn(): Promise<void> {
    await this.sendNotification('How are you today? 🤗', {
      body: 'Check in with yourself. SERENE is here to support you.',
      tag: 'wellness-checkin',
      requireInteraction: false,
    });
  }

  // Schedule daily reminders (example implementation)
  scheduleDaily Reminders(enabled: boolean): void {
    // Clear existing reminders
    const reminderKeys = [
      'mood-reminder-interval',
      'journal-reminder-interval',
      'breathing-reminder-interval',
    ];

    reminderKeys.forEach((key) => {
      const intervalId = localStorage.getItem(key);
      if (intervalId) {
        clearInterval(parseInt(intervalId));
        localStorage.removeItem(key);
      }
    });

    if (!enabled) return;

    // Mood check-in: Every 6 hours
    const moodInterval = setInterval(() => {
      this.sendMoodCheckInReminder();
    }, 6 * 60 * 60 * 1000);
    localStorage.setItem('mood-reminder-interval', String(moodInterval));

    // Journal reminder: Daily at 8 PM (simplified - would use a proper scheduler in production)
    const journalInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 20) {
        this.sendJournalReminder();
      }
    }, 60 * 60 * 1000); // Check every hour
    localStorage.setItem('journal-reminder-interval', String(journalInterval));

    // Breathing exercise: Every 4 hours
    const breathingInterval = setInterval(() => {
      this.sendBreathingExerciseReminder();
    }, 4 * 60 * 60 * 1000);
    localStorage.setItem('breathing-reminder-interval', String(breathingInterval));
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
