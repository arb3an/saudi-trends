import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface LiveIndicatorProps {
  lastUpdated: Date;
  isConnected?: boolean;
}

export function LiveIndicator({ lastUpdated, isConnected = true }: LiveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(
        formatDistanceToNow(lastUpdated, {
          addSuffix: true,
          locale: ar,
        })
      );
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2" data-testid="live-indicator">
      {isConnected && (
        <div className="flex items-center gap-1.5" data-testid="status-connected">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle" data-testid="indicator-pulse" />
          <span className="text-sm font-medium text-primary">مباشر الآن</span>
        </div>
      )}
      <span className="text-xs text-muted-foreground font-mono" dir="ltr" data-testid="text-last-updated">
        {timeAgo}
      </span>
    </div>
  );
}
