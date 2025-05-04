import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    deleteDoc,
  } from 'firebase/firestore'
  import { useEffect, useState } from 'react'
  import { db } from '../firebase'
  import { useAuth } from '../contexts/AuthContext'
  import { Habit } from '../pages/Dashboard'
  import { CheckinsMap, getCurrentStreak, getLongestStreak } from '../utils/streak'
  import Heatmap from './Heatmap'
  import { format } from 'date-fns'
  
  export default function HabitCard({ habit }: { habit: Habit }) {
    const { user } = useAuth()
    const [checkins, setCheckins] = useState<CheckinsMap>({})
    const todayKey = new Date().toISOString().slice(0, 10)
  
    useEffect(() => {
      const col = collection(db, 'users', user!.uid, 'habits', habit.id, 'checkins')
      const unsub = onSnapshot(col, snap => {
        const map: CheckinsMap = {}
        snap.docs.forEach(d => (map[d.id] = d.data().completed))
        setCheckins(map)
      })
      return unsub
    }, [user, habit.id])
  
    const toggleToday = () => {
      const ref = doc(
        db,
        'users',
        user!.uid,
        'habits',
        habit.id,
        'checkins',
        todayKey,
      )
      setDoc(ref, { completed: !checkins[todayKey], ts: new Date() })
    }
  
    const remove = async () => {
      if (confirm('Delete habit?')) {
        await deleteDoc(doc(db, 'users', user!.uid, 'habits', habit.id))
      }
    }
  
    const currentStreak = getCurrentStreak(checkins)
    const longestStreak = getLongestStreak(checkins)
  
    return (
      <article className="bg-white p-4 rounded-xl shadow relative">
        <h3 className="text-lg font-medium mb-1">{habit.name}</h3>
        <p className="text-xs text-gray-500 mb-2">
          Started {format(habit.startDate, 'PPP')}
        </p>
  
        <button
          className={`w-full py-1 rounded
            ${checkins[todayKey] ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={toggleToday}
        >
          {checkins[todayKey] ? '✓ Completed today' : 'Mark complete'}
        </button>
  
        <div className="flex justify-between text-sm mt-2">
          <span>🔥 {currentStreak}</span>
          <span>🏆 {longestStreak}</span>
          <button onClick={remove} className="text-red-500">Delete</button>
        </div>
  
        <Heatmap checkins={checkins} />
      </article>
    )
  }
  