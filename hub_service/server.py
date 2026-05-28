import os, time, jwt, grpc
from concurrent import futures
from collections import OrderedDict
from dotenv import load_dotenv
from urllib.parse import quote, unquote

# ─────────────────── synchronous Mongo helper ────────────────────
from pymongo import MongoClient

# ----------------------------------------------------------------------
load_dotenv()

SECRET_KEY   = os.getenv("SECRET_KEY", "dev")
ALGO         = "HS256"
MAX_CHANNELS = 8
MONGO_URI    = os.getenv("MONGO_URI", "mongodb://mongodb:27017")

# one global PyMongo client (thread-safe) ------------------------------
mongo      = MongoClient(MONGO_URI)
messages   = mongo["chatdb"]["messages"]

# --- in-memory hub state ---------------------------------------------
active_tokens: set[str]          = set()
channels: "OrderedDict[str,str]" = OrderedDict({
    "Main":  "Main Channel",
    "testi": "Testi Channel",
})

# --- helper -----------------------------------------------------------
def decode_token(token: str) -> str | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGO])["sub"]
    except jwt.InvalidTokenError:
        return None

# --- gRPC service -----------------------------------------------------
from proto.hub_service_pb2_grpc import HubServiceServicer, add_HubServiceServicer_to_server
from proto.hub_service_pb2 import (
    EnterHubRes, LogoutRes,
    Empty, Channel, ChannelListRes,
    CreateReq, DeleteReq, BoolRes,
)

class HubService(HubServiceServicer):

    # ---------- auth ----------
    def EnterHub(self, req, ctx):
        if (user := decode_token(req.token)) is None:
            return EnterHubRes(success=False, message="Invalid token.")
        active_tokens.add(req.token)
        return EnterHubRes(success=True, message=f"Welcome, {user}!")

    def Logout(self, req, ctx):
        active_tokens.discard(req.token)
        return LogoutRes(success=True, message="Logged out.")

    # ---------- channels ----------
    def ListChannels(self, _req: Empty, _ctx):
        return ChannelListRes(
            channels=[Channel(id=k, name=v) for k, v in channels.items()]
        )

    def CreateChannel(self, req: CreateReq, ctx):
        name = req.name.strip()
        if not name:
            return BoolRes(ok=False, message="Name cannot be empty.")
        if name in channels:
            return BoolRes(ok=False, message="Channel exists.")
        if len(channels) >= MAX_CHANNELS:
            return BoolRes(ok=False, message=f"Channel limit reached ({MAX_CHANNELS}).")
        channels[name] = f"{name}"
        return BoolRes(ok=True,  message="Channel created.")

    def DeleteChannel(self, req: DeleteReq, ctx):
        raw_id = req.id
        decoded_id = unquote(raw_id)
        encoded_id = quote(decoded_id, safe="")

        if decoded_id == "Main":
            return BoolRes(ok=False, message="Cannot delete Main.")

        if channels.pop(decoded_id, None) is None:
            return BoolRes(ok=False, message="Channel not found.")

        result = messages.delete_many({
            "$or": [
                {"channel": decoded_id},
                {"channel": encoded_id},
                {"channel": raw_id},
                {"channel": f"{decoded_id} Channel"},  # optional legacy cleanup
            ]
        })

        print(
            f"[hub] deleted {result.deleted_count} docs for channel "
            f"raw={raw_id!r}, decoded={decoded_id!r}, encoded={encoded_id!r}"
        )

        return BoolRes(ok=True, message="Channel deleted and history purged.")

# --- bootstrap --------------------------------------------------------
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_HubServiceServicer_to_server(HubService(), server)
    server.add_insecure_port("[::]:50052")
    server.start()
    print("HubService running on :50052")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == "__main__":
    serve()
