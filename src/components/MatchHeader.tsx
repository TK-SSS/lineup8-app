'use client'
import { useState } from 'react'
import type { Match, Formation } from '@/types'

const FORMATIONS: Formation[] = ['3-3-1', '2-3-2', '3-2-2', '2-4-1']

interface Props {
  match: Match
  onUpdate: (patch: Partial<Match>) => void
}

function ScoreControl({ value, onInc, onDec }: { value: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onDec} className="w-7 h-7 flex items-center justify-center text-violet-300/70 text-lg font-bold active:text-white transition-all">−</button>
      <span className="text-2xl font-black text-white w-8 text-center leading-none tabular-nums">{value}</span>
      <button onClick={onInc} className="w-7 h-7 flex items-center justify-center text-violet-200 text-base font-bold active:text-white transition-all">＋</button>
    </div>
  )
}

export default function MatchHeader({ match, onUpdate }: Props) {
  const [editingOpponent, setEditingOpponent] = useState(false)
  const [showFormationPicker, setShowFormationPicker] = useState(false)

  const us = match.scoreUs ?? 0
  const opp = match.scoreOpp ?? 0

  return (
    <div className="bg-violet-500 px-4 pt-1.5 pb-1.5 text-white">
      {/* Row 1: vs + opponent name */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-xs font-medium text-violet-300">vs</span>
        {editingOpponent ? (
          <input
            autoFocus
            className="bg-violet-600 text-white text-base font-bold text-center rounded px-2 py-0.5 w-36 outline-none border border-violet-300"
            value={match.opponent}
            placeholder="相手チーム名"
            onChange={e => onUpdate({ opponent: e.target.value })}
            onBlur={() => setEditingOpponent(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingOpponent(false) }}
          />
        ) : (
          <button className="text-base font-bold min-w-[80px] text-center" onClick={() => setEditingOpponent(true)}>
            {match.opponent || '相手チーム名'}
          </button>
        )}
      </div>

      {/* Row 2: score (horizontal) */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <ScoreControl value={us} onInc={() => onUpdate({ scoreUs: us + 1 })} onDec={() => onUpdate({ scoreUs: Math.max(0, us - 1) })} />
        <span className="text-xl font-black text-violet-300">—</span>
        <ScoreControl value={opp} onInc={() => onUpdate({ scoreOpp: opp + 1 })} onDec={() => onUpdate({ scoreOpp: Math.max(0, opp - 1) })} />
      </div>

      {/* Row 3: date / time / formation */}
      <div className="flex items-center justify-center gap-2 text-xs text-violet-100">
        <input
          type="date"
          className="bg-transparent text-violet-100 text-xs outline-none cursor-pointer border-b border-violet-300/50"
          value={match.date}
          onChange={e => onUpdate({ date: e.target.value })}
        />
        <input
          type="time"
          className="bg-transparent text-violet-100 text-xs outline-none cursor-pointer border-b border-violet-300/50 w-[60px]"
          value={match.time}
          onChange={e => onUpdate({ time: e.target.value })}
        />
        <div className="relative">
          <button className="flex items-center gap-1 font-semibold text-xs" onClick={() => setShowFormationPicker(p => !p)}>
            {match.formation}
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z" /></svg>
          </button>
          {showFormationPicker && (
            <div className="absolute right-0 top-full mt-1 bg-violet-700 border border-violet-500 rounded-lg shadow-xl z-50 overflow-hidden">
              {FORMATIONS.map(f => (
                <button
                  key={f}
                  className={`block w-full px-6 py-3 text-left text-sm hover:bg-violet-600 ${f === match.formation ? 'bg-violet-600 font-bold' : ''}`}
                  onClick={() => { onUpdate({ formation: f }); setShowFormationPicker(false) }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
