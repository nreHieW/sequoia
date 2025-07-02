"use client"

import { SleepRecord } from "@/lib/types";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const fetchSleepRecords = async () => {
  let { data, error } = await supabase.from("sleep_records").select("*").order("date", { ascending: true });
  if (error) console.error("Error fetching sleep records:", error.message);
  
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  data = (data || []).map((record) => {
    let sleepTime = record.sleep_time;
    let wakeTime = record.wake_time;

    if (record.timezone !== currentTimezone) {
      // Convert times from record timezone to current timezone
      const [sleepHour, sleepMin] = record.sleep_time.split(':');
      const [wakeHour, wakeMin] = record.wake_time.split(':');

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
      sleepTime = sleepInOriginalTZ.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: currentTimezone
      });
      
      wakeTime = wakeInOriginalTZ.toLocaleTimeString('en-US', {
        hour12: false, 
        hour: '2-digit',
        minute: '2-digit',
        timeZone: currentTimezone
      });
    }

    return {
      id: record.id,
      date: record.date,
      sleepTime: sleepTime,
      wakeTime: wakeTime,
      hoursSlept: record.hours_slept,
      timezone: record.timezone,
    } as SleepRecord;
  });
  return data;
};

const SleepGraph =  () => {
  const { data: sleepRecords, error } = useQuery({
    queryKey: ["sleepRecords"],
    queryFn: fetchSleepRecords,
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sleepRecords}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="hoursSlept" stroke="#8884d8" isAnimationActive={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepGraph;
