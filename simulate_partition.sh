#!/bin/bash

echo "---------------------------------------"
echo " Starting Deterministic Partition Test"
echo "---------------------------------------"

# 1. Create incident in US
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/incidents \
-H "Content-Type: application/json" \
-d "{\"title\":\"PartitionTest\",\"severity\":\"HIGH\"}")

ID=$(echo $CREATE_RESPONSE | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

echo "Incident ID: $ID"

sleep 6

# 2. Disable replication in BOTH regions
echo "Disabling replication..."
curl -s -X POST http://localhost:3000/internal/disable-replication
curl -s -X POST http://localhost:3001/internal/disable-replication

sleep 2

# 3. Update US
echo "Updating US..."
curl -s -X PUT http://localhost:3000/incidents/$ID \
-H "Content-Type: application/json" \
-d "{\"status\":\"ACKNOWLEDGED\",\"vector_clock\":{\"us\":1,\"eu\":0,\"apac\":0}}"

echo ""

# 4. Update EU (using old clock)
echo "Updating EU..."
curl -s -X PUT http://localhost:3001/incidents/$ID \
-H "Content-Type: application/json" \
-d "{\"status\":\"CRITICAL\",\"vector_clock\":{\"us\":1,\"eu\":0,\"apac\":0}}"

echo ""

# 5. Re-enable replication
echo "Re-enabling replication..."
curl -s -X POST http://localhost:3000/internal/enable-replication
curl -s -X POST http://localhost:3001/internal/enable-replication

sleep 10

# 6. Check EU state
echo "Final EU state:"
curl -s http://localhost:3001/incidents/$ID
echo ""

echo "---------------------------------------"
echo " Test Complete"
echo "---------------------------------------"