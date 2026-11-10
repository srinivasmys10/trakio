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
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 999,
        width:        42,
        height:       42,
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
