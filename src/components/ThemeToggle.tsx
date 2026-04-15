import type { Theme } from '../types'

interface ThemeToggleProps {
  theme:        Theme
  onToggle:     () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
      style={{
        background:   theme === 'dark' ? 'var(--surface-hover)' : 'rgba(0,0,0,0.06)',
        border:       `1px solid ${theme === 'dark' ? 'var(--border-input)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 20,
        width:        36,
        height:       36,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        cursor:       'pointer',
        fontSize:     16,
        transition:   'all 0.2s',
        flexShrink:   0,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
