import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../../types/tasks';

const loadTasks = async () => {
  try {
    const savedTasks = await AsyncStorage.getItem('tasks');
    if (savedTasks) {
      setTodayTasks(JSON.parse(savedTasks));
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
};

const saveTasks = async () => {
  try {
    await AsyncStorage.setItem('tasks', JSON.stringify(todayTasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

// Function to add a new task
const handleAddTask = (title: string, dueDate?: Date) => {
  const newTask: Task = {
    id: Date.now().toString(),
    title: title,
    completed: false,
    dueDate: dueDate || new Date(),
  };
  setTodayTasks([...todayTasks, newTask]);
};

// Function to toggle task completion
const handleToggleTask = (taskId: string) => {
  setTodayTasks(
    todayTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
  );
};

// Function to delete a task
const handleDeleteTask = (taskId: string) => {
  setTodayTasks(todayTasks.filter((task) => task.id !== taskId));
};
