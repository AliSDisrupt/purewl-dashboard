"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Calendar, CalendarDays } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Custom hook to share date range state
const DATE_RANGE_KEY = "dashboard-date-range";
const DATE_RANGE_TYPE_KEY = "dashboard-date-range-type";
const CUSTOM_START_DATE_KEY = "dashboard-custom-start-date";
const CUSTOM_END_DATE_KEY = "dashboard-custom-end-date";

type DateRangeType = "preset" | "custom" | "today" | "yesterday";

interface DateRangeConfig {
  startDate: string;
  endDate: string;
  label: string;
}

export function DateRangePicker() {
  const [rangeType, setRangeType] = useState<DateRangeType>("preset");
  const [presetDays, setPresetDays] = useState(7);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const queryClient = useQueryClient();

  // Load saved date range from localStorage
  useEffect(() => {
    const savedType = localStorage.getItem(DATE_RANGE_TYPE_KEY) as DateRangeType | null;
    if (savedType) {
      setRangeType(savedType);
      
      if (savedType === "preset") {
        const savedDays = localStorage.getItem(DATE_RANGE_KEY);
        if (savedDays) {
          const days = parseInt(savedDays);
          if (!isNaN(days)) {
            setPresetDays(days);
          }
        }
      } else if (savedType === "custom") {
        const savedStart = localStorage.getItem(CUSTOM_START_DATE_KEY);
        const savedEnd = localStorage.getItem(CUSTOM_END_DATE_KEY);
        if (savedStart) {
          setCustomStartDate(new Date(savedStart));
        }
        if (savedEnd) {
          setCustomEndDate(new Date(savedEnd));
        }
      }
    }
  }, []);

  // Listen for date range changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedType = localStorage.getItem(DATE_RANGE_TYPE_KEY) as DateRangeType | null;
      if (savedType && savedType !== rangeType) {
        setRangeType(savedType);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dateRangeChange", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dateRangeChange", handleStorageChange);
    };
  }, [rangeType]);

  const getDateRangeConfig = (): DateRangeConfig => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (rangeType) {
      case "today": {
        const start = new Date(today);
        const end = new Date(today);
        return {
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
          label: "Today",
        };
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: format(yesterday, "yyyy-MM-dd"),
          endDate: format(yesterday, "yyyy-MM-dd"),
          label: "Yesterday",
        };
      }
      case "custom": {
        if (customStartDate && customEndDate) {
          return {
            startDate: format(customStartDate, "yyyy-MM-dd"),
            endDate: format(customEndDate, "yyyy-MM-dd"),
            label: `${format(customStartDate, "MMM d")} - ${format(customEndDate, "MMM d")}`,
          };
        }
        // Fallback to preset if custom dates not set
        const start = new Date(today);
        start.setDate(start.getDate() - presetDays);
        return {
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
          label: `Last ${presetDays} days`,
        };
      }
      default: {
        const start = new Date(today);
        start.setDate(start.getDate() - presetDays);
        return {
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
          label: `Last ${presetDays} days`,
        };
      }
    }
  };

  const applyDateRange = (config: DateRangeConfig) => {
    // Invalidate all GA4 queries to refetch with new date range
    queryClient.invalidateQueries({ queryKey: ["ga4-overview"] });
    queryClient.invalidateQueries({ queryKey: ["ga4-channels"] });
    queryClient.invalidateQueries({ queryKey: ["ga4-geography"] });
    queryClient.invalidateQueries({ queryKey: ["ga4-pages"] });
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("dateRangeChange"));
  };

  const handlePresetChange = (days: number) => {
    setRangeType("preset");
    setPresetDays(days);
    localStorage.setItem(DATE_RANGE_TYPE_KEY, "preset");
    localStorage.setItem(DATE_RANGE_KEY, days.toString());
    applyDateRange(getDateRangeConfig());
  };

  const handleToday = () => {
    setRangeType("today");
    localStorage.setItem(DATE_RANGE_TYPE_KEY, "today");
    applyDateRange(getDateRangeConfig());
  };

  const handleYesterday = () => {
    setRangeType("yesterday");
    localStorage.setItem(DATE_RANGE_TYPE_KEY, "yesterday");
    applyDateRange(getDateRangeConfig());
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setRangeType("custom");
      localStorage.setItem(DATE_RANGE_TYPE_KEY, "custom");
      localStorage.setItem(CUSTOM_START_DATE_KEY, customStartDate.toISOString());
      localStorage.setItem(CUSTOM_END_DATE_KEY, customEndDate.toISOString());
      setIsCustomOpen(false);
      applyDateRange(getDateRangeConfig());
    }
  };

  const dateRanges = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 14 days", value: 14 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
  ];

  const currentConfig = getDateRangeConfig();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {currentConfig.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Quick Options */}
        <DropdownMenuItem onClick={handleToday}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Today
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleYesterday}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Yesterday
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Preset Ranges */}
        {dateRanges.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() => handlePresetChange(range.value)}
            className={rangeType === "preset" && presetDays === range.value ? "bg-accent" : ""}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {range.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Custom Date Range */}
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsCustomOpen(true);
              }}
              className={rangeType === "custom" ? "bg-accent" : ""}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Custom Range
            </DropdownMenuItem>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Start Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">End Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    disabled={(date) => {
                      if (customStartDate) {
                        return date < customStartDate;
                      }
                      return false;
                    }}
                    className="rounded-md border"
                  />
                </div>
              </div>
              {customStartDate && customEndDate && (
                <div className="text-xs text-muted-foreground text-center">
                  {format(customStartDate, "MMM d, yyyy")} - {format(customEndDate, "MMM d, yyyy")}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1"
                  size="sm"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                    setIsCustomOpen(false);
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
