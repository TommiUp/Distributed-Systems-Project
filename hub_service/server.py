import os
import grpc
from concurrent import futures
import time
import jwt
from dotenv import load_dotenv
load_dotenv()

from proto.hub_service_pb2 import EnterHubResponse, LogoutResponse
from proto.hub_service_pb2_grpc import HubServiceServicer, add_HubServiceServicer_to_server

# Same secret key as in user_service so tokens can be validated
SECRET_KEY = os.getenv("SECRET_KEY", "dev")
ALGORITHM = "HS256"

# Holds active tokens
active_tokens = set()

class HubService(HubServiceServicer):
    def EnterHub(self, request, context):
        token = request.token
        try:
            # Validate the JWT token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Add token to active set if valid
            active_tokens.add(token)

            username = payload.get("sub", "Unknown")
            return EnterHubResponse(success=True, message=f"Welcome to the hub, {username}!")
        except jwt.ExpiredSignatureError:
            return EnterHubResponse(success=False, message="Token has expired.")
        except jwt.InvalidTokenError:
            return EnterHubResponse(success=False, message="Invalid token.")

    def Logout(self, request, context):
        token = request.token
        if token in active_tokens:
            active_tokens.remove(token)
            return LogoutResponse(success=True, message="Logout successful. Token invalidated.")
        else:
            return LogoutResponse(success=False, message="Token not found or already logged out.")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_HubServiceServicer_to_server(HubService(), server)
    server.add_insecure_port('[::]:50052')
    server.start()
    print("Hub Service is running on port 50052...")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()