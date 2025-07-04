import React from 'react'
import CalorieTracker from '@/components/food/CalorieTracker'
import FoodGraph from '@/components/food/FoodGraph'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const page = () => {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 lg:px-8 py-4 pb-20">
        <CalorieTracker />
        <Card>
            <CardHeader>
                <CardTitle>Food Graph</CardTitle>
            </CardHeader>
            <CardContent className="min-h-80">
                <FoodGraph />
            </CardContent>
        </Card>
    </div>
  )
}

export default page