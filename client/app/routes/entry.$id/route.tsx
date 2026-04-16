import { useState, useRef, useEffect, useCallback } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { Button, Frame, Modal, TitleBar } from '@react95/core'
import { Progman9 } from '@react95/icons'
import placeholder from "~/assets/logo-icon.png";
import AudioPlayer from '~/components/ui/common/AudioPlayer';
import { getEntries } from '~/lib/api';
import { auth } from '~/lib/auth';
import type { Route } from './+types/route';

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const BASE = 'https://scrapweb.kite-keeper.com'

// ─── Audio Player Hook ────────────────────────────────────────────────────────

function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    })
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => setPlaying(false))
    return () => { audio.pause(); audio.src = '' }
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !src) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().catch(() => {}); setPlaying(true) }
  }

  const seek = (ratio: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = ratio * audio.duration
    setProgress(ratio)
  }

  const fmt = (s: number) => {
    if (!isFinite(s) || s <= 0) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return { playing, toggle, progress, seek, duration, fmt, hasAudio: !!src }
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress, onSeek, disabled }: { progress: number; onSeek: (r: number) => void; disabled?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const getRatio = (clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setDragging(true)
    onSeek(getRatio(e.clientX))
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => onSeek(getRatio(e.clientX))
    const onUp = (e: MouseEvent) => { onSeek(getRatio(e.clientX)); setDragging(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, onSeek])

  const pct = `${progress * 100}%`

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      style={{ flex: 1, height: '18px', position: 'relative', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <Frame boxShadow="in" style={{ width: '100%', height: '6px', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: pct, height: '100%', background: disabled ? '#aaa' : '#000080' }} />
      </Frame>
      {!disabled && (
        <div style={{
          position: 'absolute', left: pct, transform: 'translateX(-50%)',
          width: '12px', height: '18px', background: '#c0c0c0',
          border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff',
          boxSizing: 'border-box', cursor: 'ew-resize', zIndex: 2, flexShrink: 0
        }} />
      )}
    </div>
  )
}

// ─── Image Placeholder ────────────────────────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div style={{ width: '100%', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#c0c0c0', gap: '8px' }}>
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns={placeholder}>
        <path d="M18 34V14l20-4v20" stroke="#606060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="34" r="4" stroke="#606060" strokeWidth="2"/>
        <circle cx="34" cy="30" r="4" stroke="#606060" strokeWidth="2"/>
      </svg>
      <span style={{ fontSize: '11px', color: '#606060' }}>No image</span>
    </div>
  )
}

export async function clientLoader({request, params}: Route.ClientLoaderArgs ) {
  if (!params.id) {
    return null;
  }
  
  const entries = await getEntries();
  const entry = entries.find((value) => {
    return (value.id === params.id)
  })
  if (!entry) return null;
  return entry;
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function MediaDetailRoute() {
  const navigate = useNavigate()
  
  // ── Data ──
  const entry = useLoaderData<typeof clientLoader>();

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#008080]">
        <Modal
          boxShadow="$out"
          padding="16px"
          bgColor="$material"
          title="Error"
          titleBarOptions={<TitleBar.Close onClick={() => navigate('/')} />}
        >
          <div style={{ fontSize: '12px' }}>Entry not found.</div>
          <Button onClick={() => navigate('/')} style={{ marginTop: '12px' }}>Go Back</Button>
        </Modal>
      </div>
    )
  }

  // ── State ──
  const [editMode, setEditMode] = useState(false)
  const [text, setText] = useState(entry.note ?? '')
  const [audioUrl, setAudioUrl] = useState(entry.audioURL ?? '')
  const [photoPreview, setPhotoPreview] = useState(entry.imageURL ?? '')
  
  // Try to parse artist/title from filename if possible, otherwise use defaults
  const [displayTitle, setDisplayTitle] = useState('Untitled')
  const [displayArtist, setDisplayArtist] = useState('Unknown Artist')
  
  const [entryDate, setEntryDate] = useState(() => {
    // entry.date is in MM-DD-YYYY format from api.ts
    const [m, d, y] = entry.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return isNaN(dateObj.getTime()) 
      ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  })

  const [editingDate, setEditingDate] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [savedTime, setSavedTime] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  
  // ── About icon drag ──
  const [aboutPos, setAboutPos] = useState({ x: 16, y: 100 })
  const aboutDragRef = useRef<{ startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null)
  const aboutWasDragged = useRef(false)

  const handleAboutMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    aboutWasDragged.current = false
    aboutDragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startX: aboutPos.x, startY: aboutPos.y }
    const onMove = (ev: MouseEvent) => {
      if (!aboutDragRef.current) return
      const dx = ev.clientX - aboutDragRef.current.startMouseX
      const dy = ev.clientY - aboutDragRef.current.startMouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) aboutWasDragged.current = true
      setAboutPos({ x: aboutDragRef.current.startX + dx, y: aboutDragRef.current.startY + dy })
    }
    const onUp = () => {
      aboutDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  } 

  const photoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs to latest values for save-on-exit
  const textRef = useRef(text)
  const photoFileRef = useRef(photoFile)
  const audioFileRef = useRef(audioFile)
  useEffect(() => { textRef.current = text }, [text])
  useEffect(() => { photoFileRef.current = photoFile }, [photoFile])
  useEffect(() => { audioFileRef.current = audioFile }, [audioFile])

  const player = useAudioPlayer(audioUrl)

  // ── Save ──
  const save = useCallback(async (text: string, pf: File | null, af: File | null) => {
    if (!entry?.id) {
      setSaveStatus('error')
      return
    }
    setSaveStatus('saving')
    try {
      const form = new FormData()
      form.append("notes", text)
      if (pf) form.append('photo', pf)
      if (af) form.append('audio', af)
      const res = await fetch(`${BASE}/api/media/${entry.id}`, {
        method: 'PATCH',
        headers: { ...auth.getAuthHeader() },
        body: form
      })
      const now = new Date()
      await res.json(); 
      setSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      if (res.ok) {
        setSaveStatus('saved')
      } else {
        setSaveStatus('error')
        if (res.status == 404) {
          // todo
        }
      }
    } catch (error: any) {
      console.log("error: " + error.toString());
      setSaveStatus("error");
    }
    
  }, [entry?.id])

  const scheduleAutosave = useCallback((t: string, pf: File | null, af: File | null) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    setSavedTime('')
    saveTimerRef.current = setTimeout(() => save(t, pf, af), 1500)
  }, [save])

  // ── Toggle edit: save immediately on exit ──
  const toggleEdit = () => {
    if (editMode) {
      // Cancel any pending autosave and save right now
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null }
      save(textRef.current, photoFileRef.current, audioFileRef.current)
    }
    setEditMode(prev => !prev)
  }

  // ── Handlers ──
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    scheduleAutosave(val, photoFile, audioFile)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    scheduleAutosave(text, file, audioFile)
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioFile(file)
    setAudioUrl(URL.createObjectURL(file))
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    const parts = nameWithoutExt.split(' - ')
    if (parts.length >= 2) {
      setDisplayArtist(parts[0].trim())
      setDisplayTitle(parts.slice(1).join(' - ').trim())
    } else {
      setDisplayTitle(nameWithoutExt)
      setDisplayArtist('Unknown Artist')
    }
    scheduleAutosave(text, photoFile, file)
  }

  // ── Routing on close ──
  const handleClose = () => {
    navigate('/')
  }

  // Refactored to LogoutButton component
  /*
  // ── Logout ──
  const handleLogout = () => {
    auth.logout()
    navigate('/index')
  }
  */

  // ── Delete ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!entry?.id) return
    setDeleting(true)
    try {
      const res = await fetch(`${BASE}/api/media/${entry.id}`, {
        method: 'DELETE',
        headers: { ...auth.getAuthHeader() }
      })
      if (!res.ok) throw new Error()
      navigate('/')
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // ── Title bar text ──
  const titleBase = entryDate || displayTitle || 'Untitled'
  const titleText = editMode
    ? saveStatus === 'saving' ? `* ${titleBase} - Saving...`
    : saveStatus === 'saved'  ? `${titleBase} - saved at ${savedTime}`
    : saveStatus === 'error'  ? `* ${titleBase} - Save failed`
    : titleBase
    : titleBase

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-[#008080]"
      style={{ position: 'relative' }}
    >

      {/* ── Main modal ── */}
      <Modal
        boxShadow="$out"
        padding="0"
        bgColor="$material"
        title={titleText}
        titleBarOptions={<TitleBar.Close onClick={handleClose} />}
        style={{ width: '600px', maxWidth: '95vw' }}
      >
        {/* Win95 menu bar */}
        <div style={{
          display: 'flex', alignItems: 'stretch',
          borderBottom: '1px solid #808080',
          background: '#c0c0c0',
          padding: '0 2px',
          userSelect: 'none',
          position: 'relative'
        }}>
          {/* Edit tab */}
          <div
            onClick={toggleEdit}
            style={{
              padding: '2px 8px', fontSize: '12px', cursor: 'default',
              background: editMode ? '#000080' : 'transparent',
              color: editMode ? '#fff' : '#000',
              border: editMode ? '1px solid #808080' : '1px solid transparent',
              marginTop: '2px', lineHeight: '1.6'
            }}
          >
            Edit
          </div>

          {/* Date tab */}
          <div
            onClick={() => { setDateInput(entryDate); setEditingDate(p => !p) }}
            style={{
              padding: '2px 8px', fontSize: '12px', cursor: 'default',
              background: editingDate ? '#000080' : 'transparent',
              color: editingDate ? '#fff' : '#000',
              border: editingDate ? '1px solid #808080' : '1px solid transparent',
              marginTop: '2px', lineHeight: '1.6'
            }}
          >
            Date
          </div>

          {/* Delete tab */}
          <div
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '2px 8px', fontSize: '12px', cursor: 'default',
              background: 'transparent', color: '#000',
              border: '1px solid transparent',
              marginTop: '2px', lineHeight: '1.6'
            }}
          >
            Delete
          </div>

          {/* Date dropdown */}
          {editingDate && (
            <div style={{
              position: 'absolute', top: '100%', left: '40px', zIndex: 100,
              background: '#c0c0c0',
              border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff',
              boxShadow: '2px 2px 0 #000',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px',
              minWidth: '240px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Set entry date:</span>
              <input
                type="date"
                defaultValue={(() => {
                  const d = new Date(entryDate)
                  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
                })()}
                onChange={e => {
                  if (!e.target.value) return
                  const d = new Date(e.target.value + 'T12:00:00')
                  setDateInput(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
                }}
                style={{
                  fontFamily: 'inherit', fontSize: '12px',
                  border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080',
                  padding: '2px 4px', background: '#fff'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { if (dateInput) setEntryDate(dateInput); setEditingDate(false) }}
                  style={{
                    fontFamily: 'inherit', fontSize: '12px', padding: '2px 12px',
                    background: '#c0c0c0', border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff', cursor: 'default'
                  }}
                >OK</button>
                <button
                  onClick={() => setEditingDate(false)}
                  style={{
                    fontFamily: 'inherit', fontSize: '12px', padding: '2px 12px',
                    background: '#c0c0c0', border: '2px solid',
                    borderColor: '#ffffff #808080 #808080 #ffffff', cursor: 'default'
                  }}
                >Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '12px', display: 'flex', gap: '12px', minHeight: '320px' }}>

          {/* Left: Text panel */}
          <Frame boxShadow="in" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', minHeight: '296px', position: 'relative', overflow: 'hidden' }}>
            {editMode ? (
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Write your notes here..."
                style={{
                  position: 'absolute', inset: 0,
                  border: 'none', outline: 'none', background: 'transparent',
                  resize: 'none', fontFamily: 'inherit', fontSize: '12px', padding: '6px',
                  overflowY: 'auto'
                }}
              />
            ) : (
              <div style={{ flex: 1, fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit', color: text ? '#000' : '#999', overflowY: 'auto', overflowX: 'hidden', position: 'absolute', inset: 0, padding: '6px' }}>
                {text ? text : <em>No notes yet. Switch to Edit mode to add some.</em>}
              </div>
            )}
          </Frame>

          {/* Right: Image + info + player */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* Cover image */}
            <Frame boxShadow="in" style={{ position: 'relative', overflow: 'hidden' }}>
              {photoPreview
                ? <img src={photoPreview} alt="cover" style={{ width: '100%', minHeight: '180px', objectFit: 'cover', display: 'block' }} />
                : <ImagePlaceholder />
              }
              {editMode && (
                <div style={{ position: 'absolute', bottom: '6px', right: '6px' }}>
                  <Button onClick={() => photoInputRef.current?.click()} style={{ fontSize: '11px', padding: '2px 8px' }}>
                    📷 {photoPreview ? 'Replace' : 'Add Photo'}
                  </Button>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                </div>
              )}
            </Frame>

            {/* Song info */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayTitle || 'Untitled'}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>{displayArtist || 'Unknown Artist'}</div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #808080', borderBottom: '1px solid #fff', margin: '0' }} />

            {/* Audio player */}
            <AudioPlayer audioURL={audioUrl} />

            {/* Edit mode: replace audio */}
            {editMode && (
              <>
                <Button onClick={() => audioInputRef.current?.click()} style={{ width: '100%', fontSize: '11px' }}>
                  🎵 {player.hasAudio ? 'Replace Audio' : 'Add Audio'}
                </Button>
                <input ref={audioInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioChange} />
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Desktop logout icon (draggable) ── */}

      {/* Refactored to LogoutButton component
      <div
        ref={iconRef}
        onMouseDown={handleIconMouseDown}
        onDoubleClick={() => { if (!wasDragged.current) setShowLogoutConfirm(true) }}
        style={{
          position: 'absolute',
          top: iconPos.y,
          left: iconPos.x,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          cursor: 'grab', userSelect: 'none', width: '64px', padding: '4px'
        }}
        title="Log Out (double-click)"
      >
        <Inetcpl1305 variant="32x32_4" style={{ width: '32px', height: '32px', pointerEvents: 'none' }} />
        <span style={{ fontSize: '11px', color: '#fff', textAlign: 'center', textShadow: '1px 1px 1px #000', lineHeight: 1.2, pointerEvents: 'none' }}>
          Log Out
        </span>
      </div>
      */}

      {/* ── About icon (draggable) ── */}
      <div
        onMouseDown={handleAboutMouseDown}
        onDoubleClick={() => { if (!aboutWasDragged.current) navigate('/about') }}
        style={{
          position: 'absolute',
          top: aboutPos.y,
          left: aboutPos.x,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          cursor: 'grab', userSelect: 'none', width: '64px', padding: '4px'
        }}
        title="About (double-click)"
      >
        <Progman9 variant="32x32_4" style={{ width: '32px', height: '32px', pointerEvents: 'none' }} />
        <span style={{ fontSize: '11px', color: '#fff', textAlign: 'center', textShadow: '1px 1px 1px #000', lineHeight: 1.2, pointerEvents: 'none' }}>
          About
        </span>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <Modal
            boxShadow="$out"
            padding="0"
            bgColor="$material"
            title="Delete Entry"
            titleBarOptions={<TitleBar.Close onClick={() => setShowDeleteConfirm(false)} />}
            style={{ width: '300px' }}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '24px', lineHeight: 1 }}>⚠️</span>
                <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <strong>Are you sure you want to delete this entry?</strong>
                  <div style={{ color: '#555', marginTop: '4px' }}>This will permanently remove the text, photo, and audio. This cannot be undone.</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button onClick={handleDelete} disabled={deleting} style={{ minWidth: '75px', fontSize: '12px' }}>
                  {deleting ? '...' : 'Delete'}
                </Button>
                <Button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} style={{ minWidth: '75px', fontSize: '12px' }}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Refactored to LogoutButton component
      {showLogoutConfirm && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <Modal
            boxShadow="$out"
            padding="0"
            bgColor="$material"
            title="Log Out"
            titleBarOptions={<TitleBar.Close onClick={() => setShowLogoutConfirm(false)} />}
            style={{ width: '280px' }}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock variant="32x32_4" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
                <span style={{ fontSize: '12px' }}>Are you sure you want to log out?</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button onClick={handleLogout} style={{ minWidth: '75px', fontSize: '12px' }}>Yes</Button>
                <Button onClick={() => setShowLogoutConfirm(false)} style={{ minWidth: '75px', fontSize: '12px' }}>No</Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
      */}
    </div>
  )
}
