# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git ca-certificates

# Copy go module files and download dependencies
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code and build optimized static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/api

# Stage 2: Minimal runtime environment
FROM alpine:latest

WORKDIR /app

# Retrieve certs and binary from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
