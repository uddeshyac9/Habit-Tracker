"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Mail, Lock, UserPlus, Moon, Sun } from "lucide-react"

export default function Register() {
  const { register } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr("")
    setLoading(true)

    try {
      await register(email, pwd)
      nav("/")
    } catch (error: any) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-4">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">HabitVault</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account</p>
        </div>

        <form onSubmit={handle} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 6 characters</p>
            </div>

            {err && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
