"use client";

import React from "react";

/**
 * PriceRangeFilter component with input fields
 * Features:
 * - Two separate input fields for min/max selection
 * - Dynamic range validation
 * - Theme-appropriate styling
 */

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  className?: string;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  minPrice,
  maxPrice,
  onPriceChange,
  className = "",
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure min doesn't exceed max
    const newMin = isNaN(value) ? minPrice : Math.min(value, maxPrice);
    onPriceChange(newMin, maxPrice);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Ensure max doesn't go below min
    const newMax = isNaN(value) ? maxPrice : Math.max(value, minPrice);
    onPriceChange(minPrice, newMax);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#e7f3eb]">
        <span className="text-sm font-medium text-[#0d1b12]">Price:</span>
        <div className="flex items-center gap-1">
          <div className="relative w-20">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#0d1b12] text-xs">
              $
            </span>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              step="0.01"
              value={minPrice}
              onChange={handleMinChange}
              className="w-full pl-5 pr-2 py-1 rounded text-sm bg-white border-[#4c9a66] text-[#0d1b12] focus:outline-none focus:ring-1 focus:ring-[#13ec5b] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-[#0d1b12] text-xs">-</span>
          <div className="relative w-20">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#0d1b12] text-xs">
              $
            </span>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              step="0.01"
              value={maxPrice}
              onChange={handleMaxChange}
              className="w-full pl-5 pr-2 py-1 rounded text-sm bg-white border-[#4c9a66] text-[#0d1b12] focus:outline-none focus:ring-1 focus:ring-[#13ec5b] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
