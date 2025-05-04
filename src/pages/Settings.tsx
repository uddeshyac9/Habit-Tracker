"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import Layout from "../components/Layout"
import { Save, Moon, Sun, Bell } from "lucide-react"

type UserSettings = {
  reminderTime: string
  reminderEnabled: boolean
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
}

const defaultSettings: UserSettings = {
  reminderTime: "20:00",
  reminderEnabled: false,
  weekStartsOn: 0,
}

export default function Settings() {
  const { user } = useAuth()
  const { darkMode, setDarkMode } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return

      try {
        setLoading(true)
        const docRef = doc(db, "users", user.uid, "settings", "preferences")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings)
        } else {
          // Initialize with defaults if no settings exist
          await setDoc(docRef, defaultSettings)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user])

  const saveSettings = async () => {
    if (!user) return

    try {
      setSaving(true)
      const docRef = doc(db, "users", user.uid, "settings", "preferences")
      await setDoc(docRef, settings)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleDarkModeToggle = (isDark: boolean) => {
    setDarkMode(isDark)
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-black mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-black-400">Customize your habit tracking experience</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-g-800 rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold ">Preferences</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? (
                  <Moon className="mr-3 text-blue-600 dark:text-blue-400" size={20} />
                ) : (
                  <Sun className="mr-3 text-blue-600 dark:text-blue-400 " size={20} />
                )}
                <div>
                  <h3 className="font-medium ">Dark Mode</h3>
                  <p className="text-sm text-gray-500 ">Switch between light and dark themes</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={(e) => handleDarkModeToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Reminder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-3 text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <h3 className="font-medium ">Daily Reminder</h3>
                  <p className="text-sm text-gray-500 ">Get notified to check in on your habits</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.reminderEnabled}
                  onChange={(e) => handleChange("reminderEnabled", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Reminder Time */}
            {settings.reminderEnabled && (
              <div className="ml-8">
                <label className="block text-sm font-medium  mb-1">Reminder Time</label>
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  "
                  value={settings.reminderTime}
                  onChange={(e) => handleChange("reminderTime", e.target.value)}
                />
              </div>
            )}

            {/* Week Start */}
            <div>
              <h3 className="font-medium mb-2 ">Week Starts On</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    settings.weekStartsOn === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => handleChange("weekStartsOn", 0)}
                >
                  Sunday
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    settings.weekStartsOn === 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => handleChange("weekStartsOn", 1)}
                >
                  Monday
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t dark:border-gray-700 bg-gray-50  flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-green-600 dark:text-green-400 text-sm">Settings saved successfully!</span>
              )}
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={saveSettings}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
