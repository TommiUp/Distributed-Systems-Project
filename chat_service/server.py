import os, asyncio, jwt
from datetime import datetime
from collections import defaultdict
import grpc
from grpc import aio
from motor.motor_asyncio import AsyncIOMotorClient

from proto import chat_service_pb2 as pb, chat_service_pb2_grpc as svc

# ───────── configuration ─────────
SECRET = os.getenv("SECRET_KEY", "dev")
DB     = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://mongodb:27017"))["chatdb"]

hub_queues:  dict[str, asyncio.Queue] = {}
hub_channel: dict[str, str]           = {}          # user → current channel
hub_members: defaultdict[str, set]    = defaultdict(set)

def utc_ms() -> int:            # unix epoch in milliseconds
    return int(datetime.utcnow().timestamp() * 1000)

# ───────── helpers ─────────
def ensure_member(user: str, ch: str):
    old = hub_channel.get(user)
    if old == ch:
        return
    if old:
        hub_members[old].discard(user)
    hub_channel[user] = ch
    hub_members[ch].add(user)

def user_from_ctx(ctx) -> str | None:
    for k, v in (ctx.invocation_metadata() or []):
        if k.lower() == "authorization" and v.startswith("Bearer "):
            try:
                return jwt.decode(v[7:], SECRET, algorithms=["HS256"])["sub"]
            except jwt.InvalidTokenError:
                return None
    return None

async def unicast(user: str, env):
    q = hub_queues.get(user)
    if q: await q.put(env)

async def broadcast(ch: str, env, *, exclude=None):
    for u in hub_members[ch]:
        if u != exclude:
            await unicast(u, env)

# ───────── service ─────────
class ChatService(svc.ChatServiceServicer):

    # ---------- server stream for browsers ----------
    async def SubscribeChat(self, init: pb.Init, ctx):
        try:
            user = jwt.decode(init.token, SECRET, algorithms=["HS256"])["sub"]
        except jwt.InvalidTokenError:
            yield pb.ServerEnvelope(notice="Invalid token")
            return

        q = asyncio.Queue()
        hub_queues[user] = q
        ensure_member(user, "Main")
        await q.put(pb.ServerEnvelope(notice=f"Welcome {user}!"))

        try:
            while True:
                yield await q.get()
        finally:
            ch = hub_channel.pop(user, None)
            if ch:
                hub_members[ch].discard(user)
            hub_queues.pop(user, None)

    # ---------- unary helpers for browsers ----------
    async def JoinChannel(self, req: pb.JoinReq, ctx):
        user = user_from_ctx(ctx) or "anon"
        ensure_member(user, req.name or "Main")
        return pb.Empty()

    async def SendChannelMsg(self, msg: pb.ChannelMsg, ctx):
        user = user_from_ctx(ctx) or "anon"
        ch   = msg.channel or "Main"
        ensure_member(user, ch)

        ts = utc_ms()
        body = msg.body
        await DB.messages.insert_one({"channel": ch, "sender": user,
                                      "body": body, "ts": ts})
        await broadcast(ch, pb.ServerEnvelope(
            cm=pb.ChannelMsg(channel=ch, body=f"{user}: {body}", ts=ts)
        ))
        return pb.Empty()

    async def SendPrivateMsg(self, pm: pb.PrivateMsg, ctx):
        sender = user_from_ctx(ctx) or "anon"
        ts     = utc_ms()

        # store once (use a synthetic channel ID ">pm<recipient>" for indexing)
        await DB.messages.insert_one({"recipient": pm.recipient, "sender": sender,
                                      "body": pm.body, "ts": ts})

        env = pb.ServerEnvelope(pm=pb.PrivateMsg(
            recipient=pm.recipient,
            body=f"(private) {sender}: {pm.body}",
            ts=ts
        ))

        # deliver to both sides
        await unicast(pm.recipient, env)
        await unicast(sender, env)
        return pb.Empty()

    async def GetHistory(self, req: pb.HistoryReq, _ctx):
        cur = DB.messages.find({"channel": req.channel},
                               sort=[("ts", -1)], limit=req.limit)
        items = [pb.ChannelMsg(channel=req.channel,
                               body=f"{d['sender']}: {d['body']}",
                               ts=d['ts'])
                 async for d in cur][::-1]
        return pb.HistoryRes(items=items)

    # ---------- unchanged bidirectional stream for CLI ----------
    async def Chat(self, req_iter, ctx):
        send_q = asyncio.Queue()
        user   = None

        async def consumer():
            nonlocal user
            async for env in req_iter:
                kind = env.WhichOneof("payload")
                if kind == "init":
                    try:
                        user = jwt.decode(env.init.token, SECRET,
                                          algorithms=["HS256"])["sub"]
                        hub_queues[user] = send_q
                        ensure_member(user, "Main")
                        await send_q.put(pb.ServerEnvelope(
                            notice=f"Welcome {user}!"))
                    except jwt.InvalidTokenError:
                        await send_q.put(pb.ServerEnvelope(
                            notice="Invalid token"))
                        break
                elif kind == "join":
                    ensure_member(user, env.join.name or "Main")
                elif kind == "cm":
                    ch, body = hub_channel[user], env.cm.body
                    await self.SendChannelMsg(
                        pb.ChannelMsg(channel=ch, body=body), ctx)

        asyncio.create_task(consumer())
        try:
            while True:
                yield await send_q.get()
        finally:
            if user:
                ch = hub_channel.pop(user, None)
                if ch:
                    hub_members[ch].discard(user)
                hub_queues.pop(user, None)

# ---------- bootstrap ----------
async def main():
    server = aio.server()
    svc.add_ChatServiceServicer_to_server(ChatService(), server)
    server.add_insecure_port("[::]:50053")
    await server.start()
    print("ChatService listening on :50053")
    await server.wait_for_termination()

if __name__ == "__main__":
    asyncio.run(main())
