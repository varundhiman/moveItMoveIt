import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-neutral-950 px-4 py-2 text-xs font-bold shadow-lg animate-bounce">
      <WifiOff className="w-4 h-4 stroke-[2.5]" />
      <span>Offline Mode — Rep tracking & local routine logs cached safely</span>
    </div>
  );
};
