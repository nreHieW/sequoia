"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateRandomColor } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

const habitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const HabitCreator = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof habitSchema>>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const saveHabit = async (values: z.infer<typeof habitSchema>) => {
    const { data, error } = await supabase.from("habits").insert({
      name: values.name,
      description: values.description,
      color: generateRandomColor(),
    });
    if (error) {
      // TODO: handle error
      if (
        error.code === "23505" &&
        error.message.includes("habits_name_unique")
      ) {
        throw new Error(`Habit "${values.name}" already exists!`);
      }
      throw error;
    } else {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    }

    return data;
  };
  const habitMutation = useMutation({
    mutationFn: saveHabit,
  });
  async function onSubmit(values: z.infer<typeof habitSchema>) {
    habitMutation.mutate(values);
  }

  return (
    <Card>
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex flex-row items-center justify-between w-full">
              <CardTitle>Add New Habit</CardTitle>
              <ChevronsUpDown className="w-4 h-4 shrink-0" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habit Name</FormLabel>
                      <FormControl>
                        <Input type="text" className="w-full" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habit Description</FormLabel>
                      <FormControl>
                        <Input type="text" className="w-full" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full border-1 border-black/50"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default HabitCreator;
