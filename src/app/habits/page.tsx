import React from 'react'
import HabitTracker from '@/components/habits/HabitTracker'
import HabitCreator from '@/components/habits/HabitCreator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const page = () => {
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>Habit Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <HabitTracker />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Habits</CardTitle>
            </CardHeader>
            <CardContent>
                <HabitCreator />
            </CardContent>
        </Card>
    </div>
  )
}

export default page