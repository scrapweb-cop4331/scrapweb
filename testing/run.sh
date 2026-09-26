#!/bin/bash
node ../server/server.js
node --env-file=../.env testing/testapi.js