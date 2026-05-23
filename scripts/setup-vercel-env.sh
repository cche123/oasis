#!/usr/bin/env bash
# Adds GEMINI_API_KEY from .env.local to Vercel (production). Run once after: npm i -g vercel
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env.local — add GEMINI_API_KEY=your_key first."
  exit 1
fi

KEY=$(grep '^GEMINI_API_KEY=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
if [[ -z "$KEY" ]]; then
  echo "GEMINI_API_KEY not found in .env.local"
  exit 1
fi

echo "Setting GEMINI_API_KEY on Vercel (production)..."
printf '%s' "$KEY" | vercel env add GEMINI_API_KEY production
echo "Done. Redeploy: vercel --prod"
