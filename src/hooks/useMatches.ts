'use client'
import { useState, useEffect, useRef } from 'react'
import type { Match, Formation } from '@/types'
import { storage } from '@/lib/storage'

function pad(n: number) { return String(n).padStart(2, '0') }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowStr() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    setMatches(storage.loadMatches())
  }, [])

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return }
    storage.saveMatches(matches)
  }, [matches])

  const createMatch = (formation: Formation = '3-3-1'): Match => {
    const m: Match = {
      id: crypto.randomUUID(),
      date: todayStr(),
      time: nowStr(),
      opponent: '',
      formation,
      created_at: new Date().toISOString(),
    }
    setMatches(prev => [...prev, m])
    return m
  }

  const updateMatch = (id: string, patch: Partial<Match>) =>
    setMatches(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)))

  const deleteMatch = (id: string) =>
    setMatches(prev => prev.filter(m => m.id !== id))

  return { matches, createMatch, updateMatch, deleteMatch }
}
