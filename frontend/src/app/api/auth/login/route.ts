import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  // TODO: replace this stub with real lookup + bcrypt.compare
  const ok = /* await db.findUser(username) */ true

  if (!ok) {
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    )
  }

  const token = jwt.sign(
    { sub: username },
    process.env.SECRET_KEY! /* SECRET_KEY must be set in .env */,
    { algorithm: 'HS256', expiresIn: '30m' }
  )

  // Return both the HttpOnly cookie AND the token in the JSON body
  const res = NextResponse.json({ success: true, token })
  res.headers.set(
    'Set-Cookie',
    [
      `access_token=${token}; Path=/; HttpOnly; SameSite=Strict`,
      process.env.NODE_ENV === 'production' && 'Secure',
    ]
      .filter(Boolean)
      .join('; ')
  )
  return res
}
