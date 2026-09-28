import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { api } from '@/lib/api'

// Defines our backend DB user format
export interface AppUser {
  id: string
  firebase_uid: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserFromDB = async () => {
    try {
      const res = await api.get('/api/v1/auth/me')
      setUser(res.data)
    } catch (err) {
      console.error("Failed to fetch user from DB:", err)
      setUser(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setFirebaseUser(currUser)
      if (currUser) {
        // Automatically sync with DB and fetch profile on auth state change
        try {
          const syncRes = await api.post('/api/v1/auth/sync')
          setUser(syncRes.data)
        } catch (err) {
          console.error("Failed to sync user:", err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, refreshUser: fetchUserFromDB }}>
      {children}
    </AuthContext.Provider>
  )
}
