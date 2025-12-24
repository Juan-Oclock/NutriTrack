"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { format } from "date-fns"

interface DailyStats {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface WeeklyCalorieChartProps {
  data: DailyStats[]
}

export function WeeklyCalorieChart({ data }: WeeklyCalorieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "EEE")}
          tick={{ fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [`${value} cal`, "Calories"]}
          labelFormatter={(date) => format(new Date(String(date)), "MMM d")}
        />
        <Bar
          dataKey="calories"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
