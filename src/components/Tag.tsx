import type { TagProps } from '../types'

export default function Tag({ children, color = '#94a3b8', style = {} }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        border: 'none',
        borderRadius: 999,
        padding: '3px 11px',
        fontSize: 11,
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
