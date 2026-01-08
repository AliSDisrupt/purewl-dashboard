"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckSquare, Calendar, AlertCircle, FileText, Tag, Clock, User } from "lucide-react";

interface Task {
  id: string;
  name: string;
  status: string;
  priority?: string;
  dueDate?: string;
  taskType?: string;
  notes?: string;
  associatedContact?: string;
  associatedDeal?: string;
}

interface TasksTableProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TasksTable({ tasks, isLoading }: TasksTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("completed") || statusLower.includes("done")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (statusLower.includes("progress") || statusLower.includes("in_progress")) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
    if (statusLower.includes("waiting") || statusLower.includes("deferred")) {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "Overdue";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 7) return `In ${diffDays} days`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    try {
      return new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
          <Badge variant="secondary">{tasks.length} tasks</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTask(task)}
                >
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.priority ? (
                      <Badge variant="outline">{task.priority}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.taskType ? (
                      <span className="text-sm">{task.taskType}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className={`flex items-center gap-2 text-sm ${isOverdue(task.dueDate) ? "text-red-500" : ""}`}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              {selectedTask?.name}
            </DialogTitle>
            <DialogDescription>
              Complete task information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6 mt-4">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    Status
                  </div>
                  <Badge variant="outline" className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Priority
                  </div>
                  {selectedTask.priority ? (
                    <Badge variant="outline">{selectedTask.priority}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not set</span>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                {selectedTask.dueDate ? (
                  <div className={`flex items-center gap-2 ${isOverdue(selectedTask.dueDate) ? "text-red-500" : ""}`}>
                    <span className="font-medium">
                      {new Date(selectedTask.dueDate).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {isOverdue(selectedTask.dueDate) && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Overdue
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No due date set</span>
                )}
              </div>

              {/* Task Type */}
              {selectedTask.taskType && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Task Type
                  </div>
                  <Badge variant="outline">{selectedTask.taskType}</Badge>
                </div>
              )}

              {/* Associated Records */}
              {(selectedTask.associatedContact || selectedTask.associatedDeal) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Associated Records
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.associatedContact && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        Contact: {selectedTask.associatedContact}
                      </Badge>
                    )}
                    {selectedTask.associatedDeal && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Deal: {selectedTask.associatedDeal}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              {/* Task ID */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Task ID:</span>
                  <code className="px-2 py-1 rounded bg-muted font-mono">{selectedTask.id}</code>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
