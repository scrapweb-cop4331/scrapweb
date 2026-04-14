import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Frame, Input , Modal, TitleBar } from '@react95/core'
import logo from '../../assets/logo_worded.png'
import { mapResponseToUser, type LoginResponseDTO } from './utils/data'
import { auth } from '../../lib/auth'
import { forgotPassword } from '../../lib/api'

type Mode = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const navigate = useNavigate()

  const clearFields = () => {
    setUsername('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setForgotEmail('')
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode: Mode) => {
    clearFields()
    setMode(newMode)
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('https://scrapweb.kite-keeper.com:443/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data: LoginResponseDTO = await response.json()

      if (!response.ok) {
        setError((data as any).error || 'Login failed')
        return
      }

      const user = mapResponseToUser(data);
      auth.saveUser(user);
      
      setSuccess(`Logged in as ${user.username}`)
      navigate('/')

    } catch (err) {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }
  

  const handleRegister = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('https://scrapweb.kite-keeper.com:443/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess('Account created! Please check your email to verify your account.')

    } catch (err) {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await forgotPassword(forgotEmail)
      if (!response) {
        setError('Could not send reset email. Please try again.')
      } else {
        setSuccess('Check your email for reset instructions.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "80vh" }}>
      <Modal
        dragOptions={{ defaultPosition: { x: 0, y: 0 }, bounds: "body" }}
        boxShadow="$out"
        padding="0"
        bgColor="$material"
        title="ScrapWeb"
        titleBarOptions={<TitleBar.Close></TitleBar.Close>}
        style={{ width: "320px"}}
      >
        {/* Body */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              paddingBottom: "4px",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ height: "50px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Error */}
          {error && (
            <Frame boxShadow="in" padding="4px 6px">
              <span style={{ color: "red", fontSize: "12px" }}>⚠ {error}</span>
            </Frame>
          )}

          {/* Success */}
          {success && (
            <Frame boxShadow="in" padding="4px 6px">
              <span style={{ fontSize: "12px" }}>✔ {success}</span>
            </Frame>
          )}

          {/* Register-only fields */}
          {mode === "register" && (
            <>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <label style={{ fontSize: "12px" }} htmlFor="firstName">
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <label style={{ fontSize: "12px" }} htmlFor="lastName">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <label style={{ fontSize: "12px" }} htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </div>
            </>
          )}

          {/* Shared fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={{ fontSize: "12px" }} htmlFor="username">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={{ fontSize: "12px" }} htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              style={{ width: "100%" }}
            />
          </div>

          {mode === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '12px' }} htmlFor="forgotEmail">
                Email Address
              </label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForgotEmail(e.target.value)
                }
                style={{ width: '100%' }}
              />
            </div>
          )}

          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            {/* Forgot password link — only show on login screen */}
            {mode === 'login' && (
              <button
                onClick={() => switchMode('forgot')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '11px',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Forgot Password?
              </button>
            )}
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <Button
              onClick={
                mode === 'login'
                  ? handleLogin
                  : mode === 'register'
                  ? handleRegister
                  : handleForgotPassword
              }
              disabled={loading}
              style={{ minWidth: '75px' }}
            >
              {loading ? "..." : mode === "login" ? "OK" : "Register"}
            </Button>
            <Button
              onClick={() =>
                switchMode(mode === "login" ? "register" : "login")
              }
              style={{ minWidth: "75px" }}
            >
              {mode === "login" ? "Register" : "Back"}
            </Button>
          </div>
        </div>
        </div>
      </Modal>
    </div>
  );
}