// src/app/(protected)/layout.tsx
import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const jwt = (await cookies()).get('access_token')?.value

  if (!jwt) {
    // if no JWT cookie, immediately redirect to /login
    redirect('/login')
  }

  return <>{children}</>
}
