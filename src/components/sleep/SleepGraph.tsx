"use client";

import { SleepRecord } from "@/lib/types";
import { useState, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Dot,
  Area,
  ResponsiveContainer,
  AreaChart,
  LineChart,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";

const fetchSleepRecords = async () => {
  let { data, error } = await supabase
    .from("sleep_records")
    .select("id, date, sleep_time, wake_time, hours_slept, timezone")
    .order("date", { ascending: true });
  if (error) console.error("Error fetching sleep records:", error.message);

  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  data = (data || []).map((record) => {
    let sleepTime = record.sleep_time;
    let wakeTime = record.wake_time;

    if (record.timezone !== currentTimezone) {
      // Convert times from record timezone to current timezone
      const [sleepHour, sleepMin] = record.sleep_time.split(":");
      const [wakeHour, wakeMin] = record.wake_time.split(":");

      const sleepDate = new Date();
      sleepDate.setHours(parseInt(sleepHour), parseInt(sleepMin));

      const wakeDate = new Date();
      wakeDate.setHours(parseInt(wakeHour), parseInt(wakeMin));

      // Create dates in record's timezone
      const sleepInOriginalTZ = new Date(
        `${record.date}T${record.sleep_time}:00${record.timezone}`
      );
      const wakeInOriginalTZ = new Date(
        `${record.date}T${record.wake_time}:00${record.timezone}`
      );

      // Convert to current timezone
      sleepTime = sleepInOriginalTZ.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: currentTimezone,
      });

      wakeTime = wakeInOriginalTZ.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: currentTimezone,
      });
    } else {
      sleepTime = record.sleep_time;
      wakeTime = record.wake_time;
    }

    return {
      id: record.id,
      date: record.date,
      sleep_time: sleepTime,
      wake_time: wakeTime,
      hours_slept: record.hours_slept,
      timezone: record.timezone,
    } as SleepRecord;
  });
  return data as SleepRecord[];
};

const processSleepRecords = (
  sleepRecords: SleepRecord[],
  viewMode: "day" | "week" | "month"
) => {
  switch (viewMode) {
    case "day":
      return sleepRecords.slice(-14); // last 14 days

    case "week":
      const weekGroups: { [key: string]: SleepRecord[] } = {};

      sleepRecords.forEach((record) => {
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
          sleep_time: records[0].sleep_time,
          wake_time: records[0].wake_time,
          hours_slept:
            records.reduce((sum, r) => sum + r.hours_slept, 0) / records.length, // Average
          timezone: records[0].timezone,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    case "month":
      const monthGroups: { [key: string]: SleepRecord[] } = {};

      sleepRecords.forEach((record) => {
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
          sleep_time: records[0].sleep_time,
          wake_time: records[0].wake_time,
          hours_slept:
            records.reduce((sum, r) => sum + r.hours_slept, 0) / records.length, // Average
          timezone: records[0].timezone,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
  }
};

const SleepGraph = () => {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(
    null
  );
  const { data: rawSleepRecords, error } = useQuery({
    queryKey: ["sleepRecords"],
    queryFn: fetchSleepRecords,
  });
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    return (
      <Dot
        cx={cx}
        cy={cy}
        r={2}
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        className="cursor-pointer hover:r-6 transition-all"
      />
    );
  };

  const processedSleepRecords = useMemo(() => {
    if (!rawSleepRecords) return [];
    return processSleepRecords(rawSleepRecords, viewMode);
  }, [rawSleepRecords, viewMode]);

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

  const primaryColor = "black";

  const SleepGraphDetails = ({
    selectedRecord,
  }: {
    selectedRecord: SleepRecord;
  }) => {
    return (
      <div className="flex flex-col gap-2 rounded-md border-1 border-black p-4 mt-4">
        <h1 className="font-bold">Sleep Details</h1>
        <p>Date: {selectedRecord.date}</p>
        {/* <p>Sleep Time: {selectedRecord.sleep_time}</p>
        <p>Wake Time: {selectedRecord.wake_time}</p>
        <p>Hours Slept: {selectedRecord.hours_slept}</p>
        <p>Timezone: {selectedRecord.timezone}</p> */}
      </div>
    );
  };

  return (
    <div className="w-full min-h-80 mb-10 flex flex-col">
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
          <AreaChart
            data={processedSleepRecords}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            onClick={(data: any) => {
              if (
                data &&
                data.activeIndex !== undefined &&
                processedSleepRecords[data.activeIndex]
              ) {
                const selectedRecord = processedSleepRecords[data.activeIndex];
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
              domain={[0, 12]}
              ticks={[2, 4, 6, 8, 10, 12]}
              width={10}
            />
            <Line
              type="monotone"
              dataKey="hours_slept"
              stroke={primaryColor}
              strokeWidth={1}
              dot={<CustomDot />}
              activeDot={{
                fill: primaryColor,
                stroke: primaryColor,
                strokeWidth: 2,
                r: 4,
              }}
            />
            <Area
              type="monotone"
              dataKey="hours_slept"
              stroke={"green"}
              fill={"green"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {selectedRecord && <SleepGraphDetails selectedRecord={selectedRecord} />}
    </div>
  );
};

export default SleepGraph;
