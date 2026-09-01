'use client'
import { useState, useEffect, useRef } from 'react'
import type { Player } from '@/types'
import { storage } from '@/lib/storage'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    setPlayers(storage.loadPlayers())
  }, [])

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return }
    storage.savePlayers(players)
  }, [players])

  const addPlayer = (number: number, name: string) =>
    setPlayers(prev => [
      ...prev,
      { id: crypto.randomUUID(), number, name },
    ])

  const updatePlayer = (id: string, patch: Partial<Omit<Player, 'id'>>) =>
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))

  const deletePlayer = (id: string) =>
    setPlayers(prev => prev.filter(p => p.id !== id))

  return { players, addPlayer, updatePlayer, deletePlayer }
}
