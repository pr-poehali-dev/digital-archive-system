import { createContext, useContext, useEffect, useState, ReactNode } from "react"

const PROFILE_URL = "https://functions.poehali.dev/7d55ad6e-bdc9-4de0-b98e-d83a89828163"
const STEAM_AUTH_URL = "https://functions.poehali.dev/16d38f6f-d96f-4e0a-9388-e5b4b47e7f62"

export interface User {
  id: number
  steam_id: string
  username: string
  avatar_url: string
  profile_url: string
  plan: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getSession = () => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get("session")
    if (fromUrl) {
      localStorage.setItem("session_id", fromUrl)
      params.delete("session")
      const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
      window.history.replaceState({}, "", newUrl)
      return fromUrl
    }
    return localStorage.getItem("session_id")
  }

  useEffect(() => {
    const sessionId = getSession()
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetch(PROFILE_URL, {
      headers: { "X-Session-Id": sessionId },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        else localStorage.removeItem("session_id")
      })
      .catch(() => localStorage.removeItem("session_id"))
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    window.location.href = `${STEAM_AUTH_URL}/login`
  }

  const logout = () => {
    const sessionId = localStorage.getItem("session_id")
    if (sessionId) {
      fetch(`${STEAM_AUTH_URL}/logout`, {
        headers: { "X-Session-Id": sessionId },
      })
    }
    localStorage.removeItem("session_id")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
