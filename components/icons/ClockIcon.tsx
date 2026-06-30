import React from "react";

interface ClockIconProps {
  className?: string;
  width?: string;
  height?: string;
  color?: string;
}

const ClockIcon: React.FC<ClockIconProps> = ({
  className = "",
  width = "24",
  height = "24",
  color = "#13ec5b",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path
        d="M12 6V12L16 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ClockIcon;
