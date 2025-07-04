"use client"
import HabitTracker from '@/components/habits/HabitTracker'
import HabitCreator from '@/components/habits/HabitCreator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Habit, HabitRecord } from '@/lib/types';
import HabitGraph from '@/components/habits/HabitGraph';

const fetchHabits = async () => {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, color, description");
  if (error) throw error;
  return data;
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
  return data;
};

const Page = () => {
  const { data: habits } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });

  const { data: habitRecords } = useQuery<HabitRecord[]>({
    queryKey: ["habitRecords"],
    queryFn: fetchPastHabits,
  });

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 lg:px-8 py-4 pb-20">
        <Card>
            <CardHeader>
                <CardTitle>Habit Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <HabitTracker habits={habits ?? []} habitRecords={habitRecords ?? []} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Habit Progress</CardTitle>
            </CardHeader>
            <CardContent>
                {habits?.map((habit) => (
                    <HabitGraph key={habit.id} habitRecords={habitRecords ?? []} habit={habit} />
                ))}
            </CardContent>
        </Card>
        <HabitCreator />
    </div>
  )
}

export default Page