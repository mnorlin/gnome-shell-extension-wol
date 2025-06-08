#!/bin/bash

# Usage: ./ping_wait.sh <hostname> <timeout_in_seconds>

HOST=$1
TIMEOUT=$2
INTERVAL=1

START_TIME=$(date +%s)

while true; do
    if ping -c 1 -W 1 "$HOST" > /dev/null 2>&1; then
        # Host is reachable
        exit 0
    fi

    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))

    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        # Timeout reached. Host is not reachable
        exit 1
    fi

    sleep $INTERVAL
done
