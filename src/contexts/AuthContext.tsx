import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from 'react'
  import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
  } from 'firebase/auth'
  import { auth } from '../firebase'
  
  type AuthCtx = {
    user: User | null
    login: (e: string, p: string) => Promise<void>
    register: (e: string, p: string) => Promise<void>
    logout: () => Promise<void>
  }
  
  const C = createContext<AuthCtx | null>(null)
  export const useAuth = () => useContext(C)!
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, u => {
        setUser(u)
        setLoading(false)
      })
      return unsub
    }, [])
  
    const value: AuthCtx = {
      user,
      login: (e, p) => signInWithEmailAndPassword(auth, e, p).then(),
      register: (e, p) => createUserWithEmailAndPassword(auth, e, p).then(),
      logout: () => signOut(auth),
    }
  
    if (loading) return <div className="h-screen w-screen grid place-content-center">Loading…</div>
    return <C.Provider value={value}>{children}</C.Provider>
  }
  