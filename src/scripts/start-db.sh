#!/bin/bash
set -ex

# These variables can be anything as they only apply to the docker container; pw and db should match your .env
CONTAINER="conex-db-container"
PW="c0n3xd@ta!"
DB="conexdb"

mkdir -p $(pwd)/devDb
echo "echo stop & remove old docker [$CONTAINER] and starting new fresh instance of [$CONTAINER]"
# (docker kill $CONTAINER || :) &&
#   (docker rm $CONTAINER || :) &&
  docker ps | grep $CONTAINER || (
    docker run --mount type=bind,source="$(pwd)"/devDb,target=/var/lib/postgresql/data --name $CONTAINER -e POSTGRES_PASSWORD=$PW \
      -e PGPASSWORD=$PW \
      -p 5435:5435 \
      -d postgres
)

# wait for pg to start
echo "sleep wait for pg-server [$CONTAINER] to start"
sleep 5 # you may need to increase the sleep period if you get a psql error complaining that you can't connect to the server.

# create the db
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $CONTAINER psql -U postgres


echo "\l" | docker exec -i $CONTAINER psql -U postgres
