import React from 'react'
import SleepTracker from '@/components/sleep/SleepTracker'
import SleepGraph from '@/components/sleep/SleepGraph'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const page = () => {
  return (
    <div>
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
            <CardContent>
                <SleepGraph />
            </CardContent>
        </Card>
    </div>
  )
}

export default page