export interface TimeState {
  hours: number;
  minutes: number;
}

export const timeToEnglish = (hours: number, minutes: number): string => {
  // Convert to 12-hour format
  const displayHours = hours % 12 || 12;

  // Handle special cases first
  if (minutes === 0) {
    return `It's ${displayHours} o'clock`;
  }

  if (minutes === 15) {
    return `It's quarter past ${displayHours}`;
  }

  if (minutes === 30) {
    return `It's half past ${displayHours}`;
  }

  if (minutes === 45) {
    const nextHour = (hours % 12) + 1 || 1;
    return `It's quarter to ${nextHour}`;
  }

  // Handle minutes past the hour
  if (minutes < 30) {
    if (minutes === 1) {
      return `It's one minute past ${displayHours}`;
    }
    return `It's ${minutes} minutes past ${displayHours}`;
  }

  // Handle minutes to the next hour
  if (minutes > 30) {
    const nextHour = (hours % 12) + 1 || 1;
    const minutesTo = 60 - minutes;

    if (minutesTo === 1) {
      return `It's one minute to ${nextHour}`;
    }
    return `It's ${minutesTo} minutes to ${nextHour}`;
  }

  return `It's ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

export const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
};

export const angleToTime = (angle: number, isHour: boolean = false): { hours: number; minutes: number } => {
  const normalizedAngle = normalizeAngle(angle);

  if (isHour) {
    // Each hour represents 30 degrees (360/12)
    // Use floor with a small buffer to avoid rounding issues at boundaries
    const hourValue = Math.floor((normalizedAngle + 15) / 30) % 12; // Add 15 degrees (half hour) for better rounding
    return { hours: hourValue || 12, minutes: 0 };
  } else {
    // Each minute represents 6 degrees (360/60)
    // Use floor with a small buffer to avoid rounding issues at boundaries
    const minutes = Math.floor((normalizedAngle + 3) / 6) % 60; // Add 3 degrees (half minute) for better rounding
    return { hours: 0, minutes };
  }
};

export const timeToAngle = (hours: number, minutes: number, isHour: boolean = false): number => {
  if (isHour) {
    // Hour hand moves as minutes pass (30 degrees per hour + 0.5 degrees per minute)
    const displayHours = hours % 12 || 12;
    return (displayHours * 30) + (minutes * 0.5);
  } else {
    // Minute hand moves 6 degrees per minute
    return minutes * 6;
  }
};