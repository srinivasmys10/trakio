import { useState, useRef, useEffect } from 'react'

type RecordState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error'

interface AudioRecorderProps {
  existingUrl?: string | null
  onRecorded:  (blob: Blob) => void
  onClear:     () => void
}

export default function AudioRecorder({ existingUrl, onRecorded, onClear }: AudioRecorderProps) {
  const [state,    setState]    = useState<RecordState>('idle')
  const [elapsed,  setElapsed]  = useState(0)        // seconds
  const [errMsg,   setErrMsg]   = useState('')
  const [blobUrl,  setBlobUrl]  = useState<string | null>(null)

  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const animRef     = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  function drawWaveform() {
    const analyser = analyserRef.current
    const canvas   = canvasRef.current
    if (!analyser || !canvas) return

    const ctx    = canvas.getContext('2d')!
    const buf    = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(buf)

    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    ctx.strokeStyle = '#4ade80'
    ctx.lineWidth   = 1.5

    const step = W / buf.length
    buf.forEach((v, i) => {
      const y = (v / 128) * (H / 2)
      if (i === 0) ctx.moveTo(0, y)
      else ctx.lineTo(i * step, y)
    })
    ctx.stroke()
    animRef.current = requestAnimationFrame(drawWaveform)
  }

  async function startRecording() {
    setState('requesting')
    setErrMsg('')
    chunksRef.current = []

    try {
      const stream  = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up Web Audio analyser for waveform
      const audioCtx   = new AudioContext()
      const source     = audioCtx.createMediaStreamSource(stream)
      const analyser   = audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analyserRef.current = analyser

      // Prefer webm/opus; fall back to whatever browser supports
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', '']
        .find(m => !m || MediaRecorder.isTypeSupported(m)) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRef.current = recorder

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        cancelAnimationFrame(animRef.current)
        stopTimer()

        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        const url  = URL.createObjectURL(blob)
        setBlobUrl(url)
        setState('stopped')
        onRecorded(blob)
      }

      recorder.start(250) // collect in 250ms chunks
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
      drawWaveform()

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied'
      setErrMsg(msg)
      setState('error')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
  }

  function clearRecording() {
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null) }
    setState('idle')
    setElapsed(0)
    onClear()
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.15s',
  }

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Audio Demo / Cue
      </div>

      {/* Existing audio playback */}
      {existingUrl && state === 'idle' && (
        <div style={{ marginBottom: 8 }}>
          <audio src={existingUrl} controls style={{ width: '100%', height: 32, outline: 'none' }} />
          <button onClick={clearRecording} style={{ ...btnBase, marginTop: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' }}>
            🗑 Remove recording
          </button>
        </div>
      )}

      {/* New blob playback */}
      {blobUrl && (
        <div style={{ marginBottom: 8 }}>
          <audio src={blobUrl} controls style={{ width: '100%', height: 32, outline: 'none' }} />
          <button onClick={clearRecording} style={{ ...btnBase, marginTop: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' }}>
            🗑 Re-record
          </button>
        </div>
      )}

      {/* Recording controls */}
      {state === 'idle' && !existingUrl && (
        <button onClick={startRecording} style={{ ...btnBase, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
          Record audio cue
        </button>
      )}

      {state === 'requesting' && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Requesting microphone…</div>
      )}

      {state === 'recording' && (
        <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-dot 1s ease infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>Recording {fmt(elapsed)}</span>
            <button onClick={stopRecording} style={{ ...btnBase, marginLeft: 'auto', background: 'var(--red)', color: '#fff', border: 'none', padding: '5px 12px' }}>
              ■ Stop
            </button>
          </div>
          <canvas ref={canvasRef} width={260} height={36} style={{ width: '100%', height: 36, display: 'block', borderRadius: 6, background: 'rgba(74,222,128,0.05)' }} />
        </div>
      )}

      {state === 'error' && (
        <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 6 }}>⚠ {errMsg}</div>
      )}
    </div>
  )
}
