import { Loader2 } from "lucide-react";

export default function InsightsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading insights...</span>
    </div>
  );
}
