import type { SectionTitleProps } from '../types'

export default function SectionTitle({ children, style = {} }: SectionTitleProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 600,
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        marginBottom: 12,
        marginTop: 8,
        paddingLeft: 4,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
