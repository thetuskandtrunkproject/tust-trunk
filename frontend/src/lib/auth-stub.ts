// TODO: replace with real Firebase calls

export const handleLogin = async (email?: string, password?: string) => {
  console.log('Stub: handleLogin called', { email, password })
  // In a real app, this would call Firebase signInWithEmailAndPassword
  // and handle errors. For now, we just pretend it succeeds.
  return { success: true }
}

export const handleGoogleLogin = async () => {
  console.log('Stub: handleGoogleLogin called')
  // In a real app, this would call Firebase signInWithPopup(auth, googleProvider)
  return { success: true }
}

export const handleSignup = async (email?: string, password?: string) => {
  console.log('Stub: handleSignup called', { email, password })
  // In a real app, this would call Firebase createUserWithEmailAndPassword
  return { success: true }
}

export const handleResendVerification = async () => {
  console.log('Stub: handleResendVerification called')
  // In a real app, this would call Firebase sendEmailVerification(currentUser)
  return { success: true }
}
