import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button, Modal, TitleBar } from '@react95/core'
import { Inetcpl1305, Lock } from '@react95/icons'
import { auth } from '~/lib/auth'

export function LogoutButton() {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [iconPos, setIconPos] = useState({ x: 16, y: 16 })
  const iconDragRef = useRef<{ startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null)
  const wasDragged = useRef(false)

  const handleIconMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    wasDragged.current = false
    iconDragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startX: iconPos.x, startY: iconPos.y }
    const onMove = (ev: MouseEvent) => {
      if (!iconDragRef.current) return
      const dx = ev.clientX - iconDragRef.current.startMouseX
      const dy = ev.clientY - iconDragRef.current.startMouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged.current = true
      setIconPos({ x: iconDragRef.current.startX + dx, y: iconDragRef.current.startY + dy })
    }
    const onUp = () => {
      iconDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleLogout = () => {
    auth.logout()
    navigate('/login')
  }

  return (
    <>
      <div
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
    </>
  )
}
