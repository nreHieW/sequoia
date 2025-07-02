import { Habit } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Trash } from "lucide-react";

const HabitCard = ({
  habit,
  deleteHabit,
  onCheckedChange,
  isChecked,
}: 
{
  habit: Habit;
  deleteHabit: (id: string) => void;
  onCheckedChange: (id: string, checked: boolean) => void;
  isChecked: boolean;
}) => {
    console.log(isChecked);
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Checkbox onCheckedChange={(checked) => onCheckedChange(habit.id, !!checked)} checked={isChecked} />
          <div>
            <p className="font-bold">{habit.name}</p>
            <p>{habit.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.color }}
        ></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteHabit(habit.id)}
        >
          <Trash />
        </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
