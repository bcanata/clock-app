import React from 'react';

interface TimeDisplayProps {
  timeDescription: string;
  digitalTime?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeDescription, digitalTime }) => {
  return (
    <div className="time-display">
      <div className="english-time">
        {timeDescription}
      </div>
      {digitalTime && (
        <div className="digital-time">
          {digitalTime}
        </div>
      )}
    </div>
  );
};

export default TimeDisplay;