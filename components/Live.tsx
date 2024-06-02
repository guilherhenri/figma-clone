import { useCallback, useEffect, useState } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { shortcuts } from '@/constants'
import useInterval from '@/hooks/useInterval'
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from '@/liveblocks.config'
import { CursorMode, CursorState, Reaction } from '@/types/type'

import { Comments } from './comments/Comments'
import { CursorChat } from './cursor/CursorChat'
import { LiveCursors } from './cursor/LiveCursors'
import { FlyingReaction } from './reaction/FlyingReaction'
import { ReactionSelector } from './reaction/ReactionButton'

interface LiveProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  undo: () => void
  redo: () => void
}

export function Live({ canvasRef, undo, redo }: LiveProps) {
  const [{ cursor }, updateMyPresence] = useMyPresence()

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  })
  const [reaction, setReaction] = useState<Reaction[]>([])

  const broadcast = useBroadcastEvent()

  useInterval(() => {
    setReaction((prevReactions) =>
      prevReactions.filter((r) => r.timestamp > Date.now() - 4000),
    )
  }, 1000)

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReaction((prevReactions) =>
        prevReactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ]),
      )

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      })
    }
  }, 100)

  useEventListener((eventData) => {
    const event = eventData.event

    setReaction((prevReactions) =>
      prevReactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ]),
    )
  })

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault()

    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y

      updateMyPresence({ cursor: { x, y } })
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden })

    updateMyPresence({ cursor: null, message: null })
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y

      updateMyPresence({ cursor: { x, y } })

      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state,
      )
    },
    [cursorState.mode, setCursorState],
  )

  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state,
    )
  }, [cursorState.mode, setCursorState])

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        })
      } else if (e.key === 'Escape') {
        updateMyPresence({ message: '' })
        setCursorState({ mode: CursorMode.Hidden })
      } else if (e.key === 'e') {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        })
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
      }
    }

    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [updateMyPresence])

  const setReactions = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    })
  }, [])

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        })
        break
      case 'Reactions':
        setCursorState({
          mode: CursorMode.ReactionSelector,
        })
        break
      case 'Undo':
        undo()
        break
      case 'Redo':
        redo()
        break
      default:
        break
    }
  }, [])

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative flex size-full flex-1 items-center justify-center"
      >
        <canvas ref={canvasRef} />

        {reaction.map((item) => (
          <FlyingReaction
            key={item.timestamp.toString()}
            x={item.point.x}
            y={item.point.y}
            timestamp={item.timestamp}
            value={item.value}
          />
        ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReactions} />
        )}

        <LiveCursors />

        <Comments />
      </ContextMenuTrigger>

      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            onClick={() => handleContextMenuClick(item.name)}
            className="right-menu-item"
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
