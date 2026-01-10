// services/taskStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/tasks';

const TASKS_KEY = '@tasks_v1';

export const TaskStorage = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Save all tasks
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  // Add a single task
  addTask: async (task: Task): Promise<void> => {
    const tasks = await TaskStorage.getTasks();
    tasks.unshift(task); // Add to beginning
    await TaskStorage.saveTasks(tasks);
  },

  // Update a task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const tasks = await TaskStorage.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);

    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await TaskStorage.saveTasks(tasks);
    }
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    const tasks = await TaskStorage.getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    await TaskStorage.saveTasks(filtered);
  },

  // Toggle task completion
  toggleTask: async (taskId: string): Promise<void> => {
    const tasks = await TaskStorage.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      await TaskStorage.updateTask(taskId, {
        completed: !task.completed,
      });
    }
  },

  // Get tasks for today
  getTasksForToday: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  },

  // Get tasks for a specific date
  getTasksForDate: async (date: Date): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === targetDate.getTime();
    });
  },

  // Get tasks for a date range (for calendar view)
  getTasksForDateRange: async (startDate: Date, endDate: Date): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= start && dueDate <= end;
    });
  },

  // Get tasks by priority
  getTasksByPriority: async (
    priority: 'low' | 'medium' | 'high'
  ): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    return tasks.filter((task) => task.priority === priority);
  },

  // Get all repeating tasks
  getRepeatingTasks: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    return tasks.filter((task) => task.repeat === true);
  },

  // Get tasks that need alerts today
  getTasksWithAlertsToday: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter((task) => {
      if (!task.alert || !task.alertTime) return false;
      const alertTime = new Date(task.alertTime);
      return alertTime >= today && alertTime < tomorrow;
    });
  },

  // Get upcoming tasks (next 7 days)
  getUpcomingTasks: async (days: number = 7): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return tasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < futureDate && !task.completed;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate!).getTime();
        const dateB = new Date(b.dueDate!).getTime();
        return dateA - dateB;
      });
  },

  // Get overdue tasks
  getOverdueTasks: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  },

  // Get completed tasks
  getCompletedTasks: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    return tasks.filter((task) => task.completed === true);
  },

  // Get incomplete tasks
  getIncompleteTasks: async (): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    return tasks.filter((task) => !task.completed);
  },

  // Generate recurring task instances
  generateRecurringTasks: async (task: Task, numberOfInstances: number = 10): Promise<Task[]> => {
    if (!task.repeat || !task.repeatInterval || !task.dueDate) {
      return [];
    }

    const instances: Task[] = [];
    let currentDate = new Date(task.dueDate);

    for (let i = 0; i < numberOfInstances; i++) {
      const newTask: Task = {
        ...task,
        id: `${task.id}_recurring_${i}`,
        dueDate: new Date(currentDate),
      };

      instances.push(newTask);

      // Calculate next occurrence
      switch (task.repeatInterval) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        case 'custom':
          // For custom days, find the next occurrence
          if (task.repeatCustomDays && task.repeatCustomDays.length > 0) {
            currentDate = TaskStorage.getNextCustomDay(currentDate, task.repeatCustomDays);
          } else {
            // Fallback to daily if no custom days specified
            currentDate.setDate(currentDate.getDate() + 1);
          }
          break;
      }

      // Check if we've passed the repeat end date
      if (task.repeatEndDate && currentDate > new Date(task.repeatEndDate)) {
        break;
      }
    }

    return instances;
  },

  // Helper to get next occurrence for custom days
  getNextCustomDay: (fromDate: Date, customDays: string[]): Date => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Find the next day that matches one of the custom days
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDayName = days[checkDate.getDay()];
      
      if (customDays.includes(checkDayName)) {
        return checkDate;
      }
    }
    
    // Fallback: return tomorrow if no match found
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  },

  // Helper to get next occurrence of a specific weekday (keep for backwards compatibility)
  getNextWeekday: (fromDate: Date, weekday: string): Date => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(weekday);
    const currentDay = fromDate.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + daysUntilTarget);
    return nextDate;
  },

  // Search tasks
  searchTasks: async (query: string): Promise<Task[]> => {
    const tasks = await TaskStorage.getTasks();
    const lowerQuery = query.toLowerCase();

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  // Get task statistics
  getTaskStats: async () => {
    const tasks = await TaskStorage.getTasks();
    const completed = tasks.filter((t) => t.completed).length;
    const incomplete = tasks.filter((t) => !t.completed).length;
    const overdue = (await TaskStorage.getOverdueTasks()).length;
    const today = (await TaskStorage.getTasksForToday()).length;

    return {
      total: tasks.length,
      completed,
      incomplete,
      overdue,
      today,
      completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
    };
  },

  // Clear all tasks
  clearAllTasks: async (): Promise<void> => {
    await AsyncStorage.removeItem(TASKS_KEY);
  },

  // Export tasks as JSON
  exportTasks: async (): Promise<string> => {
    const tasks = await TaskStorage.getTasks();
    return JSON.stringify(tasks, null, 2);
  },

  // Import tasks from JSON
  importTasks: async (jsonString: string): Promise<void> => {
    try {
      const importedTasks = JSON.parse(jsonString);
      const existingTasks = await TaskStorage.getTasks();
      
      // Merge tasks (avoiding duplicates)
      const mergedTasks = [...existingTasks];
      const existingIds = new Set(existingTasks.map(t => t.id));
      
      for (const task of importedTasks) {
        if (!existingIds.has(task.id)) {
          mergedTasks.push(task);
        }
      }
      
      await TaskStorage.saveTasks(mergedTasks);
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw new Error('Invalid JSON file');
    }
  },
};