'use client';

import { useEffect, useState } from 'react';
import * as grpcWeb from 'grpc-web';
import { HubServiceClient } from '@/generated/Hub_serviceServiceClientPb';
import {
  Empty,
  ChannelListResponse,
  Channel as ChannelMsg,
} from '@/generated/hub_service_pb';
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hubHost = process.env.NEXT_PUBLIC_HUB_HOST!;

  useEffect(() => {
    setError(null);

    const client = new HubServiceClient(hubHost, null, null);
    const req = new Empty();

    client.listChannels(
      req,
      {},
      (err: grpcWeb.RpcError, resp: ChannelListResponse | null) => {
        if (err || !resp) {
          console.error('listChannels gRPC error:', err);
          setError('Could not load channels.');
          setLoading(false);
          return;
        }

        const result: Channel[] = resp.getChannelsList().map((ch: ChannelMsg) => ({
          id: ch.getId(),
          name: ch.getName(),
        }));

        setChannels(result);
        setLoading(false);
      },
    );
  }, [hubHost]);           // ← stable dependency

  if (loading) return <div>Loading channels…</div>;
  if (error)   return <div className="text-red-600">{error}</div>;

  return (
    <aside className="w-64 border-r min-h-screen p-4">
      <h2 className="text-lg font-bold mb-4">Channels</h2>
      {channels.map((c) => (
        <Link
          key={c.id}
          href={`/channel/${c.id}`}
          className="block py-2 px-3 rounded hover:bg-gray-100"
        >
          {c.name}
        </Link>
      ))}
    </aside>
  );
}
