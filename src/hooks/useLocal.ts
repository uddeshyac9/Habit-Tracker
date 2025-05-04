// src/hooks/useLocal.ts
import { useState } from 'react'

export const useLocal = (key: string, init: string) => {
  const [val, setVal] = useState(() => localStorage.getItem(key) || init)
  const update = (v: string) => {
    setVal(v)
    localStorage.setItem(key, v)
  }
  return [val, update] as const
}
