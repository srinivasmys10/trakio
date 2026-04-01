import type { CardProps } from '../types'

export default function Card({ children, style = {}, accent }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${accent ? `${accent}44` : 'var(--border)'}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
