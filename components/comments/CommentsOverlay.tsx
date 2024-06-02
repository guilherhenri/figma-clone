'use client'

import { ThreadData } from '@liveblocks/client'
import { useCallback, useRef } from 'react'

import { useMaxZIndex } from '@/lib/useMaxZIndex'
import {
  ThreadMetadata,
  useEditThreadMetadata,
  useThreads,
} from '@/liveblocks.config'

import { PinnedThread } from './PinnedThread'

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>
  maxZIndex: number
}

export const CommentsOverlay = () => {
  /**
   * We're using the useThreads hook to get the list of threads
   * in the room.
   *
   * useThreads: https://liveblocks.io/docs/api-reference/liveblocks-react#useThreads
   */
  const { threads } = useThreads()

  // get the max z-index of a thread
  const maxZIndex = useMaxZIndex()

  return (
    <div>
      {threads
        .filter((thread) => !thread.metadata.resolved)
        .map((thread) => (
          <OverlayThread
            key={thread.id}
            thread={thread}
            maxZIndex={maxZIndex}
          />
        ))}
    </div>
  )
}

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  const editThreadMetadata = useEditThreadMetadata()
  const threadRef = useRef<HTMLDivElement>(null)

  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return
    }

    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    })
  }, [thread, editThreadMetadata, maxZIndex])

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
      }}
    >
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  )
}
