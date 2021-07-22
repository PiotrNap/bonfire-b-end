#!/bin/bash
set -e

# These variables can be anything as they only apply to the docker container
CONTAINER="conex-db-container"
PW="c0n3xd@ta!";
DB="conexDB";

# this will remove ALL containers from your system... DO NOT USE UNLESS YOU UNDERSTAND
#sudo docker container stop $(sudo docker container ls -aq)
#sudo docker container prune -f

echo "echo stop & remove old docker [$CONTAINER] and starting new fresh instance of [$CONTAINER]"
( sudo docker kill $CONTAINER || :) && \
  ( sudo docker rm $CONTAINER || :) && \
   sudo docker run --name $CONTAINER -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5432:5432 \
  -d postgres

# wait for pg to start
echo "sleep wait for pg-server [$CONTAINER] to start";
sleep 9; # you may need to increase the sleep period if you get a psql error complaining that you can't connect to the server.

# create the db 
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" |  sudo docker exec -i $CONTAINER psql -U postgres
echo "\l" |  sudo docker exec -i $CONTAINER psql -U postgres