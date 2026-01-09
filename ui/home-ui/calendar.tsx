import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
  type?: 'task' | 'event' | 'meeting' | 'birthday' | 'deadline';
}

export interface CalendarProps {
  selectedDate?: Date;
  initialMonth?: Date;
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  renderDay?: (props: DayCellProps) => React.ReactNode;
  showEvents?: boolean;
  showHeader?: boolean;
  showSelectedDate?: boolean;
  renderHeader?: (props: HeaderProps) => React.ReactNode;
  theme?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    border?: string;
    today?: string;
    selected?: string;
    event?: string;
  };
}

export interface DayCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onPress: () => void;
}

export interface HeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate: propSelectedDate,
  initialMonth,
  events = [],
  onDateSelect,
  onMonthChange,
  renderDay,
  showEvents = true,
  showHeader = true,
  showSelectedDate = true,
  renderHeader,
  theme = {},
}) => {
  // State
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(
    propSelectedDate || new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialMonth || new Date()
  );

  const selectedDate = propSelectedDate || internalSelectedDate;

  // Theme
  const defaultTheme = {
    primary: '#4A6FA5',
    secondary: '#2C3E50',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    border: '#E8ECF0',
    today: '#4A6FA5',
    selected: '#4A6FA5',
    event: '#4CAF50',
  };

  const calendarTheme = { ...defaultTheme, ...theme };

  // Constants
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { width } = Dimensions.get('window');
  const DAY_SIZE = Math.floor((width - 40) / 7 * .52); // Use Math.floor to avoid rounding issues

  // Helper functions
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  };

  // FIXED: Generate exactly 42 days starting from the Sunday before the 1st
  const getDaysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // What day of the week is it? (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Start from the Sunday before the 1st (or the 1st if it's a Sunday)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    // Generate exactly 42 days (6 weeks)
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentMonth]);

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  // Navigation
  const goToPreviousMonth = (): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToNextMonth = (): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const goToToday = (): void => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
    onMonthChange?.(today);
  };

  // Date selection
  const handleDateSelect = (date: Date): void => {
    if (propSelectedDate === undefined) {
      setInternalSelectedDate(date);
    }
    onDateSelect?.(date);

    // Navigate to the month if date is from a different month
    if (!isSameMonth(date, currentMonth)) {
      const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    }
  };

  // Render functions
  const renderDefaultHeader = (): React.ReactNode => (
    <View style={styles.monthHeader}>
      <TouchableOpacity
        onPress={goToPreviousMonth}
        style={[styles.navButton, { borderColor: calendarTheme.border }]}
      >
        <ChevronLeft size={24} color={calendarTheme.primary} />
      </TouchableOpacity>

      <View style={styles.monthYearContainer}>
        <Text style={[styles.monthYearText, { color: calendarTheme.text }]}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text
            style={[styles.todayButtonText, { color: calendarTheme.primary }]}
          >
            Today
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={goToNextMonth}
        style={[styles.navButton, { borderColor: calendarTheme.border }]}
      >
        <ChevronRight size={24} color={calendarTheme.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderDefaultDay = ({
    date,
    isSelected,
    isToday,
    isCurrentMonth,
    events,
    onPress,
  }: DayCellProps): React.ReactNode => {
    const dayEvents = getEventsForDay(date);
    const hasEvents = showEvents && dayEvents.length > 0;
    const isFromOtherMonth = !isSameMonth(date, currentMonth);

    return (
      <TouchableOpacity
        style={[
          styles.dayContainer,
          {
            width: DAY_SIZE,
            height: DAY_SIZE,
            // FIX: Add explicit margin to ensure proper spacing
            marginHorizontal: 0,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.dayCircle,
            {
              width: DAY_SIZE - 12,
              height: DAY_SIZE - 12,
              borderRadius: (DAY_SIZE - 12) / 2,
              borderColor: calendarTheme.today,
              opacity: isFromOtherMonth ? 0.4 : 1,
            },
            isSelected && {
              backgroundColor: calendarTheme.selected,
              opacity: 1,
            },
            isToday &&
              !isSelected && {
                borderWidth: 2,
              },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              {
                color: isFromOtherMonth
                  ? calendarTheme.text + '80'
                  : calendarTheme.text,
              },
              isSelected && styles.selectedDayText,
              isToday &&
                !isSelected && {
                  color: calendarTheme.today,
                  fontWeight: '600',
                },
            ]}
          >
            {date.getDate()}
          </Text>
        </View>

        {hasEvents && (
          <View style={styles.eventDotsContainer}>
            {dayEvents.slice(0, 3).map((event, index) => (
              <View
                key={index}
                style={[
                  styles.eventDot,
                  {
                    backgroundColor: event.color || calendarTheme.event,
                    opacity: isFromOtherMonth ? 0.6 : 1,
                  },
                ]}
              />
            ))}
            {dayEvents.length > 3 && (
              <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: calendarTheme.background }]}
    >
      {/* Header */}
      {showHeader &&
        (renderHeader
          ? renderHeader({
              currentMonth,
              onPreviousMonth: goToPreviousMonth,
              onNextMonth: goToNextMonth,
            })
          : renderDefaultHeader())}

      {/* Days of Week */}
      <View
        style={[
          styles.daysOfWeekContainer,
          { borderBottomColor: calendarTheme.border },
        ]}
      >
        {daysOfWeek.map((day, index) => (
          <View key={day} style={[styles.dayOfWeekCell, { width: DAY_SIZE }]}>
            <Text style={[styles.dayOfWeekText, { color: calendarTheme.text }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid - FIXED: Ensure all 42 cells fit in 7 columns */}
      <View style={styles.calendarGrid}>
        {getDaysInMonth.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const isCurrentMonthDay = isSameMonth(date, currentMonth);
          const dayEvents = getEventsForDay(date);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

          const dayCellProps: DayCellProps = {
            date,
            isSelected,
            isToday,
            isCurrentMonth: isCurrentMonthDay,
            events: dayEvents,
            onPress: () => handleDateSelect(date),
          };

          return (
            <View
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`}
              style={[
                styles.gridCell,
              ]}
            >
              {renderDay
                ? renderDay(dayCellProps)
                : renderDefaultDay(dayCellProps)}
            </View>
          );
        })}
      </View>

      {/* Selected Date Details */}
      {showSelectedDate && (
        <View
          style={[
            styles.selectedDateContainer,
            { backgroundColor: calendarTheme.surface },
          ]}
        >
          <Text
            style={[styles.selectedDateLabel, { color: calendarTheme.text }]}
          >
            Selected Date
          </Text>
          <Text
            style={[styles.selectedDateText, { color: calendarTheme.primary }]}
          >
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {showEvents && events.length > 0 && (
            <View style={styles.selectedDateEvents}>
              <Text style={[styles.eventsTitle, { color: calendarTheme.text }]}>
                Events for today:
              </Text>
              {getEventsForDay(selectedDate).map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View
                    style={[
                      styles.eventColorDot,
                      { backgroundColor: event.color || calendarTheme.event },
                    ]}
                  />
                  <Text
                    style={[styles.eventTitle, { color: calendarTheme.text }]}
                  >
                    {event.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Debug Grid - Shows column numbers */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Grid: 42 cells total | Day size: {DAY_SIZE}px | Columns should be: 7 |
          Total width needed: {DAY_SIZE * 7}px | Available width: {width - 40}px
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  monthYearContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dayOfWeekCell: {
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
    // FIX: Ensure the container has exact width to contain 7 columns
    width: '100%',
  },
  gridCell: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // FIX: Remove any margins that might cause wrapping
    margin: 0,
    padding: 0,
    borderColor: 'black',
  },
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // FIX: Remove any padding/margin that might affect layout
    padding: 0,
    margin: 0,
  },
  dayCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreEventsText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  selectedDateContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  selectedDateEvents: {
    marginTop: 12,
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 14,
  },
  debugContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default Calendar;
