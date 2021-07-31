#!/bin/bash
set -e

# These variables can be anything as they only apply to the docker container; pw and db should match your .env
CONTAINER="conex-db-container"
PW="c0n3xd@ta!";
DB="conexdb";

# this will remove ALL containers from your system... DO NOT USE UNLESS YOU UNDERSTAND
docker container stop $(docker container ls -aq)
docker container prune -f

echo "echo stop & remove old docker [$CONTAINER] and starting new fresh instance of [$CONTAINER]"
( docker kill $CONTAINER || :) && \
  ( docker rm $CONTAINER || :) && \
   docker run --name $CONTAINER -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5432:5432 \
  -d postgres

# wait for pg to start
echo "sleep wait for pg-server [$CONTAINER] to start";
sleep 20; # you may need to increase the sleep period if you get a psql error complaining that you can't connect to the server.

# create the db 
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" |  docker exec -i $CONTAINER psql -U postgres
echo "\l" |  docker exec -i $CONTAINER psql -U postgres