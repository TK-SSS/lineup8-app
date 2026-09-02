'use client'
import { useRouter } from 'next/navigation'
import { useMatches } from '@/hooks/useMatches'
import type { Match } from '@/types'

function formatDate(date: string) {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${m}/${d}`
}

function MatchRow({
  match,
  onSelect,
  onDelete,
}: {
  match: Match
  onSelect: () => void
  onDelete: () => void
}) {
  const hasScore = match.scoreUs != null || match.scoreOpp != null
  const us = match.scoreUs ?? 0
  const opp = match.scoreOpp ?? 0

  return (
    <div className="flex items-center border-b border-violet-900/40 active:bg-violet-900/30 transition-colors">
      <button onClick={onSelect} className="flex-1 px-3 py-3 text-left flex items-center gap-3 min-w-0">
        <span className="text-violet-300 font-black text-base w-10 shrink-0">{formatDate(match.date)}</span>
        <span className="text-violet-500 text-sm w-10 shrink-0">{match.time || '—'}</span>
        <span className={`text-base font-bold w-28 shrink-0 truncate ${match.opponent ? 'text-white' : 'text-violet-700 italic'}`}>
          {match.opponent || '未設定'}
        </span>
        <span className="text-violet-500 text-sm w-10 shrink-0">{match.formation}</span>
        <span className="w-12 shrink-0">
          {hasScore && (
            <span className="bg-violet-700 text-white font-black text-base px-2 py-0.5 rounded-lg tabular-nums">
              {us}-{opp}
            </span>
          )}
        </span>
      </button>

      <button
        onClick={onDelete}
        className="px-3 py-3 flex items-center text-violet-800 active:text-red-400 active:bg-red-900/20 transition-colors shrink-0"
        aria-label="削除"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  )
}

export default function MatchesPage() {
  const router = useRouter()
  const { matches, isLoaded, createMatch, deleteMatch } = useMatches()

  const sorted = [...matches].reverse()

  function handleSelect(id: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lineup8-nav-to-match', id)
    }
    router.push('/')
  }

  function handleNew() {
    const prev = matches[matches.length - 1]
    const m = createMatch(prev?.formation ?? '3-3-1')
    if (typeof window !== 'undefined') {
      localStorage.setItem('lineup8-nav-to-match', m.id)
    }
    router.push('/')
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="bg-violet-600 px-4 py-4 flex items-center">
        <h1 className="flex-1 text-white font-bold text-xl text-center">試合リスト</h1>
        <button
          onClick={handleNew}
          className="bg-violet-500 hover:bg-violet-400 active:scale-95 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shrink-0"
        >
          ＋ 新規作成
        </button>
      </div>

      {!isLoaded ? (
        <div className="flex-1" />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl">📋</div>
          <p className="text-violet-400 text-sm text-center">
            試合がまだありません<br />
            新規作成から始めましょう
          </p>
        </div>
      ) : (
        <div>
          {sorted.map(m => (
            <MatchRow
              key={m.id}
              match={m}
              onSelect={() => handleSelect(m.id)}
              onDelete={() => {
                if (confirm(`${m.date} VS ${m.opponent || '（未設定）'} を削除しますか？`)) {
                  deleteMatch(m.id)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
