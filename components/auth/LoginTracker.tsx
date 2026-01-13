"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function LoginTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Track login on client side
      fetch("/api/auth/track-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        console.error("Failed to track login:", error);
      });
    }
  }, [status, session]);

  return null; // This component doesn't render anything
}
