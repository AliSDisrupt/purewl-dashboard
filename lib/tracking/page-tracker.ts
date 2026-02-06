/**
 * Client-side page tracking utility
 * Tracks page visits and clicks, sends to API
 */

interface TrackingData {
  pageUrl: string;
  pageTitle?: string;
  pagePath: string;
  clickType?: "link" | "button" | "form" | "other";
  clickedElement?: string;
  clickedUrl?: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  browser?: string;
  operatingSystem?: string;
  screenResolution?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

class PageTracker {
  private sessionId: string;
  private visitorId: string | null = null;
  private initialized = false;

  constructor() {
    // Get or create session ID
    this.sessionId = this.getOrCreateSessionId();
    
    // Get or create visitor ID (persistent across sessions)
    this.visitorId = this.getOrCreateVisitorId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";
    
    const stored = sessionStorage.getItem("tracking_session_id");
    if (stored) return stored;
    
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tracking_session_id", newId);
    return newId;
  }

  private getOrCreateVisitorId(): string | null {
    if (typeof window === "undefined") return null;
    
    const stored = localStorage.getItem("tracking_visitor_id");
    if (stored) return stored;
    
    const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tracking_visitor_id", newId);
    return newId;
  }

  private getDeviceType(): "desktop" | "mobile" | "tablet" {
    if (typeof window === "undefined") return "desktop";
    
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private getBrowser(): string {
    if (typeof window === "undefined") return "";
    
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private getOS(): string {
    if (typeof window === "undefined") return "";
    
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown";
  }

  private getScreenResolution(): string {
    if (typeof window === "undefined") return "";
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getUTMParams(): {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  } {
    if (typeof window === "undefined") return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      utmContent: params.get("utm_content") || undefined,
    };
  }

  private async sendTracking(data: TrackingData): Promise<void> {
    try {
      await fetch("/api/tracking/page-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          sessionId: this.sessionId,
          visitorId: this.visitorId,
        }),
      });
    } catch (error) {
      console.error("Failed to send tracking data:", error);
    }
  }

  public trackPageView(): void {
    if (typeof window === "undefined") return;
    
    const data: TrackingData = {
      pageUrl: window.location.href,
      pageTitle: document.title,
      pagePath: window.location.pathname,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      operatingSystem: this.getOS(),
      screenResolution: this.getScreenResolution(),
      ...this.getUTMParams(),
    };

    this.sendTracking(data);
  }

  public trackClick(
    element: HTMLElement,
    type: "link" | "button" | "form" | "other" = "other"
  ): void {
    if (typeof window === "undefined") return;
    
    const clickedUrl = element.tagName === "A" 
      ? (element as HTMLAnchorElement).href 
      : undefined;
    
    const clickedElement = element.id || 
      element.className || 
      element.tagName || 
      element.textContent?.substring(0, 50);

    const data: TrackingData = {
      pageUrl: window.location.href,
      pageTitle: document.title,
      pagePath: window.location.pathname,
      clickType: type,
      clickedElement,
      clickedUrl,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      operatingSystem: this.getOS(),
      screenResolution: this.getScreenResolution(),
      ...this.getUTMParams(),
    };

    this.sendTracking(data);
  }

  public init(): void {
    if (this.initialized || typeof window === "undefined") return;
    
    // Track initial page view
    this.trackPageView();

    // Track clicks on links
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const link = target.closest("a");
      if (link) {
        this.trackClick(link, "link");
        return;
      }

      const button = target.closest("button");
      if (button) {
        this.trackClick(button, "button");
        return;
      }

      const form = target.closest("form");
      if (form) {
        this.trackClick(target, "form");
        return;
      }
    });

    // Track page changes (for SPA navigation)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(() => this.trackPageView(), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Track on popstate (browser back/forward)
    window.addEventListener("popstate", () => {
      setTimeout(() => this.trackPageView(), 100);
    });

    this.initialized = true;
  }
}

// Export singleton instance
export const pageTracker = new PageTracker();

// Auto-initialize when imported in browser
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      pageTracker.init();
    });
  } else {
    pageTracker.init();
  }
}
