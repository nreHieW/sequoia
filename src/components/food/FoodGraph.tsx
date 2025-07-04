"use client";

import { FoodRecord } from "@/lib/types";
import { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import FoodItemCard from "./FoodItemCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type AggregatedFoodRecord = {
  id: string;
  date: string;
  total_calories: number;
  records: FoodRecord[];
};

const fetchFoodRecords = async () => {
  const { data: initialData, error } = await supabase
    .from("food_records")
    .select("id, date, total_calories, parts")
    .order("date", { ascending: true });
  
  if (error) {
    console.error("Error fetching food records:", error.message);
    throw error;
  }

  return (initialData || []) as FoodRecord[];
};

const processFoodRecords = (
  foodRecords: FoodRecord[],
  viewMode: "day" | "week" | "month"
): AggregatedFoodRecord[] => {
  switch (viewMode) {
    case "day":
      const dayGroups: { [key: string]: FoodRecord[] } = {};

      foodRecords.forEach((record) => {
        const dayKey = record.date; // YYYY-MM-DD format
        if (!dayGroups[dayKey]) {
          dayGroups[dayKey] = [];
        }
        dayGroups[dayKey].push(record);
      });

      return Object.entries(dayGroups)
        .map(([date, records]) => ({
          id: `day-${date}`,
          date: date,
          total_calories: records.reduce((sum, r) => sum + r.total_calories, 0),
          records: records, // Keep all records for detail view
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Show last 14 days

    case "week":
      const weekGroups: { [key: string]: FoodRecord[] } = {};

      foodRecords.forEach((record) => {
        const date = new Date(record.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weekGroups[weekKey]) {
          weekGroups[weekKey] = [];
        }
        weekGroups[weekKey].push(record);
      });

      return Object.entries(weekGroups)
        .map(([weekStart, records]) => ({
          id: `week-${weekStart}`,
          date: weekStart,
          total_calories: records.reduce((sum, r) => sum + r.total_calories, 0),
          records: records, // Keep all records for detail view
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    case "month":
      const monthGroups: { [key: string]: FoodRecord[] } = {};

      foodRecords.forEach((record) => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-01`;

        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = [];
        }
        monthGroups[monthKey].push(record);
      });

      return Object.entries(monthGroups)
        .map(([monthStart, records]) => ({
          id: `month-${monthStart}`,
          date: monthStart,
          total_calories: records.reduce((sum, r) => sum + r.total_calories, 0),
          records: records, // Keep all records for detail view
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
  }
};

const FoodGraph = () => {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedRecord, setSelectedRecord] = useState<AggregatedFoodRecord | null>(null);
  
  const { data: rawFoodRecords } = useQuery({
    queryKey: ["foodRecords"],
    queryFn: fetchFoodRecords,
  });

  const processedFoodRecords = useMemo(() => {
    if (!rawFoodRecords) return [];
    return processFoodRecords(rawFoodRecords, viewMode);
  }, [rawFoodRecords, viewMode]);

  const formatXAxisLabel = (tickItem: string) => {
    switch (viewMode) {
      case "day": {
        const date = new Date(tickItem);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      case "week": {
        const date = new Date(tickItem);
        return `Week of ${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;
      }
      case "month": {
        const [year, month] = tickItem.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      }
      default:
        return tickItem;
    }
  };

  const FoodGraphDetails = ({
    selectedRecord,
  }: {
    selectedRecord: AggregatedFoodRecord;
  }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    const formatDateRange = (dateString: string) => {
      if (selectedRecord.id && typeof selectedRecord.id === "string") {
        if (selectedRecord.id.startsWith("week-")) {
          const weekStart = new Date(dateString);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `${formatDate(weekStart.toISOString().split("T")[0])} - ${formatDate(weekEnd.toISOString().split("T")[0])}`;
        } else if (selectedRecord.id.startsWith("month-")) {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        }
      }
      return formatDate(dateString);
    };

    return (
      <div className="flex flex-col gap-4 rounded-md border-1 border-black p-4 mt-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold">Food Details</h1>
          <X
            onClick={() => setSelectedRecord(null)}
            className="cursor-pointer h-5 w-5"
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Period</p>
          <p className="font-medium">{formatDateRange(selectedRecord.date)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Total Calories: <span className="font-semibold text-green-600">{selectedRecord.total_calories}</span>
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          <h4 className="font-medium text-gray-700 mb-3">Food Records ({selectedRecord.records.length})</h4>
          {selectedRecord.records.map((record) => (
            <Collapsible key={record.id} className="border border-gray-200 rounded-lg">
              <CollapsibleTrigger className="flex w-full justify-between items-center p-3 text-left hover:bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-medium">{formatDate(record.date)}</span>
                  <span className="text-sm text-gray-600">{record.total_calories} calories</span>
                </div>
                <span className="text-xs text-gray-500">Click to expand</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <FoodItemCard foodRecord={record} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-80 mb-5 flex flex-col">
      <div className="flex justify-end gap-1 mb-2">
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          onClick={() => setViewMode("day")}
          className="w-16 border-1 border-black"
        >
          Day
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          onClick={() => setViewMode("week")}
          className="w-16 border-1 border-black"
        >
          Week
        </Button>
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          onClick={() => setViewMode("month")}
          className="w-16 border-1 border-black"
        >
          Month
        </Button>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedFoodRecords}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                         onClick={(chartEvent) => {
               const { activeIndex } = chartEvent as { activeIndex?: number };
               if (
                 activeIndex !== undefined &&
                 processedFoodRecords[activeIndex]
               ) {
                 const selectedRecord = processedFoodRecords[activeIndex];
                 console.log("Selected record:", selectedRecord); // Debug log
                 setSelectedRecord(selectedRecord);
               }
             }}
          >
            <CartesianGrid strokeDasharray="1, 1" opacity={1} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis
              tickLine={false}
              domain={[0, 'dataMax + 200']}
              width={40}
              label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
            />
            <Bar
              dataKey="total_calories"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {selectedRecord && <FoodGraphDetails selectedRecord={selectedRecord} />}
    </div>
  );
};

export default FoodGraph; 