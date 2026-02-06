"use client";

import { useEffect } from "react";
import { pageTracker } from "@/lib/tracking/page-tracker";

/**
 * Page Tracking Component
 * Initializes page tracking on all pages
 */
export function PageTracking() {
  useEffect(() => {
    // Initialize tracking
    pageTracker.init();
  }, []);

  return null; // This component doesn't render anything
}
