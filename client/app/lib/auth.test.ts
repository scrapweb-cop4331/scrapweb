import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { auth, type User } from './auth'

describe('auth service', () => {
  const mockUser: User = {
    id: '123',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    token: 'fake-jwt-token'
  }

  beforeEach(() => {
    // Mock document.cookie
    let cookie = ''
    vi.stubGlobal('document', {
      get cookie() {
        return cookie
      },
      set cookie(val) {
        cookie = val
      }
    })
    // Ensure we start with a clean state
    auth.logout()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should save and load user from cookie', () => {
    auth.saveUser(mockUser)
    auth.loadUser()
    expect(auth.getUser()).toEqual(mockUser)
    expect(auth.isAuthenticated()).toBe(true)
  })

  it('should return null when no user is saved', () => {
    auth.loadUser()
    expect(auth.getUser()).toBeNull()
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('should logout and clear user', () => {
    auth.saveUser(mockUser)
    auth.logout()
    auth.loadUser()
    expect(auth.getUser()).toBeNull()
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('should provide Authorization header', () => {
    auth.saveUser(mockUser)
    expect(auth.getAuthHeader()).toEqual({
      Authorization: `Bearer ${mockUser.token}`
    })
  })

  it('should return empty object for Auth header if not authenticated', () => {
    expect(auth.getAuthHeader()).toEqual({})
  })
})
