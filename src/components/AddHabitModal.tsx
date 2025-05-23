"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db, ts } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import clsx from "clsx"
import { X } from "lucide-react"

export default function AddHabitModal({ close }: { close: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [target, setTarget] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]) // default everyday
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleDay = (d: number) => setTarget((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const save = async () => {
    if (!name.trim() || !user || isSubmitting) return

    try {
      setIsSubmitting(true)
      await addDoc(collection(db, "users", user.uid, "habits"), {
        name,
        targetDays: target,
        startDate: ts(),
        createdAt: ts(),
        archived: false,
      })
      close()
    } catch (error) {
      console.error("Error adding habit:", error)
      alert("Failed to add habit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold">New Habit</h2>
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

            <div className="flex gap-2 mt-3">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setTarget([1, 2, 3, 4, 5])}
                type="button"
              >
                Weekdays
              </button>
              <button className="text-sm text-blue-600 hover:underline" onClick={() => setTarget([0, 6])} type="button">
                Weekends
              </button>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setTarget([0, 1, 2, 3, 4, 5, 6])}
                type="button"
              >
                Every day
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              onClick={save}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
