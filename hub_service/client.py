import grpc
import sys, os

# Set up Python path to find generated proto modules and other services
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "proto"))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from hub_service_pb2 import EnterHubRequest, LogoutRequest
from hub_service_pb2_grpc import HubServiceStub


def run_hub(token):
    with grpc.insecure_channel('localhost:50052') as channel:
        stub = HubServiceStub(channel)
        # Verify token and enter hub
        response = stub.EnterHub(EnterHubRequest(token=token))
        if not response.success:
            print("Access denied:", response.message)
            return
        print(response.message)

        try:
            while True:
                print("\nMenu:")
                print("1. Placeholder action")
                print("2. Enter Chat")
                print("3. Logout")
                choice = input("Your choice: ")

                if choice == "1":
                    print("Placeholder action executed.")

                elif choice == "2":
                    # Import chat service client to allow transition to chat
                    from chat_service.client import run_chat
                    run_chat(token)

                elif choice == "3":
                    logout_response = stub.Logout(LogoutRequest(token=token))
                    print(logout_response.message)
                    break

                else:
                    print("Invalid choice. Please try again.")

        except KeyboardInterrupt:
            # Handle Ctrl+C by logging out
            print("\nReturning to auth service...")
            logout_response = stub.Logout(LogoutRequest(token=token))
            print(logout_response.message)

if __name__ == '__main__':
    token = input("Enter your JWT token: ")
    run_hub(token)
