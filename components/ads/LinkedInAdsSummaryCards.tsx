"use client";

import { LinkedInAdsSummary } from "@/types/ads";
import { formatNumber } from "@/lib/utils";
import { DollarSign, Eye, MousePointerClick, Users, TrendingUp, Target, Briefcase } from "lucide-react";

interface LinkedInAdsSummaryCardsProps {
  summary: LinkedInAdsSummary;
  isLoading?: boolean;
}

export function LinkedInAdsSummaryCards({ summary, isLoading = false }: LinkedInAdsSummaryCardsProps) {
  const cards = [
    {
      label: "Total Ad Spend",
      value: `$${formatNumber(summary.totalSpend)}`,
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Impressions",
      value: formatNumber(summary.totalImpressions),
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Clicks",
      value: formatNumber(summary.totalClicks),
      icon: MousePointerClick,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Cost Per Click",
      value: `$${summary.cpc.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Leads Generated",
      value: formatNumber(summary.totalLeads),
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Conversion Rate",
      value: `${summary.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "Total Deal Value",
      value: `$${formatNumber(summary.totalDealValue)}`,
      icon: Briefcase,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Deal Conversion",
      value: `${summary.dealConversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            )}
            {!isLoading && card.label === "Cost Per Click" && summary.totalClicks > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                CTR: {summary.ctr.toFixed(2)}%
              </div>
            )}
            {!isLoading && card.label === "Conversion Rate" && (
              <div className="text-xs text-muted-foreground mt-1">
                {summary.totalLeads} leads from {summary.totalClicks} clicks
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
