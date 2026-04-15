import { useState, useRef, useEffect } from 'react'
import type { UserMenuProps } from '../types'

/** Renders the first letter of a name or email as a fallback avatar */
function Avatar({ user }: { user: UserMenuProps['user'] }) {
  const initials = (user.name ?? user.email ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name ?? 'avatar'}
        referrerPolicy="no-referrer"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid rgba(74,222,128,0.4)',
          objectFit: 'cover',
        }}
      />
    )
  }

  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: 'var(--bg)',
      border: '2px solid rgba(74,222,128,0.4)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open,          setOpen]          = useState(false)
  const [signingOut,    setSigningOut]    = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await onSignOut()
    } finally {
      setSigningOut(false)
      setOpen(false)
    }
  }

  const displayName = user.name ?? user.email ?? 'User'
  const providerIcon = user.provider === 'google' ? '🌐' : '✉️'

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: 6, borderRadius: 20,
          outline: 'none',
        }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar user={user} />
        <span style={{
          fontSize: 10, color: open ? 'var(--text-secondary)' : 'var(--text-muted)',
          transition: 'color 0.2s',
        }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 220,
          background: 'var(--bg-dropdown)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* User info */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Avatar user={user} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </div>
                {user.name && user.email && (
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 5, padding: '2px 8px',
              fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
            }}>
              {providerIcon} {user.provider === 'google' ? 'Google' : 'Email'} account
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: '100%', padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: signingOut ? 'rgba(248,113,113,0.4)' : '#f87171',
              fontSize: 13, fontWeight: 600,
              cursor: signingOut ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!signingOut) (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span style={{ fontSize: 16 }}>↩</span>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
