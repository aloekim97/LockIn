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
}
