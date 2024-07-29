#!/usr/bin/env bash
set -e

npm run migrate
npm run start:prod
