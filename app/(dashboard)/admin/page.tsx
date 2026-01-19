"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Mail, Clock, Activity, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  loginHistory: Array<{
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

async function fetchUsers() {
  const res = await fetch('/api/admin/users');
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }
    throw new Error('Failed to fetch users');
  }
  const data = await res.json();
  return data.users as User[];
}

async function updateUserRole(userId: string, role: 'admin' | 'user') {
  const res = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }
    throw new Error('Failed to update user role');
  }
  return res.json();
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  
  // Check admin status from session, but also check storage for updated role
  const [isAdmin, setIsAdmin] = useState(session?.user?.role === 'admin' || session?.user?.email === 'admin@orion.local');
  
  // Check for updated role from storage on mount and when session changes
  useEffect(() => {
    if (session?.user?.email) {
      // Fetch role from API to get the latest from storage
      fetch('/api/auth/get-role')
        .then(res => res.json())
        .then(data => {
          if (data.role) {
            const adminStatus = data.role === 'admin' || session?.user?.email === 'admin@orion.local';
            setIsAdmin(adminStatus);
          }
        })
        .catch(() => {
          // Fallback to session role if API fails
          setIsAdmin(session?.user?.role === 'admin' || session?.user?.email === 'admin@orion.local');
        });
    }
  }, [session]);
  
  useEffect(() => {
    if (session && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router, session]);
  
  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
    enabled: isAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'user' }) =>
      updateUserRole(userId, role),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      // Refresh the users list to show updated roles
      await queryClient.refetchQueries({ queryKey: ['admin-users'] });
      
      // If updating the current user's role, refresh their session and page
      const currentUserId = session?.user?.id || session?.user?.email;
      if (currentUserId === variables.userId) {
        // Refresh the page to trigger a new session check
        // The session callback will check storage on the next request
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // For other users, their session will update on their next page load
        // The session callback checks storage on every request
      }
    },
  });
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Badge variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Panel
        </Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Users ({users?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load users'}
              </AlertDescription>
            </Alert>
          ) : users && users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Users will appear here after they log in.
            </div>
          ) : (
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.lastLoginAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last login: {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                          </span>
                        )}
                        <span className="text-xs">
                          Joined: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={user.role === 'admin' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => {
                        const newRole = user.role === 'admin' ? 'user' : 'admin';
                        updateRoleMutation.mutate({ userId: user.id, role: newRole });
                      }}
                      disabled={updateRoleMutation.isPending || user.email === 'admin@orion.local'}
                      className="ml-4"
                    >
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </div>
                  
                  {user.loginHistory && user.loginHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <button
                        onClick={() => toggleUserExpanded(user.id)}
                        className="w-full flex items-center justify-between text-sm font-medium hover:text-foreground transition-colors text-left"
                      >
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {(() => {
                            // Count unique logins (filter duplicates within 5 minutes)
                            const MIN_TIME_BETWEEN_LOGINS = 5 * 60 * 1000;
                            const uniqueLogins: typeof user.loginHistory = [];
                            
                            for (const login of user.loginHistory) {
                              const loginTime = new Date(login.timestamp);
                              const isDuplicate = uniqueLogins.some(existing => {
                                const existingTime = new Date(existing.timestamp);
                                const timeDiff = Math.abs(loginTime.getTime() - existingTime.getTime());
                                return timeDiff < MIN_TIME_BETWEEN_LOGINS;
                              });
                              
                              if (!isDuplicate) {
                                uniqueLogins.push(login);
                              }
                            }
                            
                            return `Last 10 Unique Logins (${uniqueLogins.length} unique)`;
                          })()}
                        </span>
                        {expandedUsers.has(user.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {expandedUsers.has(user.id) && (
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {(() => {
                            // Filter out duplicate logins that are within 5 minutes of each other
                            const MIN_TIME_BETWEEN_LOGINS = 5 * 60 * 1000; // 5 minutes
                            const uniqueLogins: typeof user.loginHistory = [];
                            
                            for (const login of user.loginHistory) {
                              const loginTime = new Date(login.timestamp);
                              const isDuplicate = uniqueLogins.some(existing => {
                                const existingTime = new Date(existing.timestamp);
                                const timeDiff = Math.abs(loginTime.getTime() - existingTime.getTime());
                                return timeDiff < MIN_TIME_BETWEEN_LOGINS;
                              });
                              
                              if (!isDuplicate) {
                                uniqueLogins.push(login);
                              }
                            }
                            
                            return uniqueLogins.slice(0, 10).map((login, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1">
                                <span>{formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}</span>
                                {login.ip && <span className="text-xs font-mono">{login.ip}</span>}
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
