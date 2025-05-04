"use client"

import { type ReactNode, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Calendar, Home, Settings, LogOut, BarChart3, Menu, X } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Today", href: "/today", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed z-50 bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b">
            <h1 className="text-2xl font-bold text-blue-600">HabitVault</h1>
            <p className="text-sm text-gray-500 mt-1 truncate">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
