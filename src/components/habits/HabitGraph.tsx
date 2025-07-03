import { useMemo } from "react";
import { Habit, HabitRecord } from "@/lib/types";

const formatTooltipDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const NUM_WEEKS = 12;
const NUM_DAYS = 7;
const TOTAL_DAYS = NUM_WEEKS * NUM_DAYS;

const HabitGraph = ({
  habitRecords,
  habit,
}: {
  habitRecords: HabitRecord[];
  habit: Habit;
}) => {
  const dateGrid = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (TOTAL_DAYS - 1));

    const grid: string[][] = [];
    for (let weekIndex = 0; weekIndex < NUM_WEEKS; weekIndex++) {
      const week: string[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);
        week.push(targetDate.toISOString().split("T")[0]);
      }
      grid.push(week);
    }
    return grid;
  }, []);

  // Calculate completion percentage for past days only
  const completionStats = useMemo(() => {
    const allDates = dateGrid.flat();
    const today = new Date().toISOString().split("T")[0];
    const pastDates = allDates.filter(date => date <= today);
    
    const completedDays = pastDates.filter(date => 
      habitRecords.some(record => 
        record.date === date && record.habit_id === habit.id
      )
    ).length;
    
    const percentage = pastDates.length > 0 ? Math.round((completedDays / pastDates.length) * 100) : 0;
    
    return {
      completed: completedDays,
      total: pastDates.length,
      percentage
    };
  }, [dateGrid, habitRecords, habit.id]);

  return (
    <div className="w-full space-y-3">
      {/* Habit Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="font-medium text-sm">{habit.name}</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {completionStats.percentage}% ({completionStats.completed}/{completionStats.total})
        </div>
      </div>
      
      {/* Habit Graph */}
      <div className="flex justify-between w-full">
        {Array.from({ length: NUM_WEEKS }).map((_, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1.5">
          {Array.from({ length: NUM_DAYS }).map((_, dayIndex) => {
            const cellDate = dateGrid[weekIndex][dayIndex];
            const dayData = habitRecords.find(
              (record) =>
                record.date === cellDate && record.habit_id === habit.id
            );

            const isToday = cellDate === new Date().toISOString().split("T")[0];
            const isFuture = new Date(cellDate) > new Date();
            const isCompleted = !!dayData;

            return (
              <div
                key={dayIndex}
                className={`w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-110 ${
                  isToday ? "ring-1 ring-foreground" : ""
                } ${isFuture ? "hidden" : ""}`}
                style={{
                  backgroundColor: isCompleted ? habit.color : "#e5e7eb",
                  opacity: isFuture ? 0.1 : isCompleted ? 1 : 0.3,
                }}
                title={`${formatTooltipDate(cellDate)} - ${
                  isCompleted ? "Completed" : "Not completed"
                }`}
              />
            );
          })}
        </div>
      ))}
      </div>
    </div>
  );
};

export default HabitGraph;
