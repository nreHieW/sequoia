"use client";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Habit, HabitRecord } from "@/lib/types";
import HabitCard from "./HabitCard";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fetchHabits = async () => {
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, color, description");
  if (error) throw error;
  return data;
};

const fetchTodayHabits = async () => {
  const { data, error } = await supabase
    .from("habit_records")
    .select("*")
    .eq("date", new Date().toISOString().split("T")[0]);
  if (error) throw error;
  return data;
};

const HabitTracker = () => {
  const queryClient = useQueryClient();
  const { data: habits, error } = useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: fetchHabits,
  });

  const { data: todayHabits, error: todayHabitsError } = useQuery<
    HabitRecord[]
  >({
    queryKey: ["todayHabits"],
    queryFn: fetchTodayHabits,
  });

  const deleteHabit = async (id: string) => {
    const { error: recordsError } = await supabase
      .from("habit_records")
      .delete()
      .eq("habit_id", id);
    if (recordsError) throw recordsError;

    const { data, error } = await supabase.from("habits").delete().eq("id", id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    return data;
  };

  const HabitSchema = z.object({
    habitId: z.string(),
    checked: z.boolean(),
  });

  const habitForm = useForm<z.infer<typeof HabitSchema>>({
    resolver: zodResolver(HabitSchema),
    defaultValues: {
      habitId: "",
      checked: false,
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof HabitSchema>) => {
      if (values.checked) {
        const { error } = await supabase.from("habit_records").upsert({
          habit_id: values.habitId,
          date: new Date().toISOString().split("T")[0],
        }, {
          onConflict: "habit_id,date",
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_records")
          .delete()
          .eq("habit_id", values.habitId)
          .eq("date", new Date().toISOString().split("T")[0]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["todayHabits"] });
    },
  });

  const onCheckedChange = (id: string, checked: boolean) => {
    habitForm.setValue("habitId", id);
    habitForm.setValue("checked", checked);
    updateHabitMutation.mutate({ habitId: id, checked });
  };


  return (
    <div>
      {habits?.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          deleteHabit={deleteHabit}
          onCheckedChange={onCheckedChange}
          isChecked={todayHabits?.some((h) => h.habit_id === habit.id) ?? false}
        />
      ))}
    </div>
  );
};

export default HabitTracker;
