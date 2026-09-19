import { Loader2 } from 'lucide-react';

/**
 * Full-page loading spinner used as Suspense fallback during
 * route-level code splitting transitions.
 */
export default function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
