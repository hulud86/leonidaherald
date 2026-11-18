#!/usr/bin/env bash
# Daily refresh: set the edition date to today (Pacific time), rebuild, publish.
# Run from the repo root: bash _src/daily.sh
set -euo pipefail
today=$(TZ=America/Los_Angeles date +%F)
node -e 'const fs=require("fs");const f="_src/content.json";const c=JSON.parse(fs.readFileSync(f));c.edition=process.argv[1];fs.writeFileSync(f,JSON.stringify(c,null,2)+"\n")' "$today"
rm -rf /tmp/lh-out
node _src/build.js _src/content.json /tmp/lh-out
cp -r /tmp/lh-out/. .
echo "edition=$today"
