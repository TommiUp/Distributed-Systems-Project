'use client';

import { useEffect, useState, useMemo } from 'react';
import * as grpcWeb from 'grpc-web';
import {
  HubServiceClient,
} from '@/generated/Hub_serviceServiceClientPb';
import {
  Empty, ChannelListRes, Channel as ChMsg,
  CreateReq, DeleteReq, BoolRes,
} from '@/generated/hub_service_pb';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ───────── helpers ───────── */
const readJwt = () => {
  const m = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};
const md = (): grpcWeb.Metadata => {
  const t = readJwt();
  return t ? { authorization: `Bearer ${t}` } : {};
};

/* ───────── component ─────── */
interface Channel { id: string; name: string }

export default function ChannelsPage() {
  const router         = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newName,  setNewName]  = useState('');
  const [err, setErr]          = useState<string|null>(null);
  const [loading, setLoading]  = useState(true);

  const hubClient = useMemo(
    () => new HubServiceClient(process.env.NEXT_PUBLIC_HUB_HOST!, null, null),
    []
  );

  /* -------- fetch list -------- */
  const refresh = () => {
    hubClient.listChannels(new Empty(), md(), (e, res: ChannelListRes|null) => {
      setLoading(false);
      if (e || !res) { setErr('Load failed'); return; }
      setChannels(res.getChannelsList().map(
        (c:ChMsg) => ({ id: c.getId(), name: c.getName() })
      ));
    });
  };
  useEffect(refresh, [hubClient]);

  /* -------- create -------- */
  const create = () => {
    const name = newName.trim();
    if (!name) return;
    hubClient.createChannel(new CreateReq().setName(name), md(),
      (_e, res: BoolRes|null) => {
        if (res?.getOk()) { setNewName(''); refresh(); }
        else               { alert(res?.getMessage() || 'error'); }
      });
  };

  /* -------- delete -------- */
  const del = (id: string) => {
    if (!confirm(`Delete channel “${id}” and its history?`)) return;
    hubClient.deleteChannel(new DeleteReq().setId(id), md(),
      (_e, res: BoolRes|null) => {
        if (res?.getOk()) refresh();
        else              alert(res?.getMessage() || 'error');
      });
  };

  /* -------- logout -------- */
  const logout = () => {
    document.cookie = 'access_token=; Max-Age=0; path=/;';   // clear cookie
    router.push('/login');
  };

  /* -------- render -------- */
  if (loading) return <div>Loading…</div>;
  if (err)     return <div className="text-red-600">{err}</div>;

  return (
    <aside className="w-64 border-r min-h-screen p-4 flex flex-col gap-4">

      {/* header row */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          Channels ({channels.length}/8)
        </h2>
        <button className="text-sm text-red-600" onClick={logout}>
          Logout
        </button>
      </div>

      {/* list */}
      <div className="flex-1 space-y-1">
        {channels.map(c => (
          <div key={c.id} className="flex justify-between items-center">
            <Link
              href={`/channel/${c.id}`}
              className="flex-1 py-1 px-2 rounded hover:bg-gray-100"
            >
              {c.name}
            </Link>
            {c.id !== 'Main' && (
              <button
                onClick={() => del(c.id)}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* create */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="input flex-1"
          placeholder="New channel…"
        />
        <button
          onClick={create}
          disabled={!newName.trim() || channels.length >= 8}
          className="btn"
        >
          +
        </button>
      </div>
    </aside>
  );
}
