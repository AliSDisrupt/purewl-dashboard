"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Megaphone,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Ads", href: "/ads", icon: Megaphone },
  { name: "Community", href: "/community", icon: MessageSquare },
];

export function Sidebar() {
  const pathnameFromHook = usePathname();
  const [pathname, setPathname] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    setPathname(pathnameFromHook || "");
  }, [pathnameFromHook]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "hidden md:flex flex-col m-4 rounded-xl glass border-none overflow-hidden transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.h1
              key="expanded"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent whitespace-nowrap"
            >
              PureWL
            </motion.h1>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
            >
              P
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 group",
                isCollapsed ? "justify-center" : "gap-3",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="relative h-5 w-5 z-10 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-colors group",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
              Settings
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
