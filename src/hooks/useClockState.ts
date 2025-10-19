import { useState, useCallback } from 'react';
import { timeToEnglish, angleToTime, timeToAngle, normalizeAngle, TimeState } from '../utils/timeToEnglish';

export const useClockState = () => {
  const [time, setTime] = useState<TimeState>({ hours: 3, minutes: 0 });
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);

  const updateFromAngles = useCallback((hourAngle: number, minuteAngle: number, isDraggingMinute: boolean = false) => {
    const normalizedHourAngle = normalizeAngle(hourAngle);
    const normalizedMinuteAngle = normalizeAngle(minuteAngle);

    const minuteResult = angleToTime(normalizedMinuteAngle, false);
    let hours = angleToTime(normalizedHourAngle, true).hours;

    // Special handling for minute hand dragging to prevent jumps
    if (isDraggingMinute) {
      // When dragging minute hand, maintain hour consistency
      // Only change hour when we've actually crossed the hour boundary (from 59 to 0 minutes)
      if (time.minutes >= 58 && minuteResult.minutes <= 2) {
        // Crossed from end of hour to beginning of next hour
        hours = (time.hours % 12) + 1 || 1;
      } else if (time.minutes <= 2 && minuteResult.minutes >= 58) {
        // Crossed from beginning of hour to end of previous hour
        hours = ((time.hours - 2) % 12) + 1 || 1;
      } else {
        // Keep current hour
        hours = time.hours;
      }
    } else {
      // Normal hour hand dragging behavior
      if (minuteResult.minutes >= 30) {
        hours = (hours % 12) + 1 || 1;
      }
    }

    setTime({ hours, minutes: minuteResult.minutes });
  }, [time.hours, time.minutes]);

  const setHourAngle = useCallback((angle: number) => {
    const currentMinuteAngle = timeToAngle(time.hours, time.minutes, false);
    updateFromAngles(angle, currentMinuteAngle);
  }, [time.hours, time.minutes, updateFromAngles]);

  const setMinuteAngle = useCallback((angle: number) => {
    const currentHourAngle = timeToAngle(time.hours, time.minutes, true);
    updateFromAngles(currentHourAngle, angle, true); // true indicates we're dragging minute hand
  }, [time.hours, time.minutes, updateFromAngles]);

  const getAngles = useCallback(() => {
    return {
      hourAngle: timeToAngle(time.hours, time.minutes, true),
      minuteAngle: timeToAngle(time.hours, time.minutes, false)
    };
  }, [time.hours, time.minutes]);

  const getTimeDescription = useCallback(() => {
    return timeToEnglish(time.hours, time.minutes);
  }, [time.hours, time.minutes]);

  return {
    time,
    isDragging,
    setIsDragging,
    setHourAngle,
    setMinuteAngle,
    getAngles,
    getTimeDescription,
    setTime
  };
};