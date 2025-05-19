import grpc
import sys
import os

# Added proto directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "proto"))

from hub_service_pb2 import EnterHubRequest, LogoutRequest
from hub_service_pb2_grpc import HubServiceStub

def run_hub(token):
    with grpc.insecure_channel('localhost:50052') as channel:
        stub = HubServiceStub(channel)
        # Verify token and enter chat
        response = stub.EnterHub(EnterHubRequest(token=token))
        if not response.success:
            print("Access denied:", response.message)
            return
        print(response.message)
        # Placeholder menu with logout option
        try:
            while True:
                print("\nMenu:")
                print("1. Placeholder action")
                print("2. Logout")
                choice = input("Your choice: ")
                if choice == "1":
                    print("Placeholder action executed.")
                elif choice == "2":
                    logout_response = stub.Logout(LogoutRequest(token=token))
                    print(logout_response.message)
                    break
                else:
                    print("Invalid choice. Please try again.")
        except KeyboardInterrupt:
            # Handle Ctrl+C by logging out
            print("\nInterrupt received. Logging out...")
            logout_response = stub.Logout(LogoutRequest(token=token))
            print(logout_response.message)

if __name__ == '__main__':
    token = input("Enter your JWT token: ")
    run_hub(token)