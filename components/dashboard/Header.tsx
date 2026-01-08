"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function Header() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all queries to force refresh
    queryClient.invalidateQueries();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-16 items-center justify-between px-6 glass m-4 rounded-xl mb-0"
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-glow">Dashboard Overview</h2>
      </div>
      <div className="flex items-center gap-2">
        <DateRangePicker />
        <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </motion.header>
  );
}
