'use client';

import { useEffect, useState, useMemo } from 'react';
import * as grpcWeb from 'grpc-web';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';

import { ChatServiceClient } from '@/generated/Chat_serviceServiceClientPb';
import {
  Init,
  ChannelMsg,
  JoinReq,
  HistoryReq,
  ServerEnvelope,
} from '@/generated/chat_service_pb';

import { HubServiceClient } from '@/generated/Hub_serviceServiceClientPb';
import {
  Empty,
  Channel as ChMsg,
  CreateReq,
  DeleteReq,
} from '@/generated/hub_service_pb';

type Msg     = { user: string; text: string; ts: number };
type Channel = { id: string; name: string };

export default function ChannelPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // — auth / metadata —
  const token = () =>
    decodeURIComponent(
      document.cookie.match(/(?:^|; )access_token=([^;]+)/)?.[1] || ''
    );
  const md = (): grpcWeb.Metadata =>
    token() ? { authorization: `Bearer ${token()}` } : {};
  const logout = () => {
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  // — sidebar (channels CRUD) —
  const [channels, setChannels]       = useState<Channel[]>([]);
  const [newName, setNewName]         = useState('');
  const [chanErr, setChanErr]         = useState<string|null>(null);
  const [chanLoading, setChanLoading] = useState(true);

  const hubClient = useMemo(
    () => new HubServiceClient(process.env.NEXT_PUBLIC_HUB_HOST!, null, null),
    []
  );

  const fetchChannels = () => {
    hubClient.listChannels(new Empty(), md(), (e, res) => {
      setChanLoading(false);
      if (e || !res) {
        setChanErr('Failed to load channels');
        return;
      }
      setChannels(
        res.getChannelsList().map((c: ChMsg) => ({
          id:   c.getId(),
          name: c.getName(),
        }))
      );
    });
  };
  useEffect(fetchChannels, [hubClient]);

  const createChannel = () => {
    const name = newName.trim();
    if (!name) return;
    hubClient.createChannel(new CreateReq().setName(name), md(), (_e, res) => {
      if (res?.getOk()) {
        setNewName('');
        fetchChannels();
      } else {
        alert(res?.getMessage() || 'Error creating');
      }
    });
  };

  const deleteChannel = (cid: string) => {
    if (!confirm(`Delete channel “${cid}”?`)) return;
    hubClient.deleteChannel(new DeleteReq().setId(cid), md(), (_e, res) => {
      if (res?.getOk()) {
        if (cid === id) router.push('/channels');
        fetchChannels();
      } else {
        alert(res?.getMessage() || 'Error deleting');
      }
    });
  };

  // — chat (history + live) —
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState('');

  const chat = useMemo(
    () =>
      new ChatServiceClient(
        process.env.NEXT_PUBLIC_CHAT_HOST!,
        null,
        null
      ),
    []
  );

  const push = (m: Msg) => setMessages(p => [...p, m]);
  const stripUser = (s: string) => s.split(':',1)[0] || 'anon';
  const stripText = (s: string) => s.slice(s.indexOf(':')+1).trim();

  useEffect(() => {
    if (!token()) {
      router.push('/login');
      return;
    }

    chat.joinChannel(new JoinReq().setName(id), md(), () => {});
    chat.getHistory(new HistoryReq().setChannel(id).setLimit(200), md(),
      (_e, res) => res?.getItemsList().forEach(m =>
        push({
          user: stripUser(m.getBody()),
          text: stripText(m.getBody()),
          ts:   m.getTs(),
        })
      )
    );

    const stream = chat.subscribeChat(new Init().setToken(token()), {});
    stream.on('data', (e: ServerEnvelope) => {
      if (e.getNotice()) {
        push({ user: 'System', text: e.getNotice()!, ts: Date.now() });
      }
      const cm = e.getCm();
      if (cm) {
        push({
          user: stripUser(cm.getBody()),
          text: stripText(cm.getBody()),
          ts:   cm.getTs(),
        });
      }
      const pm = e.getPm();
      if (pm) {
        push({ user: '(private)', text: pm.getBody(), ts: pm.getTs() });
      }
    });
    stream.on('error', console.error);
    return () => stream.cancel();
  }, [chat, id, router]);

  const send = () => {
    const body = input.trim();
    if (!body) return;
    chat.sendChannelMsg(
      new ChannelMsg().setChannel(id).setBody(body),
      md(),
      err => err && console.error(err)
    );
    setInput('');
  };

  // timestamp formatter
  const fmt = (ts: number) =>
    dayjs(ts).isSame(dayjs(), 'day')
      ? dayjs(ts).format('HH:mm')
      : dayjs(ts).format('D MMM YYYY HH:mm');

  // — render —
  if (chanLoading) return <div className="p-4 text-gray-400">Loading…</div>;
  if (chanErr)     return <div className="p-4 text-red-500">{chanErr}</div>;

  let lastDate = '';

  return (
    <div className="flex h-screen bg-[#2f3136]">
      {/* sidebar */}
      <aside className="w-72 flex flex-col p-4 bg-[#202225]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Channels</h2>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {channels.map(c => (
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
                  onClick={() => deleteChannel(c.id)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New channel…"
            className="
              flex-1 px-3 py-2 rounded bg-[#36393F] text-gray-200
              placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7289DA]
            "
          />
          <button
            onClick={createChannel}
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

      {/* chat area */}
      <main className="flex-1 flex flex-col">
        <header className="px-4 py-2 bg-[#36393f] border-b border-[#40444b] flex items-center">
          {/* ← back to hub */}
          <button
            onClick={() => router.push('/channels')}
            className="text-gray-400 hover:text-white mr-4"
          >
            ←
          </button>
          <h1 className="text-white font-semibold">#{id}</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {messages.map((m, i) => {
            const dayKey   = dayjs(m.ts).format('YYYY-MM-DD');
            const isNotice = m.user === 'System';
            const showSep  = !isNotice && dayKey !== lastDate;
            lastDate      = dayKey;

            return (
              <div key={i} className="mb-4">
                {showSep && (
                  <div className="flex items-center text-gray-400 text-xs my-4">
                    <hr className="flex-1 border-[#40444b]" />
                    <span className="mx-2 whitespace-nowrap">
                      {dayjs(m.ts).format('D MMM YYYY')}
                    </span>
                    <hr className="flex-1 border-[#40444b]" />
                  </div>
                )}

                {/* Username + timestamp */}
                <div className="flex items-center gap-2">
                  <strong
                    className={isNotice ? 'text-[#7289DA]' : 'text-white'}
                  >
                    {m.user}
                  </strong>
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {fmt(m.ts)}
                  </span>
                </div>

                {/* Message body */}
                <div className="ml-14 text-gray-200 break-words">
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* input */}
        <div className="px-4 py-3 bg-[#36393f] border-t border-[#40444b] flex gap-2">
          <input
            className="
              flex-1 px-3 py-2 bg-[#202225] text-white rounded
              focus:outline-none focus:ring-2 focus:ring-[#7289da]
            "
            placeholder={`Message #${id}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            className="px-4 py-2 bg-[#7289da] text-white rounded hover:bg-opacity-90"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
