import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import AddHabitModal from '../components/AddHabitModal'
import HabitCard from '../components/HabitCard'

export type Habit = {
  id: string
  name: string
  targetDays: number[]
  startDate: Date
  archived: boolean
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const col = collection(db, 'users', user!.uid, 'habits')
    const q = query(col, orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap =>
      setHabits(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Habit, 'id' | 'startDate'>),
          startDate: d.data().startDate.toDate(),
        })),
      ),
    )
    return unsub
  }, [user])

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Hi, {user?.email}</h1>
        <div className="space-x-2">
          <button className="btn-primary" onClick={() => setOpen(true)}>+ Add Habit</button>
          <button className="btn-primary bg-gray-500 hover:bg-gray-600" onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map(h => (
          <HabitCard key={h.id} habit={h} />
        ))}
      </section>

      {open && <AddHabitModal close={() => setOpen(false)} />}
    </div>
  )
}
