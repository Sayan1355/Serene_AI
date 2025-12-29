import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowInstallPrompt(false);
  };

  return (
    <>
      {/* Update Available Notification */}
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-[350px] shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {offlineReady ? 'App ready to work offline' : 'New version available'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {offlineReady
                  ? 'SERENE is now ready to work offline'
                  : 'Click reload to update to the latest version'}
              </CardDescription>
            </CardHeader>
            {needRefresh && (
              <CardContent>
                <Button
                  onClick={() => updateServiceWorker(true)}
                  className="w-full"
                >
                  Reload
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-[350px] shadow-lg border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Install SERENE
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Install SERENE on your device for quick access and offline support
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={handleInstallClick} className="flex-1">
                Install
              </Button>
              <Button onClick={close} variant="outline" className="flex-1">
                Not now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
