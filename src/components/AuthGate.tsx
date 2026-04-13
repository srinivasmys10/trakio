import { useState, type FormEvent } from 'react'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/auth'

type AuthMode = 'signin' | 'signup'

// ─── Small sub-components ─────────────────────────────────────────────────────

function InputField({
  label, type = 'text', value, onChange, placeholder, autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-input)',
          borderRadius: 10,
          color: 'var(--text-primary)',
          fontSize: 14,
          padding: '11px 14px',
          outline: 'none',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(96,165,250,0.5)' }}
        onBlur={(e)  => { e.target.style.borderColor = 'var(--border-input)' }}
      />
    </div>
  )
}

function PrimaryButton({
  children, onClick, disabled, style = {},
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        background: disabled
          ? 'rgba(74,222,128,0.2)'
          : 'linear-gradient(135deg, #4ade80 0%, #22d3ee 100%)',
        color: disabled ? 'rgba(74,222,128,0.5)' : 'var(--bg)',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ─── Google button ────────────────────────────────────────────────────────────

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '11px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid var(--border-input)',
        background: 'var(--bg-input)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) (e.target as HTMLElement).style.background = 'var(--border)' }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--bg-input)' }}
    >
      {/* Google "G" SVG */}
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 19.07 12c0 .68-.06 1.33-.18 1.96H12v-3.73h7.72A10.93 10.93 0 0 0 12 1.03 10.97 10.97 0 0 0 1.03 12c0 3.24 1.4 6.15 3.63 8.18L7.8 17A7.08 7.08 0 0 1 5.27 9.76z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77A6.52 6.52 0 0 1 12 19.1a7.09 7.09 0 0 1-6.7-4.77l-4.1 3.18A10.97 10.97 0 0 0 12 23z"/>
        <path fill="#4A90D9" d="M19.28 20.34A10.93 10.93 0 0 0 23 12c0-.65-.06-1.29-.18-1.9H12v3.73h7.89a7.26 7.26 0 0 1-2.6 4.51l3.57 2.77-.58-.77z"/>
        <path fill="#FBBC05" d="M5.3 14.33A7.08 7.08 0 0 1 4.93 12c0-.81.14-1.6.37-2.34L1.2 6.48A10.97 10.97 0 0 0 1.03 12c0 1.85.46 3.6 1.24 5.13l3.03-2.8z"/>
      </svg>
      Continue with Google
    </button>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, color: 'var(--checkbox-off)', fontWeight: 600 }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ─── Main AuthGate ────────────────────────────────────────────────────────────

export default function AuthGate() {
  const [mode,        setMode]        = useState<AuthMode>('signin')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [name,        setName]        = useState('')
  const [username,    setUsername]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [successMsg,  setSuccessMsg]  = useState<string | null>(null)

  const busy = loading || googleLoading

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    setSuccessMsg(null)

    if (!email.trim())    { setError(mode === 'signup' ? 'Email is required' : 'Email or username is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name || undefined, username.trim() || undefined)
        setSuccessMsg('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
        setPassword('')
      } else {
        await signInWithEmail(email, password)
        // useAuth() in App will detect the session change automatically
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (busy) return
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle() // redirects — page will reload on return
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(msg)
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,222,128,0.07) 0%, transparent 70%)',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 400,
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo / branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏃</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Run & Eat
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Training planner · Meal planner · Backed by Supabase
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '28px 24px',
          backdropFilter: 'blur(12px)',
        }}>

          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 10,
            padding: 3,
            marginBottom: 24,
          }}>
            {(['signin', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccessMsg(null) }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: mode === m ? 'var(--border)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <div style={{ marginBottom: 16 }}>
            <GoogleButton onClick={handleGoogle} disabled={busy} />
            {googleLoading && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Redirecting to Google…
              </p>
            )}
          </div>

          <Divider />

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>

            {mode === 'signup' && (
              <InputField
                label="Display Name (optional)"
                value={name}
                onChange={setName}
                placeholder="e.g. Alex"
                autoComplete="name"
              />
            )}

            {mode === 'signup' && (
              <InputField
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="e.g. alex_runs (letters, numbers, _)"
                autoComplete="username"
              />
            )}

            <InputField
              label={mode === 'signup' ? 'Email' : 'Email or Username'}
              type={mode === 'signup' ? 'email' : 'text'}
              value={email}
              onChange={setEmail}
              placeholder={mode === 'signup' ? 'you@example.com' : 'your@email.com or username'}
              autoComplete={mode === 'signup' ? 'email' : 'username email'}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            {/* Error / success messages */}
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--red)',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--green)',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}>
                <span>✓</span>
                {successMsg}
              </div>
            )}

            <PrimaryButton disabled={busy} style={{ marginTop: 4 }}>
              {loading
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </PrimaryButton>
          </form>

          {/* Security footnote */}
          <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>
            🔒 Passwords are hashed with bcrypt by Supabase Auth.
            Your raw password is never stored.
          </p>
        </div>
      </div>
    </div>
  )
}
