// types/tasks.ts
export interface Task {
  id: string;
  title: string;
  completed?: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  alert?: boolean;
  timeStart?: string;
  timeEnd?: string;
  alertTime?: Date;
  repeat?: boolean;
  repeatInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  repeatCustomDays?: string[]; 
  repeatEndDate?: Date;
}