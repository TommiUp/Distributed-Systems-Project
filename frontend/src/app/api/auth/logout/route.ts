import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.headers.set(
    'Set-Cookie',
    [
      `access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`,
      process.env.NODE_ENV === 'production' && 'Secure',
    ]
      .filter(Boolean)
      .join('; ')
  )
  return res
}
