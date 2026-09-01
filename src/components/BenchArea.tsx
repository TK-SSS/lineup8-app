'use client'
import { useDroppable } from '@dnd-kit/core'
import type { Player } from '@/types'
import PlayerToken from './PlayerToken'

interface Props {
  players: Player[]
  subOutMap?: Map<string, number>
}

export default function BenchArea({ players, subOutMap }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench' })

  return (
    <div className="px-3 py-2">
      <div className="text-sm font-semibold text-violet-300 mb-1.5 uppercase tracking-wider">
        ベンチ ({players.length}人)
      </div>
      <div
        ref={setNodeRef}
        className={`rounded-xl border-2 border-dashed transition-all ${
          isOver
            ? 'border-violet-400 bg-violet-500/20'
            : 'border-violet-400/60 bg-violet-400/10'
        }`}
      >
        {players.length === 0 ? (
          <div className="py-3 text-violet-500 text-xs text-center">
            選手をドラッグしてベンチへ
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-2">
            {players.map(p => (
              <PlayerToken key={p.id} player={p} subToNum={subOutMap?.get(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
