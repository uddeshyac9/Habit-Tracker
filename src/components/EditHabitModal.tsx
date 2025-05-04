"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import type { Habit } from "../pages/Dashboard"
import { X } from "lucide-react"
import clsx from "clsx"

export default function EditHabitModal({
  habit,
  close,
}: {
  habit: Habit
  close: () => void
}) {
  const { user } = useAuth()
  const [name, setName] = useState(habit.name)
  const [target, setTarget] = useState<number[]>(habit.targetDays)

  const toggleDay = (d: number) => setTarget((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const save = async () => {
    if (!name.trim() || !user) return

    const ref = doc(db, "users", user.uid, "habits", habit.id)
    await updateDoc(ref, {
      name,
      targetDays: target,
    })

    close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Habit</h2>
          <button onClick={close} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Drink 2L water"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Days</label>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                <button
                  key={idx}
                  className={clsx(
                    "w-10 h-10 rounded-full grid place-content-center border transition-colors",
                    target.includes(idx)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100",
                  )}
                  onClick={() => toggleDay(idx)}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={save}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
