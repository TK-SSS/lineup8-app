'use client'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { Match, Player, LineupMap, Substitution } from '@/types'
import { FORMATIONS } from '@/lib/formations'
import MatchHeader from './MatchHeader'
import CourtDisplay from './CourtDisplay'
import BenchArea from './BenchArea'
import PlayerToken from './PlayerToken'

interface Props {
  match: Match
  lineup: LineupMap
  players: Player[]
  matchIndex: number
  totalMatches: number
  onUpdateMatch: (patch: Partial<Match>) => void
  onSetPlayer: (playerId: string, toPos: string | null) => void
  onSwapPositions: (pos1: string, pos2: string) => void
  onClear: () => void
  onPrev: () => void
  onNext: () => void
  onNew: () => void
  onOpenHistory: () => void
}

export default function LineupScreen({
  match,
  lineup,
  players,
  matchIndex,
  totalMatches,
  onUpdateMatch,
  onSetPlayer,
  onSwapPositions,
  onClear,
  onPrev,
  onNext,
  onNew,
  onOpenHistory,
}: Props) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)
  const [pendingSub, setPendingSub] = useState<{ benchPlayerId: string; targetPos: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const positions = FORMATIONS[match.formation]
  const courtPlayerIds = new Set(
    positions.map(pos => lineup[pos.key]).filter((id): id is string => !!id)
  )
  const benchPlayers = players.filter(p => !courtPlayerIds.has(p.id)).sort((a, b) => a.number - b.number)
  const activePlayer = activePlayerId ? players.find(p => p.id === activePlayerId) : null
  const activePosKey = Object.entries(lineup).find(([, pid]) => pid === activePlayerId)?.[0]

  const substitutions = match.substitutions ?? []
  const subInMap = new Map<string, number>()
  const subOutMap = new Map<string, number>()
  for (const sub of substitutions) {
    const outPlayer = players.find(p => p.id === sub.outId)
    const inPlayer = players.find(p => p.id === sub.inId)
    if (outPlayer && inPlayer) {
      subInMap.set(sub.inId, outPlayer.number)
      subOutMap.set(sub.outId, inPlayer.number)
    }
  }

  function handleDragStart(e: DragStartEvent) {
    setActivePlayerId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActivePlayerId(null)
    const { active, over } = e
    if (!over) return

    const playerId = active.id as string
    const sourcePos = (active.data.current?.position as string) ?? null
    const destId = over.id as string

    if (destId === 'bench') {
      if (sourcePos && !match.started) onSetPlayer(playerId, null)
    } else {
      const existingId = lineup[destId]
      if (!sourcePos && existingId && match.started) {
        setPendingSub({ benchPlayerId: playerId, targetPos: destId })
      } else if (sourcePos && existingId && existingId !== playerId) {
        onSwapPositions(sourcePos, destId)
      } else {
        onSetPlayer(playerId, destId)
      }
    }
  }

  function confirmSub() {
    if (!pendingSub) return
    const { benchPlayerId, targetPos } = pendingSub
    const outPlayerId = lineup[targetPos]
    onSetPlayer(benchPlayerId, targetPos)
    if (outPlayerId) {
      const newSubs: Substitution[] = [...substitutions, { outId: outPlayerId, inId: benchPlayerId, position: targetPos }]
      onUpdateMatch({ substitutions: newSubs })
    }
    setPendingSub(null)
  }

  const pendingOutPlayer = pendingSub ? players.find(p => p.id === lineup[pendingSub.targetPos]) : null
  const pendingInPlayer = pendingSub ? players.find(p => p.id === pendingSub.benchPlayerId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <MatchHeader match={match} onUpdate={onUpdateMatch} />

      {/* Navigation row */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <button
          onClick={onPrev}
          disabled={matchIndex === 0}
          className="w-9 h-9 flex items-center justify-center rounded-full text-violet-400 disabled:opacity-20 active:bg-violet-900/40 text-xl"
        >
          ‹
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full active:bg-violet-900/40"
        >
          {Array.from({ length: Math.min(totalMatches, 7) }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === Math.min(matchIndex, 6) ? 'w-4 h-2 bg-violet-400' : 'w-2 h-2 bg-violet-700'
              }`}
            />
          ))}
          {totalMatches > 7 && <span className="text-violet-500 text-xs ml-1">…</span>}
        </button>

        <button
          onClick={onNext}
          disabled={matchIndex === totalMatches - 1}
          className="w-9 h-9 flex items-center justify-center rounded-full text-violet-400 disabled:opacity-20 active:bg-violet-900/40 text-xl"
        >
          ›
        </button>

        <button
          onClick={onNew}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-500 text-white text-xl font-bold shadow active:scale-95 active:bg-violet-400 transition-all"
        >
          +
        </button>
      </div>

      <CourtDisplay positions={positions} lineup={lineup} players={players} subInMap={subInMap} />
      <BenchArea players={benchPlayers} subOutMap={subOutMap} />

      {/* Bottom action row */}
      <div className="px-3 pb-2 flex gap-2">
        {!match.started ? (
          <button
            onClick={() => onUpdateMatch({ started: true })}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-violet-500 active:bg-violet-400 transition-all active:scale-95 shadow"
          >
            途中交代
          </button>
        ) : (
          <button
            onClick={() => onUpdateMatch({ started: false })}
            className="flex-1 py-2.5 rounded-xl text-sm text-amber-400 bg-amber-900/30 text-center font-semibold active:bg-amber-900/50 transition-all"
          >
            途中交代中{substitutions.length > 0 ? `　${substitutions.length}回` : ''}　✕
          </button>
        )}
        <button
          onClick={() => { onClear(); onUpdateMatch({ substitutions: [], started: false }) }}
          className="py-2 px-4 rounded-xl font-bold text-sm text-violet-500 bg-violet-900/40 active:bg-violet-800/60 transition-all active:scale-95"
        >
          クリア
        </button>
      </div>

      {/* Substitution confirmation modal */}
      {pendingSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center pb-12">
          <div className="bg-violet-950 border border-violet-600 rounded-2xl p-5 mx-4 w-full max-w-sm">
            <p className="text-white font-bold text-center text-base mb-4">途中交代</p>
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-violet-700 border-2 border-violet-400 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white leading-none">{pendingOutPlayer?.number}</span>
                  <span className="text-[10px] text-violet-200 leading-tight">{pendingOutPlayer?.name}</span>
                </div>
                <span className="text-xs text-violet-400 font-semibold">OUT</span>
              </div>
              <span className="text-violet-400 text-2xl mb-4">→</span>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-400 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white leading-none">{pendingInPlayer?.number}</span>
                  <span className="text-[10px] text-amber-100 leading-tight">{pendingInPlayer?.name}</span>
                </div>
                <span className="text-xs text-amber-400 font-semibold">IN</span>
              </div>
            </div>
            <button
              onClick={confirmSub}
              className="w-full py-3 bg-violet-500 text-white font-bold rounded-xl mb-2 active:scale-95 transition-all"
            >
              途中交代
            </button>
            <button
              onClick={() => setPendingSub(null)}
              className="w-full py-2 text-violet-400 text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <DragOverlay dropAnimation={null}>
        {activePlayer && (
          <div className="opacity-90 scale-110 pointer-events-none">
            <PlayerToken player={activePlayer} position={activePosKey} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
