"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Building2, 
  User, 
  Mail, 
  ExternalLink, 
  Calendar,
  Filter,
  Search,
  Linkedin,
  MapPin,
  Briefcase,
  Users,
  Globe,
  Zap,
  Phone,
  Monitor,
  Clock,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe2,
  Target,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RB2BVisitor {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  company?: string;
  companyDomain?: string;
  jobTitle?: string;
  linkedInUrl?: string;
  phone?: string;
  twitterUrl?: string;
  githubUrl?: string;
  seniority?: string;
  department?: string;
  industry?: string;
  companySize?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  country?: string;
  city?: string;
  region?: string;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  visitedAt: string;
  visitCount?: number;
  timeOnSite?: number;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  engagementScore?: number;
  intentSignals?: string[];
  pagesViewed?: string[];
  formSubmissions?: string[];
}

async function fetchRB2BVisitors(limit: number = 100) {
  const res = await fetch(`/api/rb2b/visitors?limit=${limit}`);
  if (!res.ok) {
    throw new Error("Failed to fetch visitors");
  }
  return res.json();
}

export default function SignalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "company" | "location">("newest");
  const [expandedVisitors, setExpandedVisitors] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch } = useQuery<{ visitors: RB2BVisitor[]; total: number }>({
    queryKey: ["rb2b-visitors"],
    queryFn: () => fetchRB2BVisitors(100),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const visitors = data?.visitors || [];
  const total = data?.total || 0;

  // Filter and sort visitors
  const filteredVisitors = visitors
    .filter((visitor) => {
      const matchesSearch = 
        (visitor.company?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (visitor.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (visitor.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (visitor.jobTitle?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesIndustry = filterIndustry === "all" || visitor.industry === filterIndustry;
      
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime();
      } else if (sortBy === "company") {
        return (a.company || "").localeCompare(b.company || "");
      } else {
        return (a.country || "").localeCompare(b.country || "");
      }
    });

  // Get unique industries for filter
  const uniqueIndustries = Array.from(new Set(visitors.map(v => v.industry).filter(Boolean)));

  // Get unique companies count
  const uniqueCompanies = new Set(visitors.map(v => v.company).filter(Boolean)).size;

  // Get visitors from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayVisitors = visitors.filter(v => new Date(v.visitedAt) >= today).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      `}</style>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FFF', margin: 0 }}>Website Visitor Signals</h1>
            <span style={{
              fontSize: 11,
              color: '#F97316',
              background: 'rgba(249, 115, 22, 0.15)',
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 600,
            }}>RB2B</span>
          </div>
          <p style={{ fontSize: 14, color: '#71717A', margin: '8px 0 0' }}>
            Identified website visitors • Auto-refreshes every 30 seconds
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)', opacity: 0.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase' }}>Total Identified</span>
            <Users className="h-4 w-4 text-blue-400 opacity-60" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{total}</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg, transparent, #10B981, transparent)', opacity: 0.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase' }}>Today</span>
            <Zap className="h-4 w-4 text-emerald-400 opacity-60" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{todayVisitors}</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)', opacity: 0.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase' }}>Unique Companies</span>
            <Building2 className="h-4 w-4 text-purple-400 opacity-60" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{uniqueCompanies}</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(14, 14, 20, 0.8) 0%, rgba(18, 18, 26, 0.8) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: '20px 24px',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)', opacity: 0.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase' }}>Industries</span>
            <Globe className="h-4 w-4 text-amber-400 opacity-60" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', fontFamily: "'JetBrains Mono', monospace" }}>{uniqueIndustries.length}</div>
        </div>
      </div>

      {/* Webhook Info */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(14, 14, 20, 0.8) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔗</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#E4E4E7' }}>Webhook URL: </span>
            <code style={{ 
              fontSize: 12, 
              color: '#3B82F6', 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              /api/webhooks/rb2b
            </code>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#52525B' }}>Configure this URL in your RB2B dashboard settings</span>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Identified Visitors
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search visitors, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              {uniqueIndustries.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Industry: {filterIndustry === "all" ? "All" : filterIndustry}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterIndustry("all")}>
                      All Industries
                    </DropdownMenuItem>
                    {uniqueIndustries.map((industry) => (
                      <DropdownMenuItem key={industry} onClick={() => setFilterIndustry(industry!)}>
                        {industry}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort: {sortBy === "newest" ? "Newest" : sortBy === "company" ? "Company" : "Location"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("company")}>
                    Company Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("location")}>
                    Location
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading visitors...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-red-500">Failed to load visitors</p>
            </div>
          )}

          {!isLoading && !error && filteredVisitors.length === 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: 40,
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 48, opacity: 0.6 }}>👥</span>
              <span style={{ fontSize: 15, color: '#71717A' }}>No visitors identified yet</span>
              <span style={{ fontSize: 13, color: '#52525B', textAlign: 'center', maxWidth: 400 }}>
                RB2B will send visitor data to the webhook when they identify someone on your website. 
                Make sure your RB2B pixel is installed and the webhook URL is configured.
              </span>
            </div>
          )}

          {!isLoading && !error && filteredVisitors.length > 0 && (
            <div className="space-y-3">
              {filteredVisitors.map((visitor) => {
                const isExpanded = expandedVisitors.has(visitor.id);
                return (
                  <div 
                    key={visitor.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: 20,
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-accent/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Visitor Info */}
                        <div className="flex items-start gap-4">
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#FFF',
                            flexShrink: 0,
                          }}>
                            {(visitor.firstName?.[0] || visitor.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="font-semibold text-lg text-white">
                                {visitor.fullName || visitor.email || 'Unknown Visitor'}
                              </h3>
                              {visitor.seniority && (
                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                  {visitor.seniority}
                                </Badge>
                              )}
                              {visitor.linkedInUrl && (
                                <a
                                  href={visitor.linkedInUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#0A66C2] hover:underline text-sm"
                                >
                                  <Linkedin className="h-4 w-4" />
                                  LinkedIn
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              {visitor.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{visitor.email}</span>
                                </div>
                              )}
                              {visitor.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{visitor.phone}</span>
                                </div>
                              )}
                              {visitor.jobTitle && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{visitor.jobTitle}</span>
                                </div>
                              )}
                              {visitor.department && (
                                <Badge variant="outline" className="text-xs">
                                  {visitor.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Company & Location Info */}
                        <div className="pl-16 space-y-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            {visitor.company && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-400" />
                                <span className="font-medium text-white">{visitor.company}</span>
                                {visitor.companyDomain && (
                                  <Badge variant="outline" className="text-xs">
                                    {visitor.companyDomain}
                                  </Badge>
                                )}
                                {visitor.companyWebsite && (
                                  <a
                                    href={visitor.companyWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Globe2 className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            )}
                            {visitor.industry && (
                              <Badge variant="secondary" className="text-xs">
                                {visitor.industry}
                              </Badge>
                            )}
                            {visitor.companySize && (
                              <Badge variant="outline" className="text-xs">
                                {visitor.companySize} employees
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {(visitor.city || visitor.country) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {[visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(visitor.visitedAt), { addSuffix: true })}
                              </span>
                            </div>
                            {visitor.visitCount && visitor.visitCount > 1 && (
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>{visitor.visitCount} visits</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Page & Visit Details */}
                        <div className="pl-16 space-y-2">
                          {visitor.pageUrl && (
                            <div className="flex items-start gap-2">
                              <ExternalLink className="h-3 w-3 mt-1 text-blue-400" />
                              <div className="flex-1 min-w-0">
                                {visitor.pageTitle && (
                                  <div className="text-sm font-medium text-white mb-1">{visitor.pageTitle}</div>
                                )}
                                <a
                                  href={visitor.pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                                >
                                  {visitor.pageUrl}
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {/* Visit Stats */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {visitor.timeOnSite && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{Math.floor(visitor.timeOnSite / 60)}m {visitor.timeOnSite % 60}s on site</span>
                              </div>
                            )}
                            {visitor.deviceType && (
                              <div className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                <span>{visitor.deviceType}</span>
                                {visitor.browser && <span className="ml-1">• {visitor.browser}</span>}
                              </div>
                            )}
                            {visitor.engagementScore && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>Engagement: {visitor.engagementScore}/100</span>
                              </div>
                            )}
                          </div>

                          {/* UTM Parameters */}
                          {(visitor.utmSource || visitor.utmMedium || visitor.utmCampaign) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Source:</span>
                              {visitor.utmSource && (
                                <Badge variant="outline" className="text-xs">
                                  {visitor.utmSource}
                                </Badge>
                              )}
                              {visitor.utmMedium && (
                                <Badge variant="outline" className="text-xs">
                  {visitor.utmMedium}
                                </Badge>
                              )}
                              {visitor.utmCampaign && (
                                <Badge variant="outline" className="text-xs">
                  {visitor.utmCampaign}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="pl-16 space-y-3 pt-2 border-t border-white/5">
                            {/* Intent Signals */}
                            {visitor.intentSignals && visitor.intentSignals.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-3 w-3 text-orange-400" />
                                  <span className="text-xs font-medium text-muted-foreground">Intent Signals</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {visitor.intentSignals.map((signal, i) => (
                                    <Badge key={i} variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
                                      {signal}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pages Viewed */}
                            {visitor.pagesViewed && visitor.pagesViewed.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-3 w-3 text-green-400" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Pages Viewed ({visitor.pagesViewed.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {visitor.pagesViewed.slice(0, 5).map((page, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {page}
                                    </Badge>
                                  ))}
                                  {visitor.pagesViewed.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{visitor.pagesViewed.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Form Submissions */}
                            {visitor.formSubmissions && visitor.formSubmissions.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs font-medium text-muted-foreground">Form Submissions</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {visitor.formSubmissions.map((form, i) => (
                                    <Badge key={i} variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                      {form}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Referrer */}
                            {visitor.referrer && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Referrer: </span>
                                <a href={visitor.referrer} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  {visitor.referrer}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newExpanded = new Set(expandedVisitors);
                          if (isExpanded) {
                            newExpanded.delete(visitor.id);
                          } else {
                            newExpanded.add(visitor.id);
                          }
                          setExpandedVisitors(newExpanded);
                        }}
                        className="flex-shrink-0"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            More
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
