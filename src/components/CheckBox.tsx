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
        width: 22,
        height: 22,
        border: `2px solid ${checked ? 'var(--green)' : 'rgba(255,255,255,0.25)'}`,
        borderRadius: 6,
        background: checked ? 'rgba(74,222,128,0.2)' : 'transparent',
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
        <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>
      )}
    </div>
  )
}
