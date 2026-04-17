import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button, Modal, TitleBar } from '@react95/core'
import { Person116 } from '@react95/icons'
import { auth } from '~/lib/auth'

export function AccountButton() {
  const navigate = useNavigate()
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

  const handleClick = () => {

    navigate('/account')
  }

  return (
    <>
      <div
        onMouseDown={handleIconMouseDown}
        onDoubleClick={() => { if (!wasDragged.current) handleClick }}
        style={{
          position: 'absolute',
          top: iconPos.y,
          left: iconPos.x,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          cursor: 'grab', userSelect: 'none', width: '64px', padding: '4px'
        }}
        title="Log Out (double-click)"
      >
        <Person116 style={{ width: '32px', height: '32px', pointerEvents: 'none' }} />
        <span style={{ fontSize: '11px', color: '#fff', textAlign: 'center', textShadow: '1px 1px 1px #000', lineHeight: 1.2, pointerEvents: 'none' }}>
          Account
        </span>
      </div>

    </>
  )
}
