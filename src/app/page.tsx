'use client'
import { useState, useEffect } from 'react'
import type { Match } from '@/types'
import { useMatches } from '@/hooks/useMatches'
import { usePlayers } from '@/hooks/usePlayers'
import { useAllLineups } from '@/hooks/useAllLineups'
import LineupScreen from '@/components/LineupScreen'

export default function HomePage() {
  const { matches, isLoaded: matchesLoaded, createMatch, updateMatch } = useMatches()
  const { players } = usePlayers()
  const { getLineup, setPlayer, swapPositions, copyLineup, clearLineup } = useAllLineups()

  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [animKey, setAnimKey] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left')

  function navigate(newIndex: number, dir: 'left' | 'right') {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    setCurrentIndex(newIndex)
  }

  useEffect(() => {
    if (matches.length > 0 && currentIndex === -1) {
      const navTo = typeof window !== 'undefined' ? localStorage.getItem('lineup8-nav-to-match') : null
      if (navTo) {
        localStorage.removeItem('lineup8-nav-to-match')
        const idx = matches.findIndex(m => m.id === navTo)
        setCurrentIndex(idx >= 0 ? idx : matches.length - 1)
      } else {
        setCurrentIndex(matches.length - 1)
      }
    }
  }, [matches, currentIndex])

  function handleNewMatch() {
    const newMatch: Match = createMatch(matches[currentIndex]?.formation ?? '3-3-1')
    navigate(matches.length, 'left')
    void newMatch
  }

  if (!matchesLoaded) return (
    <div className="bg-violet-600 px-3 pt-1 pb-1" style={{ minHeight: 56 }} />
  )

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
        <div className="text-6xl">⚽</div>
        <h1 className="text-2xl font-bold text-white text-center">LineUp 8</h1>
        <p className="text-violet-300 text-center text-sm leading-relaxed">
          最初の試合を作成して<br />スタメンを管理しましょう
        </p>
        <button
          onClick={handleNewMatch}
          className="bg-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          ＋　試合を作成する
        </button>
        <p className="text-violet-600 text-xs text-center mt-2">
          選手管理タブから先に選手を登録することをおすすめします
        </p>
      </div>
    )
  }

  const match = matches[currentIndex]
  if (!match) return null

  const lineup = getLineup(match.id)

  // Resolve player display using snapshot so past lineups are unaffected by edits
  const resolvedPlayers = players.map(p => {
    const snap = match.playerSnapshot?.[p.id]
    return snap ? { ...p, ...snap } : p
  })

  function handleSetPlayer(playerId: string, toPos: string | null) {
    setPlayer(match.id, playerId, toPos)
    if (toPos === null) return
    const player = players.find(p => p.id === playerId)
    if (!player) return
    updateMatch(match.id, m => ({
      playerSnapshot: {
        ...(m.playerSnapshot ?? {}),
        [player.id]: { name: player.name, number: player.number },
      },
    }))
  }

  return (
    <div
      key={animKey}
      className={`min-h-full ${animKey > 0 ? (animDir === 'left' ? 'slide-from-right' : 'slide-from-left') : ''}`}
    >
      <LineupScreen
        match={match}
        lineup={lineup}
        players={resolvedPlayers}
        matchIndex={currentIndex}
        totalMatches={matches.length}
        onUpdateMatch={patch => updateMatch(match.id, patch)}
        onSetPlayer={handleSetPlayer}
        onSwapPositions={(p1, p2) => swapPositions(match.id, p1, p2)}
        onClear={() => clearLineup(match.id)}
        onPrev={() => navigate(Math.max(0, currentIndex - 1), 'right')}
        onNext={() => navigate(Math.min(matches.length - 1, currentIndex + 1), 'left')}
        onNew={handleNewMatch}
      />
    </div>
  )
}
