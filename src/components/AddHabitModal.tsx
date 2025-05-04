import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db, ts } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'

export default function AddHabitModal({ close }: { close: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [target, setTarget] = useState<number[]>([1,2,3,4,5,6,0]) // default everyday

  const toggleDay = (d: number) =>
    setTarget(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]))

  const save = async () => {
    if (!name.trim()) return
    await addDoc(collection(db, 'users', user!.uid, 'habits'), {
      name,
      targetDays: target,
      startDate: ts(),
      createdAt: ts(),
      archived: false,
    })
    close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-content-center">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-xl font-semibold mb-4">New Habit</h2>
        <input
          className="input"
          placeholder="e.g. Drink 2L water"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <p className="text-sm mb-2">Target Days</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {'SMTWTFS'.split('').map((d, idx) => (
            <button
              key={idx}
              className={clsx(
                'w-8 h-8 rounded-full grid place-content-center border',
                target.includes(idx) ? 'bg-blue-600 text-white' : '',
              )}
              onClick={() => toggleDay(idx)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-primary bg-gray-500 hover:bg-gray-600" onClick={close}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
