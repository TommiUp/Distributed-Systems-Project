'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as grpcWeb from 'grpc-web';

import { ChatServiceClient } from '@/generated/Chat_serviceServiceClientPb';
import {
  Init,
  ChannelMsg,
  ServerEnvelope,
} from '@/generated/chat_service_pb';

import { useRouter, useParams } from 'next/navigation';

interface ChatLine { user: string; text: string }

export default function ChannelPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };   // “Main”, “testi”, …
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [input, setInput]       = useState('');

  // keep track of the server-stream so we can cancel on unmount
  const streamRef = useRef<grpcWeb.ClientReadableStream<ServerEnvelope> | null>(null);

  /* ───────── helpers ───────── */
  const readJwt = () => {
    const m = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  };

  /* ───────── gRPC client ───── */
  const chatHost   = process.env.NEXT_PUBLIC_CHAT_HOST!;
  const chatClient = useMemo(
    () => new ChatServiceClient(chatHost, null, null),
    [chatHost]
  );

  /* ───────── effect: open stream ──────── */
  useEffect(() => {
    const token = readJwt();
    if (!token) { router.push('/login'); return; }

    // 1) create Init(token) and open server-stream
    const initReq = new Init();
    initReq.setToken(token);
    const stream  = chatClient.subscribeChat(initReq, {});   // metadata = {}

    streamRef.current = stream;

    // 2) receive messages
    stream.on('data', (srv: ServerEnvelope) => {
      switch (srv.getPayloadCase()) {
        case ServerEnvelope.PayloadCase.NOTICE:
          setMessages(p => [...p, { user: 'System', text: srv.getNotice() }]);
          break;
        case ServerEnvelope.PayloadCase.CM: {
          const cm = srv.getCm()!;
          setMessages(p => [...p, { user: `[${cm.getChannel()}]`, text: cm.getBody() }]);
          break;
        }
        case ServerEnvelope.PayloadCase.PM: {
          const pm = srv.getPm()!;
          setMessages(p => [...p, { user: '(private)', text: pm.getBody() }]);
          break;
        }
        case ServerEnvelope.PayloadCase.HISTORY_RES:
          srv.getHistoryRes()!.getItemsList().forEach(m =>
            setMessages(p => [...p, { user: `[history:${m.getChannel()}]`, text: m.getBody() }])
          );
          break;
      }
    });
    stream.on('error', (err: grpcWeb.RpcError) =>
      console.error('Chat stream error:', err)
    );
    stream.on('end', () => console.log('Chat stream ended'));

    // 3) cleanup on unmount
    return () => stream.cancel();
  }, [chatClient, router]);

  /* ───────── send message ───── */
  const sendMsg = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const cmReq = new ChannelMsg();
    cmReq.setChannel(id);        // “Main”, “testi”, …
    cmReq.setBody(trimmed);

    chatClient.sendChannelMsg(cmReq, {}, (err) => {
      if (err) console.error('sendChannelMsg error:', err);
    });
  };

  /* ───────── UI ─────────────── */
  return (
    <main className="flex-1 flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto mb-2 border rounded p-2">
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.user}:</strong> {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type ↵ to send…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { sendMsg(input); setInput(''); }
          }}
        />
        <button
          className="btn"
          onClick={() => { sendMsg(input); setInput(''); }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
