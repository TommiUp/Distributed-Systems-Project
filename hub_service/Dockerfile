# Use a lightweight Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# PYTHONPATH for proto files
ENV PYTHONPATH="/app/proto"

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Start the chat service server
CMD ["python", "server.py"]