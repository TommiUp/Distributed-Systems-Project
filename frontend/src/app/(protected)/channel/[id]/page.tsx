'use client';

import { useEffect, useState, useMemo } from 'react';
import * as grpcWeb from 'grpc-web';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';

import { ChatServiceClient } from '@/generated/Chat_serviceServiceClientPb';
import {
  Init,
  ChannelMsg,
  JoinReq,
  HistoryReq,
  ServerEnvelope,
} from '@/generated/chat_service_pb';

/* ──────── local types ──────── */
type Msg = { user: string; text: string; ts: number };

/* ──────── component ────────── */
export default function ChannelPage() {
  const router          = useRouter();
  const { id }          = useParams() as { id: string };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,    setInput]    = useState('');

  /*  helpers  */
  const token = () =>
    decodeURIComponent(
      document.cookie.match(/(?:^|; )access_token=([^;]+)/)?.[1] || ''
    );

  const md = (): grpcWeb.Metadata =>
    token() ? { authorization: `Bearer ${token()}` } : {};

  /*  grpc-web client (memoised)  */
  const chat = useMemo(
    () =>
      new ChatServiceClient(
        process.env.NEXT_PUBLIC_CHAT_HOST!,
        null,
        null,
      ),
    [],
  );

  /*  strip "user: text" helpers  */
  const stripUser = (s: string) => s.split(':', 1)[0] || 'anon';
  const stripText = (s: string) => s.slice(s.indexOf(':') + 1).trim();

  /*  push message into state  */
  const push = (m: Msg) => setMessages((p) => [...p, m]);

  /*  on-mount: join → history → live stream  */
  useEffect(() => {
    if (!token()) {
      router.push('/login');
      return;
    }

    /* 0) explicit join so server tracks us */
    chat.joinChannel(new JoinReq().setName(id), md(), () => {});

    /* 1) fetch history */
    chat.getHistory(
      new HistoryReq().setChannel(id).setLimit(200),
      md(),
      (_, res) =>
        res
          ?.getItemsList()
          .forEach((m) =>
            push({
              user: stripUser(m.getBody()),
              text: stripText(m.getBody()),
              ts: m.getTs(),
            }),
          ),
    );

    /* 2) open live stream */
    const stream = chat.subscribeChat(new Init().setToken(token()), {});
    stream.on('data', (e: ServerEnvelope) => {
      /* notice */
      if (e.getNotice()) {
        push({
          user: 'System',
          text: e.getNotice()!,
          ts: Date.now(),
        });
      }

      /* channel msg */
      const cm = e.getCm();
      if (cm) {
        push({
          user: stripUser(cm.getBody()),
          text: stripText(cm.getBody()),
          ts: cm.getTs(),
        });
      }

      /* private msg */
      const pm = e.getPm();
      if (pm) {
        push({
          user: '(private)',
          text: pm.getBody(),
          ts: pm.getTs(),
        });
      }
    });
    stream.on('error', console.error);

    return () => stream.cancel(); // cleanup
  }, [chat, id, router]);

  /*  send handler  */
  const send = () => {
    const body = input.trim();
    if (!body) return;

    chat.sendChannelMsg(
      new ChannelMsg().setChannel(id).setBody(body),
      md(),
      (err) => err && console.error(err),
    );
    setInput('');
  };

  /*  ts → “HH:mm” | “D MMM YYYY HH:mm”  */
  const fmt = (ts: number) =>
    dayjs(ts).isSame(dayjs(), 'day')
      ? dayjs(ts).format('HH:mm')
      : dayjs(ts).format('D MMM YYYY HH:mm');

  /* ──────── render ─────────── */
  let lastDate = '';

  return (
    <main className="flex flex-col h-screen p-4">
      {/* back link */}
      <button
        onClick={() => router.push('/channels')}
        className="mb-4 text-sm hover:underline"
      >
        ← Back to Hub
      </button>

      {/* message list */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-2 border rounded p-2">
        {messages.map((m, i) => {
          const curDate = dayjs(m.ts).format('YYYY-MM-DD');
          const showSep = curDate !== lastDate;
          lastDate = curDate;

          return (
            <div key={i}>
              {showSep && (
                <div className="my-4 flex items-center gap-2">
                  <hr className="flex-1 border-gray-600" />
                  <span className="text-xs text-gray-400">
                    {dayjs(m.ts).format('D MMMM YYYY')}
                  </span>
                  <hr className="flex-1 border-gray-600" />
                </div>
              )}
              <span className="text-gray-400 text-xs mr-2">{fmt(m.ts)}</span>
              <strong>{m.user}:</strong> {m.text}
            </div>
          );
        })}
      </div>

      {/* input row */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={input}
          placeholder="Type ↵ to send…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn" onClick={send}>
          Send
        </button>
      </div>
    </main>
  );
}
