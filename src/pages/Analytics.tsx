"use client"

import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import Layout from "../components/Layout"
import { format, subDays, eachDayOfInterval } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { Habit } from "./Dashboard"

export default function Analytics() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkins, setCheckins] = useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month">("week")

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const col = collection(db, "users", user.uid, "habits")
    const q = query(col, where("archived", "==", false))

    const unsub = onSnapshot(q, (snap) => {
      const habitsData = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Habit, "id" | "startDate">),
        startDate: d.data().startDate.toDate(),
      }))
      setHabits(habitsData)

      // Fetch check‑ins for each habit
      habitsData.forEach((habit) => {
        const checkinsCol = collection(
          db,
          "users",
          user.uid,
          "habits",
          habit.id,
          "checkins"
        )
        onSnapshot(checkinsCol, (checkinsSnap) => {
          const checkinsMap: Record<string, boolean> = {}
          checkinsSnap.docs.forEach((d) => {
            checkinsMap[d.id] = d.data().completed
          })
          setCheckins((prev) => ({
            ...prev,
            [habit.id]: checkinsMap,
          }))
        })
      })

      setLoading(false)
    })

    return unsub
  }, [user])

  //  ─── Calculate daily completion data ───────────────────────────
  const days = timeRange === "week" ? 7 : 30
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  })

  const dailyData = dateRange.map((date) => {
    const dateKey = date.toISOString().slice(0, 10)
    const dayHabits = habits.filter((h) =>
      h.targetDays.includes(date.getDay())
    )
    const completed = dayHabits.filter((h) => checkins[h.id]?.[dateKey]).length
    const total = dayHabits.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      date: format(date, "MMM d"),
      completed,
      total,
      percentage,
    }
  })

  //  ─── Habit completion data ──────────────────────────────────────
  const habitCompletionData = habits
    .map((habit) => {
      const habitCheckins = checkins[habit.id] || {}
      const targetDates = dateRange
        .filter((d) => habit.targetDays.includes(d.getDay()))
        .map((d) => d.toISOString().slice(0, 10))

      const completed = targetDates.filter((d) => habitCheckins[d]).length
      const total = targetDates.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        name: habit.name,
        completed,
        total,
        percentage,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  //  ─── Overall stats (removed unused dateKey) ────────────────────
  const totalCheckins = Object.values(checkins).reduce(
    (sum, habitCheckins) =>
      sum + Object.values(habitCheckins).filter(Boolean).length,
    0
  )

  const totalPossibleCheckins = dateRange.reduce((sum, date) => {
    const dayCount = habits.filter((h) =>
      h.targetDays.includes(date.getDay())
    ).length
    return sum + dayCount
  }, 0)

  const overallCompletionRate =
    totalPossibleCheckins > 0
      ? Math.round((totalCheckins / totalPossibleCheckins) * 100)
      : 0

  //  ─── Pie chart data ─────────────────────────────────────────────
  const pieData = [
    { name: "Completed", value: totalCheckins, color: "#4f46e5" },
    {
      name: "Missed",
      value: totalPossibleCheckins - totalCheckins,
      color: "#FF0000",
    },
  ]

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your habit performance over time</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Time range selector */}
          <div className="flex justify-end mb-6">
            <div className="bg-white rounded-lg shadow-sm inline-flex p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === "week"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setTimeRange("week")}
              >
                Week
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === "month"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setTimeRange("month")}
              >
                Month
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-gray-500 text-sm mb-1">Total Habits</h3>
              <p className="text-3xl font-bold">{habits.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-gray-500 text-sm mb-1">Completion Rate</h3>
              <p className="text-3xl font-bold">{overallCompletionRate}%</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-gray-500 text-sm mb-1">Total Check-ins</h3>
              <p className="text-3xl font-bold">{totalCheckins}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily completion */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-4">Daily Completion Rate</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis unit="%" domain={[0, 100]} />
                    <RechartsTooltip
                      formatter={(value) => [`${value}%`, "Completion Rate"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="percentage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overall completion */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-4">Overall Completion</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [value, "Check-ins"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <h3 className="font-semibold p-5 border-b">Habit Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">
                      Habit
                    </th>
                    <th className="text-center py-3 px-5 text-sm font-medium text-gray-500">
                      Completion Rate
                    </th>
                    <th className="text-center py-3 px-5 text-sm font-medium text-gray-500">
                      Completed
                    </th>
                    <th className="text-center py-3 px-5 text-sm font-medium text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {habitCompletionData.map((h) => (
                    <tr key={h.name} className="hover:bg-gray-50">
                      <td className="py-3 px-5">{h.name}</td>
                      <td className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${h.percentage}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm">{h.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center">{h.completed}</td>
                      <td className="py-3 px-5 text-center">{h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
