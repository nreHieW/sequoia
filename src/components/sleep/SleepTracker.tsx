"use client";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

const calculateSleepHours = (sleepTime: string, wakeTime: string): number => {
  if (!sleepTime || !wakeTime) return 0;

  const [sleepHour, sleepMinute] = sleepTime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

  const sleepMinutes = sleepHour * 60 + sleepMinute;
  const wakeMinutes = wakeHour * 60 + wakeMinute;

  let totalMinutes;

  if (wakeMinutes >= sleepMinutes) {
    // Same day sleep (e.g., nap from 14:00 to 16:00)
    totalMinutes = wakeMinutes - sleepMinutes;
  } else {
    // Sleep crosses midnight (e.g., sleep at 23:00, wake at 07:00)
    totalMinutes = 24 * 60 - sleepMinutes + wakeMinutes;
  }
  return Math.round((totalMinutes / 60) * 100) / 100;
};

const sleepSchema = z.object({
  sleepTime: z.string().time(),
  wakeTime: z.string().time(),
});

const saveSleepRecord = async (values: z.infer<typeof sleepSchema>) => {
  const hoursSlept = calculateSleepHours(values.sleepTime, values.wakeTime);
  const { data, error } = await supabase.from("sleep_records").upsert(
    {
      sleep_time: values.sleepTime,
      wake_time: values.wakeTime,
      date: new Date().toLocaleDateString("en-CA"),
      hours_slept: hoursSlept,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      onConflict: "date",
    }
  );
  return data;
};

const SleepTracker = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof sleepSchema>>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      sleepTime: "",
      wakeTime: getCurrentTime(),
    },
  });

  const sleepMutation = useMutation({
    mutationFn: saveSleepRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleepRecords"] });
    },
  });

  const onSubmit = (values: z.infer<typeof sleepSchema>) => {
    sleepMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="sleepTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep Time</FormLabel>
              <FormControl>
                <Input type="time" className="w-1/2" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wakeTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wake Time</FormLabel>
              <FormControl>
                <Input type="time" className="w-1/2" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={sleepMutation.isPending}>
          {sleepMutation.isPending ? "Saving..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default SleepTracker;

