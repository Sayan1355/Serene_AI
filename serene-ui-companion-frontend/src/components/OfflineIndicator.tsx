import { useEffect, useState } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back online',
        description: 'Your connection has been restored. Syncing pending messages...',
        duration: 3000,
      });
      
      // Sync pending messages
      syncPendingMessages();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'You are offline',
        description: 'Messages will be saved and synced when you reconnect.',
        duration: 5000,
        variant: 'destructive',
      });
    };

    offlineStorage.onOnline(handleOnline);
    offlineStorage.onOffline(handleOffline);

    return () => {
      offlineStorage.removeOnlineListener(handleOnline);
      offlineStorage.removeOfflineListener(handleOffline);
    };
  }, [toast]);

  const syncPendingMessages = async () => {
    try {
      const pendingMessages = await offlineStorage.getPendingMessages();
      
      for (const message of pendingMessages) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.access_token || ''}`,
            },
            body: JSON.stringify({
              text: message.content,
              conversation_id: message.conversationId,
            }),
          });

          if (response.ok) {
            await offlineStorage.markAsSynced(message.id);
          }
        } catch (error) {
          console.error('Failed to sync message:', error);
        }
      }

      // Clean up synced messages
      await offlineStorage.deleteSyncedMessages();
    } catch (error) {
      console.error('Failed to sync pending messages:', error);
    }
  };

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>You are currently offline. Messages will be saved and synced when you reconnect.</span>
    </div>
  );
}
