#!/bin/bash
set -ex

# These variables can be anything as they only apply to the docker container; pw and db should match your .env
CONTAINER="conex-db-container"
PW="c0n3xd@ta!"
DB="conexdb"

mkdir -p $(pwd)/devDb
echo "echo stop & remove old docker [$CONTAINER] and starting new fresh instance of [$CONTAINER]"
(docker kill $CONTAINER || :) &&
  (docker rm $CONTAINER || :) &&
  docker ps | grep $CONTAINER || (
    docker run \
      -d \
      -p 5435:5432 \
      -e POSTGRES_PASSWORD=$PW \
      -e PGPASSWORD=$PW \
      --name $CONTAINER \
      --mount type=bind,source="$(pwd)"/devDb,target=/var/lib/postgresql/data \
      postgres
)

# wait for pg to start
echo "sleep wait for pg-server [$CONTAINER] to start"
sleep 10 # you may need to increase the sleep period if you get a psql error complaining that you can't connect to the server.

# create the db
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $CONTAINER psql -U postgres


echo "\l" | docker exec -i $CONTAINER psql -U postgres
