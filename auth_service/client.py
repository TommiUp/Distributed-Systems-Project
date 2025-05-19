import grpc
import sys
import os

# Set up Python path to find generated proto modules and other services
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "proto"))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import generated proto classes for auth service communication
from proto import auth_service_pb2
from proto import auth_service_pb2_grpc

# Import hub service client to allow transition after login
from hub_service.client import run_hub

# Function to run the auth service client
def run_auth_service_client():
    # Establish insecure gRPC channel to the auth service server
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = auth_service_pb2_grpc.AuthServiceStub(channel)
        token = ""
        try:
            while True:
                # Display auth service menu
                print("\nAuth service menu:")
                print("1. Register")
                print("2. Login")
                print("3. Exit")
                choice = input("Your choice: ")

                if choice == "1":
                    # Handle user registration
                    username = input("Username: ")
                    password = input("Password: ")
                    response = stub.Register(auth_service_pb2.RegisterRequest(username=username, password=password))
                    print(response.message)
                elif choice == "2":
                    # Handle user login and transition to hub service if successful
                    username = input("Username: ")
                    password = input("Password: ")
                    response = stub.Login(auth_service_pb2.LoginRequest(username=username, password=password))
                    print(response.message)
                    if response.success:
                        token = response.token
                        run_hub(token)
                elif choice == "3":
                    # Exit the auth service client
                    print("\nExiting auth service...")
                    break
                else:
                    # Handle invalid input
                    print("Invalid choice, please try again.")
        except KeyboardInterrupt:
                # Handle Ctrl+C interruption gracefully
                print("\n\nExiting auth service...")

# Entry point to start the client
if __name__ == '__main__':
    run_auth_service_client()