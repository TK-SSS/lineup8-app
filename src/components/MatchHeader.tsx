'use client'
import { useState } from 'react'
import type { Match, Formation } from '@/types'

const FORMATIONS: Formation[] = ['3-3-1', '2-3-2', '3-2-2', '2-4-1']

interface Props {
  match: Match
  onUpdate: (patch: Partial<Match>) => void
}

function ScoreBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center text-violet-200 text-xl font-bold active:text-white active:scale-110 transition-all"
    >
      {label}
    </button>
  )
}

export default function MatchHeader({ match, onUpdate }: Props) {
  const [editingOpponent, setEditingOpponent] = useState(false)
  const [showFormationPicker, setShowFormationPicker] = useState(false)

  const us = match.scoreUs ?? 0
  const opp = match.scoreOpp ?? 0

  return (
    <div className="bg-violet-600 px-3 pt-1 pb-1 text-white">
      {/* Row 1: score + opponent + formation all in one line */}
      <div className="flex items-center justify-between gap-1">
        {/* Our score */}
        <div className="flex flex-col items-center gap-0">
          <span className="text-[9px] text-violet-200 leading-none">自チーム</span>
          <div className="flex items-center gap-0.5">
            <ScoreBtn label="−" onClick={() => onUpdate({ scoreUs: Math.max(0, us - 1) })} />
            <span className="text-2xl font-black w-8 text-center tabular-nums leading-none">{us}</span>
            <ScoreBtn label="＋" onClick={() => onUpdate({ scoreUs: us + 1 })} />
          </div>
        </div>

        {/* Center: vs + opponent */}
        <div className="flex-1 flex flex-col items-center min-w-0 px-1">
          <span className="text-[10px] text-violet-300 leading-none mb-0.5">vs</span>
          {editingOpponent ? (
            <input
              autoFocus
              className="bg-violet-600 text-white text-sm font-bold text-center rounded px-2 py-0.5 w-full outline-none border border-violet-300"
              value={match.opponent}
              placeholder="相手チーム名"
              onChange={e => onUpdate({ opponent: e.target.value })}
              onBlur={() => setEditingOpponent(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditingOpponent(false) }}
            />
          ) : (
            <button
              className="text-sm font-bold truncate max-w-full text-center leading-tight"
              onClick={() => setEditingOpponent(true)}
            >
              {match.opponent || '相手チーム名'}
            </button>
          )}
        </div>

        {/* Opponent score */}
        <div className="flex flex-col items-center gap-0">
          <span className="text-[9px] text-violet-200 leading-none">相手チーム</span>
          <div className="flex items-center gap-0.5">
            <ScoreBtn label="−" onClick={() => onUpdate({ scoreOpp: Math.max(0, opp - 1) })} />
            <span className="text-2xl font-black w-8 text-center tabular-nums leading-none">{opp}</span>
            <ScoreBtn label="＋" onClick={() => onUpdate({ scoreOpp: opp + 1 })} />
          </div>
        </div>
      </div>

      {/* Row 2: date / time / formation */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-violet-200 mt-0.5">
        <input
          type="date"
          className="bg-transparent text-violet-200 text-[10px] outline-none cursor-pointer"
          value={match.date}
          onChange={e => onUpdate({ date: e.target.value })}
        />
        <input
          type="time"
          className="bg-transparent text-violet-200 text-[10px] outline-none cursor-pointer w-[52px]"
          value={match.time}
          onChange={e => onUpdate({ time: e.target.value })}
        />
        <div className="relative">
          <button
            className="flex items-center gap-0.5 font-semibold"
            onClick={() => setShowFormationPicker(p => !p)}
          >
            {match.formation}
            <svg className="w-2 h-2" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z" /></svg>
          </button>
          {showFormationPicker && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-violet-700 border border-violet-500 rounded-lg shadow-xl z-50 overflow-hidden">
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
