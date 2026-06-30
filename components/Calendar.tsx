"use client";

import React, { useState } from "react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth())
  );

  const changeMonth = (amount: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const nextMonthDate = new Date(currentMonth);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-6 p-4 w-full">
      <MonthView
        date={currentMonth}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onPrev={() => changeMonth(-1)}
        showPrev
      />
      <MonthView
        date={nextMonthDate}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onNext={() => changeMonth(1)}
        showNext
      />
    </div>
  );
};

interface MonthViewProps {
  date: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPrev?: () => void;
  onNext?: () => void;
  showPrev?: boolean;
  showNext?: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  selectedDate,
  onDateSelect,
  onPrev,
  onNext,
  showPrev,
  showNext,
}) => {
  const month = date.getMonth();
  const year = date.getFullYear();

  const monthName = date.toLocaleString("default", { month: "long" });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = daysInMonth[0].getDay();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
      <div className="flex items-center p-1 justify-between">
        {showPrev ? (
          <button onClick={onPrev} className="hover:bg-gray-200 rounded-full">
            <div className="text-[#0d1b12] flex size-10 items-center justify-center">
              {"<"}
            </div>
          </button>
        ) : (
          <div className="size-10" />
        )}
        <p className="text-[#0d1b12] text-base font-bold leading-tight flex-1 text-center">
          {monthName} {year}
        </p>
        {showNext ? (
          <button onClick={onNext} className="hover:bg-gray-200 rounded-full">
            <div className="text-[#0d1b12] flex size-10 items-center justify-center">
              {">"}
            </div>
          </button>
        ) : (
          <div className="size-10" />
        )}
      </div>
      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <p
            key={day}
            className="text-[#0d1b12] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
          >
            {day}
          </p>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-12 w-full"></div>
        ))}
        {daysInMonth.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className="h-12 w-full text-[#0d1b12] text-sm font-medium leading-normal"
            >
              <div
                className={`flex size-full items-center justify-center rounded-full transition-colors ${
                  isSelected ? "bg-[#13ec5b]" : "hover:bg-gray-200"
                }`}
              >
                {day.getDate()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
