import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import LeftBox from '../../ui/nonspecific/left-box';
import TaskBox from '../../ui/home-ui/task-box';
import { Task } from '../../types/tasks';
import AddTaskModal from '../../modals/addTasksModal';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Tasks() {
  const [modalVisible, setModalVisible] = useState(false);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    saveTasks();
  }, [todayTasks]);

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

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => handleToggleTask(item.id)}
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#EEE',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDark ? '#1c1c1e' : '#FFFFFF',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: item.completed ? '#4CAF50' : isDark ? '#555' : '#CCC',
            backgroundColor: item.completed ? '#4CAF50' : 'transparent',
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.completed && (
            <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 16,
            color: isDark ? '#FFFFFF' : '#2C3E50',
            textDecorationLine: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.6 : 1,
          }}
        >
          {item.title}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <Text style={{ color: '#FF3B30', fontSize: 18 }}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LeftBox>
      <TaskBox
        setModalVisible={setModalVisible}
        todayTasks={todayTasks}
        renderTask={renderTask}
        isDark={isDark}
      />
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTask={handleAddTask}
      />
    </LeftBox>
  );
}
