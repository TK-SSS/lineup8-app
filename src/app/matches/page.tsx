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
    <div className="flex items-stretch border-b border-violet-900/40 active:bg-violet-900/30 transition-colors">
      <button onClick={onSelect} className="flex-1 px-4 py-3 text-left flex items-center gap-3">
        {/* Date / time */}
        <div className="shrink-0 w-12 text-center">
          <div className="text-white font-black text-base leading-none">{formatDate(match.date)}</div>
          <div className="text-violet-500 text-[11px] mt-0.5">{match.time || '—'}</div>
        </div>

        {/* VS + formation */}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base leading-tight truncate ${match.opponent ? 'text-white' : 'text-violet-500 italic'}`}>
            VS {match.opponent || '未設定'}
          </div>
          <div className="text-violet-500 text-xs mt-0.5">{match.formation}</div>
        </div>

        {/* Score */}
        {hasScore ? (
          <div className="shrink-0 text-right">
            <div className="text-white font-black text-xl tabular-nums leading-none">
              {us}<span className="text-violet-500 text-sm mx-1">-</span>{opp}
            </div>
          </div>
        ) : (
          <div className="shrink-0 w-10" />
        )}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="px-3 flex items-center text-violet-800 active:text-red-400 active:bg-red-900/20 transition-colors"
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
  const { matches, createMatch, deleteMatch } = useMatches()

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
      <div className="bg-violet-600 px-4 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">試合リスト</h1>
        <button
          onClick={handleNew}
          className="bg-violet-500 hover:bg-violet-400 active:scale-95 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all"
        >
          ＋ 新規作成
        </button>
      </div>

      {sorted.length === 0 ? (
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
