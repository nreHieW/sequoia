"use client";

import SleepGraph from "@/components/sleep/SleepGraph";
import HabitGraph from "@/components/habits/HabitGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Habit, HabitRecord } from "@/lib/types";

const fetchHabits = async () => {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, color, description");
  if (error) throw error;
  return data as Habit[];
};

const fetchPastHabits = async () => {
  const today = new Date();
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(today.getDate() - 84); // 12 weeks * 7 days = 84 days

  const { data, error } = await supabase
    .from("habit_records")
    .select("*")
    .gte("date", twelveWeeksAgo.toISOString().split("T")[0])
    .lte("date", today.toISOString().split("T")[0]);

  if (error) throw error;
  return data as HabitRecord[];
};

export default function Home() {
  const { data: habits } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });

  const { data: habitRecords } = useQuery<HabitRecord[]>({
    queryKey: ["habitRecords"],
    queryFn: fetchPastHabits,
  });

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 lg:px-8 py-4">
      {/* Sleep Graph Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Graph</CardTitle>
        </CardHeader>
        <CardContent className="min-h-80">
          <SleepGraph />
        </CardContent>
      </Card>

      {/* Habit Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {habits?.map((habit) => (
            <HabitGraph
              key={habit.id}
              habit={habit}
              habitRecords={habitRecords ?? []}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
