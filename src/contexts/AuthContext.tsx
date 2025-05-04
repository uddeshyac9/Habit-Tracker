// @refresh reload
"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import {
  User,
  UserCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { auth } from "../firebase"

type AuthCtx = {
  user: User | null
  login: (email: string, password: string) => Promise<UserCredential>
  register: (email: string, password: string) => Promise<UserCredential>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // Now correctly typed to return UserCredential
  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
