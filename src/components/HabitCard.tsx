"use client"

import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import type { Habit } from "../pages/Dashboard"
import { getCurrentStreak, getLongestStreak } from "../utils/streak"
import Heatmap from "./Heatmap"
import { format } from "date-fns"
import { CheckCircle, XCircle, Edit2, Trash2, MoreVertical, Archive, Flame, Trophy } from "lucide-react"
import EditHabitModal from "./EditHabitModal"

export default function HabitCard({
  habit,
  checkins,
}: {
  habit: Habit
  checkins: Record<string, boolean>
}) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const todayKey = new Date().toISOString().slice(0, 10)

  const currentStreak = getCurrentStreak(checkins)
  const longestStreak = getLongestStreak(checkins)

  // Check if today is a target day
  const today = new Date().getDay()
  const isTargetDay = habit.targetDays.includes(today)

  const toggleToday = () => {
    if (!user) return

    const ref = doc(db, "users", user.uid, "habits", habit.id, "checkins", todayKey)
    setDoc(ref, { completed: !checkins[todayKey], ts: new Date() })
  }

  const archiveHabit = async () => {
    if (!user) return

    const ref = doc(db, "users", user.uid, "habits", habit.id)
    await updateDoc(ref, { archived: !habit.archived })
    setMenuOpen(false)
  }

  const deleteHabit = async () => {
    if (!user || !window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) return

    await deleteDoc(doc(db, "users", user.uid, "habits", habit.id))
  }

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setEditModalOpen(true)
                      setMenuOpen(false)
                    }}
                  >
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={archiveHabit}
                  >
                    <Archive size={16} className="mr-2" />
                    {habit.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={deleteHabit}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-3">Started {format(habit.startDate, "MMM d, yyyy")}</span>
          <span className="flex items-center">
            {isTargetDay ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Today
              </span>
            ) : (
              <span className="text-gray-400 flex items-center">
                <XCircle size={14} className="mr-1" />
                Not today
              </span>
            )}
          </span>
        </div>

        <button
          className={`w-full py-2.5 rounded-lg font-medium transition-all transform active:scale-95 ${
            checkins[todayKey]
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          }`}
          onClick={toggleToday}
        >
          {checkins[todayKey] ? "✓ Completed today" : "Mark complete"}
        </button>

        <div className="flex justify-between mt-4 mb-2">
          <div className="flex items-center">
            <div className="bg-orange-100 p-1.5 rounded-md mr-2">
              <Flame size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-semibold">{currentStreak} days</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-purple-100 p-1.5 rounded-md mr-2">
              <Trophy size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Best</p>
              <p className="font-semibold">{longestStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <Heatmap checkins={checkins} />
      </div>

      {editModalOpen && <EditHabitModal habit={habit} close={() => setEditModalOpen(false)} />}
    </article>
  )
}
