import React from 'react'
import SleepTracker from '@/components/sleep/SleepTracker'
import SleepGraph from '@/components/sleep/SleepGraph'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const page = () => {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 lg:px-8 py-4 pb-20">
        <Card>
            <CardHeader>
                <CardTitle>Sleep Tracker</CardTitle>
            </CardHeader>
            <CardContent>
                <SleepTracker />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Sleep Graph</CardTitle>
            </CardHeader>
            <CardContent className="min-h-60">
                <SleepGraph />
            </CardContent>
        </Card>
    </div>
  )
}

export default page