'use client';

import { useState } from 'react';
import * as grpcWeb from 'grpc-web';
import { AuthServiceClient } from '@/generated/Auth_serviceServiceClientPb';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/generated/auth_service_pb';
import { useRouter } from 'next/navigation';

const authHost = process.env.NEXT_PUBLIC_AUTH_HOST!;
const authClient = new AuthServiceClient(authHost, null, null);

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Username & password are required');
      return;
    }

    if (mode === 'login') {
      const req = new LoginRequest()
        .setUsername(username)
        .setPassword(password);
      authClient.login(req, {}, (err, res) => {
        if (err || !res) return setError('Network error');
        if (!res.getSuccess()) return setError(res.getMessage());
        document.cookie = `access_token=${res.getToken()}; path=/;`;
        router.push('/channels');
      });
    } else {
      const req = new RegisterRequest()
        .setUsername(username)
        .setPassword(password);
      authClient.register(req, {}, (err, res) => {
        if (err || !res) return setError('Network error');
        if (!res.getSuccess()) return setError(res.getMessage());
        setMode('login');
        setError('✅ Registered! Please log in.');
        setPassword('');
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#2F3136] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#36393F] rounded-lg shadow-xl p-8">
        {/* Toggle */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 font-semibold rounded-tl-lg rounded-bl-lg ${
              mode === 'login'
                ? 'bg-[#202225] text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 font-semibold rounded-tr-lg rounded-br-lg ${
              mode === 'register'
                ? 'bg-[#202225] text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        {/* Heading */}
        <h2 className="text-2xl text-white font-bold mb-2">
          {mode === 'login' ? 'Welcome back!' : 'Create an account'}
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          {mode === 'login'
            ? "We're excited to see you again."
            : 'Join us—your data is safe with us.'}
        </p>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <label className="block text-gray-400 text-xs">
            Username
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 bg-[#202225] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#7289DA]"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </label>

          <label className="block text-gray-400 text-xs">
            Password
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 bg-[#202225] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#7289DA]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
        </div>

        {/* Forgot / Submit */}
        <div className="mt-6 flex items-center justify-between">
          {mode === 'login' && (
            <button className="text-xs text-[#7289DA] hover:underline">
              Forgot password?
            </button>
          )}
          <button
            className="ml-auto px-6 py-2 bg-[#7289DA] text-white font-semibold rounded hover:bg-[#5b6eae] transition"
            onClick={handleSubmit}
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </div>

        {/* Switch link */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          {mode === 'login'
            ? "Need an account? "
            : "Already have one? "}
          <button
            className="text-[#7289DA] hover:underline"
            onClick={() => {
              setMode(prev => (prev === 'login' ? 'register' : 'login'));
              setError(null);
            }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </main>
  );
}
