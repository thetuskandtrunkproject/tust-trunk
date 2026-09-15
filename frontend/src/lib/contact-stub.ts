// TODO: replace with real API call

export const submitContactForm = async (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  console.log('Stub: submitContactForm called with', data)
  // In a real app, this would send an email or save to a database.
  // For now, we just pretend it succeeds.
  return { success: true }
}
