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
  breakdown?: Record<string, number>;
}

interface ConversionFunnelChartProps {
  stages: FunnelStage[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Animated number component
const AnimatedNumber = ({ value, prefix = '', suffix = '', duration = 1200 }: { value: number; prefix?: string; suffix?: string; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

// Conversion connector between stages
const ConversionConnector = ({ rate, delay }: { rate: number; delay: number }) => (
  <motion.div 
    className="flex items-center py-2 ml-7"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay / 1000, duration: 0.5 }}
  >
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent" />
    <div className="flex items-center px-3 py-1 mx-3 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-400">
      <svg width="10" height="10" viewBox="0 0 10 10" className="mr-1.5 opacity-50">
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
      </svg>
      {rate.toFixed(1)}%
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent" />
  </motion.div>
);

export function ConversionFunnelChart({
  stages,
  dateRange,
}: ConversionFunnelChartProps) {
  const [animated, setAnimated] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

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
  const stageColors = [
    { primary: "#3B82F6", secondary: "#60A5FA", glow: "rgba(59, 130, 246, 0.3)", icon: "👁" },
    { primary: "#8B5CF6", secondary: "#A78BFA", glow: "rgba(139, 92, 246, 0.3)", icon: "✉" },
    { primary: "#F59E0B", secondary: "#FBBF24", glow: "rgba(245, 158, 11, 0.3)", icon: "🤝" },
    { primary: "#10B981", secondary: "#34D399", glow: "rgba(16, 185, 129, 0.3)", icon: "💰" },
  ];

  const formatDateRange = () => {
    if (!dateRange) return "Date Range";
    try {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      return `${formatDate(start)} - ${formatDate(end)}`;
    } catch {
      return "Date Range";
    }
  };

  // Calculate conversion rates
  const getConversionRate = (fromIndex: number) => {
    if (fromIndex >= stages.length - 1) return 0;
    const from = stages[fromIndex].count;
    const to = stages[fromIndex + 1].count;
    return from > 0 ? (to / from) * 100 : 0;
  };

  // Get source breakdown for first stage (sessions/traffic)
  const getSourceBreakdown = () => {
    if (stages.length === 0 || !stages[0].breakdown) return [];
    
    const breakdown = stages[0].breakdown;
    const channelColors: Record<string, string> = {
      "LinkedIn": "#0A66C2",
      "Reddit": "#FF4500",
      "Google Ads": "#4285f4",
      "Organic": "#10B981",
      "Direct": "#94A3B8",
      "Email": "#ea4335",
      "Social": "#8e75b2",
      "Referral": "#fbbc04",
      "Other": "#5f6368",
    };

    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([channel, value]) => ({
        name: channel,
        value: value,
        color: channelColors[channel] || "#6b7280",
      }));
  };

  const sourceBreakdown = getSourceBreakdown();
  const totalBreakdown = sourceBreakdown.reduce((sum, s) => sum + s.value, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .funnel-widget {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #0F0F14 0%, #1A1A24 50%, #0F0F14 100%);
          border-radius: 20px;
          padding: 32px;
          min-height: 600px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .funnel-widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        
        .widget-title {
          font-size: 24px;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.5px;
        }
        
        .widget-subtitle {
          font-size: 13px;
          color: #71717A;
          margin-top: 4px;
          font-weight: 400;
        }
        
        .widget-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 13px;
          color: #10B981;
          font-weight: 500;
        }
        
        .widget-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .funnel-content {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 40px;
        }
        
        .funnel-stages {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        
        .funnel-stage {
          padding: 16px 0;
        }
        
        .funnel-stage.hovered .bar-fill {
          filter: brightness(1.1);
        }
        
        .stage-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .stage-icon {
          font-size: 18px;
        }
        
        .stage-label {
          font-size: 14px;
          font-weight: 500;
          color: #E4E4E7;
        }
        
        .stage-source {
          font-size: 11px;
          color: #52525B;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .bar-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .bar-track {
          flex: 1;
          height: 44px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          transition: box-shadow 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
          transform-origin: left;
        }
        
        .bar-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 2s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .bar-value {
          min-width: 120px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px;
          font-weight: 600;
          color: #FFFFFF;
        }
        
        .bar-amount {
          font-size: 14px;
          color: #10B981;
          margin-left: 4px;
          font-weight: 500;
        }
        
        .source-breakdown {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          height: fit-content;
        }
        
        .source-title {
          font-size: 14px;
          font-weight: 600;
          color: #E4E4E7;
          margin-bottom: 20px;
        }
        
        .source-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .source-item {
          opacity: 0;
          animation: fadeSlideIn 0.4s ease-out forwards;
        }
        
        .source-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .source-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        
        .source-name {
          font-size: 13px;
          color: #A1A1AA;
          flex: 1;
        }
        
        .source-value {
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          color: #E4E4E7;
          font-weight: 500;
        }
        
        .source-bar-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .source-bar-fill {
          height: 100%;
          border-radius: 3px;
          transform-origin: left;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        
        @keyframes fadeSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="funnel-widget">
        <div className="widget-header">
          <div>
            <div className="widget-title">Conversion Funnel</div>
            <div className="widget-subtitle">Full pipeline efficiency • {formatDateRange()}</div>
          </div>
          <div className="widget-badge">
            <div className="widget-badge-dot" />
            Live Data
          </div>
        </div>
        
        <div className="funnel-content">
          <div className="funnel-stages">
            {stages.map((stage, index) => {
              const widthPercent = (stage.count / maxCount) * 100;
              const color = stageColors[index % stageColors.length];
              const stageId = `stage-${stage.number}`;
              
              return (
                <div key={stage.number}>
                  <motion.div
                    className={`funnel-stage ${hoveredStage === stageId ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredStage(stageId)}
                    onMouseLeave={() => setHoveredStage(null)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={animated ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="stage-header">
                      <span className="stage-icon">{color.icon}</span>
                      <span className="stage-label">{stage.name}</span>
                      <span className="stage-source">GA4</span>
                    </div>
                    
                    <div className="bar-container">
                      <div 
                        className="bar-track"
                        style={{ 
                          boxShadow: hoveredStage === stageId ? `0 0 30px ${color.glow}` : 'none'
                        }}
                      >
                        <motion.div 
                          className="bar-fill"
                          style={{ 
                            background: `linear-gradient(90deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                          }}
                          initial={{ scaleX: 0 }}
                          animate={animated ? { scaleX: widthPercent / 100 } : { scaleX: 0 }}
                          transition={{ delay: index * 0.15 + 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          <div className="bar-shimmer" />
                        </motion.div>
                      </div>
                      
                      <div className="bar-value">
                        <AnimatedNumber value={stage.count} duration={1200 + index * 100} />
                        <span className="text-sm text-gray-400 ml-2">
                          ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {index < stages.length - 1 && (
                    <ConversionConnector 
                      rate={getConversionRate(index)} 
                      delay={index * 150 + 400}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {sourceBreakdown.length > 0 && (
            <div className="source-breakdown">
              <div className="source-title">Traffic Sources</div>
              <div className="source-bars">
                {sourceBreakdown.slice(0, 6).map((source, i) => (
                  <motion.div 
                    key={source.name} 
                    className="source-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={animated ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  >
                    <div className="source-header">
                      <span className="source-dot" style={{ background: source.color }} />
                      <span className="source-name">{source.name}</span>
                      <span className="source-value">
                        {totalBreakdown > 0 ? ((source.value / totalBreakdown) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="source-bar-track">
                      <motion.div 
                        className="source-bar-fill" 
                        style={{ 
                          background: source.color
                        }}
                        initial={{ scaleX: 0 }}
                        animate={animated ? { scaleX: totalBreakdown > 0 ? source.value / totalBreakdown : 0 } : { scaleX: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
