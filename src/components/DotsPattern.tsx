'use client';

interface DotsPatternProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
}

export default function DotsPattern({ 
  className = '', 
  dotColor = 'currentColor',
  dotSize = 1,
  gap = 16
}: DotsPatternProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-[0.15]"
      >
        <defs>
          <pattern
            id="dots-pattern"
            x="0"
            y="0"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill={dotColor}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-pattern)" />
      </svg>
    </div>
  );
}
