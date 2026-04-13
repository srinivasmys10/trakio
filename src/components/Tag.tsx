import type { TagProps } from '../types'

export default function Tag({ children, color = '#94a3b8', style = {} }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${color}22`,
        border: `1px solid ${color}66`,
        borderRadius: 6,
        padding: '2px 8px',
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
