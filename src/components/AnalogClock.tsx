import React, { useRef, useEffect, useCallback } from 'react';
import { useClockState } from '../hooks/useClockState';

interface AnalogClockProps {
  onTimeChange?: (hours: number, minutes: number) => void;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ onTimeChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const {
    time,
    isDragging,
    setIsDragging,
    setHourAngle,
    setMinuteAngle,
    getAngles
  } = useClockState();

  const { hourAngle, minuteAngle } = getAngles();
  const latestOnTimeChange = useRef(onTimeChange);

  useEffect(() => {
    latestOnTimeChange.current = onTimeChange;
  }, [onTimeChange]);

  useEffect(() => {
    if (latestOnTimeChange.current) {
      latestOnTimeChange.current(time.hours, time.minutes);
    }
  }, [time.hours, time.minutes]);

  const handleMouseDown = (handType: 'hour' | 'minute') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handType);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI) + 90;

    if (isDragging === 'hour') {
      setHourAngle(angle);
    } else if (isDragging === 'minute') {
      setMinuteAngle(angle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handleTouchStart = (handType: 'hour' | 'minute') => (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(handType);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touch = e.touches[0];
    const touchX = touch.clientX - centerX;
    const touchY = touch.clientY - centerY;

    let angle = Math.atan2(touchY, touchX) * (180 / Math.PI) + 90;

    if (isDragging === 'hour') {
      setHourAngle(angle);
    } else if (isDragging === 'minute') {
      setMinuteAngle(angle);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div className="clock-container">
      <svg
        ref={svgRef}
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="analog-clock"
      >
        {/* Clock face */}
        <circle
          cx="150"
          cy="150"
          r="145"
          fill="white"
          stroke="#2c3e50"
          strokeWidth="8"
        />

        {/* Hour markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 150 + Math.cos(angle) * 120;
          const y1 = 150 + Math.sin(angle) * 120;
          const x2 = 150 + Math.cos(angle) * 130;
          const y2 = 150 + Math.sin(angle) * 130;
          const numberX = 150 + Math.cos(angle) * 105;
          const numberY = 150 + Math.sin(angle) * 105;

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2c3e50"
                strokeWidth="3"
              />
              <text
                x={numberX}
                y={numberY + 5}
                textAnchor="middle"
                className="hour-number"
                fontSize="18"
                fontWeight="bold"
                fill="#2c3e50"
              >
                {i === 0 ? 12 : i}
              </text>
            </g>
          );
        })}

        {/* Minute markers */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 !== 0) {
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const x1 = 150 + Math.cos(angle) * 135;
            const y1 = 150 + Math.sin(angle) * 135;
            const x2 = 150 + Math.cos(angle) * 140;
            const y2 = 150 + Math.sin(angle) * 140;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#95a5a6"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}

        {/* Hour hand */}
        <line
          x1="150"
          y1="150"
          x2="150"
          y2="90"
          stroke="#3498db"
          strokeWidth="6"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 150 150)`}
          className={`hour-hand ${isDragging === 'hour' ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown('hour')}
          onTouchStart={handleTouchStart('hour')}
          style={{ cursor: isDragging === 'hour' ? 'grabbing' : 'grab' }}
        />

        {/* Minute hand */}
        <line
          x1="150"
          y1="150"
          x2="150"
          y2="60"
          stroke="#e74c3c"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 150 150)`}
          className={`minute-hand ${isDragging === 'minute' ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown('minute')}
          onTouchStart={handleTouchStart('minute')}
          style={{ cursor: isDragging === 'minute' ? 'grabbing' : 'grab' }}
        />

        {/* Center dot */}
        <circle
          cx="150"
          cy="150"
          r="8"
          fill="#2c3e50"
        />
      </svg>
    </div>
  );
};

export default AnalogClock;
