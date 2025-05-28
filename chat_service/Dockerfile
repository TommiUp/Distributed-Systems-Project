FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY proto/ proto/
RUN python -m grpc_tools.protoc -I proto \
      --python_out=proto --grpc_python_out=proto \
      proto/chat_service.proto

COPY . .
ENV PYTHONPATH=/app/proto
EXPOSE 50053
CMD ["python", "server.py"]
