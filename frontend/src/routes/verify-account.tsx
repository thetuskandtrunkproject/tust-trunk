import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/verify-account')({
  component: VerifyAccountPage,
})

function VerifyAccountPage() {
  return <Navigate to="/login" replace />
}
