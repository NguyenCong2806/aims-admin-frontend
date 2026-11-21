export type NotificationType = "disk" | "ram" | "alert" | "security" | "system";
export type NotificationCategory = "MONITORING" | "SECURITY" | "SYSTEM";

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  category: NotificationCategory;
  reference_module?: string;
  reference_id?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  read_by?: string;
  created_at: string;
}

export type TaskType = "RESOURCE_OVERLOAD" | "UNAUTHORIZED_APP" | "LICENSE_EXPIRY" | "AGENT_OFFLINE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface ActionableTask {
  id: string;
  task_code: string;
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  urgencyLabel?: string;
  reference_module?: string;
  reference_id?: string;
  action_url: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  completed_by?: string;
}
