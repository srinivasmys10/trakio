import type { SectionTitleProps } from '../types'

export default function SectionTitle({ children, style = {} }: SectionTitleProps) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 12,
        marginTop: 4,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
