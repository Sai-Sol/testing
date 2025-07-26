
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2 } from "lucide-react";

export default function TpsWidget() {
  const [tps, setTps] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTps = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://www.megaexplorer.xyz/api/v2/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setTps(parseFloat(data.tps));
      } catch (error) {
        console.error("Error fetching TPS:", error);
        setTps(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTps();
    const interval = setInterval(fetchTps, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">MegaETH TPS</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading && tps === null ? (
            <Loader2 className="h-6 w-6 animate-spin" />
        ) : tps !== null ? (
            <>
                <div className="text-2xl font-bold">{tps.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                    Live transactions per second on the network.
                </p>
            </>
        ) : (
            <p className="text-sm text-red-500">Could not load TPS data.</p>
        )}
      </CardContent>
    </Card>
  );
}
