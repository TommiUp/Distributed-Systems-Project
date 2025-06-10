'use client';

import { useState } from 'react';
import * as grpcWeb from 'grpc-web';
import { AuthServiceClient } from '@/generated/Auth_serviceServiceClientPb';
import { LoginRequest, LoginResponse } from '@/generated/auth_service_pb';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = () => {
    setError(null);

    if (!email || !pass) {
      setError('Email & password are required');
      return;
    }

    // Only now, on client‐side button click, read NEXT_PUBLIC_AUTH_HOST:
    const authHost = process.env.NEXT_PUBLIC_AUTH_HOST;
    if (!authHost) {
      setError('Auth service URL not configured.');
      return;
    }

    const authClient = new AuthServiceClient(authHost, null, null);
    const req = new LoginRequest();
    req.setUsername(email);
    req.setPassword(pass);

    authClient.login(
      req,
      {},
      (err: grpcWeb.RpcError, resp: LoginResponse | null) => {
        if (err || !resp) {
          console.error('Login gRPC error:', err);
          setError('Login failed; please try again.');
          return;
        }
        if (!resp.getSuccess()) {
          setError(resp.getMessage());
          return;
        }
        // Store JWT in a cookie and navigate
        const token = resp.getToken();
        document.cookie = `access_token=${token}; path=/;`;
        router.push('/channels');
      }
    );
  };

  return (
    <main className="flex flex-col gap-4 w-80 mx-auto mt-32">
      {error && <div className="text-red-600">{error}</div>}
      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button className="btn" onClick={handleSignIn}>
        Sign in
      </button>
    </main>
  );
}
