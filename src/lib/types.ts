import { z } from "zod";
export interface SleepRecord {
    id: string;
    
    // Local user timezone 
    date: string; // YYYY-MM-DD format
    sleepTime: string; // HH:MM format
    wakeTime: string; // HH:MM format
    hoursSlept: number;

    timezone: string;
    
    // Created at and updated at are in UTC
    // createdAt: string;
    // updatedAt: string;
  }
  
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;

  // createdAt: string;
  // updatedAt: string;
}

export interface HabitRecord {
  id: string;
  //  local user timezone
  date: string;
  habit_id: string;

  //createdAt and updatedAt are in UTC
  // createdAt: string;
}

export interface FoodRecord {
  id: string;
  date: string;
  total_calories: number;
  parts: FoodItem[];
}

// For the AI response
const FoodItemSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

export const FoodItemListSchema = z.object({
  reasoning: z.string(),
  totalCalories: z.number(),
  parts: z.array(FoodItemSchema),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;
export type FoodItemList = z.infer<typeof FoodItemListSchema>;