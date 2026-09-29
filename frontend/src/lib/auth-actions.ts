import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signOut,
  updatePassword
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { api } from './api'

const mapAuthError = (error: any): string => {
  const code = error?.code || ''
  if (code === 'auth/invalid-credential') return "Invalid email or password. Please try again or register if you don't have an account."
  if (code === 'auth/email-already-in-use') return "An account already exists with this email address."
  if (code === 'auth/weak-password') return "Password is too weak. Please use a stronger password."
  if (code === 'auth/requires-recent-login') return "For your security, please log out and log back in to perform this action."
  if (error?.message) return error.message.replace('Firebase: Error (', '').replace(').', '')
  return "An unexpected error occurred."
}

export const handleLogin = async (email?: string, password?: string) => {
  if (!email || !password) return { success: false, error: 'Email and password required' }
  try {
    await signInWithEmailAndPassword(auth, email, password)
    return { success: true }
  } catch (error: any) {
    console.error('Login error:', error)
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleGoogleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider)
    return { success: true }
  } catch (error: any) {
    console.error('Google login error:', error)
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleSignup = async (email?: string, password?: string) => {
  if (!email || !password) return { success: false, error: 'Email and password required' }
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password)
    // Automatically send verification email
    await sendEmailVerification(userCred.user)
    return { success: true }
  } catch (error: any) {
    console.error('Signup error:', error)
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleResendVerification = async () => {
  if (!auth.currentUser) return { success: false, error: 'Not logged in' }
  try {
    await sendEmailVerification(auth.currentUser)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleLogout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleChangePassword = async (newPassword: string) => {
  if (!auth.currentUser) return { success: false, error: 'Not logged in' }
  try {
    await updatePassword(auth.currentUser, newPassword)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: mapAuthError(error) }
  }
}

export const handleRevokeAllSessions = async () => {
  try {
    await api.post('/api/v1/auth/revoke-all-sessions')
    await handleLogout()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.detail || mapAuthError(error) }
  }
}

