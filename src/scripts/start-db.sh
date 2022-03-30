#!/bin/sh
set -e
clear

# These variables can be anything as they only apply to the docker container; pw and db should match your .env
CONTAINER="bonfire_db"
PW="c0n3xd@ta!"
DB_DEV="bonfire_db_dev"
DB_PROD="bonfire_db_prod"
DBPORT="5436"
DBVOLUME=$(pwd)/bonfireDb/dev

mkdir -p $(pwd)/devDb

[ -z "${RESET:-}" ] || {
  echo "echo Recreating docker container [$CONTAINER]"
  (docker kill $CONTAINER || :) &&
  (docker rm $CONTAINER || :) 
} || { echo "NO RESET"  ; }

( docker ps | grep $CONTAINER > /dev/null ) && {
  echo "$CONTAINER is running"
  exit
} || {
(docker ps -a | grep $CONTAINER > /dev/null) && 
  echo "Starting $CONTAINER"
  docker start $CONTAINER
} || {
  docker run \
    -d \
    -p $DBPORT:5432 \
    -e POSTGRES_PASSWORD=$PW \
    -e PGPASSWORD=$PW \
    --name $CONTAINER \
    --mount type=bind,source=$DBVOLUME,target=/var/lib/postgresql/data \
    postgres    
}    
echo "WAITING for pg-server [$CONTAINER] to start"
until echo "\l" | docker exec -i $CONTAINER psql -U postgres ; do { 
  sleep 1
} done
sleep 1
(
  echo "CREATE DATABASE $DB_DEV ENCODING 'UTF-8';" 
  echo "CREATE DATABASE $DB_PROD ENCODING 'UTF-8';" 
  echo "CREATE DATABASE $MIGRATION_DB ENCODING 'UTF-8';" 
) | docker exec -i $CONTAINER psql -U postgres
