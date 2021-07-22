#!/bin/bashset -e
set -xif [ "$RUN_MIGRATIONS" ]; then
  echo "RUNNING MIGRATIONS";
  npm run typeorm:migration:run
fiecho "START SERVER";
npm run start:prod