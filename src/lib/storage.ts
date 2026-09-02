import type { Player, Match, LineupMap } from '@/types'

type AllData = { players: Player[]; matches: Match[]; lineups: Record<string, LineupMap> }

// Module-level cache so 3 hooks share a single in-flight request
let _pending: Promise<AllData> | null = null

function loadAll(): Promise<AllData> {
  if (!_pending) {
    _pending = fetch('/api/data')
      .then(r => r.json())
      .catch(() => ({ players: [], matches: [], lineups: {} }))
      .finally(() => { _pending = null })
  }
  return _pending
}

function post(body: Partial<AllData>): void {
  fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export const storage = {
  loadPlayers:  (): Promise<Player[]>                          => loadAll().then(d => d.players),
  loadMatches:  (): Promise<Match[]>                           => loadAll().then(d => d.matches),
  loadLineups:  (): Promise<Record<string, LineupMap>>         => loadAll().then(d => d.lineups),
  savePlayers:  (v: Player[])                                  => post({ players: v }),
  saveMatches:  (v: Match[])                                   => post({ matches: v }),
  saveLineups:  (v: Record<string, LineupMap>)                 => post({ lineups: v }),
}
