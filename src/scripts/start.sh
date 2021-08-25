#!/bin/sh
set -exif [ "$RUN_MIGRATIONS" ]; then
  echo "RUNNING MIGRATIONS";
  npm run typeorm:migration:run
fiecho "START SERVER";
npm run start:prod