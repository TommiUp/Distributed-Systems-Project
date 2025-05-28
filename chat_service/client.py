import os, sys, asyncio, contextlib, grpc, jwt
# load proto stubs at runtime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "proto"))
import chat_service_pb2 as pb
import chat_service_pb2_grpc as pb_grpc

ADDR = os.getenv("CHAT_ADDR", "localhost:50053")

async def _chat_session(token: str):
    async with grpc.aio.insecure_channel(ADDR) as channel:
        stub = pb_grpc.ChatServiceStub(channel)
        stream = stub.Chat()

        # authenticate
        await stream.write(pb.ClientEnvelope(init=pb.Init(token=token)))

        print(
            "\nCommands:\n"
            "/join <channel>\n"
            "/leave <channel>\n"
            "/pm <user> <msg>\n"
            "/quit\n"
            "Any other text → channel message"
        )

        async def sender():
            loop = asyncio.get_event_loop()
            while True:
                line = await loop.run_in_executor(None, sys.stdin.readline)
                if not line: continue
                cmd = line.rstrip("\n")
                if cmd == "/quit":
                    await stream.done_writing()
                    break
                elif cmd.startswith("/join "):
                    await stream.write(pb.ClientEnvelope(
                        join=pb.JoinChannel(name=cmd.split(" ",1)[1])))
                elif cmd.startswith("/leave "):
                    await stream.write(pb.ClientEnvelope(
                        leave=pb.LeaveChannel(name=cmd.split(" ",1)[1])))
                elif cmd.startswith("/pm "):
                    _, rest = cmd.split(" ",1)
                    user, msg = rest.split(" ",1)
                    await stream.write(pb.ClientEnvelope(
                        pm=pb.PrivateMsg(recipient=user, body=msg)))
                else:
                    await stream.write(pb.ClientEnvelope(
                        cm=pb.ChannelMsg(channel="", body=cmd)))

        async def receiver():
            try:
                async for srv in stream:
                    kind = srv.WhichOneof("payload")
                    if kind == "notice":
                        print(f"\n{srv.notice}")
                    elif kind == "cm":
                        print(f"[{srv.cm.channel}] {srv.cm.body}")
                    elif kind == "pm":
                        print(srv.pm.body)
                    elif kind == "history_res":
                        for m in srv.history_res.items:
                            print(f"[history:{m.channel}] {m.body}")
                        print()
            except grpc.aio.AioRpcError:
                pass

        recv = asyncio.create_task(receiver())
        await sender()
        recv.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await recv

def run_chat(token: str):
    try:
        asyncio.run(_chat_session(token))
    except KeyboardInterrupt:
        print("\nReturning to hub...")

if __name__ == "__main__":
    tok = input("Enter your JWT token: ")
    run_chat(tok)
