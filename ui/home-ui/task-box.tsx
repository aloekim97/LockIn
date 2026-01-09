import React from 'react';
import { Plus, CheckSquare } from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Task } from '../../types/tasks';

interface TaskBoxProps {
  setModalVisible: (visible: boolean) => void;
  todayTasks: Task[];
  renderTask: ListRenderItem<Task>;
  isDark: boolean;
}

const TaskBox: React.FC<TaskBoxProps> = ({
  setModalVisible,
  todayTasks,
  renderTask,
  isDark,
}) => {
    const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };
  return (
    <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <Text style={{ 
          fontSize: 20, 
          fontWeight: '600', 
          color: isDark ? '#FFFFFF' : '#2C3E50' 
        }}>
          {getTodayDate()}
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#2C2C2E' : '#E8F0FE',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Plus size={20} color={isDark ? '#0A84FF' : '#4A6FA5'} />
          <Text style={{ 
            color: isDark ? '#0A84FF' : '#4A6FA5', 
            fontWeight: '500', 
            marginLeft: 5 
          }}>
            Add Task
          </Text>
        </TouchableOpacity>
      </View>

      {todayTasks.length === 0 ? (
        <View
          style={{
            backgroundColor: isDark ? '#1c1c1e' : '#FFFFFF',
            borderRadius: 12,
            padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckSquare size={48} color={isDark ? '#555' : '#CCC'} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '500',
              color: isDark ? '#AAA' : '#999',
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No tasks for today
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#888' : '#BBB',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Add a task to get started
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: isDark ? '#0A84FF' : '#4A6FA5',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>
              Add Your First Task
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={{
            backgroundColor: isDark ? '#1c1c1e' : '#FFFFFF',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />
      )}
    </View>
  );
};

export default TaskBox;