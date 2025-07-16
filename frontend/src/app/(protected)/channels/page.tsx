// frontend/src/app/(protected)/channels/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import * as grpcWeb from 'grpc-web';
import { HubServiceClient } from '@/generated/Hub_serviceServiceClientPb';
import {
  Empty,
  Channel as ChMsg,
  CreateReq,
  DeleteReq,
} from '@/generated/hub_service_pb';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Channel = { id: string; name: string };

export default function ChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newName, setNewName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize gRPC-Web client with cookies
  const hubClient = useMemo(
    () => new HubServiceClient(
      process.env.NEXT_PUBLIC_HUB_HOST!,
      null,
      { withCredentials: true }  // send cookies on gRPC requests
    ),
    []
  );

  // Fetch channels list
  const refresh = () => {
    hubClient.listChannels(new Empty(), {}, (e, res) => {
      setLoading(false);
      if (e || !res) {
        setErr('Failed to load channels');
        return;
      }
      setChannels(
        res.getChannelsList().map((c: ChMsg) => ({
          id: c.getId(),
          name: c.getName(),
        }))
      );
    });
  };

  useEffect(refresh, [hubClient]);

  // Create a new channel
  const create = () => {
    const name = newName.trim();
    if (!name) return;
    hubClient.createChannel(
      new CreateReq().setName(name),
      {},
      (_e, res) => {
        if (res?.getOk()) {
          setNewName('');
          refresh();
        } else {
          alert(res?.getMessage() || 'Error creating');
        }
      }
    );
  };

  // Delete an existing channel
  const del = (id: string) => {
    if (!confirm(`Delete channel “${id}”?`)) return;
    hubClient.deleteChannel(
      new DeleteReq().setId(id),
      {},
      (_e, res) => {
        if (res?.getOk()) refresh();
        else alert(res?.getMessage() || 'Error deleting');
      }
    );
  };

  // Logout: clear cookie via API and redirect
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) return <div className="p-4 text-gray-400">Loading…</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;

  return (
    <div className="flex h-screen bg-[#2f3136]">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col p-4 bg-[#202225]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Channels</h2>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {channels.map((c) => (
            <div key={c.id} className="flex items-center">
              <Link
                href={`/channel/${c.id}`}
                className="
                  flex-1 px-3 py-2 rounded-md
                  text-gray-300 hover:bg-[#40444b] hover:text-white
                  transition
                "
              >
                {c.name}
              </Link>
              {c.id !== 'Main' && (
                <button
                  onClick={() => del(c.id)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                  title="Delete"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Create new (pinned to bottom) */}
        <div className="mt-auto flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New channel…"
            className="
              flex-1 px-3 py-2 rounded bg-[#36393F] text-gray-200
              placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7289DA]
            "
          />
          <button
            onClick={create}
            disabled={!newName.trim() || channels.length >= 8}
            className="
              w-10 h-10 flex items-center justify-center
              bg-[#7289DA] text-white rounded-md
              hover:bg-[#5b6eae] cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
      </aside>

      {/* Main / instructions */}
      <main className="flex-1 flex items-center justify-center text-gray-400">
        Select a channel on the left to chat.
      </main>
    </div>
  );
}
