import type { Player, Match, LineupMap } from '@/types'

const KEYS = {
  players: 'lineup8-players',
  matches:  'lineup8-matches',
  lineups:  'lineup8-lineups',
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

function save(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  loadPlayers:  (): Player[]                          => load(KEYS.players, []),
  savePlayers:  (v: Player[])                         => save(KEYS.players, v),
  loadMatches:  (): Match[]                           => load(KEYS.matches, []),
  saveMatches:  (v: Match[])                          => save(KEYS.matches, v),
  loadLineups:  (): Record<string, LineupMap>         => load(KEYS.lineups, {}),
  saveLineups:  (v: Record<string, LineupMap>)        => save(KEYS.lineups, v),
}
