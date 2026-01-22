#!/usr/bin/env bash
##############################################################################
# Usage: ./env.sh
# Updates environment variables in compiled app
##############################################################################

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load environment variables from file if present
if [[ -f ../../.env ]]; then
  echo "Loaded environment from .env file"
  source ../../.env
fi

dist_folder="dist/website"
version="sha.$(git rev-parse --short HEAD)"
ai_search_url="${AI_SEARCH_URL:-}"

perl -i -pe "s/__VERSION__/$version/g" $dist_folder/main.*.js
perl -i -pe "s/__AI_SEARCH_URL__/$ai_search_url/g" $dist_folder/main.*.js

echo Version: $version
