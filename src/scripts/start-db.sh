#!/bin/sh
set -e
clear

# Source the .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# These variables can be anything as they only apply to the docker container
CONTAINER=$POSTGRES_DATABASE
PW=$POSTGRES_PASSWORD
DB=$POSTGRES_DATABASE
DBPORT=$POSTGRES_PORT
DBVOLUME=$(pwd)/db

mkdir -p $DBVOLUME

# Recreate the docker container if RESET is specified
[ -z "${RESET:-}" ] || {
  echo "Recreating docker container [$CONTAINER]"
  (docker kill $CONTAINER || :) &&
  (docker rm $CONTAINER || :) 
} || { echo "NO RESET"  ; }

# Start the container if it's not running
( docker ps | grep $CONTAINER > /dev/null ) && {
  echo "$CONTAINER is running"
  exit
} || {
  (docker ps -a | grep $CONTAINER > /dev/null) && 
    echo "Starting $CONTAINER"
    docker start $CONTAINER
} || {
  echo "Creating and starting $CONTAINER"
  docker run \
    -d \
    -p $DBPORT:5432 \
    -e POSTGRES_PASSWORD=$PW \
    --name $CONTAINER \
    --mount type=bind,source=$DBVOLUME,target=/var/lib/postgresql/data \
    postgres    
}    

echo "WAITING for pg-server [$CONTAINER] to start"
until echo "\l" | docker exec -i $CONTAINER psql -U postgres ; do 
  sleep 1
done
sleep 1

# Create the database if it doesn't exist
if ! docker exec -i $CONTAINER psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB'" | grep -q 1; then
  echo "Creating database $DB"
  docker exec -i $CONTAINER psql -U postgres -c "CREATE DATABASE $DB ENCODING 'UTF-8';"
else
  echo "Database $DB already exists"
fi

