import os, asyncio, jwt
from datetime import datetime
from collections import defaultdict

import grpc
from grpc import aio
from motor.motor_asyncio import AsyncIOMotorClient

from proto import chat_service_pb2 as pb, chat_service_pb2_grpc as svc

# ─────────── configuration ───────────
SECRET = os.getenv("SECRET_KEY", "dev")
DB     = AsyncIOMotorClient(
            os.getenv("MONGO_URI", "mongodb://mongodb:27017")
        )["chatdb"]

hub_queues, hub_channel, hub_members = {}, {}, defaultdict(set)
def utc(): return datetime.utcnow()

# ─────────── helper functions ─────────
async def unicast(user, env):
    q = hub_queues.get(user)
    if q: await q.put(env)

async def broadcast(ch, env, *, exclude=None):
    for u in hub_members[ch]:
        if u != exclude:
            await unicast(u, env)

def login(user, q):
    hub_queues[user]  = q
    hub_channel[user] = "Main"
    hub_members["Main"].add(user)

def logout(user):
    ch = hub_channel.pop(user, None)
    if ch: hub_members[ch].discard(user)
    hub_queues.pop(user, None)

# ---- extract caller from gRPC metadata ----
def user_from_ctx(ctx):
    for k, v in ctx.invocation_metadata():
        if k == "authorization" and v.startswith("Bearer "):
            token = v[7:]
            try:
                return jwt.decode(token, SECRET, algorithms=["HS256"])["sub"]
            except jwt.InvalidTokenError:
                return None
    return None

# ─────────── service implementation ─────────
class ChatService(svc.ChatServiceServicer):

    # ---------- bidirectional stream (CLI) ----------
    async def Chat(self, req_iter, ctx):
        send_q = asyncio.Queue()
        user   = None

        async def consumer():
            nonlocal user
            async for env in req_iter:
                kind = env.WhichOneof("payload")

                if kind == "init":
                    try:
                        user = jwt.decode(env.init.token, SECRET, algorithms=["HS256"])["sub"]
                        login(user, send_q)
                        await send_q.put(pb.ServerEnvelope(notice=f"Welcome {user}!"))
                        await self._history("Main", send_q)
                    except jwt.InvalidTokenError:
                        await send_q.put(pb.ServerEnvelope(notice="Invalid token"))
                        break

                elif kind in ("join", "leave"):
                    new = env.join.name if kind == "join" else "Main"
                    old = hub_channel[user]
                    if new == old:
                        await send_q.put(pb.ServerEnvelope(notice=f"Already in {new}"))
                        continue
                    hub_members[old].discard(user)
                    await broadcast(old, pb.ServerEnvelope(notice=f"{user} left {old}"), exclude=user)
                    hub_channel[user] = new
                    hub_members[new].add(user)
                    await send_q.put(pb.ServerEnvelope(notice=f"Joined {new}"))
                    await broadcast(new, pb.ServerEnvelope(notice=f"{user} joined {new}"), exclude=user)
                    await self._history(new, send_q)

                elif kind == "cm":
                    ch, body = hub_channel[user], env.cm.body
                    await DB.messages.insert_one({"channel": ch, "sender": user, "body": body, "ts": utc()})
                    await broadcast(ch, pb.ServerEnvelope(
                        cm=pb.ChannelMsg(channel=ch, body=f"{user}: {body}")
                    ))

                elif kind == "pm":
                    pm = env.pm
                    body = pm.body
                    await DB.messages.insert_one({"recipient": pm.recipient, "sender": user, "body": body, "ts": utc()})
                    await unicast(pm.recipient, pb.ServerEnvelope(
                        pm=pb.PrivateMsg(recipient=pm.recipient, body=f"(private) {user}: {body}")
                    ))
                    await send_q.put(pb.ServerEnvelope(
                        pm=pb.PrivateMsg(recipient=pm.recipient, body=f"(to {pm.recipient}) {body}")
                    ))

        asyncio.create_task(consumer())
        try:
            while True:
                yield await send_q.get()
        finally:
            if user: logout(user)

    # ---------- browser : server stream ----------
    async def SubscribeChat(self, init: pb.Init, ctx):
        send_q = asyncio.Queue()
        try:
            user = jwt.decode(init.token, SECRET, algorithms=["HS256"])["sub"]
        except jwt.InvalidTokenError:
            yield pb.ServerEnvelope(notice="Invalid token")
            return

        login(user, send_q)
        await send_q.put(pb.ServerEnvelope(notice=f"Welcome {user}!"))
        await self._history("Main", send_q)

        try:
            while True:
                yield await send_q.get()
        finally:
            logout(user)

    # ---------- browser : unary send ----------
    async def SendChannelMsg(self, msg: pb.ChannelMsg, ctx):
        user = user_from_ctx(ctx) or "anon"
        ch   = msg.channel or "Main"
        body = msg.body

        await DB.messages.insert_one({"channel": ch, "sender": user, "body": body, "ts": utc()})
        await broadcast(ch, pb.ServerEnvelope(
            cm=pb.ChannelMsg(channel=ch, body=f"{user}: {body}")
        ))
        return pb.Empty()

    async def SendPrivateMsg(self, pm: pb.PrivateMsg, ctx):
        user = user_from_ctx(ctx) or "anon"
        await DB.messages.insert_one({"recipient": pm.recipient, "sender": user, "body": pm.body, "ts": utc()})
        await unicast(pm.recipient, pb.ServerEnvelope(
            pm=pb.PrivateMsg(recipient=pm.recipient, body=f"(private) {user}: {pm.body}")
        ))
        return pb.Empty()

    async def GetHistory(self, req: pb.HistoryReq, ctx):
        cur = DB.messages.find({"channel": req.channel},
                                sort=[("ts", -1)], limit=req.limit)
        items = [pb.ChannelMsg(channel=req.channel,
                               body=f"{d['sender']}: {d['body']}")
                 async for d in cur][::-1]
        return pb.HistoryRes(items=items)

    # ---------- internal ----------
    async def _history(self, channel, q, limit=100):
        cur = DB.messages.find({"channel": channel},
                               sort=[("ts", -1)], limit=limit)
        items = [pb.ChannelMsg(channel=channel,
                               body=f"{d['sender']}: {d['body']}")
                 async for d in cur][::-1]
        if items:
            await q.put(pb.ServerEnvelope(history_res=pb.HistoryRes(items=items)))

# ─────────── bootstrap ───────────
async def main():
    server = aio.server()
    svc.add_ChatServiceServicer_to_server(ChatService(), server)
    server.add_insecure_port("[::]:50053")
    await server.start()
    print("ChatService listening on :50053")
    await server.wait_for_termination()

if __name__ == "__main__":
    asyncio.run(main())
