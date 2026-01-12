"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreVertical, Info } from "lucide-react";
import { motion } from "framer-motion";

interface ChannelBreakdown {
  channel: string;
  value: number;
  percentage: number;
}

interface FunnelStage {
  number: number;
  name: string;
  count: number;
  percentage: number;
  color: string;
  breakdown?: Record<string, number>; // Channel breakdown: { "LinkedIn": 100, "Reddit": 50, ... }
}

interface ConversionFunnelChartProps {
  stages: FunnelStage[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export function ConversionFunnelChart({
  stages,
  dateRange,
}: ConversionFunnelChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  if (!stages || stages.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">No funnel data available</div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = stages[0]?.count || 1;
  const stageColors = ["#3b82f6", "#a855f7", "#14b8a6", "#f59e0b"];

  // Debug: Log breakdown data for troubleshooting
  useEffect(() => {
    if (stages.length > 0) {
      stages.forEach((stage) => {
        if (stage.breakdown && Object.keys(stage.breakdown).length > 0) {
          console.log(`[Funnel Chart] Stage ${stage.number} (${stage.name}) breakdown:`, stage.breakdown);
        } else {
          console.log(`[Funnel Chart] Stage ${stage.number} (${stage.name}) has no breakdown data`);
        }
      });
    }
  }, [stages]);

  const formatDateRange = () => {
    if (!dateRange) return "";
    try {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      return `${formatDate(start)} - ${formatDate(end)}T23:59:59`;
    } catch {
      return "";
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-gray-800 text-white overflow-hidden">
      <CardHeader className="pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Conversion Funnel</h2>
          <p className="text-xs text-gray-400">
            FUNNEL • {formatDateRange() || "Date Range"} <Info className="inline h-3 w-3 ml-1" />
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-8 bottom-20 w-10 flex flex-col justify-between">
            {[100, 80, 60, 40, 20, 0].map((value) => (
              <div key={value} className="relative flex items-center">
                <span className="text-xs text-gray-500">{value}%</span>
                <div className="absolute left-10 right-0 h-px bg-[#333333]" />
              </div>
            ))}
          </div>

          {/* Main funnel visualization */}
          <div className="ml-14">
            <div className="flex items-end justify-between gap-6" style={{ minHeight: "400px", paddingBottom: "80px" }}>
              {stages.map((stage, index) => {
                const previousCount = index > 0 ? stages[index - 1].count : maxCount;
                const dropOff = previousCount - stage.count;
                const dropOffPercentage = previousCount > 0 ? (dropOff / previousCount) * 100 : 0;
                const activeHeight = (stage.count / maxCount) * 100;
                const dropOffHeight = (dropOff / maxCount) * 100;
                const stageColor = stageColors[index % stageColors.length];
                const totalBarHeight = index === 0 ? activeHeight : ((previousCount || stage.count) / maxCount) * 100;

                return (
                  <motion.div
                    key={stage.number}
                    className="flex-1 flex flex-col items-center relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {/* Stage number badge */}
                    <div className="mb-3">
                      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                        {stage.number}
                      </div>
                    </div>

                    {/* Bar container - aligned to bottom */}
                    <div 
                      className="relative w-full flex flex-col-reverse items-center" 
                      style={{ height: "320px" }}
                    >
                      {/* Active section with channel breakdown - at bottom */}
                      {stage.count > 0 && (
                        <motion.div
                          className="w-full flex flex-col-reverse"
                          style={{
                            height: `${activeHeight}%`,
                            minHeight: activeHeight > 0 ? "2px" : "0",
                          }}
                          initial={{ height: 0 }}
                          animate={animated ? { height: `${activeHeight}%` } : {}}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                        >
                          {/* Channel breakdown bars */}
                          {stage.breakdown && Object.keys(stage.breakdown).length > 0 && 
                           Object.values(stage.breakdown).some((v: any) => v > 0) ? (
                            (() => {
                              const breakdownEntries = Object.entries(stage.breakdown)
                                .filter(([_, value]) => value > 0)
                                .sort(([_, a], [__, b]) => b - a);
                              
                              if (breakdownEntries.length === 0) {
                                // No valid breakdown data, use solid color
                                return (
                                  <div
                                    className="w-full"
                                    style={{
                                      height: "100%",
                                      backgroundColor: stageColor,
                                    }}
                                  />
                                );
                              }
                              
                              const totalBreakdown = breakdownEntries.reduce((sum, [_, value]) => sum + value, 0);
                              
                              // Channel colors
                              const channelColors: Record<string, string> = {
                                "LinkedIn": "#0077b5",
                                "Reddit": "#ff4500",
                                "Google Ads": "#4285f4",
                                "Organic": "#34a853",
                                "Direct": "#9aa0a6",
                                "Email": "#ea4335",
                                "Social": "#8e75b2",
                                "Referral": "#fbbc04",
                                "Other": "#5f6368",
                              };

                              return breakdownEntries.map(([channel, value], breakdownIndex) => {
                                const channelPercentage = totalBreakdown > 0 ? (value / totalBreakdown) * 100 : 0;
                                // Calculate height as percentage of the active bar height
                                const channelHeight = stage.count > 0 ? (value / stage.count) * 100 : 0;
                                const channelColor = channelColors[channel] || "#6b7280";

                                // Only render if height is significant enough to be visible (at least 1%)
                                if (channelHeight < 1) return null;

                                return (
                                  <motion.div
                                    key={channel}
                                    className="w-full border-t border-gray-800/50"
                                    style={{
                                      height: `${channelHeight}%`,
                                      backgroundColor: channelColor,
                                      minHeight: "3px", // Minimum visible height
                                    }}
                                    initial={{ height: 0 }}
                                    animate={animated ? { height: `${channelHeight}%` } : {}}
                                    transition={{ 
                                      delay: index * 0.1 + 0.2 + (breakdownIndex * 0.05), 
                                      duration: 0.3 
                                    }}
                                    title={`${channel}: ${value} (${channelPercentage.toFixed(1)}%)`}
                                  />
                                );
                              }).filter(Boolean);
                            })()
                          ) : (
                            // Fallback to solid color if no breakdown
                            <div
                              className="w-full"
                              style={{
                                height: "100%",
                                backgroundColor: stageColor,
                              }}
                            />
                          )}
                        </motion.div>
                      )}

                      {/* Drop-off section (striped) - above active section */}
                      {index > 0 && dropOff > 0 && (
                        <motion.div
                          className="w-full relative"
                          style={{
                            height: `${dropOffHeight}%`,
                            minHeight: dropOffHeight > 0 ? "2px" : "0",
                            backgroundImage: `repeating-linear-gradient(
                              45deg,
                              #4b5563 0px,
                              #4b5563 3px,
                              #1f2937 3px,
                              #1f2937 6px
                            )`,
                          }}
                          initial={{ height: 0 }}
                          animate={animated ? { height: `${dropOffHeight}%` } : {}}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        />
                      )}
                    </div>

                    {/* Arrow to next stage */}
                    {index < stages.length - 1 && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full z-10">
                        <span className="text-gray-500 text-lg">→</span>
                      </div>
                    )}

                    {/* Stage name and menu */}
                    <div className="mt-4 flex items-center gap-2 min-h-[40px]">
                      <span className="text-sm font-semibold text-white text-center">
                        {stage.name}
                      </span>
                      <button 
                        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-2 text-center space-y-1 min-h-[60px]">
                      <div className="text-sm text-white font-medium">
                        {stage.count} {stage.count === 1 ? "person" : "persons"} ({stage.percentage.toFixed(2)}%)
                      </div>
                      {index > 0 && dropOff > 0 && (
                        <div className="text-xs text-[#ef4444] flex items-center justify-center gap-1">
                          <span>↘</span>
                          <span>
                            {dropOff} {dropOff === 1 ? "person" : "persons"} ({dropOffPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                      {index === 0 && (
                        <div className="text-xs text-gray-500">
                          {stage.count} {stage.count === 1 ? "person" : "persons"} (100%)
                        </div>
                      )}
                      {/* Channel Breakdown */}
                      {stage.breakdown && Object.keys(stage.breakdown).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(stage.breakdown)
                            .filter(([_, value]) => value > 0)
                            .sort(([_, a], [__, b]) => b - a)
                            .slice(0, 4)
                            .map(([channel, value]) => {
                              const channelPercentage = stage.count > 0 ? (value / stage.count) * 100 : 0;
                              const channelColors: Record<string, string> = {
                                "LinkedIn": "#0077b5",
                                "Reddit": "#ff4500",
                                "Google Ads": "#4285f4",
                                "Organic": "#34a853",
                                "Direct": "#9aa0a6",
                                "Email": "#ea4335",
                                "Social": "#8e75b2",
                                "Referral": "#fbbc04",
                                "Other": "#5f6368",
                              };
                              return (
                                <div key={channel} className="flex items-center justify-center gap-2 text-xs">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: channelColors[channel] || "#6b7280" }}
                                  />
                                  <span className="text-gray-400">
                                    {channel}: {value} ({channelPercentage.toFixed(1)}%)
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <span>⏱</span>
                        <span>–</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
