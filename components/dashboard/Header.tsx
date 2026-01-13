"use client";

import { useState } from "react";
import { RefreshCw, Bot, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AgentPopup } from "@/components/agent/AgentPopup";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const queryClient = useQueryClient();
  const [agentOpen, setAgentOpen] = useState(false);
  const { data: session } = useSession();

  const handleRefresh = () => {
    // Invalidate all queries to force refresh
    queryClient.invalidateQueries();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex h-16 items-center justify-between px-6 glass m-4 rounded-xl mb-0"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-glow">
            {session?.user?.name 
              ? `Welcome, ${session.user.name}` 
              : session?.user?.email 
              ? `Welcome, ${session.user.email.split("@")[0]}` 
              : "Dashboard Overview"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAgentOpen(true)}
          >
            <Bot className="h-4 w-4" />
            Ask Atlas
          </Button>
          <DateRangePicker />
          <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {session && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </motion.header>
      <AgentPopup open={agentOpen} onOpenChange={setAgentOpen} />
    </>
  );
}
