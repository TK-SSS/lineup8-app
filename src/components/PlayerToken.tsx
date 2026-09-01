'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Player } from '@/types'

interface Props {
  player: Player
  position?: string   // undefined = from bench
  isOver?: boolean
  subFromNum?: number  // on court: subbed in for #N
  subToNum?: number    // on bench: was subbed out for #N
}

export default function PlayerToken({ player, position, isOver, subFromNum, subToNum }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { position },
  })

  const style = { transform: CSS.Translate.toString(transform) }
  const isBench = !position

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`select-none touch-none transition-all ${isDragging ? 'opacity-30 scale-95' : ''} ${isOver ? 'scale-110' : ''}`}
    >
      {isBench ? (
        /* Bench: pill */
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 border shadow-md ${
          subToNum !== undefined
            ? 'bg-violet-900/60 border-violet-600/60'
            : 'bg-violet-500 border-violet-300/60'
        }`}>
          <span className={`text-sm font-black w-5 text-center ${subToNum !== undefined ? 'text-violet-400' : 'text-white'}`}>{player.number}</span>
          <span className={`text-sm font-semibold max-w-[64px] truncate ${subToNum !== undefined ? 'text-violet-400' : 'text-white'}`}>{player.name}</span>
          {subToNum !== undefined && (
            <span className="text-amber-400 text-xs font-bold">→{subToNum}</span>
          )}
        </div>
      ) : (
        /* Court: circle */
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full border-2 shadow-lg flex flex-col items-center justify-center ${
            subFromNum !== undefined
              ? 'bg-emerald-600 border-emerald-300/80'
              : 'bg-violet-500 border-violet-300/70'
          }`}>
            <span className="text-xl font-black leading-none text-white">{player.number}</span>
            <span className="text-xs font-bold leading-tight text-white max-w-[58px] truncate text-center">
              {player.name}
            </span>
          </div>
          {subFromNum !== undefined && (
            <span className="mt-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px leading-none">
              替#{subFromNum}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
