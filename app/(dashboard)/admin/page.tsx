"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  User,
  Users,
  Mail,
  Clock,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  Search,
  RefreshCw,
  Trash2,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  lastLoginAt?: string;
  loginHistory: Array<{
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

const MIN_TIME_BETWEEN_LOGINS = 5 * 60 * 1000;

function getUniqueLogins(loginHistory: User["loginHistory"]) {
  const unique: User["loginHistory"] = [];
  for (const login of loginHistory) {
    const loginTime = new Date(login.timestamp).getTime();
    const isDuplicate = unique.some(
      (existing) =>
        Math.abs(new Date(existing.timestamp).getTime() - loginTime) <
        MIN_TIME_BETWEEN_LOGINS
    );
    if (!isDuplicate) unique.push(login);
  }
  return unique;
}

function countLoginsLast7Days(users: User[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let count = 0;
  for (const u of users) {
    if (!u.loginHistory?.length) continue;
    const unique = getUniqueLogins(u.loginHistory);
    for (const login of unique) {
      if (new Date(login.timestamp).getTime() >= cutoff) count++;
    }
  }
  return count;
}

async function fetchUsers() {
  const res = await fetch("/api/admin/users");
  if (!res.ok) {
    if (res.status === 403) throw new Error("Unauthorized - Admin access required");
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch users");
  }
  const data = await res.json();
  console.log('[Admin Page] Fetched users:', {
    count: data.users?.length || 0,
    users: data.users?.map((u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
  });
  return data.users as User[];
}

async function updateUserRole(userId: string, role: "admin" | "user") {
  console.log('[updateUserRole] Calling API with:', { userId, role });
  const res = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    console.error('[updateUserRole] API error:', { status: res.status, data });
    if (res.status === 403) throw new Error("Unauthorized - Admin access required");
    throw new Error(data.error || "Failed to update user role");
  }
  
  console.log('[updateUserRole] API success:', data);
  return data;
}

async function fetchHealth() {
  const res = await fetch("/api/health");
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, { connected: boolean; error: string | null }>>;
}

async function fetchVisitorsCount() {
  const res = await fetch("/api/rb2b/visitors?limit=1");
  if (!res.ok) return null;
  const data = await res.json();
  return (data.total as number) ?? 0;
}

async function clearVisitors() {
  const res = await fetch("/api/rb2b/visitors", { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to clear visitors");
  }
  return res.json();
}

async function fetchLatestInsights() {
  const res = await fetch("/api/insights/latest");
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch insights");
  }
  return res.json();
}

async function fetchTrackedVisitors(limit: number, page: number) {
  const res = await fetch(`/api/tracking/visitors?limit=${limit}&page=${page}`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Unauthorized - Admin access required");
    }
    throw new Error("Failed to fetch tracked visitors");
  }
  return res.json();
}

async function generateInsights() {
  const res = await fetch("/api/insights/generate", { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate insights");
  }
  return res.json();
}

type SortKey = "name" | "email" | "role" | "lastLogin" | "createdAt";
type SortDir = "asc" | "desc";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastLogin");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmRole, setConfirmRole] = useState<{
    user: User;
    newRole: "admin" | "user";
  } | null>(null);

  const [isAdmin, setIsAdmin] = useState(
    session?.user?.role === "admin" || session?.user?.email === "admin@orion.local"
  );

  // Check for updated role from storage periodically
  useEffect(() => {
    if (session?.user?.email) {
      const checkRole = async () => {
        try {
          const res = await fetch("/api/auth/get-role");
          const data = await res.json();
          if (data.role) {
            const adminStatus = data.role === "admin" || session?.user?.email === "admin@orion.local";
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error("Failed to check role:", error);
          setIsAdmin(
            session?.user?.role === "admin" ||
              session?.user?.email === "admin@orion.local"
          );
        }
      };
      
      checkRole();
      // Check every 10 seconds for role updates
      const interval = setInterval(checkRole, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (session && !isAdmin) router.push("/");
  }, [isAdmin, router, session]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const { data: health, refetch: refetchHealth } = useQuery({
    queryKey: ["admin-health"],
    queryFn: fetchHealth,
    enabled: isAdmin,
  });

  const { data: visitorsCount, refetch: refetchVisitors } = useQuery({
    queryKey: ["admin-visitors"],
    queryFn: fetchVisitorsCount,
    enabled: isAdmin,
  });

  const { data: latestInsights, refetch: refetchInsights } = useQuery({
    queryKey: ["admin-insights"],
    queryFn: fetchLatestInsights,
    enabled: isAdmin,
  });

  const [trackedVisitorsPage, setTrackedVisitorsPage] = useState(1);
  const { data: trackedVisitorsData, isLoading: trackedVisitorsLoading, refetch: refetchTrackedVisitors } = useQuery({
    queryKey: ["admin-tracked-visitors", trackedVisitorsPage],
    queryFn: () => fetchTrackedVisitors(50, trackedVisitorsPage),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "admin" | "user" }) =>
      updateUserRole(userId, role),
    onSuccess: async (data, variables) => {
      console.log('[Admin Page] Role update successful:', { userId: variables.userId, role: variables.role, response: data });
      setConfirmRole(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.refetchQueries({ queryKey: ["admin-users"] });
      
      // If updating the current user's role, reload to refresh session
      const currentId = session?.user?.id || session?.user?.email;
      const targetId = variables.userId;
      const targetEmail = users?.find(u => u.id === targetId)?.email;
      
      if (currentId === targetId || session?.user?.email === targetId || session?.user?.email === targetEmail) {
        console.log('[Admin Page] Current user role changed, reloading page...');
        // Show a message before reload
        alert(`Your role has been updated to ${variables.role}. The page will reload to apply changes.`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        // For other users, show a success message
        alert(`Successfully updated ${targetEmail || targetId}'s role to ${variables.role}. They may need to refresh their page to see changes.`);
      }
    },
    onError: (error: any) => {
      console.error('[Admin Page] Role update failed:', error);
      alert(`Failed to update role: ${error.message || 'Unknown error'}`);
    },
  });

  const clearVisitorsMutation = useMutation({
    mutationFn: clearVisitors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-visitors"] });
      refetchVisitors();
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: generateInsights,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-insights"] });
      queryClient.invalidateQueries({ queryKey: ["insights-latest"] });
      refetchInsights();
    },
  });

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];
    let list = [...users];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          cmp = (a.email || "").localeCompare(b.email || "");
          break;
        case "role":
          cmp = (a.role === "admin" ? 1 : 0) - (b.role === "admin" ? 1 : 0);
          break;
        case "lastLogin": {
          const ta = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const tb = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          cmp = ta - tb;
          break;
        }
        case "createdAt":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [users, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, logins7d: 0 };
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      logins7d: countLoginsLast7Days(users),
    };
  }, [users]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "email" ? "asc" : "desc");
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground mt-1">
            User management, system health, and data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Admin Panel
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings" className="gap-2">
              <Settings className="h-4 w-4" />
              API &amp; usage
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Logins (last 7 days)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.logins7d}</p>
          </CardContent>
        </Card>
      </div>

      {/* API & system health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System &amp; integrations
            </CardTitle>
            <CardDescription>
              Connection status for Claude, LinkedIn, HubSpot, GA4, Reddit, Google Ads
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchHealth()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(health).map(([key, val]) => (
                <Badge
                  key={key}
                  variant={val.connected ? "default" : "destructive"}
                  className="gap-1"
                >
                  {val.connected ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not load health. Check <Link href="/settings" className="underline">Settings</Link> for details.
            </p>
          )}
        </CardContent>
      </Card>

      {/* RB2B visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>RB2B visitors</CardTitle>
            <CardDescription>
              Visitor data stored in MongoDB. Clearing removes all records.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{visitorsCount ?? "—"}</span>
            <Button
              variant="destructive"
              size="sm"
              disabled={clearVisitorsMutation.isPending || (visitorsCount ?? 0) === 0}
              onClick={() => {
                if (window.confirm("Clear all visitor data? This cannot be undone.")) {
                  clearVisitorsMutation.mutate();
                }
              }}
            >
              {clearVisitorsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear all
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tracked Page Visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tracked Page Visitors
            </CardTitle>
            <CardDescription>
              People who have visited pages, their clicks, IPs, and pages viewed. Data stored in MongoDB.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchTrackedVisitors()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {trackedVisitorsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-md bg-muted/60 animate-pulse" />
              ))}
            </div>
          ) : trackedVisitorsData?.visitors && trackedVisitorsData.visitors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {trackedVisitorsData.visitors.length} of {trackedVisitorsData.pagination.total} visitors
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={trackedVisitorsPage === 1}
                    onClick={() => setTrackedVisitorsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">
                    Page {trackedVisitorsPage} of {trackedVisitorsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={trackedVisitorsPage >= trackedVisitorsData.pagination.totalPages}
                    onClick={() => setTrackedVisitorsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {trackedVisitorsData.visitors.map((visitor: any, idx: number) => (
                  <div
                    key={visitor.sessionId || idx}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">IP Address:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {visitor.ipAddress}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Session: {visitor.sessionId.substring(0, 20)}...</span>
                          {visitor.visitorId && (
                            <span>• Visitor: {visitor.visitorId.substring(0, 20)}...</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Pages: {visitor.pageCount}</span>
                          <span>Clicks: {visitor.clicks.length}</span>
                          {visitor.deviceType && <span>Device: {visitor.deviceType}</span>}
                          {visitor.browser && <span>Browser: {visitor.browser}</span>}
                          {visitor.country && <span>Country: {visitor.country}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          First visit: {formatDistanceToNow(new Date(visitor.firstVisit), { addSuffix: true })}
                          {" • "}
                          Last visit: {formatDistanceToNow(new Date(visitor.lastVisit), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {visitor.pages.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs font-medium mb-1">Pages Visited:</div>
                        <div className="flex flex-wrap gap-1">
                          {visitor.pages.slice(0, 5).map((page: any, pIdx: number) => (
                            <Badge key={pIdx} variant="outline" className="text-xs">
                              {page.path}
                            </Badge>
                          ))}
                          {visitor.pages.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{visitor.pages.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {visitor.clicks.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs font-medium mb-1">Clicks:</div>
                        <div className="space-y-1">
                          {visitor.clicks.slice(0, 3).map((click: any, cIdx: number) => (
                            <div key={cIdx} className="text-xs text-muted-foreground">
                              <span className="font-medium">{click.type}</span>
                              {click.element && <span> on {click.element.substring(0, 30)}</span>}
                              {click.url && <span> → {click.url.substring(0, 40)}</span>}
                              <span className="ml-2">
                                ({formatDistanceToNow(new Date(click.timestamp), { addSuffix: true })})
                              </span>
                            </div>
                          ))}
                          {visitor.clicks.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{visitor.clicks.length - 3} more clicks
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tracked visitors yet. Page visits and clicks will appear here once users start browsing.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Daily GTM Insights
            </CardTitle>
            <CardDescription>
              AI-powered insights generated daily at 9 AM PKT. Force generate to update now.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {latestInsights ? (
              <div className="text-right mr-2">
                <div className="text-sm text-muted-foreground">Last generated</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(latestInsights.generatedAt), { addSuffix: true })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mr-2">No insights yet</div>
            )}
            <Button
              variant="default"
              size="sm"
              disabled={generateInsightsMutation.isPending}
              onClick={() => {
                if (window.confirm("Generate new insights? This may take 30-60 seconds and will use Claude API credits.")) {
                  generateInsightsMutation.mutate();
                }
              }}
            >
              {generateInsightsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Force Generate
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {generateInsightsMutation.isError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {generateInsightsMutation.error instanceof Error
                  ? generateInsightsMutation.error.message
                  : "Failed to generate insights"}
              </AlertDescription>
            </Alert>
          )}
          {generateInsightsMutation.isSuccess && (
            <Alert className="mt-2 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Insights generated successfully! View them on the{" "}
                <Link href="/insights" className="underline font-semibold">
                  Insights page
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}
          {latestInsights && !generateInsightsMutation.isPending && (
            <div className="mt-2 text-sm text-muted-foreground">
              <Link href="/insights" className="text-primary hover:underline">
                View latest insights →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription>
            Manage roles and view login activity. Primary admin (admin@orion.local) cannot be changed.
          </CardDescription>
          <div className="pt-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-muted/60 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : "Failed to load users"}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </Alert>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {users?.length
                  ? "No users match your search."
                  : "No users yet. They will appear here after first sign-in."}
              </p>
              {users?.length ? (
                <Button variant="link" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      className="font-medium hover:underline"
                      onClick={() => toggleSort("name")}
                    >
                      Name {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="font-medium hover:underline"
                      onClick={() => toggleSort("email")}
                    >
                      Email {sortKey === "email" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="font-medium hover:underline"
                      onClick={() => toggleSort("role")}
                    >
                      Role {sortKey === "role" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="font-medium hover:underline"
                      onClick={() => toggleSort("lastLogin")}
                    >
                      Last login {sortKey === "lastLogin" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="font-medium hover:underline"
                      onClick={() => toggleSort("createdAt")}
                    >
                      Joined {sortKey === "createdAt" && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 opacity-70" />
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.lastLoginAt
                        ? formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={user.role === "admin" ? "outline" : "default"}
                        size="sm"
                        disabled={
                          updateRoleMutation.isPending ||
                          user.email === "admin@orion.local"
                        }
                        onClick={() => {
                          const newRole =
                            user.role === "admin" ? "user" : "admin";
                          setConfirmRole({ user, newRole });
                        }}
                      >
                        {user.role === "admin" ? "Remove admin" : "Make admin"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredAndSortedUsers.length > 0 &&
            filteredAndSortedUsers.some(
              (u) => u.loginHistory && u.loginHistory.length > 0
            ) && (
              <div className="mt-4 border-t pt-4 space-y-2">
                {filteredAndSortedUsers.map((user) => {
                  if (!user.loginHistory?.length) return null;
                  const unique = getUniqueLogins(user.loginHistory);
                  const slice = unique.slice(0, 10);
                  const isExpanded = expandedUsers.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className="rounded-lg border bg-muted/30 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleUserExpanded(user.id)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-muted/50 text-left"
                      >
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {user.name} — Last {slice.length} unique logins
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 space-y-1 text-xs text-muted-foreground border-t">
                          {slice.map((login, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1.5"
                            >
                              <span>
                                {formatDistanceToNow(new Date(login.timestamp), {
                                  addSuffix: true,
                                })}
                              </span>
                              {login.ip && (
                                <span className="font-mono">{login.ip}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Role change confirmation */}
      <Dialog open={!!confirmRole} onOpenChange={() => setConfirmRole(null)}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {confirmRole?.newRole === "admin"
                ? "Make admin"
                : "Remove admin access"}
            </DialogTitle>
            <DialogDescription>
              {confirmRole?.newRole === "admin" ? (
                <>
                  Grant admin rights to <strong>{confirmRole.user.name}</strong> (
                  {confirmRole.user.email})? They will be able to access this page
                  and manage users.
                </>
              ) : (
                <>
                  Remove admin rights from <strong>{confirmRole?.user.name}</strong>{" "}
                  ({confirmRole?.user.email})? They will lose access to the admin
                  page.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRole(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmRole)
                  updateRoleMutation.mutate({
                    userId: confirmRole.user.id,
                    role: confirmRole.newRole,
                  });
              }}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmRole?.newRole === "admin" ? (
                "Make admin"
              ) : (
                "Remove admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
