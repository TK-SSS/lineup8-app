'use client'
import { useState, useEffect, useRef } from 'react'
import type { LineupMap } from '@/types'
import { storage } from '@/lib/storage'

export function useAllLineups() {
  const [all, setAll] = useState<Record<string, LineupMap>>({})
  const initialized = useRef(false)

  useEffect(() => {
    storage.loadLineups().then(setAll)
  }, [])

  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return }
    storage.saveLineups(all)
  }, [all])

  const getLineup = (matchId: string): LineupMap => all[matchId] ?? {}

  const setPlayer = (matchId: string, playerId: string, toPos: string | null) =>
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      for (const k of Object.keys(cur)) {
        if (cur[k] === playerId) delete cur[k]
      }
      if (toPos !== null) cur[toPos] = playerId
      return { ...prev, [matchId]: cur }
    })

  const clearPosition = (matchId: string, pos: string) =>
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      delete cur[pos]
      return { ...prev, [matchId]: cur }
    })

  const swapPositions = (matchId: string, pos1: string, pos2: string) =>
    setAll(prev => {
      const cur = { ...(prev[matchId] ?? {}) }
      const p1 = cur[pos1]
      const p2 = cur[pos2]
      if (p1) cur[pos2] = p1; else delete cur[pos2]
      if (p2) cur[pos1] = p2; else delete cur[pos1]
      return { ...prev, [matchId]: cur }
    })

  const copyLineup = (fromMatchId: string, toMatchId: string) =>
    setAll(prev => ({
      ...prev,
      [toMatchId]: { ...(prev[fromMatchId] ?? {}) },
    }))

  const clearLineup = (matchId: string) =>
    setAll(prev => ({ ...prev, [matchId]: {} }))

  return { getLineup, setPlayer, clearPosition, swapPositions, copyLineup, clearLineup }
}
