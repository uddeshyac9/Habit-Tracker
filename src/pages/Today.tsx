"use client"

import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import Layout from "../components/Layout"
import { format } from "date-fns"
import { CheckCircle } from "lucide-react"
import type { Habit } from "./Dashboard"
import { doc, setDoc } from "firebase/firestore"

export default function Today() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkins, setCheckins] = useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = useState(true)

  const today = new Date().getDay()
  const todayKey = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const col = collection(db, "users", user.uid, "habits")
    const q = query(col, where("archived", "==", false), where("targetDays", "array-contains", today))

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
  }, [user, today])

  const toggleHabit = (habitId: string) => {
    if (!user) return

    const ref = doc(db, "users", user.uid, "habits", habitId, "checkins", todayKey)
    setDoc(ref, {
      completed: !checkins[habitId]?.[todayKey],
      ts: new Date(),
    })
  }

  // Calculate completion percentage
  const completedCount = habits.filter((h) => checkins[h.id]?.[todayKey]).length
  const totalCount = habits.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Today's Habits</h1>
        <p className="text-gray-600">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Daily Progress</h2>
          <span className="text-sm text-gray-500">
            {completedCount} of {totalCount} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-right mt-2 text-sm text-gray-500">{completionPercentage}% complete</p>
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
          <h3 className="text-xl font-semibold mb-2">No habits scheduled for today</h3>
          <p className="text-gray-600">Add a new habit or check back tomorrow</p>
        </div>
      )}

      {/* Habits list */}
      {!loading && habits.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <ul className="divide-y">
            {habits.map((habit) => {
              const isCompleted = checkins[habit.id]?.[todayKey]

              return (
                <li
                  key={habit.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isCompleted ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center ${
                        isCompleted ? "bg-green-600 text-white" : "border-2 border-gray-300"
                      }`}
                    >
                      {isCompleted && <CheckCircle size={16} />}
                    </button>
                    <span className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>
                      {habit.name}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isCompleted ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Mark Complete"}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Layout>
  )
}
