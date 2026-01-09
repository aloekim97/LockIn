import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Switch,
} from 'react-native';
import InputBox from '../ui/nonspecific/inputBox';
import BoxHeader from '../ui/nonspecific/box-header';
import DropDown from '../ui/nonspecific/drop-down';
import ToggleSwitch from '../ui/nonspecific/toggle-switch';
import ConfirmButton from '../ui/nonspecific/confirm-button';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (
    title: string,
    dueDate?: Date,
    priority?: 'low' | 'medium' | 'high',
    notes?: string,
    alert?: boolean
  ) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onAddTask,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [alert, setAlert] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAdd = () => {
    if (taskTitle.trim()) {
      onAddTask(
        taskTitle.trim(),
        new Date(),
        priority,
        notes.trim() || undefined,
        alert
      );
      // Reset form
      setTaskTitle('');
      setNotes('');
      setPriority('medium');
      setAlert(false);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form on close
    setTaskTitle('');
    setNotes('');
    setPriority('medium');
    setAlert(false);
    setShowPriorityPicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: isDark ? '#1c1c1e' : '#FFFFFF' },
                ]}
              >
                {/* Header */}
                <BoxHeader label="Add New Task" handleButton={handleClose} />

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Task Title Input */}
                  <InputBox
                    label="Task Title"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    placeholder="Enter task title..."
                    autoFocus={true}
                  />

                  {/* Priority Picker */}
                  <DropDown
                    label="Priority"
                    value={priority}
                    onValueChange={setPriority}
                    showColorDot={true}
                    options={[
                      { label: 'High', value: 'high', color: '#FF3B30' },
                      { label: 'Medium', value: 'medium', color: '#FF9500' },
                      { label: 'Low', value: 'low', color: '#34C759' },
                    ]}
                  />
                  {/* Notes */}
                  <InputBox 
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Additional details..."
                    multiline={true}
                    numberOfLines={4}
                  />

                  {/* Alert Toggle */}
                  <ToggleSwitch
                    label="Set Alert"
                    isOn={alert}
                    onToggle={setAlert}
                  />
                </ScrollView>

                {/* Buttons */}
                <ConfirmButton label="Cancel" onCancel={handleClose} />
                <ConfirmButton label="Add Task" onConfirm={handleAdd} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AddTaskModal;
