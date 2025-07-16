// frontend/src/app/api/auth/login/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import * as path from 'path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { join } from 'path'

const PROTO_PATH = join(process.cwd(), 'src/grpc/auth_service.proto')
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const grpcPkg = grpc.loadPackageDefinition(packageDef) as any
const AuthService = grpcPkg.authservice.AuthService

const authClient = new AuthService(
  process.env.AUTH_SERVICE_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
)

export async function POST(req: Request) {
  const { username, password } = await req.json()

  // 1) Wrap the callback in a Promise with an explicit return‐type.
  async function callLogin(): Promise<{ success: boolean; message: string; token: string }> {
    return new Promise((resolve, reject) => {
      authClient.Login({ username, password }, (err: grpc.ServiceError | null, resp: any) => {
        if (err) return reject(err)
        resolve({
          success: resp.success,
          message: resp.message,
          token: resp.token,
        })
      })
    })
  }

  // 2) Await it inside try/catch so TS knows exactly what loginResponse is.
  let loginResponse: { success: boolean; message: string; token: string }
  try {
    loginResponse = await callLogin()
  } catch (err) {
    console.error('gRPC error:', err)
    loginResponse = { success: false, message: 'Auth service unavailable', token: '' }
  }

  if (!loginResponse.success) {
    return NextResponse.json(
      { success: false, message: loginResponse.message },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ success: true, token: loginResponse.token })
  res.headers.set(
    'Set-Cookie',
    [
      `access_token=${loginResponse.token}; Path=/; HttpOnly; SameSite=Strict`,
      process.env.NODE_ENV === 'production' && 'Secure',
    ]
      .filter(Boolean)
      .join('; ')
  )
  return res
}
