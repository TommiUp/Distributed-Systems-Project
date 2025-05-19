import grpc
from concurrent import futures
import time
import pymongo
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv
load_dotenv()

# Set up Python path to find generated proto modules
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "proto"))

# Import generated proto classes
from proto import auth_service_pb2
from proto import auth_service_pb2_grpc

# Connect to MongoDB (could easily be scaled horizontally)
mongo_client = pymongo.MongoClient("mongodb://mongodb:27017/")
db = mongo_client["userdb"]
users_collection = db["users"]

# Set up password hashing using bcrypt (secure hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT secret key and settings
SECRET_KEY = os.getenv("SECRET_KEY", "dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Define the AuthService implementation
class AuthServiceServicer(auth_service_pb2_grpc.AuthServiceServicer):
    # Handle user registration
    def Register(self, request, context):
        # Check if username already exists
        if users_collection.find_one({"username": request.username}):
            return auth_service_pb2.RegisterResponse(success=False, message="Username already exists.")
        
        # Store user with hashed password for security
        hashed_password = pwd_context.hash(request.password)
        users_collection.insert_one({"username": request.username, "hashed_password": hashed_password})
        print(f"Registered new user: {request.username}")
        return auth_service_pb2.RegisterResponse(success=True, message="Registration successful.")

    # Handle user login
    def Login(self, request, context):
        user = users_collection.find_one({"username": request.username})
        if user and pwd_context.verify(request.password, user["hashed_password"]):
            # Create a JWT token with an expiration time
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            token = jwt.encode({"sub": request.username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
            print(f"User logged in: {request.username}")
            return auth_service_pb2.LoginResponse(success=True, message="\nLogin successful.", token=token)
        else:
            return auth_service_pb2.LoginResponse(success=False, message="Invalid username or password.", token="")

# Start and run the gRPC server
def serve():
    # Create a gRPC server using a thread pool (scalable to handle multiple concurrent clients)
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    auth_service_pb2_grpc.add_AuthServiceServicer_to_server(AuthServiceServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server is running on port 50051...")
    try:
        while True:
            # Keep the server alive indefinitely, Sleep for a day
            time.sleep(86400)
    except KeyboardInterrupt:
        # Graceful shutdown on Ctrl+C
        server.stop(0)

# Entry point to start the server
if __name__ == '__main__':
    serve()