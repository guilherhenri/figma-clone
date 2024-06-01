import Image from 'next/image'
import React from 'react'

import styles from './Avatar.module.css'

export function Avatar({
  name,
  otherStyles,
}: {
  name: string
  otherStyles: string
}) {
  return (
    <div
      className={`size-9 ${styles.avatar} ${otherStyles}`}
      data-tooltip={name}
    >
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        alt={name}
        fill
        className={styles.avatar_picture}
      />
    </div>
  )
}
