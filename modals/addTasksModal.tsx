import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import InputBox from '../ui/nonspecific/inputBox';
import BoxHeader from '../ui/nonspecific/box-header';
import DropDown from '../ui/nonspecific/drop-down';
import ToggleSwitch from '../ui/nonspecific/toggle-switch';
import ConfirmButton from '../ui/nonspecific/confirm-button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../types/tasks';
import { hours } from '../scrollData/times';
import ScrollPicker from '../ui/nonspecific/scroll-picker';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
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
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [alertTime, setAlertTime] = useState<Date>(new Date());
  const [showAlertTimePicker, setShowAlertTimePicker] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  >('daily');
  const [repeatCustomDays, setRepeatCustomDays] = useState<string[]>([]);
  const [repeatEndDate, setRepeatEndDate] = useState<Date | undefined>(
    undefined
  );
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const toggleCustomDay = (day: string) => {
    if (repeatCustomDays.includes(day)) {
      setRepeatCustomDays(repeatCustomDays.filter((d) => d !== day));
    } else {
      setRepeatCustomDays([...repeatCustomDays, day]);
    }
  };

  const handleAdd = () => {
    if (taskTitle.trim()) {
      onAddTask({
        title: taskTitle.trim(),
        completed: false,
        dueDate,
        priority,
        notes: notes.trim() || undefined,
        alert,
        timeStart: timeStart || undefined,
        timeEnd: timeEnd || undefined,
        alertTime: alert ? alertTime : undefined,
        repeat,
        repeatInterval: repeat ? repeatInterval : undefined,
        repeatCustomDays:
          repeat && repeatInterval === 'custom' && repeatCustomDays.length > 0
            ? repeatCustomDays
            : undefined,
        repeatEndDate: repeat ? repeatEndDate : undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setTaskTitle('');
    setNotes('');
    setPriority('medium');
    setAlert(false);
    setDueDate(new Date());
    setTimeStart('');
    setTimeEnd('');
    setAlertTime(new Date());
    setRepeat(false);
    setRepeatInterval('daily');
    setRepeatCustomDays([]);
    setRepeatEndDate(undefined);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollView}
                >
                  {/* Task Title */}
                  <InputBox
                    label="Task Title"
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    placeholder="Enter task title..."
                    autoFocus={true}
                  />

                  {/* Due Date */}
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? '#AAAAAA' : '#666666' },
                    ]}
                  >
                    Due Date
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      {
                        backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                        borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text
                      style={{
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontSize: 16,
                      }}
                    >
                      {formatDate(dueDate)}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDueDate(selectedDate);
                      }}
                    />
                  )}

                  {/* Time Start */}
                  <ScrollPicker
                    items={hours}
                    selectedIndex={selectedHour}
                    onSelect={setSelectedHour}
                    label="Hour"
                  />
                  <InputBox
                    label="Start Time (Optional)"
                    value={timeStart}
                    onChangeText={setTimeStart}
                    placeholder="e.g., 9:00 AM"
                  />

                  {/* Time End */}
                  <InputBox
                    label="End Time (Optional)"
                    value={timeEnd}
                    onChangeText={setTimeEnd}
                    placeholder="e.g., 10:00 AM"
                  />

                  {/* Priority */}
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
                    label="Notes (Optional)"
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
                    onToggle={(value) => setAlert(value)}
                  />

                  {/* Alert Time (only show if alert is enabled) */}
                  {alert && (
                    <>
                      <Text
                        style={[
                          styles.label,
                          { color: isDark ? '#AAAAAA' : '#666666' },
                        ]}
                      >
                        Alert Time
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dateButton,
                          {
                            backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                            borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
                          },
                        ]}
                        onPress={() => setShowAlertTimePicker(true)}
                      >
                        <Text
                          style={{
                            color: isDark ? '#FFFFFF' : '#000000',
                            fontSize: 16,
                          }}
                        >
                          {formatTime(alertTime)}
                        </Text>
                      </TouchableOpacity>

                      {showAlertTimePicker && (
                        <DateTimePicker
                          value={alertTime}
                          mode="time"
                          display="default"
                          onChange={(event, selectedTime) => {
                            setShowAlertTimePicker(false);
                            if (selectedTime) setAlertTime(selectedTime);
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Repeat Toggle */}
                  <ToggleSwitch
                    label="Repeat Task"
                    isOn={repeat}
                    onToggle={(value) => {
                      setRepeat(value);
                      if (!value) {
                        setRepeatCustomDays([]);
                        setRepeatEndDate(undefined);
                      }
                    }}
                  />

                  {/* Repeat Interval (only show if repeat is enabled) */}
                  {repeat && (
                    <>
                      <DropDown
                        label="Repeat Interval"
                        value={repeatInterval}
                        onValueChange={(value) => {
                          setRepeatInterval(value as any);
                          if (value !== 'custom') {
                            setRepeatCustomDays([]);
                          }
                        }}
                        options={[
                          { label: 'Daily', value: 'daily' },
                          { label: 'Weekly', value: 'weekly' },
                          { label: 'Monthly', value: 'monthly' },
                          { label: 'Yearly', value: 'yearly' },
                          { label: 'Custom Days', value: 'custom' },
                        ]}
                      />

                      {/* Custom Days Selection */}
                      {repeatInterval === 'custom' && (
                        <View style={styles.customDaysContainer}>
                          <Text
                            style={[
                              styles.label,
                              { color: isDark ? '#AAAAAA' : '#666666' },
                            ]}
                          >
                            Select Days
                          </Text>
                          <View style={styles.daysGrid}>
                            {daysOfWeek.map((day) => (
                              <TouchableOpacity
                                key={day}
                                style={[
                                  styles.dayButton,
                                  {
                                    backgroundColor: repeatCustomDays.includes(
                                      day
                                    )
                                      ? isDark
                                        ? '#0A84FF'
                                        : '#4A6FA5'
                                      : isDark
                                      ? '#2C2C2E'
                                      : '#F5F5F5',
                                    borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
                                  },
                                ]}
                                onPress={() => toggleCustomDay(day)}
                              >
                                <Text
                                  style={[
                                    styles.dayButtonText,
                                    {
                                      color: repeatCustomDays.includes(day)
                                        ? '#FFFFFF'
                                        : isDark
                                        ? '#FFFFFF'
                                        : '#000000',
                                    },
                                  ]}
                                >
                                  {day.substring(0, 3)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Repeat End Date */}
                      <Text
                        style={[
                          styles.label,
                          { color: isDark ? '#AAAAAA' : '#666666' },
                        ]}
                      >
                        Repeat Until (Optional)
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dateButton,
                          {
                            backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                            borderColor: isDark ? '#3C3C3E' : '#E0E0E0',
                          },
                        ]}
                        onPress={() => setShowRepeatEndDatePicker(true)}
                      >
                        <Text
                          style={{
                            color: isDark ? '#FFFFFF' : '#000000',
                            fontSize: 16,
                          }}
                        >
                          {repeatEndDate
                            ? formatDate(repeatEndDate)
                            : 'No end date'}
                        </Text>
                      </TouchableOpacity>

                      {showRepeatEndDatePicker && (
                        <DateTimePicker
                          value={repeatEndDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowRepeatEndDatePicker(false);
                            if (selectedDate) setRepeatEndDate(selectedDate);
                          }}
                        />
                      )}

                      {repeatEndDate && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => setRepeatEndDate(undefined)}
                        >
                          <Text style={{ color: '#FF3B30', fontSize: 14 }}>
                            Clear end date
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </ScrollView>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <ConfirmButton
                    label="Cancel"
                    onPress={handleClose}
                    variant="cancel"
                  />
                  <ConfirmButton
                    label="Add Task"
                    onPress={handleAdd}
                    variant="confirm"
                    disabled={!taskTitle.trim()}
                  />
                </View>
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
  scrollView: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  customDaysContainer: {
    marginTop: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 45,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    marginTop: 8,
    alignItems: 'center',
  },
});

export default AddTaskModal;
