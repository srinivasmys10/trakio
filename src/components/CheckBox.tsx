import type { CheckBoxProps } from '../types'

export default function CheckBox({ checked, onChange }: CheckBoxProps) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange() }}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onChange()}
      style={{
        width: 28,
        height: 28,
        border: `2px solid ${checked ? 'var(--green)' : 'var(--checkbox-off)'}`,
        borderRadius: '50%',
        background: checked ? 'var(--green)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.18s',
        userSelect: 'none',
      }}
    >
      {checked && (
        <span style={{ color: 'var(--on-accent)', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>
      )}
    </div>
  )
}
