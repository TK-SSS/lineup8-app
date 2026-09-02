'use client'
import { useState, useEffect, useRef } from 'react'
import type { Match } from '@/types'
import { useMatches } from '@/hooks/useMatches'
import { usePlayers } from '@/hooks/usePlayers'
import { useAllLineups } from '@/hooks/useAllLineups'
import LineupScreen from '@/components/LineupScreen'

function MatchHistory({
  matches,
  currentId,
  onSelect,
  onClose,
}: {
  matches: Match[]
  currentId: string
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const items = [...matches].map((m, i) => ({ m, i })).reverse()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-700 bg-violet-600">
        <h2 className="text-white font-bold text-lg">試合履歴</h2>
        <button onClick={onClose} className="text-white text-2xl w-9 h-9 flex items-center justify-center">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 && (
          <p className="text-violet-500 text-center py-12">試合がありません</p>
        )}
        {items.map(({ m, i }) => (
          <button
            key={m.id}
            onClick={() => { onSelect(i); onClose() }}
            className={`w-full px-4 py-4 text-left border-b border-violet-900/60 flex items-center justify-between active:bg-violet-900/40 ${
              m.id === currentId ? 'bg-violet-900/50' : ''
            }`}
          >
            <div>
              <div className="text-white font-bold text-base">
                {m.date}　{m.time}
              </div>
              <div className="text-violet-300 text-sm mt-0.5">
                VS {m.opponent || '（未設定）'}　／　{m.formation}
              </div>
            </div>
            {m.id === currentId && (
              <span className="text-violet-400 text-xs font-semibold border border-violet-600 rounded-full px-2 py-0.5 shrink-0">
                表示中
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { matches, isLoaded: matchesLoaded, createMatch, updateMatch } = useMatches()
  const { players } = usePlayers()
  const { getLineup, setPlayer, swapPositions, copyLineup, clearLineup } = useAllLineups()

  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [historyOpen, setHistoryOpen] = useState(false)

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

  // Swipe detection (still works alongside buttons)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0)
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0) handleNewMatch()
    else if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }

  function handleNewMatch() {
    const prev = matches[currentIndex]
    const newMatch: Match = createMatch(prev?.formation ?? '3-3-1')
    if (prev) copyLineup(prev.id, newMatch.id)
    setCurrentIndex(matches.length)
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
    <>
      {historyOpen && (
        <MatchHistory
          matches={matches}
          currentId={match.id}
          onSelect={setCurrentIndex}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      <div
        className="min-h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
          onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex(i => Math.min(matches.length - 1, i + 1))}
          onNew={handleNewMatch}
          onOpenHistory={() => setHistoryOpen(true)}
        />
      </div>
    </>
  )
}
