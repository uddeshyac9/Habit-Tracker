"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import SignIn from "./pages/SignIn"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Today from "./pages/Today"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/today"
            element={
              <Protected>
                <Today />
              </Protected>
            }
          />
          <Route
            path="/analytics"
            element={
              <Protected>
                <Analytics />
              </Protected>
            }
          />
          <Route
            path="/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
