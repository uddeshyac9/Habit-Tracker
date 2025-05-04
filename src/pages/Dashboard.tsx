"use client"

import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import AddHabitModal from "../components/AddHabitModal"
import HabitCard from "../components/HabitCard"
import Layout from "../components/Layout"
import { PlusCircle, Calendar, Trophy, Flame } from "lucide-react"
import { format } from "date-fns"
import { getCurrentStreak } from "../utils/streak"

export type Habit = {
  id: string
  name: string
  targetDays: number[]
  startDate: Date
  archived: boolean
}

export default function Dashboard() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkins, setCheckins] = useState<Record<string, Record<string, boolean>>>({})
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active">("active")

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const col = collection(db, "users", user.uid, "habits")
    const q = query(col, where("archived", "==", filter === "all"), orderBy("createdAt", "desc"))

    const unsub = onSnapshot(q, (snap) => {
      const habitsData = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Habit, "id" | "startDate">),
        startDate: d.data().startDate.toDate(),
      }))
      setHabits(habitsData)
      setLoading(false)

      // Fetch checkins for each habit
      habitsData.forEach((habit) => {
        const checkinsCol = collection(db, "users", user.uid, "habits", habit.id, "checkins")
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
    })

    return unsub
  }, [user, filter])

  // Calculate stats
  const totalHabits = habits.length
  const todayKey = new Date().toISOString().slice(0, 10)
  const completedToday = habits.filter((h) => checkins[h.id]?.[todayKey]).length

  const totalStreaks = habits.reduce((sum, habit) => {
    return sum + (getCurrentStreak(checkins[habit.id] || {}) || 0)
  }, 0)

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{format(new Date(), "EEEE, MMMM d")}</h1>
        <p className="text-gray-600">Track your daily habits and build consistency</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Today's Progress</p>
            <p className="text-2xl font-semibold">
              {completedToday} / {totalHabits}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg mr-4">
            <Flame className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Streaks</p>
            <p className="text-2xl font-semibold">{totalStreaks}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <Trophy className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Habits</p>
            <p className="text-2xl font-semibold">{totalHabits}</p>
          </div>
        </div>
      </div>

      {/* Filters and Add button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>

        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          onClick={() => setOpen(true)}
        >
          <PlusCircle size={20} />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && habits.length === 0 && (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your habits by adding your first one</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setOpen(true)}
          >
            Add Your First Habit
          </button>
        </div>
      )}

      {/* Habits grid */}
      {!loading && habits.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} checkins={checkins[habit.id] || {}} />
          ))}
        </div>
      )}

      {open && <AddHabitModal close={() => setOpen(false)} />}
    </Layout>
  )
}
