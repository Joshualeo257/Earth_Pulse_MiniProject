// src/components/crops/IrrigationCalendar.tsx

import React from 'react';
import { Droplet } from 'lucide-react';
import { format, addDays, isToday } from 'date-fns';

interface IrrigationCalendarProps {
  schedule: number[];
  quantity: number[];
  startDate?: Date;
}

export const IrrigationCalendar: React.FC<IrrigationCalendarProps> = ({ schedule, quantity, startDate = new Date() }) => {
  // Generate an array of 14 date objects starting from today
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)); // Always start from today

  // Ensure schedule and quantity arrays have a length of 14, padding with 0s if they are shorter
  const safeSchedule = [...(schedule || []), ...Array(14).fill(0)].slice(0, 14);
  const safeQuantity = [...(quantity || []), ...Array(14).fill(0)].slice(0, 14);

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">14-Day AI Irrigation Forecast</h4>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const shouldWater = safeSchedule[index] === 1;
          const waterAmount = safeQuantity[index];
          const today = isToday(day); // Check if the current day in the loop is today

          // Dynamically create class names for styling
          const dayClasses = `
            p-2 rounded-md text-center border-2 transition-all
            ${shouldWater ? 'bg-blue-100 border-blue-400 font-bold' : 'bg-gray-50 border-gray-200'}
            ${today ? '!border-green-500 ring-2 ring-green-500' : ''}
          `;

          return (
            <div key={index} className={dayClasses}>
              <div className="text-xs font-semibold text-gray-500">{format(day, 'E')}</div>
              <div className="text-lg text-gray-800">{format(day, 'd')}</div>
              <div className="h-6 flex items-center justify-center">
                {shouldWater && (
                  // This section will now render correctly when shouldWater is true
                  <div className="flex items-center text-blue-600 animate-pulse">
                    <Droplet size={14} className="flex-shrink-0" />
                    <span className="text-xs ml-1 font-semibold">{waterAmount.toFixed(1)}L</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};