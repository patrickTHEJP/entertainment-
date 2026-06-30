"use client";

import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onChange,
  placeholder = "Select an option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative inline-block w-full ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-lg bg-[#e7f3eb] px-4 py-2 text-[#0d1b12] text-sm font-medium leading-normal focus:outline-none focus:ring-2 focus:ring-[#13ec5b] transition-colors hover:bg-[#d8e9df]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`ml-2 transform transition-transform text-xs ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={`block w-full px-4 py-2 text-left text-sm leading-normal transition-colors hover:bg-[#13ec5b] hover:text-[#0d1b12] ${
                    selectedValue === option.value
                      ? "bg-[#13ec5b] text-[#0d1b12]"
                      : "text-[#0d1b12]"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
